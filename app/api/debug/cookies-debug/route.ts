import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('=== COOKIES DEBUG START ===')
    
    // Check all cookies from request
    const cookieHeader = request.headers.get('cookie')
    console.log('Cookie header:', cookieHeader)
    
    // Check Next.js cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('All cookies from Next.js:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Check specific Supabase cookies
    const supabaseCookies = allCookies.filter(c => 
      c.name.includes('supabase') || 
      c.name.includes('sb-') ||
      c.name.includes('auth')
    )
    console.log('Supabase-related cookies:', supabaseCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 50) + '...' })))
    
    // Try to create Supabase client and get user
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Supabase auth result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })

    return NextResponse.json({
      cookies: {
        total: allCookies.length,
        supabaseRelated: supabaseCookies.length,
        cookieNames: allCookies.map(c => c.name),
        supabaseCookieNames: supabaseCookies.map(c => c.name)
      },
      auth: {
        hasUser: !!user,
        userId: user?.id || null,
        email: user?.email || null,
        authError: authError?.message || null
      }
    })
    
  } catch (error: any) {
    console.error('Cookies debug error:', error)
    return NextResponse.json({
      error: 'Cookies debug failed',
      details: error.message
    }, { status: 500 })
  }
}