import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase-server'
import { chatService } from '@/lib/services/chat-service'

/**
 * GET /api/v1/chat/conversations
 * Get all conversations for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get conversations
    const conversations = await chatService.getConversations(user.id)

    return NextResponse.json({
      success: true,
      data: conversations
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/chat/conversations
 * Create a new conversation (direct or group)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { type = 'direct', recipientId, participantIds, name, description } = body

    // Validate input
    if (type === 'direct') {
      if (!recipientId) {
        return NextResponse.json(
          { success: false, error: 'Recipient ID is required for direct conversations' },
          { status: 400 }
        )
      }

      // Check permissions
      const { allowed, reason } = await chatService.checkMessagePermissions(
        user.id,
        '' // We check general permissions, not for specific conversation
      )

      if (!allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: reason || 'You cannot create conversations',
            errorType: 'PLAN_LIMIT',
            requiredPlan: 'Gold'
          },
          { status: 403 }
        )
      }

      // Create or get direct conversation
      const conversation = await chatService.getOrCreateDirectConversation(
        user.id,
        recipientId
      )

      return NextResponse.json({
        success: true,
        data: conversation
      })
    } else if (type === 'group') {
      if (!participantIds?.length || !name) {
        return NextResponse.json(
          { success: false, error: 'Participants and name are required for group conversations' },
          { status: 400 }
        )
      }

      // Create group conversation
      const conversation = await chatService.createGroupConversation(
        user.id,
        name,
        participantIds,
        description
      )

      return NextResponse.json({
        success: true,
        data: conversation
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation type' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    
    // Handle specific errors
    if (error.message?.includes('Diamond') || error.message?.includes('Dupla Hot')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          errorType: 'PLAN_LIMIT',
          requiredPlan: 'Diamond'
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}