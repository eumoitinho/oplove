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
    const { roomUrl, conversationId } = body

    if (!roomUrl || !conversationId) {
      return NextResponse.json(
        { error: 'roomUrl e conversationId são obrigatórios' },
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

    // Get user data
    const { data: userData } = await supabase
      .from('users')
      .select('username, name, full_name')
      .eq('id', user.id)
      .single()

    // Extract room name from URL
    const roomName = roomUrl.split('/').pop()
    
    if (!roomName) {
      return NextResponse.json(
        { error: 'URL da sala inválida' },
        { status: 400 }
      )
    }

    // Create meeting token for the joining user
    const meetingToken = await dailyVideoService.createMeetingToken(
      roomName,
      user.id,
      userData?.full_name || userData?.name || userData?.username || 'User',
      { 
        isModerator: false, 
        expiresInMinutes: 60 
      }
    )

    // Update call status to active if it's the first joiner
    try {
      await supabase
        .from('video_calls')
        .update({ status: 'active' })
        .eq('room_name', roomName)
        .eq('status', 'waiting')
    } catch (error) {
      // Non-critical, continue
      console.error('Error updating call status:', error)
    }

    // Record participant join
    try {
      await supabase
        .from('call_participants')
        .insert({
          call_id: conversationId, // This should be the actual call_id
          user_id: user.id,
          session_id: meetingToken.token.slice(0, 20) // Use a portion of token as session ID
        })
    } catch (error) {
      // Non-critical, continue
      console.error('Error recording participant:', error)
    }

    return NextResponse.json({
      success: true,
      token: meetingToken.token,
      roomUrl: roomUrl,
      fullUrl: `${roomUrl}?t=${meetingToken.token}`
    })

  } catch (error: any) {
    console.error('Error joining call:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao entrar na chamada' },
      { status: 500 }
    )
  }
}