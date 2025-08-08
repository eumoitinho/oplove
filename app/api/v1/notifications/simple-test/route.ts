import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        authError: authError?.message
      })
    }
    
    // Test simple notifications query
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .limit(5)
    
    return NextResponse.json({
      success: !error,
      userId: user.id,
      notificationsCount: notifications?.length || 0,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details
      } : null,
      notifications: notifications || []
    })
  } catch (error) {
    console.error('[Simple Test API] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}