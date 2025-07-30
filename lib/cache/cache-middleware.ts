import { NextRequest, NextResponse } from 'next/server'
import { CacheService } from './redis'

export interface CacheOptions {
  ttl: number
  key: string
  revalidate?: number
  tags?: string[]
}

/**
 * API Route Cache Middleware
 */
export function withCache(options: CacheOptions) {
  return function cacheMiddleware<T>(
    handler: (req: NextRequest) => Promise<T>
  ) {
    return async function cachedHandler(req: NextRequest): Promise<NextResponse> {
      const { ttl, key, revalidate } = options
      
      try {
        // For GET requests, try to serve from cache first
        if (req.method === 'GET') {
          const cached = await CacheService.get<T>(key)
          
          if (cached) {
            const response = NextResponse.json(cached)
            
            // Add cache headers
            response.headers.set('Cache-Control', `public, max-age=${ttl}, s-maxage=${ttl}`)
            response.headers.set('X-Cache', 'HIT')
            response.headers.set('X-Cache-Key', key)
            
            return response
          }
        }
        
        // Execute the handler
        const result = await handler(req)
        
        // Cache the result for GET requests
        if (req.method === 'GET') {
          await CacheService.set(key, result, ttl)
        }
        
        const response = NextResponse.json(result)
        
        // Add cache headers
        if (req.method === 'GET') {
          response.headers.set('Cache-Control', `public, max-age=${ttl}, s-maxage=${ttl}`)
          response.headers.set('X-Cache', 'MISS')
          response.headers.set('X-Cache-Key', key)
          
          if (revalidate) {
            response.headers.set('X-Revalidate-After', revalidate.toString())
          }
        }
        
        return response
        
      } catch (error) {
        console.error('Cache middleware error:', error)
        
        // Fallback to executing handler without cache
        const result = await handler(req)
        const response = NextResponse.json(result)
        response.headers.set('X-Cache', 'ERROR')
        
        return response
      }
    }
  }
}

/**
 * Cache invalidation middleware
 */
export function withCacheInvalidation(patterns: string[]) {
  return function invalidationMiddleware<T>(
    handler: (req: NextRequest) => Promise<T>
  ) {
    return async function invalidatingHandler(req: NextRequest): Promise<NextResponse> {
      try {
        // Execute the handler first
        const result = await handler(req)
        
        // Invalidate cache patterns after successful operation
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
          const invalidationPromises = patterns.map(pattern => 
            CacheService.invalidatePattern(pattern)
          )
          
          await Promise.all(invalidationPromises)
        }
        
        const response = NextResponse.json(result)
        
        if (patterns.length > 0) {
          response.headers.set('X-Cache-Invalidated', patterns.join(','))
        }
        
        return response
        
      } catch (error) {
        console.error('Cache invalidation middleware error:', error)
        throw error
      }
    }
  }
}

/**
 * Rate limiting middleware using Redis
 */
export function withRateLimit(options: {
  key: (req: NextRequest) => string
  limit: number
  window: number // seconds
  message?: string
}) {
  return function rateLimitMiddleware<T>(
    handler: (req: NextRequest) => Promise<T>
  ) {
    return async function rateLimitedHandler(req: NextRequest): Promise<NextResponse> {
      try {
        const rateLimitKey = options.key(req)
        
        const { allowed, remaining, resetTime } = await CacheService.checkRateLimit(
          rateLimitKey,
          options.limit,
          options.window
        )
        
        if (!allowed) {
          const response = NextResponse.json(
            { 
              error: options.message || 'Rate limit exceeded',
              limit: options.limit,
              remaining: 0,
              resetTime 
            },
            { status: 429 }
          )
          
          response.headers.set('X-RateLimit-Limit', options.limit.toString())
          response.headers.set('X-RateLimit-Remaining', '0')
          response.headers.set('X-RateLimit-Reset', resetTime.toString())
          
          return response
        }
        
        // Execute handler
        const result = await handler(req)
        const response = NextResponse.json(result)
        
        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', options.limit.toString())
        response.headers.set('X-RateLimit-Remaining', remaining.toString())
        response.headers.set('X-RateLimit-Reset', resetTime.toString())
        
        return response
        
      } catch (error) {
        console.error('Rate limit middleware error:', error)
        
        // Fallback - allow request if rate limiting fails
        const result = await handler(req)
        return NextResponse.json(result)
      }
    }
  }
}

