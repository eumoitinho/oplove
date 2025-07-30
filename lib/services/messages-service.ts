import { createClient } from '@/app/lib/supabase-browser'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@/types/common'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content?: string
  type: 'text' | 'image' | 'video' | 'audio' | 'file'
  media_url?: string
  media_metadata?: {
    width?: number
    height?: number
    duration?: number
    size?: number
    mime_type?: string
    file_name?: string
  }
  is_read: boolean
  is_edited: boolean
  edited_at?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  participants: string[]
  type: 'direct' | 'group'
  name?: string
  avatar_url?: string
  last_message?: Message
  last_message_at?: string
  unread_count: number
  initiated_by?: string
  initiated_by_premium?: boolean
  group_type?: 'user_created' | 'event' | 'community'
  created_at: string
  updated_at: string
}

export interface ConversationParticipant {
  conversation_id: string
  user_id: string
  role: 'member' | 'admin'
  joined_at: string
  last_read_at?: string
  notifications_enabled: boolean
}

export class PlanLimitError extends Error {
  constructor(public limitType: string, public requiredPlan?: string) {
    super(`Limite de ${limitType} atingido`)
    this.name = 'PlanLimitError'
  }
}

class MessagesService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  // Check if user can send messages based on plan
  private async checkMessagePermissions(user: User, conversation?: Conversation) {
    // Free users cannot send messages at all (0 daily limit)
    if (user.premium_type === 'free') {
      // Check if this is a reply to a premium user
      if (conversation?.initiated_by_premium && conversation.initiated_by !== user.id) {
        return { allowed: true, isReply: true }
      }
      throw new PlanLimitError('mensagens', 'Gold')
    }

    // Diamond and Couple users have unlimited messages (-1)
    if (user.premium_type === 'diamond' || user.premium_type === 'couple') {
      return { allowed: true, isReply: false }
    }

    // Gold users have daily limits
    if (user.premium_type === 'gold') {
      // Check if limit is -1 (unlimited for verified gold users)
      if (user.daily_message_limit === -1) {
        return { allowed: true, isReply: false }
      }

      // Check daily message count
      if (user.daily_message_count >= user.daily_message_limit) {
        throw new PlanLimitError(`mensagens diárias (${user.daily_message_limit}/dia)`, user.is_verified ? undefined : 'verificação')
      }

      return { allowed: true, isReply: false }
    }

    return { allowed: false, isReply: false }
  }

  // Check if user can make calls
  private checkCallPermissions(user: User) {
    if (user.premium_type !== 'diamond' && user.premium_type !== 'couple') {
      throw new PlanLimitError('chamadas de voz/vídeo', 'Diamond')
    }
    return true
  }

  // Check if user can create group
  private checkGroupPermissions(user: User) {
    if (user.premium_type !== 'diamond' && user.premium_type !== 'couple') {
      throw new PlanLimitError('grupos', 'Diamond')
    }
    return true
  }

  // Get current user with limits
  private async getCurrentUser(): Promise<User> {
    const { data: { user: authUser } } = await this.supabase.auth.getUser()
    if (!authUser) throw new Error('Usuário não autenticado')

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) throw error
    return data as User
  }

  // Get all conversations for current user
  async getConversations(userId: string) {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(
          user:users(*)
        ),
        last_message:messages(*)
      `)
      .contains('participants', [userId])
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Get or create direct conversation
  async getOrCreateDirectConversation(userId1: string, userId2: string) {
    // Get current user to check permissions
    const currentUser = await this.getCurrentUser()
    
    // Check if user can initiate conversations
    if (currentUser.id === userId1 && currentUser.premium_type === 'free') {
      throw new PlanLimitError('iniciar conversas', 'Gold')
    }

    // First, try to find existing conversation
    const { data: existing, error: searchError } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('type', 'direct')
      .contains('participants', [userId1, userId2])
      .single()

    if (existing) return existing

    // Create new conversation
    const isPremium = currentUser.premium_type !== 'free'
    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        type: 'direct',
        participants: [userId1, userId2],
        initiated_by: currentUser.id,
        initiated_by_premium: isPremium
      })
      .select()
      .single()

    if (error) throw error

    // Add participants
    await this.supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: data.id, user_id: userId1, role: 'member' },
        { conversation_id: data.id, user_id: userId2, role: 'member' }
      ])

    return data
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, limit = 50, offset = 0) {
    const { data, error } = await this.supabase
      .from('messages')
      .select(`
        *,
        sender:users(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data?.reverse() || []
  }

  // Send a text message
  async sendMessage(conversationId: string, senderId: string, content: string) {
    // Get user and conversation to check permissions
    const [user, conversationResult] = await Promise.all([
      this.getCurrentUser(),
      this.supabase.from('conversations').select('*').eq('id', conversationId).single()
    ])

    if (conversationResult.error) throw conversationResult.error
    const conversation = conversationResult.data

    // Check message permissions
    const { allowed, isReply } = await this.checkMessagePermissions(user, conversation)
    if (!allowed) {
      throw new PlanLimitError('mensagens', 'Gold')
    }

    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        type: 'text'
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation last message
    await this.supabase
      .from('conversations')
      .update({
        last_message_at: data.created_at,
        last_message_id: data.id
      })
      .eq('id', conversationId)

    // Increment daily message count for Gold users (not for replies or unlimited users)
    if (user.premium_type === 'gold' && user.daily_message_limit > 0 && !isReply) {
      await this.supabase
        .from('users')
        .update({ daily_message_count: user.daily_message_count + 1 })
        .eq('id', user.id)
    }

    return data
  }

  // Send media message (image, video, audio)
  async sendMediaMessage(
    conversationId: string,
    senderId: string,
    file: File,
    type: 'image' | 'video' | 'audio'
  ) {
    // Get user and conversation to check permissions
    const [user, conversationResult] = await Promise.all([
      this.getCurrentUser(),
      this.supabase.from('conversations').select('*').eq('id', conversationId).single()
    ])

    if (conversationResult.error) throw conversationResult.error
    const conversation = conversationResult.data

    // Check message permissions first
    const { allowed, isReply } = await this.checkMessagePermissions(user, conversation)
    if (!allowed) {
      throw new PlanLimitError('mensagens', 'Gold')
    }

    // Check media limits based on type
    if (type === 'image' && user.monthly_photo_limit !== -1) {
      if (user.monthly_photo_count >= user.monthly_photo_limit) {
        throw new PlanLimitError(`fotos mensais (${user.monthly_photo_limit}/mês)`, user.premium_type === 'free' ? 'Gold' : undefined)
      }
    }

    if (type === 'video' && user.monthly_video_limit !== -1) {
      if (user.monthly_video_count >= user.monthly_video_limit) {
        throw new PlanLimitError(`vídeos mensais (${user.monthly_video_limit}/mês)`, user.premium_type === 'free' ? 'Gold' : undefined)
      }
    }

    // Upload file to storage
    const fileName = `${conversationId}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('messages')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = this.supabase.storage
      .from('messages')
      .getPublicUrl(fileName)

    // Create metadata based on type
    const metadata: any = {
      size: file.size,
      mime_type: file.type,
      file_name: file.name
    }

    // Add type-specific metadata
    if (type === 'image' || type === 'video') {
      // For images and videos, we'd need to extract dimensions
      // This would typically be done client-side before upload
    }

    // Create message
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        type,
        media_url: publicUrl,
        media_metadata: metadata
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation
    await this.supabase
      .from('conversations')
      .update({
        last_message_at: data.created_at,
        last_message_id: data.id
      })
      .eq('id', conversationId)

    // Update counts
    const updates: any = {}
    if (user.premium_type === 'gold' && user.daily_message_limit > 0 && !isReply) {
      updates.daily_message_count = user.daily_message_count + 1
    }
    if (type === 'image' && user.monthly_photo_limit > 0) {
      updates.monthly_photo_count = user.monthly_photo_count + 1
    }
    if (type === 'video' && user.monthly_video_limit > 0) {
      updates.monthly_video_count = user.monthly_video_count + 1
    }

    if (Object.keys(updates).length > 0) {
      await this.supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
    }

    return data
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string) {
    const { error } = await this.supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false)

    if (error) throw error

    // Update participant last read
    await this.supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
  }

  // Delete message (soft delete)
  async deleteMessage(messageId: string, userId: string) {
    const { error } = await this.supabase
      .from('messages')
      .update({ 
        content: 'Mensagem apagada',
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', userId)

    if (error) throw error
  }

  // Edit message
  async editMessage(messageId: string, userId: string, newContent: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .update({ 
        content: newContent,
        is_edited: true,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Subscribe to new messages
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return this.supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()
  }

  // Subscribe to message updates (edits, deletes)
  subscribeToMessageUpdates(conversationId: string, callback: (message: Message) => void) {
    return this.supabase
      .channel(`message-updates:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()
  }

  // Subscribe to typing indicators
  subscribeToTyping(conversationId: string, callback: (data: { userId: string, isTyping: boolean }) => void) {
    return this.supabase
      .channel(`typing:${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = this.supabase.channel(`typing:${conversationId}`).presenceState()
        Object.keys(state).forEach(userId => {
          callback({ userId, isTyping: true })
        })
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        callback({ userId: key!, isTyping: false })
      })
      .subscribe()
  }

  // Send typing indicator
  async sendTypingIndicator(conversationId: string, userId: string) {
    const channel = this.supabase.channel(`typing:${conversationId}`)
    await channel.track({ user_id: userId })
  }

  // Remove typing indicator
  async removeTypingIndicator(conversationId: string, userId: string) {
    const channel = this.supabase.channel(`typing:${conversationId}`)
    await channel.untrack()
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .select('conversation_id', { count: 'exact' })
      .eq('is_read', false)
      .neq('sender_id', userId)

    if (error) throw error
    return data
  }

  // Initiate voice call
  async initiateVoiceCall(conversationId: string, callerId: string) {
    // Check if user can make calls
    const user = await this.getCurrentUser()
    this.checkCallPermissions(user)

    // This integrates with our WebRTC service
    const { data, error } = await this.supabase
      .from('calls')
      .insert({
        conversation_id: conversationId,
        caller_id: callerId,
        type: 'voice',
        status: 'ringing'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Initiate video call
  async initiateVideoCall(conversationId: string, callerId: string) {
    // Check if user can make calls
    const user = await this.getCurrentUser()
    this.checkCallPermissions(user)

    const { data, error } = await this.supabase
      .from('calls')
      .insert({
        conversation_id: conversationId,
        caller_id: callerId,
        type: 'video',
        status: 'ringing'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Record audio message
  async recordAudioMessage(conversationId: string, senderId: string, audioBlob: Blob) {
    const file = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' })
    return this.sendMediaMessage(conversationId, senderId, file, 'audio')
  }

  // Create group conversation
  async createGroupConversation(name: string, participantIds: string[], avatarUrl?: string) {
    // Check if user can create groups
    const user = await this.getCurrentUser()
    this.checkGroupPermissions(user)

    // Check max participants (50 for Diamond/Couple)
    if (participantIds.length > 50) {
      throw new Error('Grupos podem ter no máximo 50 participantes')
    }

    // Create group conversation
    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        type: 'group',
        name,
        avatar_url: avatarUrl,
        participants: participantIds,
        group_type: 'user_created',
        initiated_by: user.id,
        initiated_by_premium: true
      })
      .select()
      .single()

    if (error) throw error

    // Add participants
    const participantRecords = participantIds.map((userId, index) => ({
      conversation_id: data.id,
      user_id: userId,
      role: index === 0 ? 'admin' : 'member' // First user is admin
    }))

    await this.supabase
      .from('conversation_participants')
      .insert(participantRecords)

    return data
  }
}

export const messagesService = new MessagesService()