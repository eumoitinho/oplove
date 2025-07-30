import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/stories/me - Get current user's stories
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // DEBUG: Log auth info only when there's an issue
  if (!user || authError) {
    console.log('=== STORIES/ME AUTH DEBUG ===')
    console.log('User:', user?.id)
    console.log('Auth Error:', authError?.message)
    console.log('Cookies:', request.headers.get('cookie')?.includes('sb-') ? 'PRESENT' : 'MISSING')
  }
  
  if (authError || !user) {
    console.log('AUTH FAILED - returning 401')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        *,
        users!user_id (
          id,
          name,
          username,
          avatar_url,
          is_verified,
          premium_type
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error fetching user stories:', error)
      throw error
    }

    // Process stories to add view counts
    const processedStories = stories?.map(story => ({
      ...story,
      user: story.users,
      hasViewed: true, // User always viewed their own stories
      viewCount: story.view_count || 0,
      uniqueViewCount: story.unique_view_count || 0,
      reactionCount: story.reaction_count || 0,
      replyCount: story.reply_count || 0
    }))

    return NextResponse.json({ stories: processedStories || [] })
  } catch (error: any) {
    console.error('Error fetching user stories:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch stories',
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    )
  }
}