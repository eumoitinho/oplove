import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      auth: {
        hasUser: !!user,
        userId: user?.id || null,
        email: user?.email || null,
        authError: authError?.message || null
      },
      headers: {
        authorization: request.headers.get('authorization'),
        cookie: request.headers.get('cookie') ? 'present' : 'missing'
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Auth test failed',
      details: error.message
    }, { status: 500 })
  }
}