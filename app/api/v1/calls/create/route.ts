import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { dailyVideoService } from '@/lib/services/daily-video-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      conversationId, 
      callType = 'video',
      maxParticipants = 8,
      expiresInMinutes = 60
    } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId é obrigatório' },
        { status: 400 }
      )
    }

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
        { error: 'Você não é participante desta conversa' },
        { status: 403 }
      )
    }

    // Check if user has premium plan (only Diamond and Couple can make calls)
    const { data: userData } = await supabase
      .from('users')
      .select('premium_type, username, name, full_name')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.premium_type !== 'diamond' && userData.premium_type !== 'couple')) {
      return NextResponse.json(
        { 
          error: 'Chamadas de voz/vídeo estão disponíveis apenas para planos Diamond ou Dupla Hot', 
          code: 'UPGRADE_REQUIRED' 
        },
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
      userData.full_name || userData.name || userData.username,
      { 
        isModerator: true, 
        expiresInMinutes 
      }
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
      console.error('Failed to save call to database:', callError)
      // Continue anyway - the call can still work
    }

    // Send notification to other participants
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id)
      .is('left_at', null)

    if (participants && participants.length > 0) {
      // Create notifications for other participants
      const notifications = participants.map(p => ({
        recipient_id: p.user_id,
        sender_id: user.id,
        type: 'call',
        content: `${userData.full_name || userData.name || userData.username} está te chamando para uma ${callType === 'video' ? 'videochamada' : 'chamada de voz'}`,
        link: `/feed?view=messages&conversation=${conversationId}`,
        metadata: {
          conversation_id: conversationId,
          room_url: dailyRoom.url,
          call_type: callType
        }
      }))

      await supabase
        .from('notifications')
        .insert(notifications)
    }

    return NextResponse.json({
      success: true,
      call: {
        id: videoCall?.id || dailyRoom.id,
        room_url: dailyRoom.url,
        room_name: dailyRoom.name,
        meeting_token: meetingToken.token,
        call_type: callType,
        expires_at: new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error creating call:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar chamada' },
      { status: 500 }
    )
  }
}