import { Redis } from '@upstash/redis'
import { trackCacheOperation } from './cache-analytics'

// Initialize Redis client with fallback for missing env vars
export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Flag to check if Redis is available
export const isRedisAvailable = redis !== null

// Cache keys and TTL constants
export const CACHE_KEYS = {
  // Timeline caches
  USER_TIMELINE: (userId: string, tab: string, page: number) => `timeline:${userId}:${tab}:${page}`,
  USER_FEED_ALGORITHM: (userId: string) => `feed_algo:${userId}`,
  
  // User data caches
  USER_PROFILE: (userId: string) => `user:${userId}`,
  USER_STATS: (userId: string) => `user_stats:${userId}`,
  USER_FOLLOWERS: (userId: string) => `followers:${userId}`,
  USER_FOLLOWING: (userId: string) => `following:${userId}`,
  USER_PREFERENCES: (userId: string) => `user_prefs:${userId}`,
  USER_POSTS_COUNT: (userId: string) => `user_posts_count:${userId}`,
  USER_LIKED_POSTS: (userId: string) => `user_liked_posts:${userId}`,
  USER_PREMIUM_CONTENT: (userId: string) => `user_premium:${userId}`,
  USER_SUBSCRIPTION: (userId: string) => `user_sub:${userId}`,
  
  // Content caches
  POST: (postId: string) => `post:${postId}`,
  POST_DETAILS: (postId: string) => `post_details:${postId}`,
  POST_COMMENTS: (postId: string, page: number) => `post_comments:${postId}:${page}`,
  POST_LIKES: (postId: string) => `post_likes:${postId}`,
  
  // Recommendation caches
  TRENDING_POSTS: 'trending_posts',
  WHO_TO_FOLLOW: (userId: string) => `who_to_follow:${userId}`,
  TRENDING_TOPICS: 'trending_topics',
  RECOMMENDATIONS: (userId: string) => `recommendations:${userId}`,
  
  // Community and events
  USER_COMMUNITIES: (userId: string) => `user_communities:${userId}`,
  UPCOMING_EVENTS: (userId: string) => `upcoming_events:${userId}`,
  
  // Session and rate limiting
  USER_SESSION: (userId: string) => `session:${userId}`,
  RATE_LIMIT: (key: string) => `rate_limit:${key}`,
} as const

// TTL values in seconds
export const CACHE_TTL = {
  // Short-lived caches (1-5 minutes)
  TIMELINE: 300, // 5 minutes
  POST_COMMENTS: 180, // 3 minutes
  TRENDING_POSTS: 300, // 5 minutes
  
  // Medium-lived caches (10-30 minutes)
  USER_PROFILE: 1800, // 30 minutes
  USER_STATS: 900, // 15 minutes
  RECOMMENDATIONS: 1200, // 20 minutes
  WHO_TO_FOLLOW: 1800, // 30 minutes
  
  // Long-lived caches (1-24 hours)
  USER_FOLLOWERS: 3600, // 1 hour
  USER_FOLLOWING: 3600, // 1 hour
  TRENDING_TOPICS: 7200, // 2 hours
  UPCOMING_EVENTS: 14400, // 4 hours
  
  // Very long-lived (24+ hours)
  USER_COMMUNITIES: 86400, // 24 hours
  FEED_ALGORITHM: 43200, // 12 hours
  
  // Session and rate limiting
  USER_SESSION: 3600, // 1 hour
  RATE_LIMIT: 3600, // 1 hour
} as const

/**
 * Generic cache operations
 */
