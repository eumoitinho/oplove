import type { ApiResponse } from "./api"
import { createClient } from "@/app/lib/supabase-browser"
import type {
  Conversation,
  Message,
  CreateConversationData,
  SendMessageData,
  MessageFilter,
  ConversationFilter,
  TypingStatus,
  OnlineStatus,
} from "@/types/chat.types"

/**
 * Chat service handling all messaging operations
 */
export class ChatService {
  private supabase = createClient()
  private typingTimeouts = new Map<string, NodeJS.Timeout>()

  /**
   * Get user conversations
   */
  async getConversations(filter: ConversationFilter = {}): Promise<ApiResponse<Conversation[]>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      let query = this.supabase
        .from("conversations")
        .select(`
          *,
          participants:conversation_participants(
            user:users(*)
          ),
          last_message:messages(
            *,
            sender:users(*)
          )
        `)
        .or(`created_by.eq.${user.id},participants.user_id.eq.${user.id}`)
        .order("updated_at", { ascending: false })

      if (filter.type) {
        query = query.eq("type", filter.type)
      }

      if (filter.limit) {
        query = query.limit(filter.limit)
      }

      const { data, error } = await query

      if (error) {
        return {
          data: null,
          error: "Erro ao carregar conversas",
          success: false,
          status: 400,
        }
      }