/**
 * Combined middleware for caching + rate limiting
 */
export function withCacheAndRateLimit(
  cacheOptions: CacheOptions,
  rateLimitOptions: {
    key: (req: NextRequest) => string
    limit: number
    window: number
    message?: string
  }
) {
  return function combinedMiddleware<T>(
    handler: (req: NextRequest) => Promise<T>
  ) {
    const rateLimitedHandler = withRateLimit(rateLimitOptions)(handler)
    const cachedHandler = withCache(cacheOptions)(rateLimitedHandler)
    return cachedHandler
  }
}

/**
 * Utility to generate cache keys from request
 */
export class CacheKeyGenerator {
  static userTimeline(userId: string, tab: string, page: number): string {
    return `api:timeline:${userId}:${tab}:${page}`
  }
  
  static userProfile(userId: string): string {
    return `api:profile:${userId}`
  }
  
  static userPosts(userId: string, page: number): string {
    return `api:posts:${userId}:${page}`
  }
  
  static recommendations(userId: string): string {
    return `api:recommendations:${userId}`
  }
  
  static search(query: string, type: string, page: number): string {
    const cleanQuery = query.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    return `api:search:${cleanQuery}:${type}:${page}`
  }
  
  static trending(type: string): string {
    return `api:trending:${type}`
  }
  
  static fromRequest(req: NextRequest, prefix: string): string {
    const url = new URL(req.url)
    const path = url.pathname.replace(/[^a-zA-Z0-9]/g, '_')
    const params = Array.from(url.searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}_${value}`)
      .join('_')
    
    return `${prefix}:${path}${params ? ':' + params : ''}`
  }
  
  static rateLimitKey(req: NextRequest, identifier: 'ip' | 'user'): string {
    if (identifier === 'ip') {
      const forwarded = req.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
      return `rate_limit:ip:${ip}`
    }
    
    // For user-based rate limiting, you'd extract user ID from JWT or session
    // This is a placeholder - implement based on your auth system
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `rate_limit:user:${userId}`
  }
}

/**
 * Cache warming utility
 */
export class CacheWarmer {
  static async warmUpUserSession(userId: string): Promise<void> {
    try {
      // Warm up common user caches in background
      const warmupPromises = [
        // Timeline caches
        CacheService.getOrSet(
          `timeline:${userId}:for-you:1`,
          () => Promise.resolve([]), // Replace with actual fetcher
          300
        ),
        
        // Profile cache
        CacheService.getOrSet(
          `user:${userId}`,
          () => Promise.resolve({}), // Replace with actual fetcher
          1800
        ),
        
        // Recommendations cache
        CacheService.getOrSet(
          `recommendations:${userId}`,
          () => Promise.resolve({}), // Replace with actual fetcher
          1200
        )
      ]
      
      await Promise.allSettled(warmupPromises)
    } catch (error) {
      console.error('Cache warm-up error:', error)
    }
  }
  
  static async warmUpGlobalCaches(): Promise<void> {
    try {
      const globalWarmupPromises = [
        // Trending topics
        CacheService.getOrSet(
          'trending_topics',
          () => Promise.resolve([]), // Replace with actual fetcher
          7200
        ),
        
        // Trending posts
        CacheService.getOrSet(
          'trending_posts',
          () => Promise.resolve([]), // Replace with actual fetcher
          300
        )
      ]
      
      await Promise.allSettled(globalWarmupPromises)
    } catch (error) {
      console.error('Global cache warm-up error:', error)
    }
  }
}