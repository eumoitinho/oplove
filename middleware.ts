import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, rateLimitPresets } from '@/lib/rate-limit'

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

  const { data: { user }, error } = await supabase.auth.getUser()

  // Protected routes
  const protectedRoutes = ['/feed', '/profile', '/messages', '/settings']
  const authRoutes = ['/login', '/register', '/forgot-password']
  const publicRoutes = ['/test-auth']
  const apiRoutes = ['/api/']
  
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isApiRoute = apiRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Apply security headers to all responses
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.supabase.co;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: blob: https://*.supabase.co https://*.githubusercontent.com;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.github.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim()
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // API Rate limiting
  if (isApiRoute) {
    // Determine rate limit based on endpoint
    let rateLimitConfig = rateLimitPresets.api.default
    
    if (request.nextUrl.pathname.includes('/auth/')) {
      if (request.nextUrl.pathname.includes('/login')) {
        rateLimitConfig = rateLimitPresets.auth.login
      } else if (request.nextUrl.pathname.includes('/register')) {
        rateLimitConfig = rateLimitPresets.auth.register
      }
    } else if (request.nextUrl.pathname.includes('/verification')) {
      rateLimitConfig = rateLimitPresets.api.verification
    } else if (request.nextUrl.pathname.includes('/upload')) {
      rateLimitConfig = rateLimitPresets.api.upload
    }

    const rateLimitResult = await rateLimit(request, {
      ...rateLimitConfig,
      identifier: request.nextUrl.pathname,
      byIP: !user
    })

    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds.`
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
            ...Object.fromEntries(Object.entries(securityHeaders))
          }
        }
      )
    }

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString())
  }

  // Redirect to login if accessing protected route without authenticated user
  if (isProtectedRoute && (!user || error)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to feed if accessing auth route with authenticated user
  if (isAuthRoute && user && !error) {
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