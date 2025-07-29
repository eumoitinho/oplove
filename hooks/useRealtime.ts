"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

/**
 * Real-time subscriptions hook for OpenLove
 *
 * Manages Supabase real-time subscriptions for live updates across the platform.
 * Handles connection state, automatic reconnection, and subscription cleanup.
 *
 * @example
 * ```tsx
 * function ChatRoom({ roomId }: { roomId: string }) {
 *   const [messages, setMessages] = useState<Message[]>([])
 *
 *   const { subscribe, unsubscribe, isConnected } = useRealtime()
 *
 *   useEffect(() => {
 *     const subscription = subscribe(
 *       `messages:room_id=eq.${roomId}`,
 *       'messages',
 *       (payload) => {
 *         if (payload.eventType === 'INSERT') {
 *           setMessages(prev => [...prev, payload.new as Message])
 *         }
 *       }
 *     )
 *
 *     return () => unsubscribe(subscription)
 *   }, [roomId, subscribe, unsubscribe])
 *
 *   return (
 *     <div>
 *       {!isConnected && <div>Reconectando...</div>}
 *       {messages.map(message => (
 *         <MessageBubble key={message.id} message={message} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 *
 * @returns Real-time subscription controls and state
 */
export function useRealtime() {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)

  /**
   * Handle connection state changes
   */
  useEffect(() => {
    const handleConnectionChange = (status: string) => {
      setIsConnected(status === "SUBSCRIBED")

      if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setConnectionError("Conexão perdida")
        handleReconnect()
      } else if (status === "SUBSCRIBED") {
        setConnectionError(null)
        reconnectAttemptsRef.current = 0
      }
    }

    // Monitor connection status
    const channel = supabase.channel("connection-monitor")
    channel.on("system", {}, handleConnectionChange)
    channel.subscribe()

    return () => {
      channel.unsubscribe()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  /**
   * Handle automatic reconnection
   */
  const handleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= 5) {
      setConnectionError("Falha na conexão. Recarregue a página.")
      return
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++

      // Resubscribe to all channels
      channelsRef.current.forEach((channel) => {
        channel.unsubscribe()
        channel.subscribe()
      })
    }, delay)
  }, [])

  /**
   * Subscribe to real-time updates
   */
  const subscribe = useCallback(
    <T = any>(
      filter: string,
      table: string,
      callback: (payload: RealtimePostgresChangesPayload<T>) => void,
      options?: {
        event?: "INSERT" | "UPDATE" | "DELETE" | "*"
        schema?: string
      },
    ) => {
      if (!user) {
        console.warn("Cannot subscribe to real-time updates without authentication")
        return null
      }

      const channelName = `${table}-${filter}-${Date.now()}`
      const channel = supabase.channel(channelName)

      // Configure subscription
      channel.on(
        "postgres_changes",
        {
          event: options?.event || "*",
          schema: options?.schema || "public",
          table,
          filter,
        },
        callback,
      )

      // Handle subscription state
      channel.on("system", {}, (payload) => {
        if (payload.status === "SUBSCRIBED") {
          setIsConnected(true)
          setConnectionError(null)
        } else if (payload.status === "CLOSED") {
          setIsConnected(false)
          setConnectionError("Conexão perdida")
        }
      })

      // Subscribe and store reference
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channelsRef.current.set(channelName, channel)
        }
      })

      return channelName
    },
    [user],
  )

  /**
   * Unsubscribe from real-time updates
   */
  const unsubscribe = useCallback((subscriptionId: string | null) => {
    if (!subscriptionId) return

    const channel = channelsRef.current.get(subscriptionId)
    if (channel) {
      channel.unsubscribe()
      channelsRef.current.delete(subscriptionId)
    }
  }, [])

  /**
   * Subscribe to user presence
   */
  const subscribeToPresence = useCallback(
    (roomId: string, onPresenceChange: (presences: Record<string, any>) => void) => {
      if (!user) return null

      const channelName = `presence-${roomId}`
      const channel = supabase.channel(channelName)

      // Track user presence
      channel.on("presence", { event: "sync" }, () => {
        const presences = channel.presenceState()
        onPresenceChange(presences)
      })

      channel.on("presence", { event: "join" }, ({ newPresences }) => {
        console.log("User joined:", newPresences)
      })

      channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
        console.log("User left:", leftPresences)
      })

      // Join presence
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            online_at: new Date().toISOString(),
          })

          channelsRef.current.set(channelName, channel)
        }
      })

      return channelName
    },
    [user],
  )

  /**
   * Send broadcast message
   */
  const broadcast = useCallback((channelName: string, event: string, payload: any) => {
    const channel = channelsRef.current.get(channelName)
    if (channel) {
      channel.send({
        type: "broadcast",
        event,
        payload,
      })
    }
  }, [])

  /**
   * Subscribe to broadcast messages
   */
  const subscribeToBroadcast = useCallback((channelName: string, event: string, callback: (payload: any) => void) => {
    const channel = channelsRef.current.get(channelName)
    if (channel) {
      channel.on("broadcast", { event }, callback)
    }
  }, [])

  /**
   * Cleanup all subscriptions
   */
  useEffect(() => {
    return () => {
      channelsRef.current.forEach((channel) => {
        channel.unsubscribe()
      })
      channelsRef.current.clear()

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    // State
    isConnected,
    connectionError,

    // Methods
    subscribe,
    unsubscribe,
    subscribeToPresence,
    broadcast,
    subscribeToBroadcast,
  }
}
