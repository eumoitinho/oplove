import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
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
  private supabase = createClient()
  private cacheService = new ConversationCacheService()

  /**
   * Get user conversations with all metadata in a single optimized query
   * Fixes N+1 query problem
   */
  async getUserConversations(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<ConversationWithMetadata[]> {
    try {
      // Check cache first
      const cacheKey = `conversations:${userId}:${offset}:${limit}`
      const cached = await this.cacheService.getConversations(userId)
      if (cached && offset === 0) {
        return cached.slice(0, limit)
      }

      // Use the optimized RPC function we created in the migration
      const { data, error } = await this.supabase
        .rpc('get_user_conversations', {
          p_user_id: userId,
          p_limit: limit,
          p_offset: offset
        })

      if (error) throw error

      // Transform RPC result to our interface
      const conversationIds = data.map((c: any) => c.conversation_id)
      
      // Batch fetch participants and additional data
      const [participantsResult, sendersResult] = await Promise.all([
        this.batchFetchParticipants(conversationIds),
        this.batchFetchUsers(data.map((c: any) => c.last_message_sender).filter(Boolean))
      ])

      const conversations: ConversationWithMetadata[] = data.map((conv: any) => {
        const participants = participantsResult[conv.conversation_id] || []
        const lastMessageSender = conv.last_message_sender 
          ? sendersResult[conv.last_message_sender]
          : null

        return {
          id: conv.conversation_id,
          type: conv.type,
          name: conv.name,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          initiated_by: conv.initiated_by,
          initiated_by_premium: conv.initiated_by_premium,
          group_type: conv.group_type,
          unread_count: conv.unread_count || 0,
          participants,
          is_typing: [],
          last_message: conv.last_message_id ? {
            id: conv.last_message_id,
            content: conv.last_message_content,
            created_at: conv.last_message_at,
            sender_id: conv.last_message_sender,
            conversation_id: conv.conversation_id,
            message_type: 'text',
            sender: lastMessageSender || {
              id: conv.last_message_sender,
              username: 'Unknown',
              avatar_url: null,
              display_name: null
            }
          } : undefined
        }
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
   * Batch fetch participants for multiple conversations
   */
  private async batchFetchParticipants(
    conversationIds: string[]
  ): Promise<Record<string, any[]>> {
    if (conversationIds.length === 0) return {}

    const { data, error } = await this.supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        user_id,
        users!inner(
          id,
          username,
          avatar_url,
          display_name,
          last_seen_at,
          is_online
        )
      `)
      .in('conversation_id', conversationIds)
      .is('left_at', null)

    if (error) {
      console.error('Error fetching participants:', error)
      return {}
    }

    // Group by conversation_id
    const grouped: Record<string, any[]> = {}
    for (const participant of data || []) {
      if (!grouped[participant.conversation_id]) {
        grouped[participant.conversation_id] = []
      }
      grouped[participant.conversation_id].push({
        user_id: participant.user_id,
        username: participant.users.username,
        avatar_url: participant.users.avatar_url,
        display_name: participant.users.display_name,
        is_online: participant.users.is_online || false
      })
    }

    return grouped
  }

  /**
   * Batch fetch user data
   */
  private async batchFetchUsers(
    userIds: string[]
  ): Promise<Record<string, any>> {
    if (userIds.length === 0) return {}

    const { data, error } = await this.supabase
      .from('users')
      .select('id, username, avatar_url, display_name')
      .in('id', userIds)

    if (error) {
      console.error('Error fetching users:', error)
      return {}
    }

    // Create lookup map
    const userMap: Record<string, any> = {}
    for (const user of data || []) {
      userMap[user.id] = user
    }

    return userMap
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
      // Build query
      let query = this.supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(
            id,
            username,
            avatar_url,
            display_name
          ),
          message_reads(user_id, read_at)
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
          display_name: null
        },
        read_by: msg.message_reads?.map((r: any) => r.user_id) || [],
        reactions: {} // TODO: Implement reactions
      }))

      // Mark messages as read
      await this.markMessagesAsRead(conversationId, userId)

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

      // Check daily limit for Gold users
      await this.checkDailyMessageLimit(senderId)

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
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      // Increment daily message count
      await this.incrementDailyMessageCount(senderId)

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
    }

    return true
  }

  /**
   * Check daily message limit for Gold users
   */
  private async checkDailyMessageLimit(userId: string): Promise<void> {
    const { data: user } = await this.supabase
      .from('users')
      .select('premium_type, is_verified, daily_message_limit, daily_messages_sent')
      .eq('id', userId)
      .single()

    if (!user) throw new Error('User not found')

    // Only check for Gold unverified users
    if (user.premium_type === 'gold' && !user.is_verified) {
      const today = new Date().toISOString().split('T')[0]
      
      const { data: count } = await this.supabase
        .from('daily_message_counts')
        .select('count')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      const currentCount = count?.count || 0
      const limit = user.daily_message_limit || 10

      if (currentCount >= limit) {
        throw new Error(`Daily message limit reached (${limit} messages). Verify your account for unlimited messages.`)
      }
    }
  }

  /**
   * Increment daily message count
   */
  private async incrementDailyMessageCount(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    
    await this.supabase
      .from('daily_message_counts')
      .upsert({
        user_id: userId,
        date: today,
        count: 1
      }, {
        onConflict: 'user_id,date',
        count: 'increment'
      })
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      // Get unread messages
      const { data: messages } = await this.supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('deleted_at', null)

      if (!messages || messages.length === 0) return

      // Insert read receipts
      const readReceipts = messages.map(msg => ({
        message_id: msg.id,
        user_id: userId,
        read_at: new Date().toISOString()
      }))

      await this.supabase
        .from('message_reads')
        .upsert(readReceipts, {
          onConflict: 'message_id,user_id'
        })

      // Update last read message in participants
      const lastMessage = messages[messages.length - 1]
      await this.supabase
        .from('conversation_participants')
        .update({ last_read_message_id: lastMessage.id })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      // Invalidate cache
      await this.cacheService.invalidateConversation(conversationId)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
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
        .rpc('get_direct_conversation', {
          user1_id: userId,
          user2_id: otherUserId
        })

      if (existing && existing.length > 0) {
        return existing[0]
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

  /**
   * Create group conversation (Diamond only)
   */
  async createGroupConversation(
    creatorId: string,
    name: string,
    participantIds: string[],
    description?: string
  ): Promise<Conversation> {
    try {
      // Validate creator is Diamond
      const { data: creator } = await this.supabase
        .from('users')
        .select('premium_type')
        .eq('id', creatorId)
        .single()

      if (creator?.premium_type !== 'diamond' && creator?.premium_type !== 'couple') {
        throw new Error('Only Diamond users can create group chats')
      }

      // Validate participant count
      if (participantIds.length > 50) {
        throw new Error('Groups cannot have more than 50 members')
      }

      // Create conversation
      const { data: conversation, error } = await this.supabase
        .from('conversations')
        .insert({
          type: 'group',
          name,
          description,
          created_by: creatorId,
          group_type: 'user_created'
        })
        .select()
        .single()

      if (error) throw error

      // Add participants
      const participants = [creatorId, ...participantIds].map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        is_admin: userId === creatorId
      }))

      await this.supabase
        .from('conversation_participants')
        .insert(participants)

      return conversation
    } catch (error) {
      console.error('Error creating group:', error)
      throw error
    }
  }

  /**
   * Get conversation details with participants
   */
  async getConversation(
    conversationId: string,
    userId: string
  ): Promise<ConversationWithMetadata | null> {
    try {
      // Check if user is participant
      const { data: participant } = await this.supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .is('left_at', null)
        .single()

      if (!participant) return null

      // Get conversation with participants
      const { data: conversation, error } = await this.supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants!inner(
            user_id,
            is_admin,
            users!inner(
              id,
              username,
              avatar_url,
              display_name,
              is_online
            )
          )
        `)
        .eq('id', conversationId)
        .single()

      if (error) throw error

      // Get last message
      const { data: lastMessage } = await this.supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(
            id,
            username,
            avatar_url,
            display_name
          )
        `)
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Get unread count
      const unreadCount = await this.getUnreadCount(conversationId, userId)

      return {
        ...conversation,
        last_message: lastMessage,
        unread_count: unreadCount,
        participants: conversation.participants.map((p: any) => ({
          user_id: p.user_id,
          username: p.users.username,
          avatar_url: p.users.avatar_url,
          display_name: p.users.display_name,
          is_online: p.users.is_online || false
        })),
        is_typing: []
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      return null
    }
  }

  /**
   * Get unread message count for a conversation
   */
  private async getUnreadCount(
    conversationId: string,
    userId: string
  ): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('get_unread_count', {
        p_user_id: userId,
        p_conversation_id: conversationId
      })

    if (error) {
      console.error('Error getting unread count:', error)
      return 0
    }

    return data || 0
  }

  /**
   * Delete message (soft delete)
   */
  async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('messages')
        .update({ 
          deleted_at: new Date().toISOString(),
          is_deleted: true 
        })
        .eq('id', messageId)
        .eq('sender_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  /**
   * Edit message
   */
  async editMessage(
    messageId: string,
    userId: string,
    newContent: string
  ): Promise<Message> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .update({ 
          content: newContent,
          edited_at: new Date().toISOString(),
          is_edited: true
        })
        .eq('id', messageId)
        .eq('sender_id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error editing message:', error)
      throw error
    }
  }
}