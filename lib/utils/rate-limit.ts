/**
 * Rate limiting utility for API endpoints
 * Uses Redis for distributed rate limiting
 */

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (identifier: string) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

class RateLimiter {
  private redis: any

  constructor() {
    // Initialize Redis connection
    if (typeof window === 'undefined') {
      // Only initialize on server side
      this.initRedis()
    }
  }

  private async initRedis() {
    try {
      // Use Upstash Redis if available
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const { Redis } = await import('@upstash/redis')
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
      }
    } catch (error) {
      console.error('Failed to initialize Redis for rate limiting:', error)
    }
  }

  async checkRateLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    if (!this.redis) {
      // Fallback: allow all requests if Redis is not available
      console.warn('Redis not available, skipping rate limiting')
      return {
        allowed: true,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
      }
    }

    const key = config.keyGenerator 
      ? config.keyGenerator(identifier)
      : `rate_limit:${identifier}`

    const window = Math.floor(Date.now() / config.windowMs)
    const windowKey = `${key}:${window}`

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline()
      
      // Increment counter for current window
      pipeline.incr(windowKey)
      
      // Set expiry for the window key
      pipeline.expire(windowKey, Math.ceil(config.windowMs / 1000))
      
      // Execute pipeline
      const results = await pipeline.exec()
      const currentCount = results[0][1]

      const remaining = Math.max(0, config.maxRequests - currentCount)
      const resetTime = (window + 1) * config.windowMs

      if (currentCount > config.maxRequests) {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
        
        return {
          allowed: false,
          limit: config.maxRequests,
          remaining: 0,
          resetTime,
          retryAfter,
        }
      }

      return {
        allowed: true,
        limit: config.maxRequests,
        remaining,
        resetTime,
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      
      // On error, allow the request but log the issue
      return {
        allowed: true,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
      }
    }
  }

  // Clear rate limit for specific identifier (useful for testing)
  async clearRateLimit(identifier: string, config: RateLimitConfig): Promise<void> {
    if (!this.redis) return

    const key = config.keyGenerator 
      ? config.keyGenerator(identifier)
      : `rate_limit:${identifier}`
    
    try {
      // Find all keys matching the pattern
      const keys = await this.redis.keys(`${key}:*`)
      
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Error clearing rate limit:', error)
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

// Predefined rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  // Webhook endpoints - stricter limits
  webhook: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute per IP
    keyGenerator: (ip: string) => `webhook:${ip}`,
  },
  
  // Payment endpoints - moderate limits
  payment: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute per user
    keyGenerator: (userId: string) => `payment:${userId}`,
  },
  
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes per IP
    keyGenerator: (ip: string) => `auth:${ip}`,
  },
  
  // General API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute per user
    keyGenerator: (userId: string) => `api:${userId}`,
  },
} as const

// Helper function to get client IP
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim()
  }
  
  if (xRealIP) {
    return xRealIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to a default value (not ideal for production)
  return 'unknown'
}

// Higher-order function to apply rate limiting to API routes
export function withRateLimit(config: RateLimitConfig) {
  return function(handler: Function) {
    return async function(request: Request, ...args: any[]) {
      const ip = getClientIP(request)
      const rateLimitResult = await rateLimiter.checkRateLimit(ip, config)
      
      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`,
            retryAfter: rateLimitResult.retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
              'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            },
          }
        )
      }
      
      // Add rate limit headers to successful responses
      const response = await handler(request, ...args)
      
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
        response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
      }
      
      return response
    }
  }
}

export default rateLimiter