import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createStorySchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video']),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().max(200).optional(),
  duration: z.number().min(1).max(15).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  fileSize: z.number().optional(),
  isPublic: z.boolean().optional()
})

// GET /api/v1/stories - Get stories feed
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { searchParams } = new URL(request.url)
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const boosted = searchParams.get('boosted') === 'true'
  const userId = searchParams.get('userId')
  const following = searchParams.get('following') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    let query = supabase
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
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Filter by boosted stories
    if (boosted) {
      query = query
        .eq('is_boosted', true)
        .order('boost_credits_spent', { ascending: false })
    }

    // Filter by specific user
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Filter by following users
    if (following) {
      // Get following list
      const { data: followingList } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = followingList?.map(f => f.following_id) || []
      if (followingIds.length > 0) {
        query = query.in('user_id', followingIds)
      }
    }

    const { data: stories, error } = await query

    if (error) {
      console.error('Database error fetching stories:', error)
      throw error
    }

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

    return NextResponse.json({ stories: processedStories })
  } catch (error: any) {
    console.error('Error fetching stories:', error)
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

// POST /api/v1/stories - Create a new story
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = createStorySchema.parse(body)

    // Create story (trigger will check limits)
    const { data: story, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        ...validatedData,
        duration: validatedData.duration || (validatedData.mediaType === 'image' ? 5 : 15)
      })
      .select(`
        *,
        user:users!user_id (
          id,
          name,
          username,
          avatar_url,
          is_verified,
          premium_type
        )
      `)
      .single()

    if (error) {
      if (error.message?.includes('Daily story limit reached')) {
        return NextResponse.json(
          { error: 'Você atingiu o limite diário de stories' },
          { status: 429 }
        )
      }
      throw error
    }

    return NextResponse.json(story, { status: 201 })
  } catch (error: any) {
    console.error('Error creating story:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to create story',
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    )
  }
}