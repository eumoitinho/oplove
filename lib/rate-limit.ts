import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { headers } from 'next/headers'
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface RateLimitOptions {
  limit: number
  window: string // e.g., '1h', '15m', '1d'
  identifier?: string // Additional identifier for specific endpoints
  skipAuth?: boolean // Skip authentication check
  byIP?: boolean // Rate limit by IP instead of user ID
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// Convert window string to milliseconds
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/)
  if (!match) throw new Error('Invalid window format')
  
  const [, value, unit] = match
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }
  
  return parseInt(value) * multipliers[unit as keyof typeof multipliers]
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const headersList = headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  const cfConnectingIP = headersList.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  if (realIP) return realIP
  
  return 'unknown'
}

// Main rate limiting function
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const {
    limit,
    window,
    identifier = '',
    skipAuth = false,
    byIP = false,
  } = options
  
  try {
    let key: string
    
    if (byIP) {
      // Rate limit by IP address
      const ip = getClientIP(request)
      key = `ratelimit:ip:${ip}:${identifier}`
    } else if (!skipAuth) {
      // Rate limit by authenticated user
      const supabase = createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // If no user, fall back to IP-based rate limiting
        const ip = getClientIP(request)
        key = `ratelimit:ip:${ip}:${identifier}`
      } else {
        key = `ratelimit:user:${user.id}:${identifier}`
      }
    } else {
      // Rate limit by IP when auth is skipped
      const ip = getClientIP(request)
      key = `ratelimit:ip:${ip}:${identifier}`
    }
    
    // Get current window start time
    const now = Date.now()
    const windowMs = parseWindow(window)
    const windowStart = Math.floor(now / windowMs) * windowMs
    const windowEnd = windowStart + windowMs
    
    // Create a unique key for this time window
    const windowKey = `${key}:${windowStart}`
    
    // Increment counter
    const count = await redis.incr(windowKey)
    
    // Set expiration on first request
    if (count === 1) {
      await redis.expire(windowKey, Math.ceil(windowMs / 1000))
    }
    
    // Check if limit exceeded
    const success = count <= limit
    const remaining = Math.max(0, limit - count)
    
    return {
      success,
      limit,
      remaining,
      reset: windowEnd,
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // On error, allow the request but log it
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + parseWindow(window),
    }
  }
}

// Middleware helper for API routes
export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<Response>,
  options: RateLimitOptions
): Promise<Response> {
  const result = await rateLimit(request, options)
  
  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.reset).toISOString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }
  
  // Add rate limit headers to successful responses
  const response = await handler(request)
  const newHeaders = new Headers(response.headers)
  newHeaders.set('X-RateLimit-Limit', result.limit.toString())
  newHeaders.set('X-RateLimit-Remaining', result.remaining.toString())
  newHeaders.set('X-RateLimit-Reset', new Date(result.reset).toISOString())
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}

// Preset rate limit configurations
export const rateLimitPresets = {
  // Authentication endpoints
  auth: {
    login: { limit: 5, window: '15m' },
    register: { limit: 3, window: '1h' },
    passwordReset: { limit: 3, window: '1h' },
  },
  
  // API endpoints
  api: {
    default: { limit: 100, window: '15m' },
    search: { limit: 30, window: '15m' },
    upload: { limit: 10, window: '1h' },
    verification: { limit: 3, window: '1h' },
  },
  
  // User actions
  user: {
    post: { limit: 10, window: '1h' },
    message: { limit: 50, window: '1h' },
    follow: { limit: 30, window: '1h' },
    like: { limit: 100, window: '1h' },
  },
  
  // Premium limits (higher for paid users)
  premium: {
    gold: {
      post: { limit: 20, window: '1h' },
      message: { limit: 100, window: '1h' },
      upload: { limit: 20, window: '1h' },
    },
    diamond: {
      post: { limit: 50, window: '1h' },
      message: { limit: 500, window: '1h' },
      upload: { limit: 50, window: '1h' },
    },
  },
}

// Check if user has premium plan for higher limits
export async function getPremiumRateLimit(
  userId: string,
  action: keyof typeof rateLimitPresets.user
): Promise<RateLimitOptions> {
  const supabase = createServerClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('premium_type')
    .eq('id', userId)
    .single()
  
  if (!user) {
    return rateLimitPresets.user[action]
  }
  
  switch (user.premium_type) {
    case 'gold':
      return rateLimitPresets.premium.gold[action] || rateLimitPresets.user[action]
    case 'diamond':
    case 'couple':
      return rateLimitPresets.premium.diamond[action] || rateLimitPresets.user[action]
    default:
      return rateLimitPresets.user[action]
  }
}