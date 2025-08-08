/**
 * Simple in-memory cache service for development
 * Falls back when Redis is not available
 */

interface CacheItem {
  value: any
  expiry: number
}

class SimpleCache {
  private cache = new Map<string, CacheItem>()
  private cleanupInterval?: NodeJS.Timeout

  constructor() {
    // Cleanup expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry < now) {
        this.cache.delete(key)
      }
    }
  }

  set(key: string, value: any, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (item.expiry < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  keys(pattern: string): string[] {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return Array.from(this.cache.keys()).filter(key => regex.test(key))
  }

  clear(): void {
    this.cache.clear()
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

// Singleton instance
const simpleCache = new SimpleCache()

export { simpleCache }