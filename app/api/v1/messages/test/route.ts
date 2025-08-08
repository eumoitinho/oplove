import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Testing messages API for user:', user.id)

    // Test 1: Check if we can access messages table at all
    const { data: allMessages, error: allError } = await supabase
      .from('messages')
      .select('id, content, created_at, sender_id')
      .limit(5)

    console.log('🔍 All messages test:', { allMessages, allError })

    // Test 2: Check conversations user has access to
    const { data: userConversations, error: convError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    console.log('🔍 User conversations:', { userConversations, convError })

    // Test 3: Get messages for user's conversations
    if (userConversations && userConversations.length > 0) {
      const conversationIds = userConversations.map(c => c.conversation_id)
      
      const { data: userMessages, error: msgError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          conversation_id,
          sender:users(id, username, name)
        `)
        .in('conversation_id', conversationIds)
        .limit(10)

      console.log('🔍 User messages:', { userMessages, msgError })

      return NextResponse.json({
        success: true,
        user_id: user.id,
        tests: {
          allMessages: { data: allMessages, error: allError },
          userConversations: { data: userConversations, error: convError },
          userMessages: { data: userMessages, error: msgError }
        }
      })
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      message: 'No conversations found for user',
      tests: {
        allMessages: { data: allMessages, error: allError },
        userConversations: { data: userConversations, error: convError }
      }
    })
  } catch (error: any) {
    console.error('🔍 Test API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}