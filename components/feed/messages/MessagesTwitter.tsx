'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Send, 
  ArrowLeft, 
  Search, 
  Plus,
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  Smile,
  Info,
  Paperclip
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useMessagePermissions } from '@/hooks/useMessagePermissions'
import { messagesService, type Message, type Conversation } from '@/lib/services/messages-service'
import { NewConversationModal } from './NewConversationModal'
import { createClient } from '@/app/lib/supabase-browser'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useMessagesCache } from '@/lib/stores/messages-cache'

export function MessagesTwitter() {
  const { user } = useAuth()
  const permissions = useMessagePermissions()
  const supabase = createClient()
  const searchParams = useSearchParams()
  
  // Use cache for state persistence
  const {
    conversations,
    conversationsLoading,
    selectedConversationId,
    messages,
    searchQuery,
    messageInput,
    setConversations,
    setConversationsLoading,
    updateConversation,
    addConversation,
    setSelectedConversationId,
    setMessages,
    addMessage,
    updateMessage,
    setSearchQuery,
    setMessageInput,
    isConversationsStale,
    clearCache
  } = useMessagesCache()
  
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load conversations on mount - check cache first
  useEffect(() => {
    if (user) {
      // If we have cached data and it's not stale, don't reload
      if (conversations.length > 0 && !isConversationsStale()) {
        console.log('[MessagesTwitter] Using cached conversations')
        return
      }
      loadConversations()
    } else {
      clearCache()
    }
  }, [user, conversations.length, isConversationsStale])

  // Handle conversation selection
  useEffect(() => {
    if (selectedConversationId) {
      const conversation = conversations.find(c => c.id === selectedConversationId)
      if (conversation) {
        loadMessages(selectedConversationId)
        markMessagesAsRead(selectedConversationId)
      }
      
      // Subscribe to messages
      const channel = messagesService.subscribeToMessages(
        selectedConversationId,
        handleNewMessage
      )

      const updateChannel = messagesService.subscribeToMessageUpdates(
        selectedConversationId,
        handleMessageUpdate
      )

      const typingChannel = messagesService.subscribeToTyping(
        selectedConversationId,
        handleTypingUpdate
      )

      return () => {
        supabase.removeChannel(channel)
        supabase.removeChannel(updateChannel)
        supabase.removeChannel(typingChannel)
      }
    } else {
      setMessages([])
    }
  }, [selectedConversationId, conversations])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadConversations = async () => {
    try {
      setConversationsLoading(true)
      console.log('[MessagesTwitter] Loading conversations for user:', user!.id)
      const data = await messagesService.getConversations(user!.id)
      setConversations(data)
    } catch (error) {
      console.error('[MessagesTwitter] Error loading conversations:', error)
      toast.error('Erro ao carregar conversas')
      setConversations([])
    } finally {
      setConversationsLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await messagesService.getMessages(conversationId)
      setMessages(data)
    } catch (error) {
      toast.error('Erro ao carregar mensagens')
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await messagesService.markMessagesAsRead(conversationId, user!.id)
      updateConversation(conversationId, { unread_count: 0 })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleNewMessage = (message: Message) => {
    addMessage(message)
    
    // Update conversation with new message
    const conversation = conversations.find(c => c.id === message.conversation_id)
    if (conversation) {
      const newUnreadCount = message.sender_id !== user?.id 
        ? conversation.unread_count + 1 
        : conversation.unread_count
        
      updateConversation(message.conversation_id, {
        last_message: message,
        last_message_at: message.created_at,
        unread_count: newUnreadCount
      })
    }
  }

  const handleMessageUpdate = (message: Message) => {
    updateMessage(message.id, message)
  }

  const handleTypingUpdate = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev)
      if (isTyping && userId !== user?.id) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return newSet
    })
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || !user) return

    const conversation = conversations.find(c => c.id === selectedConversationId)
    
    if (!permissions.canSendMessage(conversation)) {
      toast.error('Usuários gratuitos não podem enviar mensagens')
      return
    }

    try {
      await messagesService.sendMessage(
        selectedConversationId,
        user.id,
        messageInput.trim()
      )
      setMessageInput("")
      removeTypingIndicator()
    } catch (error) {
      toast.error('Erro ao enviar mensagem')
    }
  }

  const handleTyping = () => {
    if (!selectedConversationId || !user) return
    messagesService.sendTypingIndicator(selectedConversationId, user.id)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(removeTypingIndicator, 3000)
  }

  const removeTypingIndicator = () => {
    if (!selectedConversationId || !user) return
    messagesService.removeTypingIndicator(selectedConversationId, user.id)
  }

  const handleVoiceCall = async () => {
    if (!permissions.canMakeCalls()) {
      toast.error('Apenas Diamond ou Dupla Hot')
      return
    }
    
    if (!selectedConversationId) {
      toast.error('Selecione uma conversa')
      return
    }

    try {
      const response = await fetch('/api/v1/calls/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          callType: 'audio'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.code === 'UPGRADE_REQUIRED') {
          toast.error(error.error)
        } else {
          throw new Error(error.error)
        }
        return
      }

      const { call } = await response.json()
      
      // Open Daily.co call in new window
      const callWindow = window.open(
        `${call.room_url}?t=${call.meeting_token}`,
        'OpenLove Call',
        'width=800,height=600,toolbar=no,location=no,status=no,menubar=no'
      )
      
      if (!callWindow) {
        toast.error('Permita pop-ups para fazer chamadas')
      }
    } catch (error: any) {
      console.error('Error starting voice call:', error)
      toast.error('Erro ao iniciar chamada de voz')
    }
  }

  const handleVideoCall = async () => {
    if (!permissions.canMakeCalls()) {
      toast.error('Apenas Diamond ou Dupla Hot')
      return
    }
    
    if (!selectedConversationId) {
      toast.error('Selecione uma conversa')
      return
    }

    try {
      const response = await fetch('/api/v1/calls/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          callType: 'video'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.code === 'UPGRADE_REQUIRED') {
          toast.error(error.error)
        } else {
          throw new Error(error.error)
        }
        return
      }

      const { call } = await response.json()
      
      // Open Daily.co call in new window
      const callWindow = window.open(
        `${call.room_url}?t=${call.meeting_token}`,
        'OpenLove Call',
        'width=800,height=600,toolbar=no,location=no,status=no,menubar=no'
      )
      
      if (!callWindow) {
        toast.error('Permita pop-ups para fazer chamadas')
      }
    } catch (error: any) {
      console.error('Error starting video call:', error)
      toast.error('Erro ao iniciar videochamada')
    }
  }

  const selectedConv = conversations.find(c => c.id === selectedConversationId)
  const otherParticipant = selectedConv?.participants?.find(p => p.user_id !== user?.id)?.user

  const filteredConversations = conversations.filter(conv => {
    const participant = conv.participants?.find(p => p.user_id !== user?.id)?.user
    return participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           participant?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="h-[calc(100vh-5rem)] lg:h-full flex bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
      {/* Conversations List - Twitter DM Style */}
      <div className={`${selectedConversationId ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 xl:w-96 flex-col border-r border-gray-200 dark:border-white/10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm`}>
        {/* Header Fixo */}
        <div className="sticky top-0 z-20 p-4 border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mensagens</h1>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowNewConversationModal(true)}
              disabled={permissions.isFreePlan}
              className="rounded-full hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-600 dark:text-purple-400"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Buscar conversas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 text-center text-gray-500">
              Carregando...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {permissions.isFreePlan 
                ? "Faça upgrade para Gold+" 
                : "Nenhuma conversa"
              }
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const participant = conv.participants?.find(p => p.user_id !== user?.id)?.user
              if (!participant) return null

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-200 ${selectedConversationId === conv.id ? 'bg-purple-50 dark:bg-purple-500/10 border-r-2 border-purple-500' : 'border-r-2 border-transparent'}`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={participant.avatar_url || ""} />
                    <AvatarFallback>
                      {participant.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold truncate">
                        {participant.full_name || participant.username}
                      </span>
                      {participant.is_verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.last_message?.content || "Iniciar conversa"}
                    </p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">
                      {conv.last_message_at && 
                        format(new Date(conv.last_message_at), "HH:mm")
                      }
                    </p>
                    {conv.unread_count > 0 && (
                      <Badge className="mt-1 bg-pink-500 text-white">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area - Mobile Full Height, Desktop Flex */}
      {selectedConversationId ? (
        <div className="flex-1 flex flex-col h-full">
          {/* Chat Header - Fixo no Topo */}
          <div className="sticky top-0 z-20 p-3 sm:p-4 border-b border-gray-200 dark:border-white/10 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSelectedConversationId(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              {otherParticipant && (
                <>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={otherParticipant.avatar_url || ""} />
                    <AvatarFallback>
                      {otherParticipant.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {otherParticipant.full_name || otherParticipant.username}
                      </h2>
                      {otherParticipant.is_verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {typingUsers.has(otherParticipant.id) ? "Digitando..." : "Online"}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceCall}
                disabled={!permissions.canMakeCalls()}
                className="rounded-full hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 w-10 h-10 sm:w-8 sm:h-8 touch-manipulation"
              >
                <Phone className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVideoCall}
                disabled={!permissions.canMakeCalls()}
                className="rounded-full hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 w-10 h-10 sm:w-8 sm:h-8 touch-manipulation"
              >
                <Video className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10 w-10 h-10 sm:w-8 sm:h-8 touch-manipulation">
                <Info className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}>
                    {msg.sender_id !== user?.id && msg.sender && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.sender.avatar_url || ""} />
                        <AvatarFallback className="text-xs">
                          {msg.sender.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div>
                      <div className={`px-4 py-3 rounded-2xl max-w-xs lg:max-w-md ${msg.sender_id === user?.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10'}`}>
                        <p className="break-words">{msg.content}</p>
                      </div>
                      <p className={`text-xs mt-1 px-1 ${msg.sender_id === user?.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Fixo no Bottom */}
          <div className="sticky bottom-0 z-20 p-3 sm:p-4 border-t border-gray-200 dark:border-white/10 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md shadow-sm">
            <div className="flex items-end gap-2 sm:gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 touch-manipulation"
              >
                <ImageIcon className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder="Enviar mensagem..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value)
                    handleTyping()
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="rounded-xl pr-12 sm:pr-10 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-purple-500 min-h-[44px] text-base sm:text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !permissions.canSendMessage()}
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 touch-manipulation"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Empty State */
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Selecione uma mensagem</h2>
            <p className="text-gray-500">
              Escolha uma conversa existente ou inicie uma nova
            </p>
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={async (id) => {
          setShowNewConversationModal(false)
          await loadConversations()
          setTimeout(() => setSelectedConversationId(id), 100)
        }}
      />
    </div>
  )
}