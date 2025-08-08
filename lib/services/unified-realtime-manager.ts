import { createClient, RealtimeChannel, RealtimeChannelSendResponse } from '@supabase/supabase-js'
import { EventEmitter } from 'events'

interface ChannelSubscription {
  id: string
  channel: RealtimeChannel
  callbacks: Set<Function>
  lastActivity: number
  config: SubscriptionConfig
}

interface SubscriptionConfig {
  table?: string
  event?: string
  filter?: string
  schema?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

interface ConnectionState {
  isConnected: boolean
  isConnecting: boolean
  reconnectAttempts: number
  lastError?: string
}

/**
 * Unified WebSocket/Realtime Manager for OpenLove
 * 
 * Handles all real-time subscriptions, authentication, and connection management
 * in a centralized, reliable way.
 */
class UnifiedRealtimeManager extends EventEmitter {
  private supabase: ReturnType<typeof createClient>
  private subscriptions: Map<string, ChannelSubscription> = new Map()
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0
  }
  
  private cleanupInterval?: NodeJS.Timeout
  private reconnectTimeout?: NodeJS.Timeout
  private maxReconnectAttempts = 5
  private maxIdleTime = 5 * 60 * 1000 // 5 minutes
  
  constructor() {
    super()
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    this.initializeConnectionMonitoring()
    this.startCleanupRoutine()
  }
  
