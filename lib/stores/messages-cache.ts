import { create } from 'zustand'
import type { Message, Conversation } from '@/lib/services/messages-service'

interface MessagesCacheState {
  // Conversations
  conversations: Conversation[]
  conversationsLoading: boolean
  conversationsLastFetch: number | null
  
  // Selected conversation
  selectedConversationId: string | null
  messages: Message[]
  messagesLoading: boolean
  
  // UI State
  searchQuery: string
  messageInput: string
  
  // Actions
  setConversations: (conversations: Conversation[]) => void
  setConversationsLoading: (loading: boolean) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  addConversation: (conversation: Conversation) => void
  
  setSelectedConversationId: (id: string | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  
  setSearchQuery: (query: string) => void
  setMessageInput: (input: string) => void
  
  clearCache: () => void
  isConversationsStale: () => boolean
}

const CONVERSATIONS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const useMessagesCache = create<MessagesCacheState>((set, get) => ({
  // Initial state
  conversations: [],
  conversationsLoading: false,
  conversationsLastFetch: null,
  
  selectedConversationId: null,
  messages: [],
  messagesLoading: false,
  
  searchQuery: '',
  messageInput: '',
  
  // Actions
  setConversations: (conversations) => set({ 
    conversations, 
    conversationsLastFetch: Date.now(),
    conversationsLoading: false 
  }),
  
  setConversationsLoading: (loading) => set({ conversationsLoading: loading }),
  
  updateConversation: (id, updates) => set(state => ({
    conversations: state.conversations.map(conv => 
      conv.id === id ? { ...conv, ...updates } : conv
    )
  })),
  
  addConversation: (conversation) => set(state => ({
    conversations: [conversation, ...state.conversations]
  })),
  
  setSelectedConversationId: (id) => set({ 
    selectedConversationId: id,
    messages: id ? get().messages : [] // Keep messages if same conversation
  }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set(state => ({
    messages: [...state.messages, message]
  })),
  
  updateMessage: (id, updates) => set(state => ({
    messages: state.messages.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    )
  })),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMessageInput: (input) => set({ messageInput: input }),
  
  clearCache: () => set({
    conversations: [],
    conversationsLoading: false,
    conversationsLastFetch: null,
    selectedConversationId: null,
    messages: [],
    messagesLoading: false,
    searchQuery: '',
    messageInput: ''
  }),
  
  isConversationsStale: () => {
    const { conversationsLastFetch } = get()
    if (!conversationsLastFetch) return true
    return Date.now() - conversationsLastFetch > CONVERSATIONS_CACHE_TTL
  }
}))