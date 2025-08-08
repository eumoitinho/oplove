// Server-side messages service using createServerClient
import { createServerClient } from '@/lib/supabase/server'

export class PlanLimitError extends Error {
  constructor(public limitType: string, public requiredPlan?: string) {
    super(`Limite de ${limitType} atingido`)
    this.name = 'PlanLimitError'
  }
}

export class MessagesServiceServer {
  async createConversation(senderId: string, recipientId: string) {
    const supabase = await createServerClient()
    
    console.log('🔍 SERVER MESSAGES - createConversation called:', { senderId, recipientId })
    
    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('user_id', [senderId, recipientId])
    
    if (existingConv && existingConv.length >= 2) {
      // Find conversation that has both users
      const conversationCounts = existingConv.reduce((acc: any, conv: any) => {
        acc[conv.conversation_id] = (acc[conv.conversation_id] || 0) + 1
        return acc
      }, {})
      
      const existingConversationId = Object.keys(conversationCounts).find(
        id => conversationCounts[id] === 2
      )
      
      if (existingConversationId) {
        console.log('🔍 SERVER MESSAGES - Conversation already exists:', existingConversationId)
        return { id: existingConversationId }
      }
    }
    
    // Check if sender can create conversations
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('premium_type')
      .eq('id', senderId)
      .single()

    console.log('🔍 SERVER MESSAGES - Sender check:', { sender, senderError })

    if (senderError || !sender) throw new Error('Erro ao verificar usuário')

    // Free users cannot create conversations
    if (!sender.premium_type || sender.premium_type === 'free') {
      console.log('🔍 SERVER MESSAGES - Free user cannot create conversation')
      throw new PlanLimitError('conversas', 'Gold')
    }
    
    console.log('🔍 SERVER MESSAGES - User can create conversation, proceeding...')

    // Create the conversation with proper auth context
    console.log('🔍 SERVER MESSAGES - Creating conversation...')
    
    // First, set the auth context for RLS
    const { error: authError } = await supabase.auth.getUser()
    console.log('🔍 SERVER MESSAGES - Auth context:', { authError })
    
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: 'direct',
        initiated_by: senderId,
        initiated_by_premium: true
      })
      .select()
      .single()

    console.log('🔍 SERVER MESSAGES - Conversation creation result:', { conversation, convError })

    if (convError) throw convError

    // Add both participants
    console.log('🔍 SERVER MESSAGES - Adding participants...')
    const participants = [
      { conversation_id: conversation.id, user_id: senderId, role: 'member' },
      { conversation_id: conversation.id, user_id: recipientId, role: 'member' }
    ]

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants)

    console.log('🔍 SERVER MESSAGES - Participants result:', { participantsError })

    if (participantsError) {
      console.log('🔍 SERVER MESSAGES - Participants error, rolling back...')
      // Rollback conversation creation
      await supabase
        .from('conversations')
        .delete()
        .eq('id', conversation.id)
      throw participantsError
    }
    
    console.log('🔍 SERVER MESSAGES - Conversation created successfully:', conversation)

    return conversation
  }

  async getConversations(userId: string) {
    const supabase = await createServerClient()
    
    console.log('🔍 SERVER MESSAGES - Getting conversations for user:', userId)
    
    // Get conversations where user is a participant
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        type,
        name,
        avatar_url,
        last_message_at,
        created_at,
        updated_at,
        initiated_by,
        initiated_by_premium,
        group_type,
        participants:conversation_participants!inner(
          user_id,
          role,
          joined_at,
          last_read_at,
          notifications_enabled,
          user:users(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type,
            last_seen
          )
        )
      `)
      .eq('conversation_participants.user_id', userId)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('🔍 SERVER MESSAGES - Error fetching conversations:', error)
      throw error
    }

    console.log('🔍 SERVER MESSAGES - Found conversations:', conversations?.length || 0)

    return conversations || []
  }
}

export const messagesServiceServer = new MessagesServiceServer()