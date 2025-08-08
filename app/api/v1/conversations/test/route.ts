import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Testing conversation query for user:', user.id)

    // Test 1: Get user's conversation participants
    const { data: userParticipants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)
      .is('left_at', null)

    console.log('🔍 User participants:', userParticipants, participantsError)

    if (participantsError) {
      return NextResponse.json({ 
        error: 'Participants query failed', 
        details: participantsError 
      }, { status: 500 })
    }

    if (!userParticipants || userParticipants.length === 0) {
      return NextResponse.json({
        conversations: [],
        message: 'No conversations found for user'
      })
    }

    // Test 2: Get conversations with details
    const conversationIds = userParticipants.map(p => p.conversation_id)
    
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)

    console.log('🔍 Conversations:', conversations, conversationsError)

    if (conversationsError) {
      return NextResponse.json({ 
        error: 'Conversations query failed', 
        details: conversationsError 
      }, { status: 500 })
    }

    return NextResponse.json({
      conversations: conversations || [],
      userParticipants,
      conversationIds
    })
  } catch (error: any) {
    console.error('🔍 Test API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}