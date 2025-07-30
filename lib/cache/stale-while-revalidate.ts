import { CacheService, CACHE_TTL } from './redis'
import { cacheFallbackService } from './cache-fallback'

export interface SWRConfig {
  ttl: number
  staleTime: number
  revalidateInBackground: boolean
  maxStaleTime?: number
}

export interface SWRResult<T> {
  data: T
  isStale: boolean
  isRevalidating: boolean
  source: 'cache' | 'fresh' | 'stale'
  revalidatedAt?: number
}

export interface SWROperation<T> {
  key: string
  fetcher: () => Promise<T>
  config?: Partial<SWRConfig>
  fallbackData?: T
}

/**
 * Stale-While-Revalidate cache implementation
 * Provides fresh data when possible, stale data when needed
 */
class StaleWhileRevalidateService {
  private static instance: StaleWhileRevalidateService
  private revalidationMap = new Map<string, Promise<any>>()
  private revalidationTimestamps = new Map<string, number>()

  private defaultConfig: SWRConfig = {
    ttl: CACHE_TTL.TIMELINE,
    staleTime: CACHE_TTL.TIMELINE * 2, // 2x TTL for stale time
    revalidateInBackground: true,
    maxStaleTime: CACHE_TTL.TIMELINE * 5 // 5x TTL max stale
  }

  static getInstance(): StaleWhileRevalidateService {
    if (!StaleWhileRevalidateService.instance) {
      StaleWhileRevalidateService.instance = new StaleWhileRevalidateService()
    }
    return StaleWhileRevalidateService.instance
  }

  /**
   * Execute SWR operation
   */
  async execute<T>(operation: SWROperation<T>): Promise<SWRResult<T>> {
    const { key, fetcher, config = {}, fallbackData } = operation
    const finalConfig = { ...this.defaultConfig, ...config }

    try {
      // Try to get cached data with metadata
      const cacheData = await this.getCacheWithMetadata<T>(key)
      
      if (cacheData) {
        const { data, timestamp } = cacheData
        const age = Date.now() - timestamp
        const isStale = age > finalConfig.ttl
        const isTooStale = finalConfig.maxStaleTime ? age > finalConfig.maxStaleTime : false

        // If data exists and not too stale
        if (!isTooStale) {
          // If stale and revalidation enabled, trigger background refresh
          if (isStale && finalConfig.revalidateInBackground) {
            this.revalidateInBackground(key, fetcher, finalConfig)
          }

          return {
            data,
            isStale,
            isRevalidating: this.isRevalidating(key),
            source: isStale ? 'stale' : 'cache',
            revalidatedAt: this.revalidationTimestamps.get(key)
          }
        }
      }

      // No cache or too stale - fetch fresh data
      const freshData = await this.fetchWithFallback(key, fetcher, fallbackData)
      await this.setCacheWithMetadata(key, freshData, finalConfig)

      return {
        data: freshData,
        isStale: false,
        isRevalidating: false,
        source: 'fresh',
        revalidatedAt: Date.now()
      }

    } catch (error) {
      console.error(`SWR execution failed for key: ${key}`, error)

      // Try to return stale data even if very old
      const staleData = await this.getCacheWithMetadata<T>(key)
      if (staleData) {
        console.warn(`Returning very stale data for key: ${key}`)
        return {
          data: staleData.data,
          isStale: true,
          isRevalidating: false,
          source: 'stale'
        }
      }

      // Last resort - fallback data
      if (fallbackData !== undefined) {
        return {
          data: fallbackData,
          isStale: true,
          isRevalidating: false,
          source: 'stale'
        }
      }

      throw error
    }
  }

