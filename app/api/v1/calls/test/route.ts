import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { dailyVideoService } from '@/lib/services/daily-video-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Check user plan
    const { data: userData } = await supabase
      .from('users')
      .select('premium_type, username, name, full_name')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.premium_type !== 'diamond' && userData.premium_type !== 'couple')) {
      return NextResponse.json(
        { 
          error: 'Chamadas de voz/vídeo estão disponíveis apenas para planos Diamond ou Dupla Hot', 
          code: 'UPGRADE_REQUIRED',
          userPlan: userData?.premium_type || 'free'
        },
        { status: 403 }
      )
    }

    // Create a test Daily.co room
    const testRoom = await dailyVideoService.createRoom(
      'test-' + Date.now().toString(), 
      'video',
      {
        maxParticipants: 2,
        expiresInMinutes: 5,
        enableScreenshare: true,
        enableChat: false
      }
    )

    // Create meeting token
    const meetingToken = await dailyVideoService.createMeetingToken(
      testRoom.name,
      user.id,
      userData.full_name || userData.name || userData.username,
      { 
        isModerator: true, 
        expiresInMinutes: 5 
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Daily.co integration is working!',
      testRoom: {
        url: testRoom.url,
        name: testRoom.name,
        token: meetingToken.token,
        fullUrl: `${testRoom.url}?t=${meetingToken.token}`,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      },
      user: {
        id: user.id,
        name: userData.full_name || userData.name || userData.username,
        plan: userData.premium_type
      }
    })

  } catch (error: any) {
    console.error('Error testing Daily.co:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao testar integração Daily.co',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}