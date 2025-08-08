import { createClient } from '@/app/lib/supabase-browser'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface Conversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  avatar_url?: string
  last_message_at?: string
  last_message_id?: string
  unread_count: number
  initiated_by?: string
  initiated_by_premium?: boolean
  group_type?: 'user_created' | 'event' | 'community'
  created_at: string
  updated_at: string
  participants?: ConversationParticipant[]
  last_message?: any
}

export interface ConversationParticipant {
  conversation_id: string
  user_id: string
  role: 'member' | 'admin'
  joined_at: string
  left_at?: string | null
  last_read_at?: string
  notifications_enabled?: boolean
  user?: {
    id: string
    username: string
    name?: string
    full_name?: string
    avatar_url?: string | null
    premium_type?: string
    is_verified?: boolean
    last_seen?: string
  }
}

/**
 * Simplified Chat Service
 * Handles conversation management without complex realtime logic
 */
class ChatService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      // Get conversations where user is a participant
      const { data: participations, error: participationError } = await this.supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(
            id,
            type,
            name,
            avatar_url,
            last_message_at,
            last_message_id,
            initiated_by,
            initiated_by_premium,
            group_type,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .is('left_at', null)
        .order('conversations(last_message_at)', { ascending: false })

      if (participationError) throw participationError

      // Format conversations
      const conversations: Conversation[] = await Promise.all(
        (participations || []).map(async (p: any) => {
          const conv = p.conversations

          // Get participants
          const { data: participants } = await this.supabase
            .from('conversation_participants')
            .select(`
              *,
              user:users(
                id,
                username,
                name,
                full_name,
                avatar_url,
                premium_type,
                is_verified
              )
            `)
            .eq('conversation_id', conv.id)
            .is('left_at', null)

          // Get last message if exists
          let lastMessage = null
          if (conv.last_message_id) {
            const { data } = await this.supabase
              .from('messages')
              .select(`
                *,
                sender:users!sender_id(
                  id,
                  username,
                  name,
                  avatar_url
                )
              `)
              .eq('id', conv.last_message_id)
              .single()
            
            lastMessage = data
          }

          // Get unread count
          const { count: unreadCount } = await this.supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .eq('is_read', false)

          return {
            ...conv,
            participants,
            last_message: lastMessage,
            unread_count: unreadCount || 0
          }
        })
      )

      return conversations
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  }

  /**
   * Get or create a direct conversation
   */
  async getOrCreateDirectConversation(currentUserId: string, targetUserId: string): Promise<Conversation> {
    try {
      // Check for existing conversation
      const { data: existing } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('type', 'direct')
        .contains('participants', [currentUserId, targetUserId])
        .single()

      if (existing) {
        return existing
      }

      // Get current user to check premium status
      const { data: currentUser } = await this.supabase
        .from('users')
        .select('premium_type')
        .eq('id', currentUserId)
        .single()

      const isPremium = currentUser?.premium_type !== 'free'

      // Create new conversation
      const { data: newConv, error: createError } = await this.supabase
        .from('conversations')
        .insert({
          type: 'direct',
          participants: [currentUserId, targetUserId],
          initiated_by: currentUserId,
          initiated_by_premium: isPremium
        })
        .select()
        .single()

      if (createError) throw createError

      // Add participants
      await this.supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: newConv.id,
            user_id: currentUserId,
            role: 'member'
          },
          {
            conversation_id: newConv.id,
            user_id: targetUserId,
            role: 'member'
          }
        ])

      return newConv
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  /**
   * Create a group conversation
   */
  async createGroupConversation(
    creatorId: string,
    name: string,
    participantIds: string[],
    description?: string
  ): Promise<Conversation> {
    try {
      // Check if user can create groups (Diamond/Couple only)
      const { data: creator } = await this.supabase
        .from('users')
        .select('premium_type')
        .eq('id', creatorId)
        .single()

      if (!creator || !['diamond', 'couple'].includes(creator.premium_type)) {
        throw new Error('Apenas usuários Diamond ou Dupla Hot podem criar grupos')
      }

      // Create conversation
      const { data: conversation, error } = await this.supabase
        .from('conversations')
        .insert({
          type: 'group',
          name,
          description,
          participants: [creatorId, ...participantIds],
          initiated_by: creatorId,
          initiated_by_premium: true,
          group_type: 'user_created'
        })
        .select()
        .single()

      if (error) throw error

      // Add participants
      const participants = [
        {
          conversation_id: conversation.id,
          user_id: creatorId,
          role: 'admin' as const
        },
        ...participantIds.map(id => ({
          conversation_id: conversation.id,
          user_id: id,
          role: 'member' as const
        }))
      ]

      await this.supabase
        .from('conversation_participants')
        .insert(participants)

      return conversation
    } catch (error) {
      console.error('Error creating group conversation:', error)
      throw error
    }
  }

  /**
   * Check if user can send messages
   */
  async checkMessagePermissions(userId: string, conversationId: string): Promise<{
    allowed: boolean
    reason?: string
    isReply?: boolean
  }> {
    try {
      // Get user and conversation details
      const [userResult, convResult] = await Promise.all([
        this.supabase.from('users').select('*').eq('id', userId).single(),
        this.supabase.from('conversations').select('*').eq('id', conversationId).single()
      ])

      if (userResult.error || convResult.error) {
        return { allowed: false, reason: 'Erro ao verificar permissões' }
      }

      const user = userResult.data
      const conversation = convResult.data

      // Free users can only reply if premium initiated
      if (user.premium_type === 'free') {
        if (conversation.initiated_by_premium && conversation.initiated_by !== userId) {
          return { allowed: true, isReply: true }
        }
        return { allowed: false, reason: 'Usuários gratuitos não podem iniciar conversas' }
      }

      // Gold users have daily limits if not verified
      if (user.premium_type === 'gold' && !user.is_verified) {
        const today = new Date().toISOString().split('T')[0]
        
        const { count } = await this.supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('sender_id', userId)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)

        const limit = 200
        if ((count || 0) >= limit) {
          return { 
            allowed: false, 
            reason: `Limite diário de ${limit} mensagens atingido. Verifique sua conta para mensagens ilimitadas.`
          }
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error('Error checking message permissions:', error)
      return { allowed: false, reason: 'Erro ao verificar permissões' }
    }
  }

  /**
   * Get conversation details
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            *,
            user:users(
              id,
              username,
              name,
              full_name,
              avatar_url,
              premium_type,
              is_verified
            )
          )
        `)
        .eq('id', conversationId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching conversation:', error)
      return null
    }
  }

  /**
   * Leave a conversation
   */
  async leaveConversation(userId: string, conversationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('conversation_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error leaving conversation:', error)
      return false
    }
  }

  /**
   * Add participants to group
   */
  async addParticipants(conversationId: string, userIds: string[]): Promise<boolean> {
    try {
      const participants = userIds.map(userId => ({
        conversation_id: conversationId,
        user_id: userId,
        role: 'member' as const
      }))

      const { error } = await this.supabase
        .from('conversation_participants')
        .insert(participants)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error adding participants:', error)
      return false
    }
  }

  /**
   * Update conversation settings
   */
  async updateConversation(
    conversationId: string,
    updates: Partial<Pick<Conversation, 'name' | 'avatar_url'>>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('conversations')
        .update(updates)
        .eq('id', conversationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating conversation:', error)
      return false
    }
  }
}

// Export singleton instance
export const chatService = new ChatService()