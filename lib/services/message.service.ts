import { createSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { ConversationCacheService } from '@/lib/cache/conversation-cache.service'

type Message = Database['public']['Tables']['messages']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type ConversationParticipant = Database['public']['Tables']['conversation_participants']['Row']

export interface ConversationWithMetadata extends Conversation {
  last_message?: Message & {
    sender: {
      id: string
      username: string
      avatar_url: string | null
      display_name: string | null
    }
  }
  unread_count: number
  participants: Array<{
    user_id: string
    username: string
    avatar_url: string | null
    display_name: string | null
    is_online: boolean
  }>
  is_typing: string[]
}

export interface MessageWithSender extends Message {
  sender: {
    id: string
    username: string
    avatar_url: string | null
    display_name: string | null
  }
  read_by: string[]
  reactions?: Record<string, string[]>
}

export class MessageService {
  private supabase = createSupabaseClient()
  private cacheService = new ConversationCacheService()

  /**
   * Get user conversations - simplified version without RPC
   */
  async getUserConversations(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<ConversationWithMetadata[]> {
    try {
      // Check cache first
      if (offset === 0) {
        const cached = await this.cacheService.getConversations(userId)
        if (cached) {
          return cached.slice(0, limit)
        }
      }

      // Get user's conversations
      const { data: userConversations, error: convError } = await this.supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(
            id,
            type,
            name,
            description,
            avatar_url,
            created_by,
            initiated_by,
            initiated_by_premium,
            group_type,
            is_active,
            message_count,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .is('left_at', null)
        .limit(limit)
        .range(offset, offset + limit - 1)

      if (convError) throw convError

      if (!userConversations || userConversations.length === 0) {
        return []
      }

      // Get conversation IDs
      const conversationIds = userConversations.map(uc => uc.conversation_id)

      // Batch fetch last messages
      const { data: lastMessages } = await this.supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(
            id,
            username,
            avatar_url,
            name
          )
        `)
        .in('conversation_id', conversationIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      // Batch fetch participants
      const { data: allParticipants } = await this.supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          user_id,
          users!inner(
            id,
            username,
            avatar_url,
            name,
            last_seen_at
          )
        `)
        .in('conversation_id', conversationIds)
        .is('left_at', null)

      // Group data by conversation
      const lastMessagesByConv = new Map()
      const participantsByConv = new Map()

      // Group last messages (keep only the most recent per conversation)
      for (const msg of lastMessages || []) {
        if (!lastMessagesByConv.has(msg.conversation_id)) {
          lastMessagesByConv.set(msg.conversation_id, msg)
        }
      }

      // Group participants
      for (const participant of allParticipants || []) {
        if (!participantsByConv.has(participant.conversation_id)) {
          participantsByConv.set(participant.conversation_id, [])
        }
        participantsByConv.get(participant.conversation_id).push({
          user_id: participant.user_id,
          username: participant.users.username,
          avatar_url: participant.users.avatar_url,
          display_name: participant.users.name,
          is_online: this.isRecentlyActive(participant.users.last_seen_at)
        })
      }

      // Build final conversations
      const conversations: ConversationWithMetadata[] = userConversations.map(uc => {
        const conv = uc.conversations
        const lastMessage = lastMessagesByConv.get(conv.id)
        const participants = participantsByConv.get(conv.id) || []

        return {
          ...conv,
          last_message: lastMessage ? {
            ...lastMessage,
            sender: lastMessage.sender || {
              id: lastMessage.sender_id,
              username: 'Unknown',
              avatar_url: null,
              display_name: 'Usuario'
            }
          } : undefined,
          unread_count: 0, // We'll implement this separately
          participants,
          is_typing: []
        }
      })

      // Sort by last message time
      conversations.sort((a, b) => {
        const timeA = a.last_message?.created_at || a.created_at || ''
        const timeB = b.last_message?.created_at || b.created_at || ''
        return new Date(timeB).getTime() - new Date(timeA).getTime()
      })

      // Cache the results
      if (offset === 0) {
        await this.cacheService.setConversations(userId, conversations)
      }

      return conversations
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  }

  /**
   * Check if user was recently active (last 5 minutes = online)
   */
  private isRecentlyActive(lastSeenAt: string | null): boolean {
    if (!lastSeenAt) return false
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return new Date(lastSeenAt).getTime() > fiveMinutesAgo
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    cursor?: string
  ): Promise<{
    messages: MessageWithSender[]
    hasMore: boolean
    nextCursor?: string
  }> {
    try {
      // Check if user is participant
      const { data: participant } = await this.supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .is('left_at', null)
        .single()

      if (!participant) {
        throw new Error('You are not a participant in this conversation')
      }

      // Build query
      let query = this.supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(
            id,
            username,
            avatar_url,
            name
          )
        `)
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit + 1) // Fetch one extra to check hasMore

      // Add cursor for pagination
      if (cursor) {
        query = query.lt('created_at', cursor)
      }

      const { data, error } = await query

      if (error) throw error

      const hasMore = (data?.length || 0) > limit
      const messages = (data || []).slice(0, limit)

      // Transform messages
      const transformedMessages: MessageWithSender[] = messages.map(msg => ({
        ...msg,
        sender: msg.sender || {
          id: msg.sender_id,
          username: 'Unknown',
          avatar_url: null,
          display_name: 'Usuario'
        },
        read_by: [], // We'll implement read receipts later
        reactions: {} // We'll implement reactions later
      }))

      return {
        messages: transformedMessages.reverse(), // Return in chronological order
        hasMore,
        nextCursor: hasMore ? messages[messages.length - 1].created_at : undefined
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  }

  /**
   * Send a message with validation
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text',
    mediaUrl?: string
  ): Promise<Message> {
    try {
      // Validate user can send message
      const canSend = await this.validateMessagePermission(senderId, conversationId)
      if (!canSend) {
        throw new Error('You do not have permission to send messages in this conversation')
      }

      // Insert message
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: type,
          media_url: mediaUrl
        })
        .select()
        .single()

      if (error) throw error

      // Update conversation updated_at
      await this.supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      // Invalidate cache
      await this.cacheService.invalidateConversation(conversationId)

      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  /**
   * Validate if user can send message based on business rules
   */
  private async validateMessagePermission(
    userId: string,
    conversationId: string
  ): Promise<boolean> {
    // Check if user is participant
    const { data: participant } = await this.supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .is('left_at', null)
      .single()

    if (!participant) return false

    // Get user plan
    const { data: user } = await this.supabase
      .from('users')
      .select('premium_type, is_verified')
      .eq('id', userId)
      .single()

    if (!user) return false

    // Free users can only reply, not initiate
    if (user.premium_type === 'free') {
      const { data: conversation } = await this.supabase
        .from('conversations')
        .select('initiated_by, initiated_by_premium')
        .eq('id', conversationId)
        .single()

      if (!conversation) return false

      // Free users can reply if premium user initiated
      if (conversation.initiated_by !== userId && conversation.initiated_by_premium) {
        return true
      }

      // Free users cannot initiate new conversations
      if (conversation.initiated_by === userId) {
        return false
      }

      return false
    }

    return true
  }

  /**
   * Create or get direct conversation
   */
  async createOrGetDirectConversation(
    userId: string,
    otherUserId: string
  ): Promise<Conversation> {
    try {
      // Check if conversation already exists
      const { data: existing } = await this.supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(user_id)
        `)
        .eq('type', 'private')
        .eq('conversation_participants.user_id', userId)

      // Filter for conversations that have both users
      let existingConv = null
      for (const conv of existing || []) {
        const participantIds = conv.conversation_participants?.map((p: any) => p.user_id) || []
        if (participantIds.includes(otherUserId) && participantIds.length === 2) {
          existingConv = conv
          break
        }
      }

      if (existingConv) {
        return existingConv
      }

      // Check if user can create conversation
      const { data: user } = await this.supabase
        .from('users')
        .select('premium_type')
        .eq('id', userId)
        .single()

      if (user?.premium_type === 'free') {
        throw new Error('Free users cannot initiate conversations. Upgrade to Gold or Diamond to start chatting.')
      }

      // Create new conversation
      const { data: conversation, error: convError } = await this.supabase
        .from('conversations')
        .insert({
          type: 'private',
          initiated_by: userId,
          initiated_by_premium: user?.premium_type !== 'free'
        })
        .select()
        .single()

      if (convError) throw convError

      // Add participants
      await this.supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: userId },
          { conversation_id: conversation.id, user_id: otherUserId }
        ])

      return conversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }
}