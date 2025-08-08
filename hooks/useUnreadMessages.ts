import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'

export function useUnreadMessages() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch initial unread count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        // Get conversations where user is participant
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            conversation_participants!inner(user_id)
          `)
          .eq('conversation_participants.user_id', user.id)

        if (convError) throw convError

        const conversationIds = conversations?.map(c => c.id) || []

        if (conversationIds.length === 0) {
          setUnreadCount(0)
          return
        }

        // Count unread messages in these conversations
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .neq('sender_id', user.id) // Exclude own messages
          .eq('is_read', false)

        if (countError) throw countError

        setUnreadCount(count || 0)
      } catch (error) {
        console.error('Error fetching unread message count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user.id}` // Only messages not from current user
        },
        (payload) => {
          // Check if user is participant in this conversation
          supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', payload.new.conversation_id)
            .eq('user_id', user.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                setUnreadCount(prev => prev + 1)
              }
            })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `is_read=eq.true`
        },
        () => {
          // Refresh count when messages are marked as read
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Function to manually update count (e.g., after marking as read)
  const decrementUnreadCount = (amount: number = 1) => {
    setUnreadCount(prev => Math.max(0, prev - amount))
  }

  const resetUnreadCount = () => {
    setUnreadCount(0)
  }

  return {
    unreadCount,
    loading,
    decrementUnreadCount,
    resetUnreadCount
  }
}