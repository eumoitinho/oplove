import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MessageService } from '@/lib/services/message.service'
import { z } from 'zod'

// Validation schemas
const createConversationSchema = z.object({
  type: z.enum(['direct', 'group']).default('direct'),
  participantIds: z.array(z.string().uuid()),
  name: z.string().optional(),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const messageService = new MessageService()
    const conversations = await messageService.getUserConversations(
      user.id,
      limit,
      offset
    )

    return NextResponse.json({
      conversations,
      pagination: {
        limit,
        offset,
        hasMore: conversations.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createConversationSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { type, participantIds, name, description } = validation.data
    const messageService = new MessageService()

    let conversation

    if (type === 'direct') {
      if (participantIds.length !== 1) {
        return NextResponse.json(
          { error: 'Direct conversations require exactly one other participant' },
          { status: 400 }
        )
      }

      conversation = await messageService.createOrGetDirectConversation(
        user.id,
        participantIds[0]
      )
    } else {
      if (!name) {
        return NextResponse.json(
          { error: 'Group conversations require a name' },
          { status: 400 }
        )
      }

      conversation = await messageService.createGroupConversation(
        user.id,
        name,
        participantIds,
        description
      )
    }

    return NextResponse.json({ conversation })
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    
    // Handle specific business rule errors
    if (error.message?.includes('Free users cannot initiate')) {
      return NextResponse.json(
        { error: error.message, code: 'UPGRADE_REQUIRED' },
        { status: 403 }
      )
    }
    
    if (error.message?.includes('Only Diamond users')) {
      return NextResponse.json(
        { error: error.message, code: 'DIAMOND_REQUIRED' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}