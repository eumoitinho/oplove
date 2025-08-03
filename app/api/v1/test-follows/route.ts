import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        authError: authError?.message
      })
    }
    
    // Test follows table permissions
    const { data: followsTest, error: followsError } = await supabase
      .from('follows')
      .select('id')
      .limit(1)
    
    return NextResponse.json({
      success: !followsError,
      userId: user.id,
      userEmail: user.email,
      followsTableAccess: followsError ? 'ERROR' : 'OK',
      followsError: followsError ? {
        message: followsError.message,
        code: followsError.code,
        details: followsError.details
      } : null,
      followsData: followsTest
    })
  } catch (error) {
    console.error('[Test Follows API] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}