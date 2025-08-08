'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  ArrowLeft, 
  Search, 
  Plus,
  Phone,
  Video,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Paperclip,
  Image as ImageIcon,
  Mic,
  Check,
  CheckCheck,
  Info,
  Smile
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { useMessagePermissions } from '@/hooks/useMessagePermissions'
import { messagesService, type Message, type Conversation, PlanLimitError } from '@/lib/services/messages-service'
import { NewConversationModal } from './NewConversationModal'
import { createClient } from '@/app/lib/supabase-browser'
import { Crown, Gem } from 'lucide-react'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface MessagesViewProps {
  className?: string
}

export function MessagesViewResponsive({ className }: MessagesViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const permissions = useMessagePermissions()
  const { toast: notification } = useToast()
  const supabase = createClient()
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showMobileChat, setShowMobileChat] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  // Handle URL params for conversation selection
  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        setSelectedConversation(conversationId)
        setShowMobileChat(true)
      }
    }
  }, [searchParams, conversations])

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      const conversation = conversations.find(c => c.id === selectedConversation)
      if (conversation) {
        loadMessages(selectedConversation)
        markMessagesAsRead(selectedConversation)
      } else {
        return
      }
      
      // Subscribe to new messages
      const channel = messagesService.subscribeToMessages(
        selectedConversation,
        handleNewMessage
      )

      // Subscribe to message updates
      const updateChannel = messagesService.subscribeToMessageUpdates(
        selectedConversation,
        handleMessageUpdate
      )

      // Subscribe to typing indicators
      const typingChannel = messagesService.subscribeToTyping(
        selectedConversation,
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
  }, [selectedConversation, conversations])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const conversations = await messagesService.getConversations(user!.id)
      setConversations(conversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
      notification({
        title: 'Erro',
        description: 'Erro ao carregar conversas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await messagesService.getMessages(conversationId)
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
      notification({
        title: 'Erro',
        description: 'Erro ao carregar mensagens',
        variant: 'destructive'
      })
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await messagesService.markMessagesAsRead(conversationId, user!.id)
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      )
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === message.conversation_id) {
          return {
            ...conv,
            last_message: message,
            last_message_at: message.created_at,
            unread_count: message.sender_id !== user?.id ? conv.unread_count + 1 : conv.unread_count
          }
        }
        return conv
      })
      return updated.sort((a, b) => 
        new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
      )
    })
  }

  const handleMessageUpdate = (message: Message) => {
    setMessages(prev => 
      prev.map(msg => msg.id === message.id ? message : msg)
    )
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user) return

    const conversation = conversations.find(c => c.id === selectedConversation)
    
    if (!permissions.canSendMessage(conversation)) {
      if (permissions.isFreePlan) {
        notification({
          title: 'Plano Gratuito',
          description: 'Usuários gratuitos não podem enviar mensagens. Faça upgrade para Gold!',
          variant: 'destructive'
        })
      }
      return
    }

    try {
      await messagesService.sendMessage(
        selectedConversation,
        user.id,
        messageInput.trim()
      )
      setMessageInput("")
      removeTypingIndicator()
    } catch (error) {
      console.error('Error sending message:', error)
      notification({
        title: 'Erro',
        description: 'Erro ao enviar mensagem',
        variant: 'destructive'
      })
    }
  }

  const handleTyping = () => {
    if (!selectedConversation || !user) return
    messagesService.sendTypingIndicator(selectedConversation, user.id)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      removeTypingIndicator()
    }, 3000)
  }

  const removeTypingIndicator = () => {
    if (!selectedConversation || !user) return
    messagesService.removeTypingIndicator(selectedConversation, user.id)
  }

  const handleVoiceCall = async () => {
    if (!selectedConversation || !user) return

    if (!permissions.canMakeCalls()) {
      notification({
        title: 'Plano Premium',
        description: 'Apenas usuários Diamond ou Dupla Hot podem fazer chamadas',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/v1/calls/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          callType: 'audio',
          maxParticipants: 4,
          expiresInMinutes: 60
        })
      })

      const result = await response.json()
      if (response.ok) {
        window.open(
          `${result.call.room_url}?t=${result.call.meeting_token}`,
          'voice-call',
          'width=800,height=600'
        )
      }
    } catch (error) {
      console.error('Error initiating voice call:', error)
    }
  }

  const handleVideoCall = async () => {
    if (!selectedConversation || !user) return

    if (!permissions.canMakeCalls()) {
      notification({
        title: 'Plano Premium',
        description: 'Apenas usuários Diamond ou Dupla Hot podem fazer chamadas',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/v1/calls/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          callType: 'video',
          maxParticipants: 8,
          expiresInMinutes: 60
        })
      })

      const result = await response.json()
      if (response.ok) {
        window.open(
          `${result.call.room_url}?t=${result.call.meeting_token}`,
          'video-call',
          'width=1200,height=800'
        )
      }
    } catch (error) {
      console.error('Error initiating video call:', error)
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId)
    setShowMobileChat(true)
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
    setSelectedConversation(null)
  }

  const selectedConversationData = conversations.find(c => c.id === selectedConversation)
  const otherParticipant = selectedConversationData?.participants?.find(p => p.user_id !== user?.id)?.user

  const filteredConversations = conversations.filter(conv => {
    const participant = conv.participants?.find(p => p.user_id !== user?.id)?.user
    return participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           participant?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const formatMessageTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: ptBR })
  }

  const getPlanBadge = (planType?: string) => {
    switch (planType) {
      case "gold":
        return <Crown className="w-3 h-3 text-yellow-600" />
      case "diamond":
        return <Gem className="w-3 h-3 text-purple-600" />
      default:
        return null
    }
  }

  return (
    <>
      {/* Desktop View */}
      <div className={cn(
        "hidden md:flex h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg",
        className
      )}>
        {/* Conversations List */}
        <div className="w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Mensagens</h2>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setShowNewConversationModal(true)}
                disabled={permissions.isFreePlan}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando conversas...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 mb-4">
                  {permissions.isFreePlan 
                    ? "Faça upgrade para iniciar conversas" 
                    : "Nenhuma conversa ainda"
                  }
                </div>
                {!permissions.isFreePlan && (
                  <Button onClick={() => setShowNewConversationModal(true)} size="sm">
                    Nova Conversa
                  </Button>
                )}
              </div>
            ) : (
              <div>
                {filteredConversations.map((conversation) => {
                  const participant = conversation.participants?.find(p => p.user_id !== user?.id)?.user
                  if (!participant) return null

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={cn(
                        "w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3",
                        selectedConversation === conversation.id && "bg-gray-50 dark:bg-gray-800"
                      )}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={participant.avatar_url || ""} />
                        <AvatarFallback>
                          {participant.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {participant.full_name || participant.username}
                          </span>
                          {participant.is_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message?.content || "Iniciar conversa"}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {conversation.last_message_at && 
                            format(new Date(conversation.last_message_at), "HH:mm")
                          }
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge className="mt-1">{conversation.unread_count}</Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {otherParticipant && (
                    <>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherParticipant.avatar_url || ""} />
                        <AvatarFallback>
                          {otherParticipant.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {otherParticipant.full_name || otherParticipant.username}
                          </h3>
                          {otherParticipant.is_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {typingUsers.has(otherParticipant.id) ? "Digitando..." : "Online"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleVoiceCall}
                    disabled={!permissions.canMakeCalls()}
                  >
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleVideoCall}
                    disabled={!permissions.canMakeCalls()}
                  >
                    <Video className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        message.sender_id === user?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender_id !== user?.id && message.sender && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.sender.avatar_url || ""} />
                          <AvatarFallback className="text-xs">
                            {message.sender.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="max-w-[70%]">
                        <div
                          className={cn(
                            "p-3 rounded-2xl",
                            message.sender_id === user?.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800"
                          )}
                        >
                          <p className="break-words">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>...</AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
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
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma mensagem..."
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
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Selecione uma conversa para começar
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className={cn(
        "md:hidden fixed inset-0 bg-white dark:bg-gray-900 z-50",
        className
      )}>
        <AnimatePresence mode="wait">
          {!showMobileChat || !selectedConversation ? (
            /* Conversations List Mobile */
            <motion.div
              key="list"
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
              className="h-full flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Mensagens</h2>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => setShowNewConversationModal(true)}
                    disabled={permissions.isFreePlan}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Conversations */}
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Carregando conversas...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      {permissions.isFreePlan 
                        ? "Faça upgrade para iniciar conversas" 
                        : "Nenhuma conversa ainda"
                      }
                    </div>
                    {!permissions.isFreePlan && (
                      <Button onClick={() => setShowNewConversationModal(true)} size="sm">
                        Nova Conversa
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    {filteredConversations.map((conversation) => {
                      const participant = conversation.participants?.find(p => p.user_id !== user?.id)?.user
                      if (!participant) return null

                      return (
                        <button
                          key={conversation.id}
                          onClick={() => handleSelectConversation(conversation.id)}
                          className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={participant.avatar_url || ""} />
                            <AvatarFallback>
                              {participant.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {participant.full_name || participant.username}
                              </span>
                              {participant.is_verified && (
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.last_message?.content || "Iniciar conversa"}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {conversation.last_message_at && 
                                format(new Date(conversation.last_message_at), "HH:mm")
                              }
                            </p>
                            {conversation.unread_count > 0 && (
                              <Badge className="mt-1">{conversation.unread_count}</Badge>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          ) : (
            /* Chat Mobile */
            <motion.div
              key="chat"
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              exit={{ x: 100 }}
              className="h-full flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  
                  {otherParticipant && (
                    <>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherParticipant.avatar_url || ""} />
                        <AvatarFallback>
                          {otherParticipant.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {otherParticipant.full_name || otherParticipant.username}
                          </h3>
                          {otherParticipant.is_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {typingUsers.has(otherParticipant.id) ? "Digitando..." : "Online"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleVoiceCall}
                    disabled={!permissions.canMakeCalls()}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleVideoCall}
                    disabled={!permissions.canMakeCalls()}
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        message.sender_id === user?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender_id !== user?.id && message.sender && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.sender.avatar_url || ""} />
                          <AvatarFallback className="text-xs">
                            {message.sender.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="max-w-[80%]">
                        <div
                          className={cn(
                            "p-3 rounded-2xl",
                            message.sender_id === user?.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800"
                          )}
                        >
                          <p className="break-words">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>...</AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
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
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    placeholder="Digite uma mensagem..."
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
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={async (conversationId) => {
          setShowNewConversationModal(false)
          await loadConversations()
          setTimeout(() => {
            handleSelectConversation(conversationId)
          }, 100)
        }}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            setSelectedFile(file)
          }
        }}
      />
    </>
  )
}