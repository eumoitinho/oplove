import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface Params {
  params: {
    storyId: string
  }
}

const replySchema = z.object({
  message: z.string().min(1).max(500),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['image', 'video', 'gif']).optional()
})

// POST /api/v1/stories/[storyId]/reply - Send reply to story
export async function POST(request: NextRequest, { params }: Params) {
  const supabase = await createServerClient()
  const { storyId } = params
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = replySchema.parse(body)

    // Check if story exists and is active
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('user_id, status, expires_at')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (story.status !== 'active' || new Date(story.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Story has expired' }, { status: 410 })
    }

    // Don't allow replying to own story
    if (story.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot reply to own story' }, { status: 400 })
    }

    // Create reply
    const { data: reply, error } = await supabase
      .from('story_replies')
      .insert({
        story_id: storyId,
        sender_id: user.id,
        ...validatedData
      })
      .select(`
        *,
        sender:users!sender_id (
          id,
          name,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    // Find or create DM conversation with story owner
    let conversation = null
    
    // Try to find existing conversation between the two users
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('type', 'direct')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${story.user_id}),and(user1_id.eq.${story.user_id},user2_id.eq.${user.id})`)
      .single()

    if (existingConv) {
      conversation = existingConv
    } else {
      // Create new conversation
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          user1_id: user.id,
          user2_id: story.user_id,
          initiated_by: user.id,
          initiated_by_premium: true // Assume premium for story replies
        })
        .select('id')
        .single()
      
      conversation = newConv
    }

    if (conversation) {
      // Send message to DM conversation
      const messageText = `📩 Respondeu ao seu story: ${validatedData.message}`
      
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          message: messageText,
          message_type: 'text'
        })
    }

    // Update reply count
    await supabase.rpc('increment', {
      table_name: 'stories',
      column_name: 'reply_count',
      row_id: storyId
    })

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error('Error sending reply:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    )
  }
}