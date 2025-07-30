import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/stories/limits - Get user's daily story limits
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's premium type and verification status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('premium_type, is_verified')
      .eq('id', user.id)
      .single()

    if (userError) throw userError

    // Calculate daily limit based on plan
    let dailyLimit = 0
    const plan = userData?.premium_type || 'free'
    const isVerified = userData?.is_verified || false

    if (plan === 'free') {
      dailyLimit = isVerified ? 3 : 0
    } else if (plan === 'gold') {
      dailyLimit = isVerified ? 10 : 5
    } else if (plan === 'diamond' || plan === 'couple') {
      dailyLimit = isVerified ? 999 : 10 // 999 = unlimited
    }

    // Get current usage
    const { data: limitData, error: limitError } = await supabase
      .from('story_daily_limits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let storiesPostedToday = 0
    let lastResetDate = new Date().toISOString().split('T')[0]

    if (limitData) {
      // Check if needs reset
      const today = new Date().toISOString().split('T')[0]
      if (limitData.last_reset_date < today) {
        // Reset counter
        const { error: resetError } = await supabase
          .from('story_daily_limits')
          .update({
            stories_posted_today: 0,
            last_reset_date: today,
            daily_limit: dailyLimit
          })
          .eq('user_id', user.id)

        if (resetError) throw resetError
        
        storiesPostedToday = 0
      } else {
        storiesPostedToday = limitData.stories_posted_today
      }
      lastResetDate = limitData.last_reset_date
    } else {
      // Create new limit record
      const { error: insertError } = await supabase
        .from('story_daily_limits')
        .insert({
          user_id: user.id,
          daily_limit: dailyLimit,
          stories_posted_today: 0,
          last_reset_date: new Date().toISOString().split('T')[0]
        })

      if (insertError) throw insertError
    }

    return NextResponse.json({
      userId: user.id,
      dailyLimit,
      storiesPostedToday,
      lastResetDate,
      canPostMore: storiesPostedToday < dailyLimit,
      remainingStories: Math.max(0, dailyLimit - storiesPostedToday)
    })
  } catch (error) {
    console.error('Error fetching story limits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch limits' },
      { status: 500 }
    )
  }
}