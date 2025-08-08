import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Simple test to get all comments
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select('id, content, created_at, post_id, user_id')
      .limit(5)
    
    if (error) {
      console.error('[Comments Simple API] Error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      })
    }
    
    // Count total comments
    const { count, error: countError } = await supabase
      .from('post_comments')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      success: true,
      totalComments: count || 0,
      comments: comments || [],
      countError: countError?.message
    })
  } catch (error) {
    console.error('[Comments Simple API] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}