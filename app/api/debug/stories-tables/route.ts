import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  
  try {
    // Check if stories table exists
    const { data: storiesTest, error: storiesError } = await supabase
      .from('stories')
      .select('count')
      .limit(1)
    
    if (storiesError && storiesError.code === 'PGRST116') {
      return NextResponse.json({
        status: 'missing_tables',
        message: 'Stories tables do not exist',
        error: storiesError.message,
        solution: {
          step1: 'Go to your Supabase dashboard',
          step2: 'Navigate to SQL Editor',
          step3: 'Run the migration: supabase/migrations/20250131_create_stories_system.sql',
          migrationFile: '/supabase/migrations/20250131_create_stories_system.sql'
        }
      })
    }
    
    if (storiesError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database error',
        error: storiesError
      })
    }
    
    // Check other required tables
    const requiredTables = [
      'story_views',
      'story_replies', 
      'story_daily_limits',
      'user_credits',
      'profile_seals'
    ]
    
    const tableStatus = {}
    
    for (const tableName of requiredTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1)
        
        tableStatus[tableName] = error ? 'missing' : 'exists'
      } catch (err) {
        tableStatus[tableName] = 'error'
      }
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Stories system database check',
      tables: {
        stories: 'exists',
        ...tableStatus
      }
    })
    
  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}