import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Getting conversations for user:', user.id)

    // Simple query without complex joins
    const { data: userConversations, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations (
          id,
          type,
          name,
          description,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .is('left_at', null)
      .limit(20)

    console.log('🔍 Query result:', { userConversations, convError })

    if (convError) {
      return NextResponse.json({ 
        error: 'Failed to fetch conversations', 
        details: convError 
      }, { status: 500 })
    }

    // Transform the data
    const conversations = (userConversations || []).map(uc => ({
      id: uc.conversations?.id,
      type: uc.conversations?.type,
      name: uc.conversations?.name,
      description: uc.conversations?.description,
      created_at: uc.conversations?.created_at,
      updated_at: uc.conversations?.updated_at,
      unread_count: 0,
      participants: [],
      is_typing: []
    })).filter(c => c.id) // Remove any null conversations

    console.log('🔍 Transformed conversations:', conversations)

    return NextResponse.json({
      success: true,
      data: conversations,
      count: conversations.length
    })
  } catch (error: any) {
    console.error('🔍 Simple API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}