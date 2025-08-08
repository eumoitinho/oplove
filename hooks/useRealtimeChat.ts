"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/app/lib/supabase-browser'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content?: string
  type: 'text' | 'image' | 'video' | 'audio' | 'file'
  media_url?: string
  media_metadata?: Record<string, any>
  is_read: boolean
  is_edited: boolean
  edited_at?: string
  created_at: string
  updated_at: string
  sender?: {
    id: string
    username: string
    name?: string
    avatar_url?: string | null
    premium_type?: string
    is_verified?: boolean
  }
}

export interface TypingUser {
  userId: string
  username?: string
  timestamp: number
}

interface UseRealtimeChatOptions {
  conversationId: string
  onNewMessage?: (message: Message) => void
  onMessageUpdate?: (message: Message) => void
  onMessageDelete?: (messageId: string) => void
  onTypingUpdate?: (typingUsers: TypingUser[]) => void
  onPresenceUpdate?: (onlineUsers: string[]) => void
}

/**
 * Unified hook for real-time chat functionality
 * Uses a single Supabase channel per conversation for all events
 */
export function useRealtimeChat({
  conversationId,
  onNewMessage,
  onMessageUpdate,
  onMessageDelete,
  onTypingUpdate,
  onPresenceUpdate
}: UseRealtimeChatOptions) {
  const { user } = useAuth()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) return

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(
            id,
            username,
            name,
            avatar_url,
            premium_type,
            is_verified
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (fetchError) throw fetchError

      setMessages(data || [])
    } catch (err) {
      console.error('Error loading messages:', err)
      setError('Erro ao carregar mensagens')
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, supabase])

  // Send message
  const sendMessage = useCallback(async (
    content: string,
    type: Message['type'] = 'text',
    mediaUrl?: string,
    mediaMetadata?: Record<string, any>
  ) => {
    if (!user || !conversationId) return null

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          type,
          media_url: mediaUrl,
          media_metadata: mediaMetadata
        })
        .select(`
          *,
          sender:users!sender_id(
            id,
            username,
            name,
            avatar_url,
            premium_type,
            is_verified
          )
        `)
        .single()

      if (error) throw error

      // Update last message in conversation
      await supabase
        .from('conversations')
        .update({
          last_message_at: data.created_at,
          last_message_id: data.id
        })
        .eq('id', conversationId)

      return data
    } catch (err) {
      console.error('Error sending message:', err)
      toast.error('Erro ao enviar mensagem')
      return null
    }
  }, [user, conversationId, supabase])

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Error editing message:', err)
      toast.error('Erro ao editar mensagem')
      return false
    }
  }, [user, supabase])

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Error deleting message:', err)
      toast.error('Erro ao excluir mensagem')
      return false
    }
  }, [user, supabase])

  // Send typing indicator
  const sendTypingIndicator = useCallback(async () => {
    if (!user || !channelRef.current) return

    try {
      await channelRef.current.track({
        user_id: user.id,
        username: user.username || user.email?.split('@')[0],
        typing: true,
        timestamp: Date.now()
      })

      // Auto-remove typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(async () => {
        if (channelRef.current) {
          await channelRef.current.untrack()
        }
      }, 3000)
    } catch (err) {
      console.error('Error sending typing indicator:', err)
    }
  }, [user])

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds?: string[]) => {
    if (!user || !conversationId) return

    try {
      const query = supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false)

      if (messageIds?.length) {
        query.in('id', messageIds)
      }

      await query
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }, [user, conversationId, supabase])

  // Setup real-time subscription
  useEffect(() => {
    if (!conversationId || !user) return

    // Load initial messages
    loadMessages()

    // Create single channel for all events
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      // PostgreSQL changes for messages
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message
            
            // Add sender info if it's from current user
            if (newMsg.sender_id === user.id) {
              newMsg.sender = {
                id: user.id,
                username: user.username || '',
                name: user.name || user.full_name,
                avatar_url: user.avatar_url,
                premium_type: user.premium_type,
                is_verified: user.is_verified
              }
            }
            
            setMessages(prev => [...prev, newMsg])
            onNewMessage?.(newMsg)
            
            // Auto mark as read if not from current user
            if (newMsg.sender_id !== user.id) {
              markAsRead([newMsg.id])
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as Message
            setMessages(prev => prev.map(m => 
              m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m
            ))
            onMessageUpdate?.(updatedMsg)
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setMessages(prev => prev.filter(m => m.id !== deletedId))
            onMessageDelete?.(deletedId)
          }
        }
      )
      // Presence for online status and typing
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        
        // Extract typing users
        const typing: TypingUser[] = []
        const online: string[] = []
        
        Object.values(state).flat().forEach((presence: any) => {
          if (presence.user_id !== user.id) {
            online.push(presence.user_id)
            
            if (presence.typing) {
              typing.push({
                userId: presence.user_id,
                username: presence.username,
                timestamp: presence.timestamp
              })
            }
          }
        })
        
        // Filter out stale typing indicators (older than 3 seconds)
        const now = Date.now()
        const activeTyping = typing.filter(t => now - t.timestamp < 3000)
        
        setTypingUsers(activeTyping)
        setOnlineUsers(online)
        onTypingUpdate?.(activeTyping)
        onPresenceUpdate?.(online)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUserIds = leftPresences.map((p: any) => p.user_id)
        
        setTypingUsers(prev => prev.filter(t => !leftUserIds.includes(t.userId)))
        setOnlineUsers(prev => prev.filter(id => !leftUserIds.includes(id)))
      })

    // Subscribe to channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Connected to conversation: ${conversationId}`)
        
        // Track user presence
        await channel.track({
          user_id: user.id,
          username: user.username || user.email?.split('@')[0],
          online_at: new Date().toISOString()
        })
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error connecting to conversation: ${conversationId}`)
        setError('Erro na conexão em tempo real')
      }
    })

    channelRef.current = channel

    // Cleanup
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      channel.untrack()
      channel.unsubscribe()
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [conversationId, user, supabase, loadMessages, markAsRead, onNewMessage, onMessageUpdate, onMessageDelete, onTypingUpdate, onPresenceUpdate])

  return {
    messages,
    typingUsers,
    onlineUsers,
    isLoading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTypingIndicator,
    markAsRead,
    reloadMessages: loadMessages
  }
}