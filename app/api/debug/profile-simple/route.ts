import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        authError: authError?.message
      }, { status: 401 })
    }

    // Check if profile exists in users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, username, name, premium_type, is_verified')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      auth: {
        userId: user.id,
        email: user.email
      },
      profile: profile || null,
      profileError: profileError?.message || null,
      hasProfile: !!profile
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error.message
    }, { status: 500 })
  }
}