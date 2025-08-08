import { createSupabaseClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimeCallback<T = any> {
  (payload: RealtimePostgresChangesPayload<T>): void
}

export interface BroadcastCallback {
  (payload: any): void
}

export interface PresenceCallback {
  (state: any): void
}

/**
 * Unified Supabase Realtime Service
 * Manages all realtime connections and subscriptions
 * 
 * Features:
 * - Postgres changes (likes, comments, notifications)
 * - Broadcast events (custom events)
 * - Presence (online users, typing indicators)
 * - Automatic reconnection
 * - Channel management
 */
class RealtimeService {
  private supabase = createSupabaseClient()
  private channels: Map<string, RealtimeChannel> = new Map()
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private subscriptionCallbacks: Map<string, Set<Function>> = new Map()

  /**
   * Subscribe to post interactions (likes, comments, shares)
   */
  subscribeToPostInteractions(
    postId: string,
    callbacks: {
      onLike?: (payload: any) => void
      onComment?: (payload: any) => void
      onShare?: (payload: any) => void
    }
  ) {
    const channelName = `post:${postId}`
    
    // Reuse existing channel if available
    let channel = this.channels.get(channelName)
    
    if (!channel) {
      channel = this.supabase.channel(channelName)
      
      // Listen to likes
      if (callbacks.onLike) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'post_likes',
            filter: `post_id=eq.${postId}`
          },
          callbacks.onLike
        )
      }
      
      // Listen to comments
      if (callbacks.onComment) {
        channel.on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'post_comments',
            filter: `post_id=eq.${postId}`
          },
          callbacks.onComment
        )
      }
      
      // Listen to shares
      if (callbacks.onShare) {
        channel.on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'post_shares',
            filter: `post_id=eq.${postId}`
          },
          callbacks.onShare
        )
      }
      
      // Listen to post updates (for counters)
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`
        },
        (payload) => {
          // Broadcast counter updates
          this.broadcastToChannel(channelName, 'counters_updated', payload.new)
        }
      )
      
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[RealtimeService] Subscribed to post ${postId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[RealtimeService] Error subscribing to post ${postId}`)
          this.scheduleReconnect(channelName)
        } else if (status === 'TIMED_OUT') {
          console.warn(`[RealtimeService] Subscription timed out for post ${postId}`)
          this.scheduleReconnect(channelName)
        }
      })
      
      this.channels.set(channelName, channel)
    }
    
    return () => this.unsubscribeFromChannel(channelName)
  }

  /**
   * Subscribe to user notifications in real-time
   */
  subscribeToUserNotifications(
    userId: string,
    onNotification: (notification: any) => void
  ) {
    const channelName = `user:${userId}:notifications`
    
    let channel = this.channels.get(channelName)
    
    if (!channel) {
      channel = this.supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`
          },
          async (payload) => {
            // Fetch sender info for the notification
            const notification = payload.new
            
            if (notification.sender_id) {
              const { data: sender } = await this.supabase
                .from('users')
                .select('id, username, name, avatar_url')
                .eq('id', notification.sender_id)
                .single()
              
              notification.sender = sender
            }
            
            onNotification(notification)
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[RealtimeService] Subscribed to notifications for user ${userId}`)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.scheduleReconnect(channelName)
          }
        })
      
      this.channels.set(channelName, channel)
    }
    
    return () => this.unsubscribeFromChannel(channelName)
  }

  /**
   * Subscribe to timeline updates (new posts, trending)
   */
  subscribeToTimeline(
    userId: string,
    callbacks: {
      onNewPost?: (post: any) => void
      onPostUpdate?: (post: any) => void
      onPostDelete?: (postId: string) => void
    }
  ) {
    const channelName = `timeline:${userId}`
    
    let channel = this.channels.get(channelName)
    
    if (!channel) {
      channel = this.supabase.channel(channelName)
      
      // Listen to new posts from followed users
      if (callbacks.onNewPost) {
        channel.on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'posts'
          },
          async (payload) => {
            // Check if post is from a followed user
            const { data: following } = await this.supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', userId)
              .eq('following_id', payload.new.user_id)
              .single()
            
            if (following) {
              callbacks.onNewPost!(payload.new)
            }
          }
        )
      }
      
      // Listen to post updates
      if (callbacks.onPostUpdate) {
        channel.on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'posts'
          },
          callbacks.onPostUpdate
        )
      }
      
      // Listen to post deletions
      if (callbacks.onPostDelete) {
        channel.on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'posts'
          },
          (payload) => callbacks.onPostDelete!(payload.old.id)
        )
      }
      
      channel.subscribe()
      this.channels.set(channelName, channel)
    }
    
    return () => this.unsubscribeFromChannel(channelName)
  }

  /**
   * Subscribe to presence (online users, typing indicators)
   */
  subscribeToPresence(
    channelName: string,
    userId: string,
    userInfo: { username: string; avatar_url?: string },
    callbacks: {
      onJoin?: (users: any[]) => void
      onLeave?: (users: any[]) => void
      onSync?: () => void
    }
  ) {
    let channel = this.channels.get(channelName)
    
    if (!channel) {
      channel = this.supabase.channel(channelName)
      
      // Track user presence
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState()
          callbacks.onSync?.()
          
          // Get all online users
          const users = Object.values(state).flat()
          callbacks.onJoin?.(users)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          callbacks.onJoin?.(newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          callbacks.onLeave?.(leftPresences)
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Send user presence
            await channel.track({
              user_id: userId,
              username: userInfo.username,
              avatar_url: userInfo.avatar_url,
              online_at: new Date().toISOString()
            })
          }
        })
      
      this.channels.set(channelName, channel)
    }
    
    return () => this.unsubscribeFromChannel(channelName)
  }

  /**
   * Broadcast custom events
   */
  async broadcastToChannel(channelName: string, event: string, payload: any) {
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload
      })
    }
  }

  /**
   * Subscribe to broadcast events
   */
  subscribeToBroadcast(
    channelName: string,
    event: string,
    callback: BroadcastCallback
  ) {
    let channel = this.channels.get(channelName)
    
    if (!channel) {
      channel = this.supabase.channel(channelName)
      this.channels.set(channelName, channel)
    }
    
    channel.on('broadcast', { event }, callback).subscribe()
    
    return () => {
      // Remove specific broadcast listener
      channel.unsubscribe()
    }
  }

  /**
   * Unsubscribe from a channel
   */
  private async unsubscribeFromChannel(channelName: string) {
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await channel.unsubscribe()
      this.channels.delete(channelName)
      
      // Clear reconnect timeout if exists
      const timeout = this.reconnectTimeouts.get(channelName)
      if (timeout) {
        clearTimeout(timeout)
        this.reconnectTimeouts.delete(channelName)
      }
    }
  }

  /**
   * Schedule reconnection for failed channels
   */
  private scheduleReconnect(channelName: string, delay = 5000) {
    // Clear existing timeout
    const existingTimeout = this.reconnectTimeouts.get(channelName)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    const timeout = setTimeout(async () => {
      console.log(`[RealtimeService] Attempting to reconnect channel: ${channelName}`)
      
      const channel = this.channels.get(channelName)
      if (channel) {
        await channel.subscribe()
      }
      
      this.reconnectTimeouts.delete(channelName)
    }, delay)
    
    this.reconnectTimeouts.set(channelName, timeout)
  }

  /**
   * Cleanup all channels
   */
  async cleanup() {
    // Unsubscribe from all channels
    for (const [name, channel] of this.channels) {
      await channel.unsubscribe()
    }
    
    // Clear all timeouts
    for (const timeout of this.reconnectTimeouts.values()) {
      clearTimeout(timeout)
    }
    
    this.channels.clear()
    this.reconnectTimeouts.clear()
    this.subscriptionCallbacks.clear()
  }

  /**
   * Get connection status
   */
  getStatus() {
    const statuses: Record<string, string> = {}
    
    for (const [name, channel] of this.channels) {
      statuses[name] = channel.state
    }
    
    return {
      channels: statuses,
      totalChannels: this.channels.size,
      reconnectQueue: this.reconnectTimeouts.size
    }
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService()

// Export for use in components
export default realtimeService