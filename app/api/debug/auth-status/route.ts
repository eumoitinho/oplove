import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH DEBUG START ===')
    
    const supabase = await createServerClient()
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      authError: authError?.message
    })

    // Test direct SQL query with service role
    const { data: directQuery, error: directError } = await supabase
      .rpc('auth_uid')
      .then(() => ({ data: 'auth_uid works', error: null }))
      .catch(err => ({ data: null, error: err.message }))

    console.log('Direct auth check:', { directQuery, directError })

    return NextResponse.json({
      authentication: {
        hasUser: !!user,
        userId: user?.id || null,
        email: user?.email || null,
        authError: authError?.message || null
      },
      request: {
        cookies: request.headers.get('cookie') ? 'present' : 'missing',
        authorization: request.headers.get('authorization') ? 'present' : 'missing',
        userAgent: request.headers.get('user-agent')
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    })
    
  } catch (error: any) {
    console.error('Auth debug error:', error)
    return NextResponse.json({
      error: 'Auth debug failed',
      details: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 })
  }
}