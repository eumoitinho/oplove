"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  Plus, 
  Send, 
  Paperclip, 
  Mic, 
  Camera,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Crown,
  Gem,
  CheckCircle,
  Check,
  CheckCheck,
  Smile,
  Image as ImageIcon,
  X,
  Download,
  Play,
  Pause,
  Trash2,
  Edit2
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { useMessagePermissions } from "@/hooks/useMessagePermissions"
import { messagesService, type Message, type Conversation, PlanLimitError } from "@/lib/services/messages-service"
import { notification } from "@/lib/services/notification-service"
import { createClient } from "@/app/lib/supabase-browser"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
// import EmojiPicker from 'emoji-picker-react' // TODO: Install dependency

export function MessagesView() {
  const { user } = useAuth()
  const { features } = usePremiumFeatures()
  const permissions = useMessagePermissions()
  const supabase = createClient()
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load conversations
  useEffect(() => {
    if (user?.id) {
      loadConversations()
    }
  }, [user?.id])

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
      markMessagesAsRead(selectedConversation)
      
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
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await messagesService.getConversations(user!.id)
      setConversations(data || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
      notification.error('Erro ao carregar conversas')
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
      notification.error('Erro ao carregar mensagens')
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await messagesService.markMessagesAsRead(conversationId, user!.id)
      // Update local conversation state
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
    // Update conversation list
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
      // Sort by last message
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

  // Send text message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user) return

    // Find conversation to check permissions
    const conversation = conversations.find(c => c.id === selectedConversation)
    
    // Check permissions
    if (!permissions.canSendMessage(conversation)) {
      if (permissions.isFreePlan) {
        notification.error('Usuários gratuitos não podem enviar mensagens. Faça upgrade para Gold!')
      } else if (permissions.isGoldPlan && !permissions.isVerified) {
        const remaining = permissions.getRemainingMessages()
        if (remaining === 0) {
          notification.error('Limite diário de mensagens atingido. Verifique sua conta para mensagens ilimitadas!')
        } else {
          notification.error(`Você tem ${remaining} mensagens restantes hoje`)
        }
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
      
      // Show remaining messages for Gold users
      if (permissions.isGoldPlan && !permissions.isVerified) {
        const remaining = permissions.getRemainingMessages() - 1
        if (remaining > 0 && remaining <= 3) {
          notification.info(`${remaining} mensagens restantes hoje`)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      if (error instanceof PlanLimitError) {
        notification.error(error.message)
      } else {
        notification.error('Erro ao enviar mensagem')
      }
    }
  }

  // Handle typing
  const handleTyping = () => {
    if (!selectedConversation || !user) return

    // Send typing indicator
    messagesService.sendTypingIndicator(selectedConversation, user.id)

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to remove typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      removeTypingIndicator()
    }, 3000)
  }

  const removeTypingIndicator = () => {
    if (!selectedConversation || !user) return
    messagesService.removeTypingIndicator(selectedConversation, user.id)
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      notification.error('Arquivo muito grande. Máximo 50MB')
      return
    }

    setSelectedFile(file)
  }

  // Send file message
  const handleSendFile = async () => {
    if (!selectedFile || !selectedConversation || !user) return

    const type = selectedFile.type.startsWith('image/') ? 'photo' 
      : selectedFile.type.startsWith('video/') ? 'video'
      : 'audio'

    // Check media permissions
    if (!permissions.canSendMedia(type as 'photo' | 'video')) {
      if (permissions.isFreePlan) {
        if (type === 'photo') {
          const remaining = permissions.getRemainingPhotos()
          if (remaining === 0) {
            notification.error('Limite mensal de fotos atingido. Faça upgrade para Gold!')
          } else {
            notification.error(`Você tem ${remaining} fotos restantes este mês`)
          }
        } else {
          notification.error('Usuários gratuitos não podem enviar vídeos. Faça upgrade para Gold!')
        }
      } else {
        const remaining = type === 'photo' ? permissions.getRemainingPhotos() : permissions.getRemainingVideos()
        notification.error(`Limite mensal de ${type === 'photo' ? 'fotos' : 'vídeos'} atingido (${remaining} restantes)`)
      }
      return
    }

    try {
      setUploadProgress(0)
      const fileType = selectedFile.type.startsWith('image/') ? 'image' 
        : selectedFile.type.startsWith('video/') ? 'video'
        : selectedFile.type.startsWith('audio/') ? 'audio'
        : 'file'

      await messagesService.sendMediaMessage(
        selectedConversation,
        user.id,
        selectedFile,
        fileType as any
      )
      
      setSelectedFile(null)
      setUploadProgress(0)
      notification.success('Arquivo enviado!')
    } catch (error) {
      console.error('Error sending file:', error)
      if (error instanceof PlanLimitError) {
        notification.error(error.message)
      } else {
        notification.error('Erro ao enviar arquivo')
      }
    }
  }

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await sendAudioMessage(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      notification.error('Erro ao acessar microfone')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Send audio message
  const sendAudioMessage = async (audioBlob: Blob) => {
    if (!selectedConversation || !user) return

    try {
      await messagesService.recordAudioMessage(
        selectedConversation,
        user.id,
        audioBlob
      )
      notification.success('Áudio enviado!')
    } catch (error) {
      console.error('Error sending audio:', error)
      notification.error('Erro ao enviar áudio')
    }
  }

  // Edit message
  const handleEditMessage = async () => {
    if (!editingMessage || !editContent.trim() || !user) return

    try {
      await messagesService.editMessage(
        editingMessage,
        user.id,
        editContent.trim()
      )
      setEditingMessage(null)
      setEditContent("")
      notification.success('Mensagem editada')
    } catch (error) {
      console.error('Error editing message:', error)
      notification.error('Erro ao editar mensagem')
    }
  }

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return

    try {
      await messagesService.deleteMessage(messageId, user.id)
      notification.success('Mensagem apagada')
    } catch (error) {
      console.error('Error deleting message:', error)
      notification.error('Erro ao apagar mensagem')
    }
  }

  // Voice call
  const handleVoiceCall = async () => {
    if (!selectedConversation || !user) return

    if (!permissions.canMakeCalls()) {
      notification.error('Apenas usuários Diamond e Couple podem fazer chamadas. Faça upgrade!')
      return
    }

    try {
      await messagesService.initiateVoiceCall(selectedConversation, user.id)
      // Here you would integrate with WebRTC service
      notification.info('Iniciando chamada de voz...')
    } catch (error) {
      console.error('Error initiating voice call:', error)
      if (error instanceof PlanLimitError) {
        notification.error(error.message)
      } else {
        notification.error('Erro ao iniciar chamada')
      }
    }
  }

  // Video call
  const handleVideoCall = async () => {
    if (!selectedConversation || !user) return

    if (!permissions.canMakeCalls()) {
      notification.error('Apenas usuários Diamond e Couple podem fazer chamadas. Faça upgrade!')
      return
    }

    try {
      await messagesService.initiateVideoCall(selectedConversation, user.id)
      // Here you would integrate with WebRTC service
      notification.info('Iniciando chamada de vídeo...')
    } catch (error) {
      console.error('Error initiating video call:', error)
      if (error instanceof PlanLimitError) {
        notification.error(error.message)
      } else {
        notification.error('Erro ao iniciar chamada')
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editingMessage) {
        handleEditMessage()
      } else {
        handleSendMessage()
      }
    }
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

  const formatMessageTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: ptBR })
  }

  const selectedConversationData = conversations.find(c => c.id === selectedConversation)
  const otherParticipant = selectedConversationData?.participants?.find(p => p.user_id !== user?.id)?.user

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    const participant = conv.participants?.find(p => p.user_id !== user?.id)?.user
    return participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           participant?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden h-[calc(100vh-200px)] shadow-sm">
      <div className="flex h-full">
        {/* Chat Area - Shows on desktop always, on mobile only when conversation selected */}
        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {selectedConversation && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden rounded-full"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={otherParticipant.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {otherParticipant.full_name?.charAt(0) || otherParticipant.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {otherParticipant.full_name || otherParticipant.username}
                        </h3>
                        {otherParticipant.is_verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        {getPlanBadge(otherParticipant.premium_type)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-white/60">
                        {typingUsers.has(otherParticipant.id) ? "Digitando..." : 
                         otherParticipant.last_seen ? `Visto por último ${format(new Date(otherParticipant.last_seen), "HH:mm", { locale: ptBR })}` : "Online"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleVoiceCall}
                      disabled={!permissions.canMakeCalls()}
                      title={!permissions.canMakeCalls() ? "Apenas Diamond e Couple podem fazer chamadas" : "Chamada de voz"}
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleVideoCall}
                      disabled={!permissions.canMakeCalls()}
                      title={!permissions.canMakeCalls() ? "Apenas Diamond e Couple podem fazer chamadas" : "Chamada de vídeo"}
                    >
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.sender_id === user?.id ? 'order-2' : 'order-1'}`}>
                        {/* Message content based on type */}
                        {message.type === 'text' ? (
                          <div
                            className={`p-3 rounded-2xl ${
                              message.sender_id === user?.id
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            {message.is_edited && (
                              <p className="text-xs opacity-70 mt-1">editado</p>
                            )}
                          </div>
                        ) : message.type === 'image' ? (
                          <div className="rounded-2xl overflow-hidden relative max-w-sm">
                            <Image 
                              src={message.media_url} 
                              alt="Imagem" 
                              width={300}
                              height={200}
                              className="cursor-pointer hover:opacity-90 transition object-cover"
                              onClick={() => window.open(message.media_url, '_blank')}
                            />
                          </div>
                        ) : message.type === 'video' ? (
                          <div className="rounded-2xl overflow-hidden bg-black">
                            <video 
                              controls 
                              className="max-w-full h-auto"
                              src={message.media_url}
                              preload="metadata"
                              playsInline
                            />
                          </div>
                        ) : message.type === 'audio' ? (
                          <div className="p-3 bg-gray-100 dark:bg-white/10 rounded-2xl">
                            <audio controls className="max-w-full">
                              <source src={message.media_url} type="audio/webm" />
                            </audio>
                          </div>
                        ) : null}

                        {/* Message actions and timestamp */}
                        <div className={`flex items-center gap-2 mt-1 ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-500 dark:text-white/60">
                            {formatMessageTime(message.created_at)}
                          </span>
                          {message.sender_id === user?.id && (
                            <>
                              {message.is_read ? (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Check className="w-3 h-3 text-gray-400" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 opacity-0 group-hover:opacity-100"
                                onClick={() => {
                                  setEditingMessage(message.id)
                                  setEditContent(message.content || "")
                                }}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 opacity-0 group-hover:opacity-100"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-white/10 rounded-2xl p-3">
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

              {/* File preview */}
              {selectedFile && (
                <div className="p-3 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {selectedFile.type.startsWith('image/') ? (
                        <ImageIcon className="w-8 h-8 text-blue-500" />
                      ) : selectedFile.type.startsWith('video/') ? (
                        <Video className="w-8 h-8 text-purple-500" />
                      ) : (
                        <Paperclip className="w-8 h-8 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSendFile}
                        className="bg-gradient-to-r from-pink-500 to-purple-500"
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-white/10">
                {editingMessage ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Editando mensagem</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMessage(null)
                          setEditContent("")
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400 rounded-full"
                      />
                      <Button
                        onClick={handleEditMessage}
                        className="bg-gradient-to-r from-pink-500 to-purple-500"
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,video/*,audio/*"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                      onClick={() => {
                        fileInputRef.current?.click()
                      }}
                    >
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    
                    <Input
                      placeholder={permissions.isFreePlan ? "Usuários gratuitos não podem enviar mensagens" : "Digite uma mensagem..."}
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value)
                        handleTyping()
                      }}
                      onKeyPress={handleKeyPress}
                      disabled={permissions.isFreePlan && !conversations.find(c => c.id === selectedConversation)?.initiated_by_premium}
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10 relative"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-16 right-4 bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-lg">
                        <div className="grid grid-cols-8 gap-2">
                          {['😀', '😍', '🥰', '😘', '🤗', '🤔', '😅', '😂', '❤️', '💕', '👍', '👏', '🔥', '💯', '🎉', '🎈'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => {
                                setMessageInput(prev => prev + emoji)
                                setShowEmojiPicker(false)
                              }}
                              className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`rounded-full hover:bg-gray-100 dark:hover:bg-white/10 ${isRecording ? 'bg-red-100 dark:bg-red-900/20' : ''}`}
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      <Mic className={`w-5 h-5 ${isRecording ? 'text-red-500' : ''}`} />
                    </Button>
                    
                    <div className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || (permissions.isFreePlan && !conversations.find(c => c.id === selectedConversation)?.initiated_by_premium)}
                        size="icon"
                        className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {(permissions.isFreePlan || (permissions.isGoldPlan && !permissions.isVerified)) && (
                  <div className="text-xs text-center mt-2 text-gray-500 dark:text-white/60">
                    {permissions.isFreePlan ? (
                      <p>Usuários gratuitos não podem enviar mensagens. <span className="text-pink-600 font-semibold">Faça upgrade para Gold!</span></p>
                    ) : (
                      <p>
                        {permissions.getRemainingMessages()} mensagens restantes hoje. 
                        <span className="text-pink-600 font-semibold">Verifique sua conta para ilimitadas!</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Desktop: Empty state
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-500 dark:text-white/60">
                  Escolha uma conversa da lista para começar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Conversations List - Right side on desktop, full screen on mobile when no conversation selected */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 md:border-l border-gray-200 dark:border-white/10`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mensagens</h2>
              <Button 
                size="icon" 
                variant="ghost"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (permissions.isFreePlan) {
                    notification.error('Usuários gratuitos não podem iniciar conversas. Faça upgrade para Gold!')
                  } else {
                    // TODO: Implement new conversation modal
                    notification.info('Em breve: Nova conversa')
                  }
                }}
                disabled={permissions.isFreePlan}
                title={permissions.isFreePlan ? "Faça upgrade para iniciar conversas" : "Nova conversa"}
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
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400 rounded-full"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center">
                <p className="text-gray-500">Carregando conversas...</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.map((conversation) => {
                  const participant = conversation.participants?.find(p => p.user_id !== user?.id)?.user
                  if (!participant) return null

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-gray-100 dark:bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={participant.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {participant.full_name?.charAt(0) || participant.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {participant.last_seen && new Date(participant.last_seen) > new Date(Date.now() - 5 * 60 * 1000) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                          )}
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {participant.full_name || participant.username}
                            </span>
                            {participant.is_verified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                            {getPlanBadge(participant.premium_type)}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-white/60 truncate">
                            {conversation.last_message?.content || "Iniciar conversa"}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-white/60">
                            {conversation.last_message_at ? 
                              format(new Date(conversation.last_message_at), "HH:mm", { locale: ptBR }) : 
                              ""
                            }
                          </p>
                          {conversation.unread_count > 0 && (
                            <Badge className="mt-1 bg-pink-500 text-white">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}