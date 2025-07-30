import { CacheService } from './redis'

export interface CompressionConfig {
  enabled: boolean
  minSize: number // Minimum size in bytes to compress
  algorithm: 'gzip' | 'deflate' | 'brotli'
  level: number // Compression level (1-9)
}

export interface CompressionMetrics {
  originalSize: number
  compressedSize: number
  compressionRatio: number
  algorithm: string
  compressionTime: number
}

export interface CompressedCacheData<T> {
  data: T
  compressed: boolean
  metrics?: CompressionMetrics
  timestamp: number
}

/**
 * Cache compression service for optimizing bandwidth and storage
 */
class CacheCompressionService {
  private static instance: CacheCompressionService
  
  private config: CompressionConfig = {
    enabled: true,
    minSize: 1024, // 1KB minimum
    algorithm: 'gzip',
    level: 6 // Balanced compression
  }

  private compressionStats = {
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    totalItems: 0,
    averageCompressionRatio: 0
  }

  static getInstance(): CacheCompressionService {
    if (!CacheCompressionService.instance) {
      CacheCompressionService.instance = new CacheCompressionService()
    }
    return CacheCompressionService.instance
  }

  /**
   * Set data with automatic compression
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(data)
      const originalSize = new Blob([serialized]).size
      
      let finalData: CompressedCacheData<T>
      let shouldCompress = this.config.enabled && originalSize >= this.config.minSize

      if (shouldCompress) {
        const startTime = performance.now()
        const compressed = await this.compress(serialized)
        const compressionTime = performance.now() - startTime
        const compressedSize = compressed.length

        const metrics: CompressionMetrics = {
          originalSize,
          compressedSize,
          compressionRatio: compressedSize / originalSize,
          algorithm: this.config.algorithm,
          compressionTime
        }

        // Only use compression if it actually saves space
        if (compressedSize < originalSize * 0.9) { // At least 10% savings
          finalData = {
            data: compressed as any, // Store compressed string
            compressed: true,
            metrics,
            timestamp: Date.now()
          }
          
          this.updateCompressionStats(metrics)
          console.log(`📦 Compressed cache: ${key} (${originalSize}B → ${compressedSize}B, ${(metrics.compressionRatio * 100).toFixed(1)}%)`)
        } else {
          // Compression didn't help
          finalData = {
            data,
            compressed: false,
            timestamp: Date.now()
          }
        }
      } else {
        finalData = {
          data,
          compressed: false,
          timestamp: Date.now()
        }
      }

      await CacheService.set(key, finalData, ttl)
      return true
    } catch (error) {
      console.error(`Compression cache set failed for: ${key}`, error)
      return false
    }
  }

  /**
   * Get data with automatic decompression
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await CacheService.get<CompressedCacheData<T>>(key)
      
      if (!cached) {
        return null
      }

      // Handle legacy cache format (direct data)
      if (!('compressed' in cached)) {
        return cached as T
      }

      const { data, compressed } = cached

      if (compressed) {
        // Decompress data
        const decompressed = await this.decompress(data as string)
        return JSON.parse(decompressed) as T
      } else {
        return data
      }
    } catch (error) {
      console.error(`Compression cache get failed for: ${key}`, error)
      return null
    }
  }

  /**
   * Compress string data
   */
  private async compress(data: string): Promise<string> {
    if (typeof window === 'undefined') {
      // Server-side compression using Node.js
      return this.compressNode(data)
    } else {
      // Client-side compression using Web APIs
      return this.compressWeb(data)
    }
  }

  /**
   * Decompress string data
   */
  private async decompress(data: string): Promise<string> {
    if (typeof window === 'undefined') {
      // Server-side decompression
      return this.decompressNode(data)
    } else {
      // Client-side decompression
      return this.decompressWeb(data)
    }
  }

  /**
   * Server-side compression using Node.js
   */
  private async compressNode(data: string): Promise<string> {
    try {
      const zlib = await import('zlib')
      const util = await import('util')
      
      let compressFunc: any
      
      switch (this.config.algorithm) {
        case 'gzip':
          compressFunc = util.promisify(zlib.gzip)
          break
        case 'deflate':
          compressFunc = util.promisify(zlib.deflate)
          break
        case 'brotli':
          compressFunc = util.promisify(zlib.brotliCompress)
          break
        default:
          throw new Error(`Unsupported compression algorithm: ${this.config.algorithm}`)
      }

      const compressed = await compressFunc(Buffer.from(data, 'utf8'), {
        level: this.config.level
      })
      
      return compressed.toString('base64')
    } catch (error) {
      console.error('Node.js compression failed:', error)
      throw error
    }
  }

