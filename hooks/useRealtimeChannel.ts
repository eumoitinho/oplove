import { useEffect, useRef } from 'react'
import { realtimeManager } from '@/lib/services/realtime-manager'

interface UseRealtimeChannelOptions {
  channelName: string
  event?: string
  schema?: string
  table?: string
  filter?: string
  enabled?: boolean
  onMessage: (payload: any) => void
}

/**
 * Hook to manage realtime channel subscriptions with automatic pooling
 */
export function useRealtimeChannel({
  channelName,
  event,
  schema,
  table,
  filter,
  enabled = true,
  onMessage
}: UseRealtimeChannelOptions) {
  const unsubscribeRef = useRef<(() => void) | null>(null)
  
  useEffect(() => {
    if (!enabled) return
    
    // Subscribe to channel
    unsubscribeRef.current = realtimeManager.subscribe(channelName, {
      event,
      schema,
      table,
      filter,
      callback: onMessage
    })
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [channelName, event, schema, table, filter, enabled])
  
  return {
    getStats: () => realtimeManager.getStats()
  }
}

/**
 * Hook for database change subscriptions
 */
export function useRealtimeDB({
  table,
  filter,
  event = '*',
  schema = 'public',
  enabled = true,
  onInsert,
  onUpdate,
  onDelete
}: {
  table: string
  filter?: string
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE'
  schema?: string
  enabled?: boolean
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
}) {
  const channelName = `db:${table}:${filter || 'all'}`
  
  useRealtimeChannel({
    channelName,
    event,
    schema,
    table,
    filter,
    enabled,
    onMessage: (payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload)
          break
        case 'UPDATE':
          onUpdate?.(payload)
          break
        case 'DELETE':
          onDelete?.(payload)
          break
      }
    }
  })
}

/**
 * Hook for presence tracking
 */
export function useRealtimePresence({
  channelName,
  userId,
  userInfo,
  enabled = true,
  onSync,
  onJoin,
  onLeave
}: {
  channelName: string
  userId: string
  userInfo?: any
  enabled?: boolean
  onSync?: (users: any[]) => void
  onJoin?: (user: any) => void
  onLeave?: (user: any) => void
}) {
  const channelRef = useRef<any>(null)
  
  useEffect(() => {
    if (!enabled) return
    
    const channel = realtimeManager.getChannel(channelName)
    channelRef.current = channel
    
    // Track presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      onSync?.(Object.values(state))
    })
    
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      onJoin?.(newPresences)
    })
    
    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      onLeave?.(leftPresences)
    })
    
    // Subscribe and track user
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          ...userInfo
        })
      }
    })
    
    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.untrack()
      }
    }
  }, [channelName, userId, userInfo, enabled])
}

/**
 * Hook for broadcast messages
 */
export function useRealtimeBroadcast({
  channelName,
  event,
  enabled = true,
  onMessage
}: {
  channelName: string
  event: string
  enabled?: boolean
  onMessage: (payload: any) => void
}) {
  const channelRef = useRef<any>(null)
  
  useRealtimeChannel({
    channelName,
    event: 'broadcast',
    enabled,
    onMessage
  })
  
  const broadcast = (message: any) => {
    if (!channelRef.current) {
      channelRef.current = realtimeManager.getChannel(channelName)
    }
    
    channelRef.current.send({
      type: 'broadcast',
      event,
      payload: message
    })
  }
  
  return { broadcast }
}