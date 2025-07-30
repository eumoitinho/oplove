import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/stories/following - Get stories from following users
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get following list
    const { data: followingList, error: followError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    if (followError) throw followError

    const followingIds = followingList?.map(f => f.following_id) || []

    if (followingIds.length === 0) {
      return NextResponse.json({ stories: [] })
    }

    // Get stories from following users
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
      .in('user_id', followingIds)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    // Process stories to add user interaction data
    const processedStories = stories?.map(story => ({
      ...story,
      user: story.users,
      hasViewed: false, // Simplificado por enquanto
      viewedAt: null,
      reaction: null,
      viewCount: story.view_count || 0,
      uniqueViewCount: story.unique_view_count || 0,
      reactionCount: story.reaction_count || 0,
      replyCount: story.reply_count || 0
    }))

    return NextResponse.json({ stories: processedStories || [] })
  } catch (error) {
    console.error('Error fetching following stories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    )
  }
}