  /**
   * Server-side decompression using Node.js
   */
  private async decompressNode(data: string): Promise<string> {
    try {
      const zlib = await import('zlib')
      const util = await import('util')
      
      let decompressFunc: any
      
      switch (this.config.algorithm) {
        case 'gzip':
          decompressFunc = util.promisify(zlib.gunzip)
          break
        case 'deflate':
          decompressFunc = util.promisify(zlib.inflate)
          break
        case 'brotli':
          decompressFunc = util.promisify(zlib.brotliDecompress)
          break
        default:
          throw new Error(`Unsupported decompression algorithm: ${this.config.algorithm}`)
      }

      const buffer = Buffer.from(data, 'base64')
      const decompressed = await decompressFunc(buffer)
      
      return decompressed.toString('utf8')
    } catch (error) {
      console.error('Node.js decompression failed:', error)
      throw error
    }
  }

  /**
   * Client-side compression using Web APIs
   */
  private async compressWeb(data: string): Promise<string> {
    try {
      if (!('CompressionStream' in window)) {
        throw new Error('CompressionStream not supported')
      }

      const stream = new CompressionStream(this.config.algorithm)
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()

      // Write data
      const encoder = new TextEncoder()
      await writer.write(encoder.encode(data))
      await writer.close()

      // Read compressed data
      const chunks: Uint8Array[] = []
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          chunks.push(value)
        }
      }

      // Combine chunks and convert to base64
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const combined = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }

      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Web compression failed:', error)
      // Fallback to no compression
      return data
    }
  }

  /**
   * Client-side decompression using Web APIs
   */
  private async decompressWeb(data: string): Promise<string> {
    try {
      if (!('DecompressionStream' in window)) {
        throw new Error('DecompressionStream not supported')
      }

      // Convert base64 to Uint8Array
      const binaryString = atob(data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const stream = new DecompressionStream(this.config.algorithm)
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()

      // Write compressed data
      await writer.write(bytes)
      await writer.close()

      // Read decompressed data
      const chunks: Uint8Array[] = []
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          chunks.push(value)
        }
      }

      // Combine and decode
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const combined = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }

      const decoder = new TextDecoder()
      return decoder.decode(combined)
    } catch (error) {
      console.error('Web decompression failed:', error)
      throw error
    }
  }

  /**
   * Update compression statistics
   */
  private updateCompressionStats(metrics: CompressionMetrics): void {
    this.compressionStats.totalOriginalSize += metrics.originalSize
    this.compressionStats.totalCompressedSize += metrics.compressedSize
    this.compressionStats.totalItems++
    
    this.compressionStats.averageCompressionRatio = 
      this.compressionStats.totalCompressedSize / this.compressionStats.totalOriginalSize
  }

  /**
   * Get compression statistics
   */
  getCompressionStats(): typeof this.compressionStats & {
    totalSavings: number
    totalSavingsPercent: number
  } {
    const totalSavings = this.compressionStats.totalOriginalSize - this.compressionStats.totalCompressedSize
    const totalSavingsPercent = totalSavings / this.compressionStats.totalOriginalSize * 100
    
    return {
      ...this.compressionStats,
      totalSavings,
      totalSavingsPercent
    }
  }

  /**
   * Update compression configuration
   */
  updateConfig(newConfig: Partial<CompressionConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('📦 Compression config updated:', this.config)
  }

  /**
   * Reset compression statistics
   */
  resetStats(): void {
    this.compressionStats = {
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      totalItems: 0,
      averageCompressionRatio: 0
    }
    console.log('📊 Compression stats reset')
  }

  /**
   * Bulk compress existing cache keys
   */
  async compressExistingKeys(keys: string[]): Promise<{
    success: number
    failed: number
    totalSavings: number
  }> {
    let success = 0
    let failed = 0
    let totalSavings = 0

    for (const key of keys) {
      try {
        // Get existing data
        const existing = await CacheService.get(key)
        if (existing) {
          const originalSize = JSON.stringify(existing).length
          
          // Re-set with compression
          const compressed = await this.set(key, existing)
          if (compressed) {
            success++
            // Estimate savings (rough calculation)
            totalSavings += originalSize * 0.3 // Assume 30% compression
          } else {
            failed++
          }
        }
      } catch (error) {
        console.error(`Failed to compress key: ${key}`, error)
        failed++
      }
    }

    console.log(`📦 Bulk compression completed: ${success} success, ${failed} failed, ~${totalSavings}B saved`)
    
    return { success, failed, totalSavings }
  }
}

export const cacheCompressionService = CacheCompressionService.getInstance()

// Convenience functions
export const setCompressed = <T>(key: string, data: T, ttl?: number) => 
  cacheCompressionService.set(key, data, ttl)

export const getCompressed = <T>(key: string) => 
  cacheCompressionService.get<T>(key)