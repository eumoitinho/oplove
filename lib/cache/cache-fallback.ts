import { CacheService } from './redis'

export interface FallbackConfig {
  maxRetries: number
  retryDelay: number
  circuitBreakerThreshold: number
  circuitBreakerTimeout: number
}

export interface CacheOperation<T> {
  key: string
  fetcher: () => Promise<T>
  ttl?: number
  fallbackData?: T
}

export interface FallbackResult<T> {
  data: T
  source: 'cache' | 'fallback' | 'fresh'
  fromCircuitBreaker?: boolean
  retries?: number
}

/**
 * Advanced cache fallback service with circuit breaker pattern
 */
class CacheFallbackService {
  private static instance: CacheFallbackService
  private circuitBreakers = new Map<string, CircuitBreaker>()
  
  private config: FallbackConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    circuitBreakerThreshold: 5, // failures before opening circuit
    circuitBreakerTimeout: 30000 // 30 seconds
  }

  static getInstance(): CacheFallbackService {
    if (!CacheFallbackService.instance) {
      CacheFallbackService.instance = new CacheFallbackService()
    }
    return CacheFallbackService.instance
  }

  /**
   * Execute cache operation with comprehensive fallback
   */
  async execute<T>(operation: CacheOperation<T>): Promise<FallbackResult<T>> {
    const { key, fetcher, ttl, fallbackData } = operation
    const circuitBreaker = this.getCircuitBreaker(key)

    // 1. Try cache first
    try {
      const cached = await CacheService.get<T>(key)
      if (cached !== null) {
        return {
          data: cached,
          source: 'cache'
        }
      }
    } catch (error) {
      console.warn(`Cache read failed for key: ${key}`, error)
    }

    // 2. Check circuit breaker
    if (circuitBreaker.isOpen()) {
      console.warn(`Circuit breaker open for: ${key}`)
      
      if (fallbackData !== undefined) {
        return {
          data: fallbackData,
          source: 'fallback',
          fromCircuitBreaker: true
        }
      }
      
      throw new Error(`Circuit breaker open and no fallback data for: ${key}`)
    }

    // 3. Execute with retries
    let lastError: Error
    let attempts = 0

    for (let retry = 0; retry <= this.config.maxRetries; retry++) {
      attempts++
      
      try {
        const data = await fetcher()
        
        // Success - reset circuit breaker and cache result
        circuitBreaker.recordSuccess()
        
        // Cache the result (fire and forget)
        this.setCacheSafely(key, data, ttl)
        
        return {
          data,
          source: 'fresh',
          retries: retry
        }
      } catch (error) {
        lastError = error as Error
        circuitBreaker.recordFailure()
        
        console.warn(`Attempt ${retry + 1} failed for key: ${key}`, error)
        
        // Wait before retry (except on last attempt)
        if (retry < this.config.maxRetries) {
          await this.delay(this.config.retryDelay * (retry + 1)) // exponential backoff
        }
      }
    }

    // 4. All retries failed - try fallback
    if (fallbackData !== undefined) {
      console.warn(`Using fallback data for key: ${key}`)
      return {
        data: fallbackData,
        source: 'fallback',
        retries: attempts - 1
      }
    }

    // 5. No fallback available - throw last error
    throw lastError || new Error(`Failed to fetch data for key: ${key}`)
  }

  /**
   * Safe cache set that doesn't throw
   */
  private async setCacheSafely<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      await CacheService.set(key, data, ttl)
    } catch (error) {
      console.warn(`Failed to cache data for key: ${key}`, error)
    }
  }

  /**
   * Get or create circuit breaker for key
   */
  private getCircuitBreaker(key: string): CircuitBreaker {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, new CircuitBreaker(this.config))
    }
    return this.circuitBreakers.get(key)!
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Execute multiple operations in parallel with fallbacks
   */
  async executeParallel<T>(operations: CacheOperation<T>[]): Promise<FallbackResult<T>[]> {
    const promises = operations.map(op => 
      this.execute(op).catch(error => ({
        data: op.fallbackData as T,
        source: 'fallback' as const,
        error
      }))
    )

    return Promise.all(promises)
  }

  /**
   * Warm cache with fallback protection
   */
  async warmCache<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<boolean> {
    try {
      const data = await fetcher()
      await CacheService.set(key, data, ttl)
      console.log(`✅ Cache warmed: ${key}`)
      return true
    } catch (error) {
      console.warn(`❌ Cache warming failed: ${key}`, error)
      return false
    }
  }

  /**
   * Get circuit breaker stats
   */
  getCircuitBreakerStats(): Map<string, any> {
    const stats = new Map()
    
    for (const [key, breaker] of this.circuitBreakers) {
      stats.set(key, {
        state: breaker.getState(),
        failures: breaker.getFailureCount(),
        lastFailure: breaker.getLastFailureTime()
      })
    }
    
    return stats
  }

  /**
   * Reset circuit breaker for key
   */
  resetCircuitBreaker(key: string): void {
    const breaker = this.circuitBreakers.get(key)
    if (breaker) {
      breaker.reset()
      console.log(`🔄 Circuit breaker reset: ${key}`)
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers(): void {
    for (const [key, breaker] of this.circuitBreakers) {
      breaker.reset()
    }
    console.log(`🔄 All circuit breakers reset`)
  }
}

/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  private failureCount = 0
  private lastFailureTime = 0
  private config: FallbackConfig

  constructor(config: FallbackConfig) {
    this.config = config
  }

  recordSuccess(): void {
    this.failureCount = 0
    this.state = 'CLOSED'
  }

  recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.config.circuitBreakerThreshold) {
      this.state = 'OPEN'
      console.warn(`🔴 Circuit breaker opened after ${this.failureCount} failures`)
    }
  }

  isOpen(): boolean {
    if (this.state === 'CLOSED') {
      return false
    }

    if (this.state === 'OPEN') {
      // Check if timeout has passed
      if (Date.now() - this.lastFailureTime >= this.config.circuitBreakerTimeout) {
        this.state = 'HALF_OPEN'
        console.log(`🟡 Circuit breaker half-open (testing)`)
        return false
      }
      return true
    }

    // HALF_OPEN state
    return false
  }

  getState(): string {
    return this.state
  }

  getFailureCount(): number {
    return this.failureCount
  }

  getLastFailureTime(): number {
    return this.lastFailureTime
  }

  reset(): void {
    this.state = 'CLOSED'
    this.failureCount = 0
    this.lastFailureTime = 0
  }
}

export const cacheFallbackService = CacheFallbackService.getInstance()

// Convenience functions
export const cacheWithFallback = <T>(operation: CacheOperation<T>) => 
  cacheFallbackService.execute(operation)

export const parallelCacheWithFallback = <T>(operations: CacheOperation<T>[]) => 
  cacheFallbackService.executeParallel(operations)