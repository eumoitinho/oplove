import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase-server'
import { chatService } from '@/lib/services/chat-service'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/v1/chat/conversations/[id]/messages
 * Get messages for a conversation
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient()
    const conversationId = params.id
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is participant
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .is('left_at', null)
      .single()

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'You are not a participant in this conversation' },
        { status: 403 }
      )
    }

    // Get pagination params
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(
          id,
          username,
          name,
          avatar_url,
          premium_type,
          is_verified
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: messages || []
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/chat/conversations/[id]/messages
 * Send a message to a conversation
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient()
    const conversationId = params.id
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { content, type = 'text', media_url, metadata } = body

    // Validate content
    if (!content && !media_url) {
      return NextResponse.json(
        { success: false, error: 'Message content or media is required' },
        { status: 400 }
      )
    }

    // Check permissions
    const { allowed, reason } = await chatService.checkMessagePermissions(
      user.id,
      conversationId
    )

    if (!allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: reason || 'You cannot send messages in this conversation',
          errorType: 'PLAN_LIMIT'
        },
        { status: 403 }
      )
    }

    // Send message
    const { data: message, error: sendError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        type,
        media_url,
        media_metadata: metadata
      })
      .select(`
        *,
        sender:users!sender_id(
          id,
          username,
          name,
          avatar_url,
          premium_type,
          is_verified
        )
      `)
      .single()

    if (sendError) throw sendError

    // Update conversation's last message
    await supabase
      .from('conversations')
      .update({
        last_message_at: message.created_at,
        last_message_id: message.id
      })
      .eq('id', conversationId)

    return NextResponse.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/v1/chat/conversations/[id]/messages
 * Mark messages as read
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient()
    const conversationId = params.id
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mark all unread messages as read
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    if (error) throw error

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}