import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MessageService } from '@/lib/services/message.service'
import { z } from 'zod'

// Validation schemas
const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'image', 'video', 'audio', 'file']).default('text'),
  mediaUrl: z.string().url().optional(),
  replyTo: z.string().uuid().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const cursor = searchParams.get('cursor') || undefined

    const messageService = new MessageService()
    const result = await messageService.getConversationMessages(
      params.id,
      user.id,
      limit,
      cursor
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = sendMessageSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid message data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { content, type, mediaUrl } = validation.data
    const messageService = new MessageService()

    const message = await messageService.sendMessage(
      params.id,
      user.id,
      content,
      type,
      mediaUrl
    )

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error('Error sending message:', error)
    
    // Handle specific business rule errors
    if (error.message?.includes('permission')) {
      return NextResponse.json(
        { error: error.message, code: 'PERMISSION_DENIED' },
        { status: 403 }
      )
    }
    
    if (error.message?.includes('Daily message limit')) {
      return NextResponse.json(
        { error: error.message, code: 'LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}