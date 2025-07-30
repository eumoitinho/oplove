import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== STORIES DEBUG START ===')
    
    const supabase = await createServerClient()
    console.log('✅ Supabase client created')
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth result:', { hasUser: !!user, userId: user?.id, authError: authError?.message })
    
    if (authError || !user) {
      console.log('❌ Auth failed, returning 401')
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: {
          hasUser: !!user,
          authError: authError?.message,
          cookies: request.headers.get('cookie') ? 'present' : 'missing'
        }
      }, { status: 401 })
    }

    // Test users table access
    console.log('Testing users table access...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, premium_type, is_verified')
      .eq('id', user.id)
      .single()
    
    console.log('Users query result:', { userData, userError: userError?.message })

    // Test stories table access
    console.log('Testing stories table access...')
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, user_id, status, created_at')
      .limit(1)
    
    console.log('Stories query result:', { stories, storiesError: storiesError?.message })

    // Test story_daily_limits table access
    console.log('Testing story_daily_limits table access...')
    const { data: limits, error: limitsError } = await supabase
      .from('story_daily_limits')
      .select('user_id, daily_limit')
      .eq('user_id', user.id)
      .single()
    
    console.log('Limits query result:', { limits, limitsError: limitsError?.message })

    console.log('=== STORIES DEBUG END ===')

    return NextResponse.json({
      message: 'Stories debug complete',
      auth: {
        hasUser: !!user,
        userId: user.id,
        email: user.email
      },
      queries: {
        users: {
          success: !userError,
          error: userError?.message,
          data: userData
        },
        stories: {
          success: !storiesError,
          error: storiesError?.message,
          count: stories?.length || 0
        },
        limits: {
          success: !limitsError,
          error: limitsError?.message,
          data: limits
        }
      }
    })
    
  } catch (error: any) {
    console.error('Stories debug error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}