import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface Params {
  params: {
    storyId: string
  }
}

// GET /api/v1/stories/[storyId] - Get a specific story
export async function GET(request: NextRequest, { params }: Params) {
  const supabase = await createServerClient()
  const { storyId } = params
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: story, error } = await supabase
      .from('stories')
      .select(`
        *,
        user:users!user_id (
          id,
          name,
          username,
          avatar_url,
          is_verified,
          premium_type
        ),
        views:story_views!story_id (
          id,
          viewer_id,
          reaction,
          viewed_at
        )
      `)
      .eq('id', storyId)
      .single()

    if (error || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Check if story is expired
    if (story.status === 'expired' || new Date(story.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Story has expired' }, { status: 410 })
    }

    // Add user interaction data
    const processedStory = {
      ...story,
      hasViewed: story.views?.some((v: any) => v.viewer_id === user.id) || false,
      viewedAt: story.views?.find((v: any) => v.viewer_id === user.id)?.viewed_at,
      reaction: story.views?.find((v: any) => v.viewer_id === user.id)?.reaction
    }

    return NextResponse.json(processedStory)
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/stories/[storyId] - Delete a story
export async function DELETE(request: NextRequest, { params }: Params) {
  const supabase = await createServerClient()
  const { storyId } = params
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if user owns the story
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('user_id')
      .eq('id', storyId)
      .single()

    if (fetchError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (story.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete the story
    const { error } = await supabase
      .from('stories')
      .update({ 
        status: 'deleted',
        deleted_at: new Date().toISOString()
      })
      .eq('id', storyId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting story:', error)
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    )
  }
}