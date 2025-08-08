"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeChat } from '@/hooks/useRealtimeChat'
import { chatService } from '@/lib/services/chat-service'
import { toast } from 'sonner'
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Search, 
  Plus,
  ArrowLeft,
  Phone,
  Video,
  Info,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { NewConversationModal } from '@/components/feed/messages/NewConversationModal'
import type { Conversation } from '@/lib/services/chat-service'

interface ChatViewProps {
  initialConversationId?: string
  onBack?: () => void
}

export function ChatView({ initialConversationId, onBack }: ChatViewProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversationId || null)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Use the unified realtime hook for the selected conversation
  const {
    messages,
    typingUsers,
    onlineUsers,
    isLoading: isLoadingMessages,
    error: messagesError,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTypingIndicator,
    markAsRead
  } = useRealtimeChat({
    conversationId: selectedConversation || '',
    onNewMessage: (message) => {
      // Update conversation list with new message
      updateConversationWithMessage(message.conversation_id, message)
    }
  })

  // Load conversations
  useEffect(() => {
    if (!user) return
    loadConversations()
  }, [user])

  // Load current conversation details
  useEffect(() => {
    if (!selectedConversation) {
      setCurrentConversation(null)
      return
    }

    const loadConversationDetails = async () => {
      const conv = await chatService.getConversation(selectedConversation)
      setCurrentConversation(conv)
    }

    loadConversationDetails()
  }, [selectedConversation])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversations list
  const loadConversations = async () => {
    if (!user) return

    try {
      setIsLoadingConversations(true)
      const convs = await chatService.getConversations(user.id)
      setConversations(convs)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Erro ao carregar conversas')
    } finally {
      setIsLoadingConversations(false)
    }
  }

  // Update conversation in list when new message arrives
  const updateConversationWithMessage = (conversationId: string, message: any) => {
    setConversations(prev => {
      const updated = [...prev]
      const index = updated.findIndex(c => c.id === conversationId)
      
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          last_message: message,
          last_message_at: message.created_at,
          unread_count: message.sender_id !== user?.id 
            ? (updated[index].unread_count || 0) + 1 
            : 0
        }
        
        // Move to top
        const [conv] = updated.splice(index, 1)
        updated.unshift(conv)
      }
      
      return updated
    })
  }

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageInput.trim() || !selectedConversation || !user) return

    // Check permissions
    const { allowed, reason } = await chatService.checkMessagePermissions(
      user.id,
      selectedConversation
    )

    if (!allowed) {
      toast.error(reason || 'Você não pode enviar mensagens nesta conversa')
      return
    }

    const messageText = messageInput.trim()
    setMessageInput('')

    const sentMessage = await sendMessage(messageText)
    
    if (sentMessage) {
      updateConversationWithMessage(selectedConversation, sentMessage)
    }
  }

  // Handle typing indicator
  const handleTyping = () => {
    sendTypingIndicator()

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      // Typing will auto-stop via the hook
    }, 2000)
  }

  // Create new conversation
  const handleNewConversationCreated = async (conversationId: string) => {
    setShowNewConversation(false)
    await loadConversations()
    setSelectedConversation(conversationId)
  }

  // Get other participant in direct conversation
  const getOtherParticipant = (conversation: Conversation) => {
    if (conversation.type !== 'direct' || !conversation.participants) return null
    return conversation.participants.find(p => p.user_id !== user?.id)?.user
  }

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    
    if (conv.name) {
      return conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    
    const otherUser = getOtherParticipant(conv)
    if (otherUser) {
      return (
        otherUser.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return false
  })

  return (
    <div className="flex h-full bg-gray-900">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-gray-800`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Mensagens</h2>
            <Button
              onClick={() => setShowNewConversation(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {isLoadingConversations ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 bg-gray-800" />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>Nenhuma conversa encontrada</p>
              <Button
                onClick={() => setShowNewConversation(true)}
                variant="ghost"
                className="mt-4 text-purple-400 hover:text-purple-300"
              >
                Iniciar nova conversa
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredConversations.map(conv => {
                const otherUser = getOtherParticipant(conv)
                const displayName = conv.name || otherUser?.name || otherUser?.username || 'Conversa'
                const avatarUrl = conv.avatar_url || otherUser?.avatar_url
                const isOnline = otherUser && onlineUsers.includes(otherUser.id)
                const isSelected = selectedConversation === conv.id

                return (
                  <motion.button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-800/50 transition-colors ${
                      isSelected ? 'bg-gray-800' : ''
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{displayName}</span>
                        {conv.last_message && (
                          <span className="text-xs text-gray-400">
                            {new Date(conv.last_message_at!).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>

                      {conv.last_message && (
                        <p className="text-sm text-gray-400 truncate">
                          {conv.last_message.sender_id === user?.id && 'Você: '}
                          {conv.last_message.content || '[Mídia]'}
                        </p>
                      )}

                      {conv.unread_count > 0 && (
                        <Badge className="mt-1 bg-purple-600">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
        {selectedConversation && currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setSelectedConversation(null)}
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>

                {(() => {
                  const otherUser = getOtherParticipant(currentConversation)
                  const displayName = currentConversation.name || otherUser?.name || otherUser?.username || 'Conversa'
                  const avatarUrl = currentConversation.avatar_url || otherUser?.avatar_url
                  const isOnline = otherUser && onlineUsers.includes(otherUser.id)

                  return (
                    <>
                      <Avatar>
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-white">{displayName}</h3>
                        {isOnline && (
                          <span className="text-xs text-green-400">Online</span>
                        )}
                        {typingUsers.length > 0 && (
                          <span className="text-xs text-gray-400">digitando...</span>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Info className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {isLoadingMessages ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 bg-gray-800" />
                  ))}
                </div>
              ) : messagesError ? (
                <div className="text-center text-red-400 py-8">
                  {messagesError}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Nenhuma mensagem ainda</p>
                  <p className="text-sm mt-2">Envie a primeira mensagem!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => {
                    const isSelf = msg.sender_id === user?.id

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isSelf ? 'order-2' : 'order-1'}`}>
                          {!isSelf && msg.sender && (
                            <span className="text-xs text-gray-400 ml-2">
                              {msg.sender.name || msg.sender.username}
                            </span>
                          )}
                          
                          <div className={`
                            rounded-2xl px-4 py-2 mt-1
                            ${isSelf 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-800 text-gray-100'
                            }
                          `}>
                            {msg.type === 'text' ? (
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            ) : (
                              <div className="text-sm opacity-75">[{msg.type}]</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 px-2">
                            <span className="text-xs text-gray-500">
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {msg.is_edited && (
                              <span className="text-xs text-gray-500">(editado)</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm">
                  <Paperclip className="w-5 h-5" />
                </Button>
                
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Digite uma mensagem..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value)
                    handleTyping()
                  }}
                  className="flex-1 bg-gray-800 border-gray-700 text-white"
                />

                <Button type="button" variant="ghost" size="sm">
                  <Smile className="w-5 h-5" />
                </Button>

                <Button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-xl mb-2">Selecione uma conversa</p>
              <p className="text-sm">ou inicie uma nova</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onConversationCreated={handleNewConversationCreated}
      />
    </div>
  )
}