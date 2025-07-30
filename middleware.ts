import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { CacheService } from '@/lib/cache/redis' // Temporarily disabled for testing

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

  // API Rate limiting and cache headers - Temporarily disabled
  // if (isApiRoute && session?.user) {
  //   // Rate limiting logic temporarily disabled for testing
  // }

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