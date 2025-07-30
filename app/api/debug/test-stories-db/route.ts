import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    // Create service role client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test stories table access
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, user_id, created_at, status')
      .limit(5)

    // Test story_daily_limits table access
    const { data: limits, error: limitsError } = await supabase
      .from('story_daily_limits')
      .select('user_id, daily_limit, stories_posted_today')
      .limit(5)

    // Test user_credits table access
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('user_id, credit_balance')
      .limit(5)

    // Check if tables exist using raw SQL
    const { data: tableCheck, error: tableError } = await supabase
      .rpc('get_table_info')
      .then(() => ({ data: 'rpc works', error: null }))
      .catch(() => ({ data: null, error: 'rpc not available' }))

    return NextResponse.json({
      message: 'Database connectivity test',
      results: {
        stories: {
          success: !storiesError,
          count: stories?.length || 0,
          error: storiesError?.message,
          sample: stories?.[0] || null
        },
        story_daily_limits: {
          success: !limitsError,
          count: limits?.length || 0,
          error: limitsError?.message,
          sample: limits?.[0] || null
        },
        user_credits: {
          success: !creditsError,
          count: credits?.length || 0,
          error: creditsError?.message,
          sample: credits?.[0] || null
        },
        tableCheck: {
          result: tableCheck,
          error: tableError
        }
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Database test failed',
      details: error.message
    }, { status: 500 })
  }
}