  /**
   * Revalidate data in background
   */
  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: SWRConfig
  ): Promise<void> {
    // Prevent multiple revalidations for the same key
    if (this.revalidationMap.has(key)) {
      return
    }

    const revalidationPromise = this.performRevalidation(key, fetcher, config)
    this.revalidationMap.set(key, revalidationPromise)

    try {
      await revalidationPromise
    } finally {
      this.revalidationMap.delete(key)
    }
  }

  /**
   * Perform actual revalidation
   */
  private async performRevalidation<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: SWRConfig
  ): Promise<void> {
    try {
      console.log(`🔄 Background revalidation started: ${key}`)
      
      const freshData = await fetcher()
      await this.setCacheWithMetadata(key, freshData, config)
      
      this.revalidationTimestamps.set(key, Date.now())
      console.log(`✅ Background revalidation completed: ${key}`)
      
    } catch (error) {
      console.error(`❌ Background revalidation failed: ${key}`, error)
    }
  }

  /**
   * Fetch with fallback service
   */
  private async fetchWithFallback<T>(
    key: string,
    fetcher: () => Promise<T>,
    fallbackData?: T
  ): Promise<T> {
    const result = await cacheFallbackService.execute({
      key,
      fetcher,
      fallbackData
    })
    
    return result.data
  }

  /**
   * Set cache with timestamp metadata
   */
  private async setCacheWithMetadata<T>(
    key: string,
    data: T,
    config: SWRConfig
  ): Promise<void> {
    const cacheData = {
      data,
      timestamp: Date.now()
    }

    await CacheService.set(key, cacheData, config.staleTime)
  }

  /**
   * Get cache with metadata
   */
  private async getCacheWithMetadata<T>(key: string): Promise<{
    data: T
    timestamp: number
  } | null> {
    try {
      const cached = await CacheService.get<{
        data: T
        timestamp: number
      }>(key)
      
      return cached
    } catch (error) {
      console.warn(`Failed to get cache metadata for: ${key}`, error)
      return null
    }
  }

  /**
   * Check if key is currently being revalidated
   */
  private isRevalidating(key: string): boolean {
    return this.revalidationMap.has(key)
  }

  /**
   * Mutate cache data directly (for optimistic updates)
   */
  async mutate<T>(key: string, data: T, revalidate = true): Promise<void> {
    // Update cache immediately
    await this.setCacheWithMetadata(key, data, this.defaultConfig)
    
    if (revalidate) {
      // Mark for revalidation but don't wait
      this.revalidationTimestamps.delete(key)
    }
    
    console.log(`🔄 Cache mutated: ${key}`)
  }

  /**
   * Preload data into cache
   */
  async preload<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: Partial<SWRConfig>
  ): Promise<boolean> {
    try {
      const finalConfig = { ...this.defaultConfig, ...config }
      const data = await fetcher()
      await this.setCacheWithMetadata(key, data, finalConfig)
      
      console.log(`✅ Cache preloaded: ${key}`)
      return true
    } catch (error) {
      console.error(`❌ Cache preload failed: ${key}`, error)
      return false
    }
  }

  /**
   * Get multiple keys with SWR
   */
  async executeMany<T>(operations: SWROperation<T>[]): Promise<SWRResult<T>[]> {
    const promises = operations.map(op => this.execute(op))
    return Promise.all(promises)
  }

  /**
   * Get revalidation status for debugging
   */
  getRevalidationStatus(): {
    active: string[]
    timestamps: Map<string, number>
  } {
    return {
      active: Array.from(this.revalidationMap.keys()),
      timestamps: new Map(this.revalidationTimestamps)
    }
  }

  /**
   * Clear revalidation state
   */
  clearRevalidationState(): void {
    this.revalidationMap.clear()
    this.revalidationTimestamps.clear()
    console.log(`🧹 Revalidation state cleared`)
  }
}

export const swrService = StaleWhileRevalidateService.getInstance()

// Convenience functions
export const useSWR = <T>(operation: SWROperation<T>) => 
  swrService.execute(operation)

export const mutateSWR = <T>(key: string, data: T, revalidate = true) => 
  swrService.mutate(key, data, revalidate)

export const preloadSWR = <T>(
  key: string,
  fetcher: () => Promise<T>,
  config?: Partial<SWRConfig>
) => swrService.preload(key, fetcher, config)