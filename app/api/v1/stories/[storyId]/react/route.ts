import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface Params {
  params: {
    storyId: string
  }
}

const reactionSchema = z.object({
  reaction: z.enum(['like', 'love', 'fire', 'wow', 'sad', 'angry'])
})

// POST /api/v1/stories/[storyId]/react - Add reaction to story
export async function POST(request: NextRequest, { params }: Params) {
  const supabase = createClient()
  const { storyId } = params
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { reaction } = reactionSchema.parse(body)

    // Update or create view with reaction
    const { data: existingView } = await supabase
      .from('story_views')
      .select('id')
      .eq('story_id', storyId)
      .eq('viewer_id', user.id)
      .single()

    if (existingView) {
      // Update existing view
      const { error } = await supabase
        .from('story_views')
        .update({ 
          reaction,
          reacted_at: new Date().toISOString()
        })
        .eq('id', existingView.id)

      if (error) throw error
    } else {
      // Create new view with reaction
      const { error } = await supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          viewer_id: user.id,
          reaction,
          reacted_at: new Date().toISOString()
        })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding reaction:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    )
  }
}