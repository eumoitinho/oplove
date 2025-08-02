import { createClient, RealtimeChannel } from '@supabase/supabase-js'

interface ChannelInfo {
  channel: RealtimeChannel
  refCount: number
  lastAccessed: number
  subscriptions: Set<string>
}

interface ChannelConfig {
  maxChannels?: number
  maxIdleTime?: number // milliseconds
  cleanupInterval?: number // milliseconds
}

class RealtimeChannelManager {
  private channels: Map<string, ChannelInfo> = new Map()
  private supabase: ReturnType<typeof createClient>
  private config: Required<ChannelConfig>
  private cleanupTimer: NodeJS.Timeout | null = null
  
  constructor(config: ChannelConfig = {}) {
    this.config = {
      maxChannels: config.maxChannels || 50,
      maxIdleTime: config.maxIdleTime || 5 * 60 * 1000, // 5 minutes
      cleanupInterval: config.cleanupInterval || 60 * 1000 // 1 minute
    }
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Start cleanup timer
    this.startCleanupTimer()
  }
  
  /**
   * Get or create a channel
   */
  getChannel(channelName: string): RealtimeChannel {
    const existingInfo = this.channels.get(channelName)
    
    if (existingInfo) {
      // Update access time and increment ref count
      existingInfo.lastAccessed = Date.now()
      existingInfo.refCount++
      return existingInfo.channel
    }
    
    // Check if we need to remove old channels
    if (this.channels.size >= this.config.maxChannels) {
      this.removeOldestChannel()
    }
    
    // Create new channel
    const channel = this.supabase.channel(channelName)
    const info: ChannelInfo = {
      channel,
      refCount: 1,
      lastAccessed: Date.now(),
      subscriptions: new Set()
    }
    
    this.channels.set(channelName, info)
    return channel
  }
  
  /**
   * Subscribe to a channel with specific configuration
   */
  subscribe(
    channelName: string,
    config: {
      event?: string
      schema?: string
      table?: string
      filter?: string
      callback: (payload: any) => void
    }
  ): () => void {
    const channel = this.getChannel(channelName)
    const subscriptionId = this.generateSubscriptionId(config)
    const channelInfo = this.channels.get(channelName)!
    
    // Track subscription
    channelInfo.subscriptions.add(subscriptionId)
    
    // Setup subscription
    if (config.table) {
      // Database changes
      channel.on('postgres_changes', {
        event: config.event as any || '*',
        schema: config.schema || 'public',
        table: config.table,
        filter: config.filter
      }, config.callback)
    } else if (config.event === 'presence') {
      // Presence
      channel.on('presence', { event: 'sync' }, config.callback)
    } else if (config.event === 'broadcast') {
      // Broadcast
      channel.on('broadcast', { event: config.event }, config.callback)
    }
    
    // Subscribe if not already subscribed
    if (channel.state !== 'subscribed' && channel.state !== 'subscribing') {
      channel.subscribe()
    }
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(channelName, subscriptionId)
    }
  }
  
  /**
   * Unsubscribe from a channel
   */
  private unsubscribe(channelName: string, subscriptionId: string) {
    const channelInfo = this.channels.get(channelName)
    if (!channelInfo) return
    
    // Remove subscription
    channelInfo.subscriptions.delete(subscriptionId)
    channelInfo.refCount--
    
    // If no more references, mark for potential cleanup
    if (channelInfo.refCount <= 0) {
      channelInfo.refCount = 0
      channelInfo.lastAccessed = Date.now()
    }
  }
  
  /**
   * Remove a channel completely
   */
  removeChannel(channelName: string) {
    const channelInfo = this.channels.get(channelName)
    if (!channelInfo) return
    
    // Unsubscribe and remove
    this.supabase.removeChannel(channelInfo.channel)
    this.channels.delete(channelName)
  }
  
  /**
   * Remove the oldest accessed channel
   */
  private removeOldestChannel() {
    let oldestChannel: string | null = null
    let oldestTime = Date.now()
    
    // Find channel with oldest access time and zero refs
    for (const [name, info] of this.channels) {
      if (info.refCount === 0 && info.lastAccessed < oldestTime) {
        oldestTime = info.lastAccessed
        oldestChannel = name
      }
    }
    
    // If no zero-ref channels, find absolute oldest
    if (!oldestChannel) {
      for (const [name, info] of this.channels) {
        if (info.lastAccessed < oldestTime) {
          oldestTime = info.lastAccessed
          oldestChannel = name
        }
      }
    }
    
    if (oldestChannel) {
      console.log(`[RealtimeManager] Removing old channel: ${oldestChannel}`)
      this.removeChannel(oldestChannel)
    }
  }
  
  /**
   * Cleanup idle channels
   */
  private cleanup() {
    const now = Date.now()
    const channelsToRemove: string[] = []
    
    for (const [name, info] of this.channels) {
      // Remove channels with no references that have been idle
      if (info.refCount === 0 && (now - info.lastAccessed) > this.config.maxIdleTime) {
        channelsToRemove.push(name)
      }
    }
    
    // Remove idle channels
    channelsToRemove.forEach(name => {
      console.log(`[RealtimeManager] Cleaning up idle channel: ${name}`)
      this.removeChannel(name)
    })
  }
  
  /**
   * Start cleanup timer
   */
  private startCleanupTimer() {
    if (this.cleanupTimer) return
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }
  
  /**
   * Stop cleanup timer
   */
  private stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
  
  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(config: any): string {
    return `${config.event || 'unknown'}_${config.table || 'none'}_${config.filter || 'all'}_${Date.now()}`
  }
  
  /**
   * Get channel statistics
   */
  getStats() {
    const stats = {
      totalChannels: this.channels.size,
      activeChannels: 0,
      idleChannels: 0,
      totalSubscriptions: 0
    }
    
    for (const [_, info] of this.channels) {
      if (info.refCount > 0) {
        stats.activeChannels++
      } else {
        stats.idleChannels++
      }
      stats.totalSubscriptions += info.subscriptions.size
    }
    
    return stats
  }
  
  /**
   * Destroy the manager
   */
  destroy() {
    // Stop cleanup timer
    this.stopCleanupTimer()
    
    // Remove all channels
    for (const [name, _] of this.channels) {
      this.removeChannel(name)
    }
    
    this.channels.clear()
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeChannelManager({
  maxChannels: 50,
  maxIdleTime: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000 // 1 minute
})

// Export for custom instances
export { RealtimeChannelManager }