      return {
        data: data as Conversation[],
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao carregar conversas",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Get single conversation
   */
  async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    try {
      const { data, error } = await this.supabase
        .from("conversations")
        .select(`
          *,
          participants:conversation_participants(
            user:users(*)
          ),
          messages:messages(
            *,
            sender:users(*),
            reactions:message_reactions(
              *,
              user:users(*)
            )
          )
        `)
        .eq("id", conversationId)
        .single()

      if (error || !data) {
        return {
          data: null,
          error: "Conversa não encontrada",
          success: false,
          status: 404,
        }
      }

      return {
        data: data as Conversation,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro ao carregar conversa",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Create new conversation
   */
  async createConversation(conversationData: CreateConversationData): Promise<ApiResponse<Conversation>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Check user permissions
      const { data: userProfile } = await this.supabase
        .from("users")
        .select("premium_type, is_verified")
        .eq("id", user.id)
        .single()

      // Check message permissions
      if (userProfile?.premium_type === "free" && !userProfile.is_verified) {
        return {
          data: null,
          error: "Usuários gratuitos precisam verificar a conta para enviar mensagens",
          success: false,
          status: 403,
        }
      }

      // For group chats, check premium requirements
      if (conversationData.type === "group" && conversationData.participants.length > 2) {
        if (!["diamond", "couple"].includes(userProfile?.premium_type || "")) {
          return {
            data: null,
            error: "Grupos personalizados são exclusivos para usuários Diamond+",
            success: false,
            status: 403,
          }
        }
      }

      // Check for existing direct conversation
      if (conversationData.type === "direct" && conversationData.participants.length === 1) {
        const otherUserId = conversationData.participants[0]

        const { data: existing } = await this.supabase
          .from("conversations")
          .select("id")
          .eq("type", "direct")
          .or(
            `and(created_by.eq.${user.id},participants.cs.{${otherUserId}}),and(created_by.eq.${otherUserId},participants.cs.{${user.id}})`,
          )
          .single()

        if (existing) {
          return this.getConversation(existing.id)
        }
      }

      // Create conversation
      const { data: conversation, error: conversationError } = await this.supabase
        .from("conversations")
        .insert([
          {
            title: conversationData.title,
            type: conversationData.type,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (conversationError) {
        return {
          data: null,
          error: "Erro ao criar conversa",
          success: false,
          status: 400,
        }
      }

      // Add participants
      const participantData = [
        { conversation_id: conversation.id, user_id: user.id, role: "admin" },
        ...conversationData.participants.map((userId) => ({
          conversation_id: conversation.id,
          user_id: userId,
          role: "member" as const,
        })),
      ]

      const { error: participantsError } = await this.supabase.from("conversation_participants").insert(participantData)

      if (participantsError) {
        // Clean up conversation
        await this.supabase.from("conversations").delete().eq("id", conversation.id)

        return {
          data: null,
          error: "Erro ao adicionar participantes",
          success: false,
          status: 400,
        }
      }

      // Get complete conversation data
      return this.getConversation(conversation.id)
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao criar conversa",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Send message
   */
  async sendMessage(conversationId: string, messageData: SendMessageData): Promise<ApiResponse<Message>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Check if user is participant
      const { data: participant } = await this.supabase
        .from("conversation_participants")
        .select("role")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .single()

      if (!participant) {
        return {
          data: null,
          error: "Você não é participante desta conversa",
          success: false,
          status: 403,
        }
      }

      // Check message permissions
      const { data: userProfile } = await this.supabase
        .from("users")
        .select("premium_type, is_verified, daily_messages_sent, daily_message_limit")
        .eq("id", user.id)
        .single()

      // Check daily message limit for Gold users without verification
      if (userProfile?.premium_type === "gold" && !userProfile.is_verified) {
        if ((userProfile.daily_messages_sent || 0) >= (userProfile.daily_message_limit || 50)) {
          return {
            data: null,
            error: "Limite diário de mensagens atingido. Verifique sua conta para mensagens ilimitadas.",
            success: false,
            status: 403,
          }
        }
      }

      // Upload media if provided
      let mediaUrl = null
      let fileName = null // Declare fileName variable
      if (messageData.media) {
        fileName = `${conversationId}_${user.id}_${Date.now()}`
        const { data: uploadData, error: uploadError } = await this.supabase.storage
          .from("messages")
          .upload(fileName, messageData.media)

        if (uploadError) {
          return {
            data: null,
            error: "Erro ao fazer upload da mídia",
            success: false,
            status: 400,
          }
        }

        const {
          data: { publicUrl },
        } = this.supabase.storage.from("messages").getPublicUrl(fileName)

        mediaUrl = publicUrl
      }

      // Create message
      const { data: message, error: messageError } = await this.supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            sender_id: user.id,
            content: messageData.content,
            media_url: mediaUrl,
            media_type: messageData.media?.type || null,
            reply_to: messageData.replyTo || null,
            created_at: new Date().toISOString(),
          },
        ])
        .select(`
          *,
          sender:users(*),
          reply_to_message:messages(
            *,
            sender:users(*)
          )
        `)
        .single()

      if (messageError) {
        // Clean up uploaded media
        if (mediaUrl) {
          await this.supabase.storage.from("messages").remove([fileName])
        }

        return {
          data: null,
          error: "Erro ao enviar mensagem",
          success: false,
          status: 400,
        }
      }

      // Update conversation timestamp
      await this.supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)

      // Update daily message count for Gold users
      if (userProfile?.premium_type === "gold" && !userProfile.is_verified) {
        await this.supabase
          .from("users")
          .update({
            daily_messages_sent: (userProfile.daily_messages_sent || 0) + 1,
          })
          .eq("id", user.id)
      }

      return {
        data: message as Message,
        error: null,
        success: true,
        status: 201,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao enviar mensagem",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Get messages for conversation
   */
  async getMessages(conversationId: string, filter: MessageFilter = {}): Promise<ApiResponse<Message[]>> {
    try {
      let query = this.supabase
        .from("messages")
        .select(`
          *,
          sender:users(*),
          reply_to_message:messages(
            *,
            sender:users(*)
          ),
          reactions:message_reactions(
            *,
            user:users(*)
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })

      if (filter.limit) {
        query = query.limit(filter.limit)
      }

      if (filter.before) {
        query = query.lt("created_at", filter.before)
      }

      if (filter.after) {
        query = query.gt("created_at", filter.after)
      }

      const { data, error } = await query

      if (error) {
        return {
          data: null,
          error: "Erro ao carregar mensagens",
          success: false,
          status: 400,
        }
      }

      return {
        data: (data as Message[]).reverse(), // Reverse to show oldest first
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao carregar mensagens",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, messageIds: string[]): Promise<ApiResponse<null>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      const readReceipts = messageIds.map((messageId) => ({
        message_id: messageId,
        user_id: user.id,
        read_at: new Date().toISOString(),
      }))

      const { error } = await this.supabase
        .from("message_read_receipts")
        .upsert(readReceipts, { onConflict: "message_id,user_id" })

      if (error) {
        return {
          data: null,
          error: "Erro ao marcar mensagens como lidas",
          success: false,
          status: 400,
        }
      }

      return {
        data: null,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao marcar como lida",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Set typing status
   */
  async setTyping(conversationId: string, isTyping: boolean): Promise<void> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) return

      const channel = this.supabase.channel(`conversation:${conversationId}`)

      if (isTyping) {
        // Clear existing timeout
        const existingTimeout = this.typingTimeouts.get(conversationId)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
        }

        // Send typing status
        await channel.send({
          type: "broadcast",
          event: "typing",
          payload: {
            user_id: user.id,
            is_typing: true,
          },
        })

        // Auto-stop typing after 3 seconds
        const timeout = setTimeout(() => {
          this.setTyping(conversationId, false)
        }, 3000)

        this.typingTimeouts.set(conversationId, timeout)
      } else {
        // Clear timeout
        const existingTimeout = this.typingTimeouts.get(conversationId)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
          this.typingTimeouts.delete(conversationId)
        }

        // Send stop typing
        await channel.send({
          type: "broadcast",
          event: "typing",
          payload: {
            user_id: user.id,
            is_typing: false,
          },
        })
      }
    } catch (error) {
      console.error("Error setting typing status:", error)
    }
  }

  /**
   * Subscribe to conversation updates
   */
  subscribeToConversation(
    conversationId: string,
    callbacks: {
      onMessage?: (message: Message) => void
      onTyping?: (status: TypingStatus) => void
      onPresence?: (status: OnlineStatus) => void
    },
  ) {
    const channel = this.supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (callbacks.onMessage) {
            callbacks.onMessage(payload.new as Message)
          }
        },
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (callbacks.onTyping) {
          callbacks.onTyping(payload.payload as TypingStatus)
        }
      })
      .on("presence", { event: "sync" }, () => {
        if (callbacks.onPresence) {
          const presenceState = channel.presenceState()
          callbacks.onPresence(presenceState as OnlineStatus)
        }
      })
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<ApiResponse<null>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Check if user owns the message
      const { data: message } = await this.supabase
        .from("messages")
        .select("sender_id, media_url")
        .eq("id", messageId)
        .single()

      if (!message || message.sender_id !== user.id) {
        return {
          data: null,
          error: "Você não tem permissão para deletar esta mensagem",
          success: false,
          status: 403,
        }
      }

      // Delete media file if exists
      if (message.media_url) {
        const fileName = message.media_url.split("/").pop()
        if (fileName) {
          await this.supabase.storage.from("messages").remove([fileName])
        }
      }

      // Delete message
      const { error } = await this.supabase.from("messages").delete().eq("id", messageId)

      if (error) {
        return {
          data: null,
          error: "Erro ao deletar mensagem",
          success: false,
          status: 400,
        }
      }

      return {
        data: null,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao deletar mensagem",
        success: false,
        status: 500,
      }
    }
  }
}

// Export singleton instance
export const chatService = new ChatService()
