import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔧 Creating test data for user:', user.id)

    // Step 1: Get another user to chat with
    const { data: otherUsers } = await supabase
      .from('users')
      .select('id, username')
      .neq('id', user.id)
      .limit(1)

    if (!otherUsers || otherUsers.length === 0) {
      return NextResponse.json({
        error: 'Need at least 2 users in database to create test conversation'
      }, { status: 400 })
    }

    const otherUser = otherUsers[0]
    console.log('🔧 Other user found:', otherUser)

    // Step 2: Create test conversation
    const conversationId = '550e8400-e29b-41d4-a716-446655440000'
    
    const { error: convError } = await supabase
      .from('conversations')
      .upsert({
        id: conversationId,
        type: 'private',
        name: 'Test Conversation',
        initiated_by: user.id,
        initiated_by_premium: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (convError) {
      console.error('Error creating conversation:', convError)
    }

    // Step 3: Add participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .upsert([
        {
          conversation_id: conversationId,
          user_id: user.id,
          role: 'member',
          joined_at: new Date().toISOString()
        },
        {
          conversation_id: conversationId,
          user_id: otherUser.id,
          role: 'member',
          joined_at: new Date().toISOString()
        }
      ])

    if (participantsError) {
      console.error('Error adding participants:', participantsError)
    }

    // Step 4: Add test messages
    const now = new Date()
    const { error: messagesError } = await supabase
      .from('messages')
      .upsert([
        {
          conversation_id: conversationId,
          sender_id: user.id,
          content: 'Olá! Como você está?',
          type: 'text',
          created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2h ago
        },
        {
          conversation_id: conversationId,
          sender_id: otherUser.id,
          content: 'Oi! Estou bem, obrigado! E você?',
          type: 'text',
          created_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() // 1h ago
        },
        {
          conversation_id: conversationId,
          sender_id: user.id,
          content: 'Também estou bem! Sistema funcionando! 🎉',
          type: 'text',
          created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString() // 30min ago
        }
      ])

    if (messagesError) {
      console.error('Error adding messages:', messagesError)
    }

    // Step 5: Verify data was created
    const { data: verification } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations(
          id, 
          name, 
          type
        )
      `)
      .eq('user_id', user.id)

    console.log('🔧 Verification result:', verification)

    return NextResponse.json({
      success: true,
      message: 'Test conversation created successfully',
      data: {
        conversationId,
        currentUser: { id: user.id },
        otherUser,
        verification
      }
    })

  } catch (error: any) {
    console.error('🔧 Error creating test data:', error)
    return NextResponse.json(
      { error: 'Failed to create test data', details: error.message },
      { status: 500 }
    )
  }
}