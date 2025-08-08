import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dailyVideoService } from '@/lib/services/daily-video.service'
import { z } from 'zod'

const createCallSchema = z.object({
  conversationId: z.string().uuid(),
  callType: z.enum(['video', 'audio']).default('video'),
  maxParticipants: z.number().min(2).max(8).default(4),
  expiresInMinutes: z.number().min(5).max(120).default(60)
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createCallSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { conversationId, callType, maxParticipants, expiresInMinutes } = validation.data

    // Verify user is participant in the conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .is('left_at', null)
      .single()

    if (!participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      )
    }

    // Check if user has premium plan (only premium users can initiate calls)
    const { data: userData } = await supabase
      .from('users')
      .select('premium_type, username, name')
      .eq('id', user.id)
      .single()

    if (!userData || userData.premium_type === 'free') {
      return NextResponse.json(
        { error: 'Video calls require Gold, Diamond or Couple plan', code: 'UPGRADE_REQUIRED' },
        { status: 403 }
      )
    }

    // Create Daily.co room
    const dailyRoom = await dailyVideoService.createRoom(conversationId, callType, {
      maxParticipants,
      expiresInMinutes,
      enableScreenshare: userData.premium_type === 'diamond' || userData.premium_type === 'couple',
      enableChat: false // Use OpenLove chat
    })

    // Create meeting token for initiator
    const meetingToken = await dailyVideoService.createMeetingToken(
      dailyRoom.name,
      user.id,
      userData.name || userData.username,
      { isModerator: true, expiresInMinutes }
    )

    // Save call to database
    const { data: videoCall, error: callError } = await supabase
      .from('video_calls')
      .insert({
        conversation_id: conversationId,
        room_id: dailyRoom.id,
        room_name: dailyRoom.name,
        room_url: dailyRoom.url,
        initiated_by: user.id,
        call_type: callType,
        status: 'waiting',
        expires_at: new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (callError) {
      // Cleanup Daily.co room if DB insert fails
      await dailyVideoService.deleteRoom(dailyRoom.name)
      throw callError
    }

    // Send call notification to other participants
    const { data: otherParticipants } = await supabase
      .from('conversation_participants')
      .select(`
        user_id,
        users!inner(
          id,
          username,
          name,
          push_token
        )
      `)
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id)
      .is('left_at', null)

    // Create call message in conversation
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: callType === 'video' ? '📹 Video call started' : '📞 Voice call started',
        type: 'system',
        system_data: {
          type: 'call_started',
          call_id: videoCall.id,
          call_type: callType,
          room_url: dailyRoom.url
        }
      })

    // TODO: Send push notifications to other participants
    // This would be implemented with your push notification service

    return NextResponse.json({
      success: true,
      call: {
        id: videoCall.id,
        room_url: dailyRoom.url,
        room_name: dailyRoom.name,
        meeting_token: meetingToken,
        call_type: callType,
        expires_at: videoCall.expires_at
      }
    })
  } catch (error: any) {
    console.error('Error creating video call:', error)
    
    if (error.message?.includes('Daily.co')) {
      return NextResponse.json(
        { error: 'Video call service unavailable', details: error.message },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create video call', details: error.message },
      { status: 500 }
    )
  }
}