  /**
   * Initialize connection monitoring
   */
  private initializeConnectionMonitoring() {
    // Monitor auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.handleAuthenticationChange(true, session?.user?.id)
      } else if (event === 'SIGNED_OUT') {
        this.handleAuthenticationChange(false)
      }
    })
  }
  
  /**
   * Handle authentication state changes
   */
  private handleAuthenticationChange(isAuthenticated: boolean, userId?: string) {
    if (!isAuthenticated) {
      // Clean up all subscriptions on logout
      this.disconnectAll()
      this.connectionState.isConnected = false
      this.emit('authStateChanged', { isAuthenticated: false })
      return
    }
    
    // Reinitialize subscriptions on login
    this.connectionState.reconnectAttempts = 0
    this.emit('authStateChanged', { isAuthenticated: true, userId })
    
    // Reconnect existing subscriptions
    this.reconnectAllSubscriptions()
  }
  
  /**
   * Subscribe to real-time updates
   */
  subscribe(
    channelId: string,
    config: SubscriptionConfig,
    callback: (payload: any) => void
  ): () => void {
    
    // Check if subscription already exists
    let subscription = this.subscriptions.get(channelId)
    
    if (!subscription) {
      // Create new channel
      const channel = this.supabase.channel(channelId)
      
      subscription = {
        id: channelId,
        channel,
        callbacks: new Set(),
        lastActivity: Date.now(),
        config
      }
      
      this.configureChannel(subscription)
      this.subscriptions.set(channelId, subscription)
    }
    
    // Add callback
    subscription.callbacks.add(callback)
    subscription.lastActivity = Date.now()
    
    // Subscribe if not already subscribed
    if (subscription.channel.state === 'closed') {
      this.activateSubscription(subscription)
    }
    
    // Return unsubscribe function
    return () => this.unsubscribe(channelId, callback)
  }
  
  /**
   * Configure channel with events and filters
   */
  private configureChannel(subscription: ChannelSubscription) {
    const { channel, config } = subscription
    
    if (config.table) {
      // Database changes subscription
      channel.on('postgres_changes', {
        event: config.event as any || '*',
        schema: config.schema || 'public',
        table: config.table,
        filter: config.filter
      }, (payload) => {
        subscription.lastActivity = Date.now()
        subscription.callbacks.forEach(callback => {
          try {
            callback(payload)
          } catch (error) {
            console.error('Error in realtime callback:', error)
            config.onError?.(error as Error)
          }
        })
      })
    }
    
    // Handle connection state changes
    channel.on('system', {}, (payload) => {
      const status = payload.status
      
      switch (status) {
        case 'SUBSCRIBED':
          this.connectionState.isConnected = true
          this.connectionState.isConnecting = false
          this.connectionState.reconnectAttempts = 0
          config.onConnect?.()
          this.emit('connected', { channelId: subscription.id })
          break
          
        case 'CLOSED':
        case 'CHANNEL_ERROR':
          this.connectionState.isConnected = false
          this.connectionState.isConnecting = false
          this.connectionState.lastError = payload.message
          config.onDisconnect?.()
          this.emit('disconnected', { 
            channelId: subscription.id, 
            error: payload.message 
          })
          this.scheduleReconnect(subscription)
          break
          
        case 'SUBSCRIBING':
          this.connectionState.isConnecting = true
          break
      }
    })
  }
  
  /**
   * Activate a subscription
   */
  private activateSubscription(subscription: ChannelSubscription) {
    subscription.channel.subscribe((status) => {
      console.log(`Channel ${subscription.id} status:`, status)
    })
  }
  
  /**
   * Unsubscribe from channel
   */
  unsubscribe(channelId: string, callback?: Function): void {
    const subscription = this.subscriptions.get(channelId)
    if (!subscription) return
    
    if (callback) {
      // Remove specific callback
      subscription.callbacks.delete(callback)
      
      // If no more callbacks, remove subscription
      if (subscription.callbacks.size === 0) {
        this.removeSubscription(channelId)
      }
    } else {
      // Remove entire subscription
      this.removeSubscription(channelId)
    }
  }
  
  /**
   * Remove subscription completely
   */
  private removeSubscription(channelId: string) {
    const subscription = this.subscriptions.get(channelId)
    if (!subscription) return
    
    // Unsubscribe from Supabase channel
    this.supabase.removeChannel(subscription.channel)
    
    // Remove from our tracking
    this.subscriptions.delete(channelId)
    
    this.emit('subscriptionRemoved', { channelId })
  }
  
  /**
   * Schedule reconnect for failed subscription
   */
  private scheduleReconnect(subscription: ChannelSubscription) {
    if (this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnect attempts reached for ${subscription.id}`)
      this.emit('maxReconnectAttemptsReached', { channelId: subscription.id })
      return
    }
    
    const delay = Math.min(1000 * Math.pow(2, this.connectionState.reconnectAttempts), 30000)
    
    this.reconnectTimeout = setTimeout(() => {
      this.connectionState.reconnectAttempts++
      console.log(`Reconnecting ${subscription.id} (attempt ${this.connectionState.reconnectAttempts})`)
      
      // Create new channel with same config
      const newChannel = this.supabase.channel(subscription.id)
      subscription.channel = newChannel
      
      this.configureChannel(subscription)
      this.activateSubscription(subscription)
    }, delay)
  }
  
  /**
   * Reconnect all subscriptions
   */
  private reconnectAllSubscriptions() {
    this.subscriptions.forEach(subscription => {
      if (subscription.channel.state === 'closed') {
        this.scheduleReconnect(subscription)
      }
    })
  }
  
  /**
   * Disconnect all subscriptions
   */
  disconnectAll() {
    this.subscriptions.forEach((subscription, channelId) => {
      this.removeSubscription(channelId)
    })
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
  }
  
  /**
   * Start cleanup routine for idle subscriptions
   */
  private startCleanupRoutine() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      
      this.subscriptions.forEach((subscription, channelId) => {
        if (subscription.callbacks.size === 0 && 
            (now - subscription.lastActivity) > this.maxIdleTime) {
          console.log(`Cleaning up idle subscription: ${channelId}`)
          this.removeSubscription(channelId)
        }
      })
    }, 60000) // Check every minute
  }
  
  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      totalSubscriptions: this.subscriptions.size,
      activeSubscriptions: Array.from(this.subscriptions.values())
        .filter(s => s.channel.state === 'subscribed').length,
      connectionState: this.connectionState,
      subscriptionDetails: Array.from(this.subscriptions.entries()).map(([id, sub]) => ({
        id,
        state: sub.channel.state,
        callbackCount: sub.callbacks.size,
        lastActivity: new Date(sub.lastActivity).toISOString()
      }))
    }
  }
  
  /**
   * Send broadcast message
   */
  broadcast(channelId: string, event: string, payload: any): Promise<RealtimeChannelSendResponse> {
    const subscription = this.subscriptions.get(channelId)
    if (!subscription) {
      throw new Error(`No active subscription found for channel: ${channelId}`)
    }
    
    return subscription.channel.send({
      type: 'broadcast',
      event,
      payload
    })
  }
  
  /**
   * Cleanup on destroy
   */
  destroy() {
    this.disconnectAll()
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    
    this.removeAllListeners()
  }
}

// Export singleton instance
export const unifiedRealtimeManager = new UnifiedRealtimeManager()

// Export class for custom instances if needed
export { UnifiedRealtimeManager }