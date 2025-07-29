import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { Conversation, Message, MessagePermissions } from "@/types/chat"
import type { User } from "@/types/common"

interface ChatState {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Record<string, Message[]>
  typingUsers: Record<string, User[]>
  isLoading: boolean

  // Actions
  setActiveConversation: (conversation: Conversation | null) => void
  loadConversations: () => Promise<void>
  loadMessages: (conversationId: string) => Promise<void>
  sendMessage: (data: {
    conversation_id: string
    content: string
    type: string
    attachments?: File[]
  }) => Promise<void>
  createConversation: (data: {
    type: "direct" | "group"
    participants: string[]
    name?: string
  }) => Promise<Conversation | null>
  createGroupChat: (data: {
    name: string
    description?: string | null
    participants: string[]
    avatar?: File | null
  }) => Promise<Conversation | null>
  updateTypingStatus: (conversationId: string, isTyping: boolean) => void
  canSendMessage: (conversationId: string) => MessagePermissions
  getMessageLimit: () => { hasLimit: boolean; remaining: number; total: number }
  reactToMessage: (messageId: string, emoji: string) => Promise<void>
  editMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  getMessageReadReceipts: (messageId: string) => Promise<any[]>
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  isLoading: false,

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation })
    if (conversation) {
      get().loadMessages(conversation.id)
    }
  },

  loadConversations: async () => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          participants:conversation_participants(
            user:users(*)
          ),
          last_message:messages(*)
        `)
        .order("updated_at", { ascending: false })

      if (!error && data) {
        set({ conversations: data })
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  loadMessages: async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users(*),
          reactions:message_reactions(*)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (!error && data) {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: data,
          },
        }))
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  },

  sendMessage: async (data) => {
    try {
      // Upload attachments if any
      const mediaUrls: string[] = []
      if (data.attachments && data.attachments.length > 0) {
        // Handle file uploads
        for (const file of data.attachments) {
          const { data: uploadData, error } = await supabase.storage
            .from("chat-media")
            .upload(`${Date.now()}-${file.name}`, file)

          if (!error && uploadData) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("chat-media").getPublicUrl(uploadData.path)
            mediaUrls.push(publicUrl)
          }
        }
      }

      const { data: message, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: data.conversation_id,
          content: data.content,
          type: data.type,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        })
        .select(`
          *,
          sender:users(*),
          reactions:message_reactions(*)
        `)
        .single()

      if (!error && message) {
        // Add to local state optimistically
        set((state) => ({
          messages: {
            ...state.messages,
            [data.conversation_id]: [...(state.messages[data.conversation_id] || []), message],
          },
        }))
      }
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  },

  createConversation: async (data) => {
    try {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert({
          type: data.type,
          name: data.name,
        })
        .select()
        .single()

      if (!error && conversation) {
        // Add participants
        const participantInserts = data.participants.map((userId) => ({
          conversation_id: conversation.id,
          user_id: userId,
        }))

        await supabase.from("conversation_participants").insert(participantInserts)

        // Reload conversations
        get().loadConversations()
        return conversation
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
    return null
  },

  createGroupChat: async (data) => {
    try {
      let avatarUrl = null

      // Upload avatar if provided
      if (data.avatar) {
        const { data: uploadData, error } = await supabase.storage
          .from("group-avatars")
          .upload(`${Date.now()}-${data.avatar.name}`, data.avatar)

        if (!error && uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("group-avatars").getPublicUrl(uploadData.path)
          avatarUrl = publicUrl
        }
      }

      const { data: group, error } = await supabase
        .from("conversations")
        .insert({
          type: "group",
          name: data.name,
          description: data.description,
          avatar_url: avatarUrl,
        })
        .select()
        .single()

      if (!error && group) {
        // Add participants
        const participantInserts = data.participants.map((userId) => ({
          conversation_id: group.id,
          user_id: userId,
          role: userId === data.participants[0] ? "admin" : "member",
        }))

        await supabase.from("conversation_participants").insert(participantInserts)

        // Reload conversations
        get().loadConversations()
        return group
      }
    } catch (error) {
      console.error("Error creating group chat:", error)
    }
    return null
  },

  updateTypingStatus: (conversationId: string, isTyping: boolean) => {
    // Handle typing indicators via realtime
    const channel = supabase.channel(`typing:${conversationId}`)
    if (isTyping) {
      channel.track({ typing: true })
    } else {
      channel.untrack()
    }
  },

  canSendMessage: (conversationId: string): MessagePermissions => {
    // This would check user permissions based on plan and verification
    // Implementation depends on your business logic
    return {
      canSend: true,
      reason: null,
    }
  },

  getMessageLimit: () => {
    // Return message limits based on user plan
    return {
      hasLimit: false,
      remaining: 0,
      total: 0,
    }
  },

  reactToMessage: async (messageId: string, emoji: string) => {
    try {
      await supabase.from("message_reactions").upsert({
        message_id: messageId,
        emoji,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })
    } catch (error) {
      console.error("Error reacting to message:", error)
      throw error
    }
  },

  editMessage: async (messageId: string, content: string) => {
    try {
      await supabase
        .from("messages")
        .update({
          content,
          edited_at: new Date().toISOString(),
        })
        .eq("id", messageId)
    } catch (error) {
      console.error("Error editing message:", error)
      throw error
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      await supabase.from("messages").delete().eq("id", messageId)
    } catch (error) {
      console.error("Error deleting message:", error)
      throw error
    }
  },

  getMessageReadReceipts: async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from("message_read_receipts")
        .select(`
          *,
          user:users(*)
        `)
        .eq("message_id", messageId)

      return data || []
    } catch (error) {
      console.error("Error getting read receipts:", error)
      return []
    }
  },
}))
