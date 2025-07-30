import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface Params {
  params: {
    storyId: string
  }
}

// GET /api/v1/stories/[storyId]/viewers - Get story viewers (owner only)
export async function GET(request: NextRequest, { params }: Params) {
  const supabase = await createServerClient()
  const { storyId } = params
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if user owns the story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('user_id')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (story.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get viewers
    const { data: viewers, error } = await supabase
      .from('story_views')
      .select(`
        *,
        viewer:users!viewer_id (
          id,
          name,
          username,
          avatar_url,
          is_verified,
          premium_type
        )
      `)
      .eq('story_id', storyId)
      .order('viewed_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ viewers: viewers || [] })
  } catch (error) {
    console.error('Error fetching story viewers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch viewers' },
      { status: 500 }
    )
  }
}