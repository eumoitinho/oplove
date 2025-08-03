import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection error',
        details: testError.message,
        code: testError.code
      })
    }
    
    // Test comments table
    const { data: commentsTest, error: commentsError } = await supabase
      .from('comments')
      .select('id')
      .limit(1)
    
    // Test posts table
    const { data: postsTest, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .limit(1)
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      tables: {
        users: testData ? 'OK' : 'Empty',
        comments: commentsError ? commentsError.message : (commentsTest ? 'OK' : 'Empty'),
        posts: postsError ? postsError.message : (postsTest ? 'OK' : 'Empty')
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}