export class CacheService {
  /**
   * Get cached data with automatic JSON parsing
   */
  static async get<T>(key: string): Promise<T | null> {
    if (!isRedisAvailable) return null
    
    const startTime = performance.now()
    try {
      const data = await redis!.get(key)
      const responseTime = performance.now() - startTime
      
      // Track analytics
      trackCacheOperation({
        key,
        operation: 'get',
        hit: data !== null,
        responseTime,
        timestamp: Date.now()
      })
      
      return data as T
    } catch (error) {
      const responseTime = performance.now() - startTime
      
      // Track error
      trackCacheOperation({
        key,
        operation: 'get',
        hit: false,
        responseTime,
        timestamp: Date.now(),
        error: (error as Error).message
      })
      
      console.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Set cached data with TTL
   */
  static async set(key: string, value: any, ttl: number): Promise<boolean> {
    if (!isRedisAvailable) return false
    
    const startTime = performance.now()
    try {
      const serialized = JSON.stringify(value)
      await redis!.setex(key, ttl, serialized)
      const responseTime = performance.now() - startTime
      
      // Track analytics
      trackCacheOperation({
        key,
        operation: 'set',
        hit: true,
        responseTime,
        timestamp: Date.now(),
        size: new Blob([serialized]).size
      })
      
      return true
    } catch (error) {
      const responseTime = performance.now() - startTime
      
      // Track error
      trackCacheOperation({
        key,
        operation: 'set',
        hit: false,
        responseTime,
        timestamp: Date.now(),
        error: (error as Error).message
      })
      
      console.error('Cache set error:', error)
      return false
    }
  }

  /**
   * Delete cached data
   */
  static async del(key: string | string[]): Promise<boolean> {
    if (!isRedisAvailable) return false
    
    const startTime = performance.now()
    try {
      const keys = Array.isArray(key) ? key : [key]
      await redis!.del(...keys)
      const responseTime = performance.now() - startTime
      
      // Track analytics for each key
      keys.forEach(k => {
        trackCacheOperation({
          key: k,
          operation: 'delete',
          hit: true,
          responseTime,
          timestamp: Date.now()
        })
      })
      
      return true
    } catch (error) {
      const responseTime = performance.now() - startTime
      const keys = Array.isArray(key) ? key : [key]
      
      // Track error for each key
      keys.forEach(k => {
        trackCacheOperation({
          key: k,
          operation: 'delete',
          hit: false,
          responseTime,
          timestamp: Date.now(),
          error: (error as Error).message
        })
      })
      
      console.error('Cache delete error:', error)
      return false
    }
  }

  /**
   * Alias for del method
   */
  static async delete(key: string | string[]): Promise<boolean> {
    return this.del(key)
  }

  /**
   * Delete by pattern
   */
  static async deletePattern(pattern: string): Promise<boolean> {
    if (!isRedisAvailable) return false
    
    try {
      const keys = await redis!.keys(pattern)
      if (keys.length > 0) {
        return this.del(keys)
      }
      return true
    } catch (error) {
      console.error('Cache deletePattern error:', error)
      return false
    }
  }

  /**
   * Flush all cache data
   */
  static async flushAll(): Promise<boolean> {
    if (!isRedisAvailable) return false
    
    try {
      await redis!.flushall()
      return true
    } catch (error) {
      console.error('Cache flushAll error:', error)
      return false
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    if (!isRedisAvailable) return false
    
    try {
      const result = await redis!.exists(key)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  /**
   * Get multiple keys at once
   */
  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!isRedisAvailable) return keys.map(() => null)
    
    try {
      const results = await redis!.mget(...keys)
      return results.map(result => result as T)
    } catch (error) {
      console.error('Cache mget error:', error)
      return keys.map(() => null)
    }
  }

  /**
   * Set multiple keys at once
   */
  static async mset(keyValuePairs: Record<string, any>, ttl?: number): Promise<boolean> {
    if (!isRedisAvailable) return false
    
    try {
      // Use individual promises instead of pipeline for Upstash compatibility
      const promises = Object.entries(keyValuePairs).map(([key, value]) => {
        if (ttl) {
          return redis!.setex(key, ttl, JSON.stringify(value))
        } else {
          return redis!.set(key, JSON.stringify(value))
        }
      })
      
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Cache mset error:', error)
      return false
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  static async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number
  ): Promise<T | null> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }

      // Fetch fresh data
      const fresh = await fetcher()
      
      // Cache the result
      await this.set(key, fresh, ttl)
      
      return fresh
    } catch (error) {
      console.error('Cache getOrSet error:', error)
      return null
    }
  }

  /**
   * Invalidate cache patterns
   */
  static async invalidatePattern(pattern: string): Promise<boolean> {
    if (!isRedisAvailable) return false
    
    try {
      const keys = await redis!.keys(pattern)
      if (keys.length > 0) {
        await redis!.del(...keys)
      }
      return true
    } catch (error) {
      console.error('Cache invalidatePattern error:', error)
      return false
    }
  }

  /**
   * Rate limiting functionality
   */
  static async checkRateLimit(
    key: string, 
    limit: number, 
    window: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (!isRedisAvailable) {
      return { allowed: true, remaining: limit, resetTime: Date.now() + window * 1000 }
    }
    
    try {
      const rateLimitKey = CACHE_KEYS.RATE_LIMIT(key)
      const current = await redis!.incr(rateLimitKey)
      
      if (current === 1) {
        await redis!.expire(rateLimitKey, window)
      }
      
      const ttl = await redis!.ttl(rateLimitKey)
      const resetTime = Date.now() + (ttl * 1000)
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime
      }
    } catch (error) {
      console.error('Rate limit error:', error)
      return { allowed: true, remaining: limit, resetTime: Date.now() + window * 1000 }
    }
  }

  /**
   * Health check
   */
  static async ping(): Promise<boolean> {
    if (!isRedisAvailable) return false
    
    try {
      const result = await redis!.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Redis ping error:', error)
      return false
    }
  }

  /**
   * Get cache stats
   */
  static async getStats(): Promise<{
    connected: boolean;
    keyCount: number;
    memoryUsage: string;
  }> {
    if (!isRedisAvailable) {
      return {
        connected: false,
        keyCount: 0,
        memoryUsage: 'Redis not configured'
      }
    }
    
    try {
      const ping = await this.ping()
      const keys = await redis!.keys('*')
      
      return {
        connected: ping,
        keyCount: keys.length,
        memoryUsage: 'N/A' // Upstash doesn't provide memory info via REST
      }
    } catch (error) {
      console.error('Cache stats error:', error)
      return {
        connected: false,
        keyCount: 0,
        memoryUsage: 'Error'
      }
    }
  }
}