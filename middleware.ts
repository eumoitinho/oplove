import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CacheService } from '@/lib/cache/redis'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ['/feed', '/profile', '/messages', '/settings']
  const authRoutes = ['/login', '/register', '/forgot-password']
  const publicRoutes = ['/test-auth']
  const apiRoutes = ['/api/']
  
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isApiRoute = apiRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // API Rate limiting and cache headers
  if (isApiRoute && session?.user) {
    const userId = session.user.id
    const pathname = request.nextUrl.pathname
    
    // Add cache headers for cacheable API routes
    const cacheableRoutes = ['/api/posts', '/api/users', '/api/timeline', '/api/recommendations']
    const isCacheable = cacheableRoutes.some(route => pathname.startsWith(route))
    
    if (isCacheable && request.method === 'GET') {
      // Check rate limiting for API calls
      const rateLimitKey = `api_limit:${userId}:${pathname}`
      
      try {
        const { allowed, remaining, resetTime } = await CacheService.checkRateLimit(
          rateLimitKey,
          100, // 100 requests per minute
          60   // 60 seconds window
        )
        
        if (!allowed) {
          return new NextResponse(
            JSON.stringify({ 
              error: 'Rate limit exceeded',
              limit: 100,
              remaining: 0,
              resetTime 
            }),
            { 
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': resetTime.toString(),
              }
            }
          )
        }
        
        // Add rate limit headers to response
        response.headers.set('X-RateLimit-Limit', '100')
        response.headers.set('X-RateLimit-Remaining', remaining.toString())
        response.headers.set('X-RateLimit-Reset', resetTime.toString())
        
        // Add cache hints
        response.headers.set('X-Cache-Enabled', 'true')
        response.headers.set('X-User-ID', userId)
        
      } catch (error) {
        console.error('Rate limiting error in middleware:', error)
        // Continue without rate limiting if Redis fails
      }
    }
  }

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to feed if accessing auth route with session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/feed',
    '/profile/:path*',
    '/messages/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/api/:path*', // Add API routes to matcher
  ],
}