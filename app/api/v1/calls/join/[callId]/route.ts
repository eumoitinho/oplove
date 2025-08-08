import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dailyVideoService } from '@/lib/services/daily-video.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { callId } = params

    // Get call information
    const { data: videoCall, error: callError } = await supabase
      .from('video_calls')
      .select(`
        *,
        conversation:conversations(
          id,
          type,
          name
        )
      `)
      .eq('id', callId)
      .single()

    if (callError || !videoCall) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      )
    }

    // Check if call is still active
    if (videoCall.status === 'ended') {
      return NextResponse.json(
        { error: 'Call has ended' },
        { status: 410 }
      )
    }

    if (new Date(videoCall.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Call has expired' },
        { status: 410 }
      )
    }

    // Verify user is participant in the conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', videoCall.conversation_id)
      .eq('user_id', user.id)
      .is('left_at', null)
      .single()

    if (!participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      )
    }

    // Get user info for meeting token
    const { data: userData } = await supabase
      .from('users')
      .select('premium_type, username, name')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create meeting token for participant
    const meetingToken = await dailyVideoService.createMeetingToken(
      videoCall.room_name,
      user.id,
      userData.name || userData.username,
      { 
        isModerator: user.id === videoCall.initiated_by,
        expiresInMinutes: 60 
      }
    )

    // Update call status to active if it's the first join
    if (videoCall.status === 'waiting') {
      await supabase
        .from('video_calls')
        .update({
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', callId)
    }

    // Log participant join
    await supabase
      .from('call_participants')
      .upsert({
        call_id: callId,
        user_id: user.id,
        joined_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      call: {
        id: videoCall.id,
        room_url: videoCall.room_url,
        room_name: videoCall.room_name,
        meeting_token: meetingToken,
        call_type: videoCall.call_type,
        conversation: videoCall.conversation
      }
    })
  } catch (error: any) {
    console.error('Error joining video call:', error)
    
    if (error.message?.includes('Daily.co')) {
      return NextResponse.json(
        { error: 'Video call service unavailable', details: error.message },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to join video call', details: error.message },
      { status: 500 }
    )
  }
}