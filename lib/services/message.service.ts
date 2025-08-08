import { createSupabaseClient } from '@/lib/supabase/client'
import { ConversationCacheService } from '@/lib/cache/conversation-cache.service'
import type { 
  Conversation, 
  Message, 
  ConversationParticipant,
  UserBasic,
  ConversationWithParticipants,
  MessageWithSender
} from '@/types/database.types'

// Enhanced conversation type with metadata
export type ConversationWithMetadata = ConversationWithParticipants & {
  is_typing: string[]
}

export class MessageService {
  private supabase = createSupabaseClient()
  private cacheService = new ConversationCacheService()

  /**
   * Get user conversations - using SQL function for better performance
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

      // Use direct query instead of RPC to avoid RLS issues
      const { data: userParticipants, error: participantError } = await this.supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId)
        .is('left_at', null)
        .limit(limit)
        .range(offset, offset + limit - 1)

      if (participantError) {
        console.error('Participant query error:', participantError)
        throw participantError
      }

      if (!userParticipants || userParticipants.length === 0) {
        return []
      }

      const conversationIds = userParticipants.map(p => p.conversation_id)

      // Get conversation details
      const { data: rawConversations, error } = await this.supabase
        .from('conversations')
        .select(`
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
          last_message_at,
          last_message_id,
          created_at,
          updated_at
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false })

      if (error) throw error

      if (!rawConversations || rawConversations.length === 0) {
        return []
      }

      // Batch fetch all participants for these conversations
      const { data: allParticipants } = await this.supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          user_id,
          role,
          joined_at,
          left_at,
          is_muted,
          last_read_at,
          users!inner(
            id,
            username,
            name,
            avatar_url,
            last_seen_at
          )
        `)
        .in('conversation_id', conversationIds)
        .is('left_at', null)

      // Batch fetch last messages
      const lastMessageIds = rawConversations
        .map(c => c.last_message_id)
        .filter(Boolean)

      let lastMessagesMap = new Map()
      if (lastMessageIds.length > 0) {
        const { data: lastMessages } = await this.supabase
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
          .in('id', lastMessageIds)

        lastMessages?.forEach(msg => {
          lastMessagesMap.set(msg.id, msg)
        })
      }

      // Group participants by conversation
      const participantsByConv = new Map()
      allParticipants?.forEach(participant => {
        if (!participantsByConv.has(participant.conversation_id)) {
          participantsByConv.set(participant.conversation_id, [])
        }
        participantsByConv.get(participant.conversation_id).push({
          id: `${participant.conversation_id}_${participant.user_id}`,
          conversation_id: participant.conversation_id,
          user_id: participant.user_id,
          role: participant.role || 'member',
          joined_at: participant.joined_at,
          left_at: participant.left_at,
          is_muted: participant.is_muted || false,
          last_read_at: participant.last_read_at,
          user: {
            id: participant.users.id,
            username: participant.users.username,
            name: participant.users.name,
            avatar_url: participant.users.avatar_url,
          } as UserBasic,
          conversation: {} as Conversation
        })
      })

      // Map to our custom conversation type
      const conversations: ConversationWithMetadata[] = rawConversations.map(raw => {
        const participants = participantsByConv.get(raw.id) || []
        
        let lastMessage: Message | null = null
        if (raw.last_message_id && lastMessagesMap.has(raw.last_message_id)) {
          const msgData = lastMessagesMap.get(raw.last_message_id)
          lastMessage = {
            id: msgData.id,
            conversation_id: msgData.conversation_id,
            sender_id: msgData.sender_id,
            content: msgData.content,
            media_url: msgData.media_urls?.[0] || null,
            media_type: msgData.media_type as any,
            media_size: msgData.media_size,
            media_duration: msgData.media_duration,
            reply_to: msgData.reply_to_id,
            message_type: msgData.type || 'text',
            system_data: null,
            call_data: null,
            is_edited: msgData.is_edited || false,
            edit_history: [],
            is_deleted: msgData.is_deleted || false,
            deleted_at: msgData.deleted_at,
            reactions_count: 0,
            created_at: msgData.created_at,
            updated_at: msgData.created_at,
            sender: msgData.sender ? {
              id: msgData.sender.id,
              username: msgData.sender.username,
              name: msgData.sender.name,
              avatar_url: msgData.sender.avatar_url,
            } as UserBasic : {} as UserBasic,
            conversation: {} as Conversation,
            reply_to_message: null,
            reactions: [],
            read_receipts: []
          }
        }

        return {
          id: raw.id,
          title: raw.name,
          type: raw.type as any,
          group_type: raw.group_type as any,
          avatar_url: raw.avatar_url,
          description: raw.description,
          created_by: raw.created_by,
          initiated_by: raw.initiated_by,
          initiated_by_premium: raw.initiated_by_premium || false,
          is_archived: false,
          is_muted: false,
          last_message_at: raw.last_message_at,
          unread_count: 0, // TODO: Calculate this
          created_at: raw.created_at,
          updated_at: raw.updated_at,
          participants,
          messages: [],
          last_message: lastMessage,
          creator: {} as UserBasic,
          is_typing: []
        } as ConversationWithMetadata
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
   * Create a group conversation
   */
  async createGroupConversation(
    userId: string,
    name: string,
    participantIds: string[],
    description?: string
  ): Promise<Conversation> {
    try {
      // Check if user can create group conversation
      const { data: user } = await this.supabase
        .from('users')
        .select('premium_type')
        .eq('id', userId)
        .single()

      if (!user) {
        throw new Error('User not found')
      }

      // Only Diamond and Couple users can create group conversations
      if (user.premium_type !== 'diamond' && user.premium_type !== 'couple') {
        throw new Error('Only Diamond and Couple users can create group conversations')
      }

      // Create the conversation
      const { data: conversation, error: convError } = await this.supabase
        .from('conversations')
        .insert({
          type: 'group',
          name,
          description,
          created_by: userId,
          initiated_by: userId,
          initiated_by_premium: true,
          group_type: 'user_created',
          max_participants: 50
        })
        .select()
        .single()

      if (convError) throw convError

      // Add all participants including creator
      const allParticipantIds = [...new Set([userId, ...participantIds])]
      const participantInserts = allParticipantIds.map(id => ({
        conversation_id: conversation.id,
        user_id: id,
        role: id === userId ? 'admin' : 'member',
        joined_at: new Date().toISOString()
      }))

      const { error: participantError } = await this.supabase
        .from('conversation_participants')
        .insert(participantInserts)

      if (participantError) {
        // Rollback conversation creation if participants fail
        await this.supabase
          .from('conversations')
          .delete()
          .eq('id', conversation.id)
        throw participantError
      }

      // Invalidate cache for all participants
      for (const participantId of allParticipantIds) {
        await this.cacheService.invalidateUserConversations(participantId)
      }

      return conversation
    } catch (error) {
      console.error('Error creating group conversation:', error)
      throw error
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