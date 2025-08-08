/**
 * Messaging System Monitoring
 * Performance metrics, health checks, and error tracking
 */

import { createClient } from '@/lib/supabase/client'
import { ConversationCacheService } from '@/lib/cache/conversation-cache.service'

export interface MessageMetrics {
  totalMessages: number
  messagesSentLastHour: number
  averageDeliveryTime: number
  failedMessages: number
  successRate: number
}

export interface ConversationMetrics {
  totalConversations: number
  activeConversations: number
  averageMessagesPerConversation: number
  averageParticipantsPerConversation: number
}

export interface CacheMetrics {
  hitRate: number
  missRate: number
  averageResponseTime: number
  cacheSize: number
  evictionRate: number
}

export interface WebRTCMetrics {
  totalCalls: number
  activeCallconnectionSuccessRate: number
  averageCallDuration: number
  failedConnections: number
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: boolean
    cache: boolean
    webrtc: boolean
    storage: boolean
  }
  metrics: {
    messages: MessageMetrics
    conversations: ConversationMetrics
    cache: CacheMetrics
    webrtc: WebRTCMetrics
  }
  errors: Array<{
    component: string
    error: string
    timestamp: string
  }>
}

export class MessagingMonitor {
  private supabase = createClient()
  private cacheService = new ConversationCacheService()
  private metricsCache: Map<string, any> = new Map()
  private errorLog: Array<{ component: string; error: string; timestamp: string }> = []
  private performanceObserver?: PerformanceObserver

  constructor() {
    this.initializePerformanceObserver()
  }

  /**
   * Initialize performance observer for browser metrics
   */
  private initializePerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return

    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('message') || entry.name.includes('conversation')) {
          this.recordPerformanceMetric(entry.name, entry.duration)
        }
      }
    })

    this.performanceObserver.observe({ entryTypes: ['measure', 'resource'] })
  }

  /**
   * Record performance metric
   */
  private recordPerformanceMetric(name: string, duration: number) {
    const metrics = this.metricsCache.get('performance') || []
    metrics.push({ name, duration, timestamp: Date.now() })
    
    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.shift()
    }
    
    this.metricsCache.set('performance', metrics)
  }

  /**
   * Get message metrics
   */
  async getMessageMetrics(): Promise<MessageMetrics> {
    try {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

      // Get total messages
      const { count: totalMessages } = await this.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })

      // Get messages sent in last hour
      const { count: messagesSentLastHour } = await this.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneHourAgo.toISOString())

      // Get failed messages (from cache/local metrics)
      const failedMessages = this.metricsCache.get('failedMessages') || 0

      // Calculate average delivery time from performance metrics
      const performanceMetrics = this.metricsCache.get('performance') || []
      const messageMetrics = performanceMetrics.filter((m: any) => m.name.includes('send-message'))
      const averageDeliveryTime = messageMetrics.length > 0
        ? messageMetrics.reduce((sum: number, m: any) => sum + m.duration, 0) / messageMetrics.length
        : 0

      // Calculate success rate
      const successRate = totalMessages > 0
        ? ((totalMessages - failedMessages) / totalMessages) * 100
        : 100

      return {
        totalMessages: totalMessages || 0,
        messagesSentLastHour: messagesSentLastHour || 0,
        averageDeliveryTime: Math.round(averageDeliveryTime),
        failedMessages,
        successRate: Math.round(successRate * 100) / 100
      }
    } catch (error) {
      this.logError('message-metrics', error)
      return {
        totalMessages: 0,
        messagesSentLastHour: 0,
        averageDeliveryTime: 0,
        failedMessages: 0,
        successRate: 0
      }
    }
  }

  /**
   * Get conversation metrics
   */
  async getConversationMetrics(): Promise<ConversationMetrics> {
    try {
      // Get total conversations
      const { count: totalConversations } = await this.supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })

      // Get active conversations (with messages in last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const { data: activeConvData } = await this.supabase
        .from('conversations')
        .select('id')
        .gte('updated_at', oneDayAgo.toISOString())

      const activeConversations = activeConvData?.length || 0

      // Get average messages per conversation
      const { data: avgMessagesData } = await this.supabase
        .rpc('get_average_messages_per_conversation')

      // Get average participants
      const { data: avgParticipantsData } = await this.supabase
        .rpc('get_average_participants_per_conversation')

      return {
        totalConversations: totalConversations || 0,
        activeConversations,
        averageMessagesPerConversation: avgMessagesData?.[0]?.avg || 0,
        averageParticipantsPerConversation: avgParticipantsData?.[0]?.avg || 0
      }
    } catch (error) {
      this.logError('conversation-metrics', error)
      return {
        totalConversations: 0,
        activeConversations: 0,
        averageMessagesPerConversation: 0,
        averageParticipantsPerConversation: 0
      }
    }
  }

  /**
   * Get cache metrics
   */
  async getCacheMetrics(): Promise<CacheMetrics> {
    try {
      const stats = await this.cacheService.getCacheStats()
      
      // Get hit/miss rates from local metrics
      const hits = this.metricsCache.get('cacheHits') || 0
      const misses = this.metricsCache.get('cacheMisses') || 0
      const total = hits + misses

      const hitRate = total > 0 ? (hits / total) * 100 : 0
      const missRate = total > 0 ? (misses / total) * 100 : 0

      // Get average response time
      const cachePerformance = this.metricsCache.get('cachePerformance') || []
      const averageResponseTime = cachePerformance.length > 0
        ? cachePerformance.reduce((sum: number, time: number) => sum + time, 0) / cachePerformance.length
        : 0

      return {
        hitRate: Math.round(hitRate * 100) / 100,
        missRate: Math.round(missRate * 100) / 100,
        averageResponseTime: Math.round(averageResponseTime),
        cacheSize: stats.conversationsCached + stats.messagesCached,
        evictionRate: 0 // Would need to track this separately
      }
    } catch (error) {
      this.logError('cache-metrics', error)
      return {
        hitRate: 0,
        missRate: 0,
        averageResponseTime: 0,
        cacheSize: 0,
        evictionRate: 0
      }
    }
  }

  /**
   * Get WebRTC metrics
   */
  async getWebRTCMetrics(): Promise<WebRTCMetrics> {
    try {
      // These would come from a calls table or WebRTC service
      const totalCalls = this.metricsCache.get('totalCalls') || 0
      const activeCalls = this.metricsCache.get('activeCalls') || 0
      const failedConnections = this.metricsCache.get('failedConnections') || 0
      const successfulConnections = totalCalls - failedConnections

      const connectionSuccessRate = totalCalls > 0
        ? (successfulConnections / totalCalls) * 100
        : 100

      // Average call duration from metrics
      const callDurations = this.metricsCache.get('callDurations') || []
      const averageCallDuration = callDurations.length > 0
        ? callDurations.reduce((sum: number, d: number) => sum + d, 0) / callDurations.length
        : 0

      return {
        totalCalls,
        activeCalls,
        connectionSuccessRate: Math.round(connectionSuccessRate * 100) / 100,
        averageCallDuration: Math.round(averageCallDuration),
        failedConnections
      }
    } catch (error) {
      this.logError('webrtc-metrics', error)
      return {
        totalCalls: 0,
        activeCalls: 0,
        connectionSuccessRate: 0,
        averageCallDuration: 0,
        failedConnections: 0
      }
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
      webrtc: await this.checkWebRTC(),
      storage: await this.checkStorage()
    }

    const metrics = {
      messages: await this.getMessageMetrics(),
      conversations: await this.getConversationMetrics(),
      cache: await this.getCacheMetrics(),
      webrtc: await this.getWebRTCMetrics()
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    const failedChecks = Object.values(checks).filter(check => !check).length
    if (failedChecks >= 2) {
      status = 'unhealthy'
    } else if (failedChecks === 1) {
      status = 'degraded'
    }

    // Check metrics thresholds
    if (metrics.messages.successRate < 90) {
      status = status === 'healthy' ? 'degraded' : status
    }
    if (metrics.cache.hitRate < 70) {
      status = status === 'healthy' ? 'degraded' : status
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      checks,
      metrics,
      errors: this.errorLog.slice(-10) // Last 10 errors
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('conversations')
        .select('id')
        .limit(1)
      
      return !error
    } catch {
      return false
    }
  }

  /**
   * Check cache connectivity
   */
  private async checkCache(): Promise<boolean> {
    try {
      const testKey = 'health-check-test'
      const testValue = Date.now().toString()
      
      // Test write and read
      await this.cacheService.setOnlineStatus(testKey, true)
      const status = await this.cacheService.getOnlineStatus([testKey])
      
      return status[testKey] !== undefined
    } catch {
      return false
    }
  }

  /**
   * Check WebRTC readiness
   */
  private async checkWebRTC(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return true
      
      // Check if WebRTC APIs are available
      return !!(
        window.RTCPeerConnection &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      )
    } catch {
      return false
    }
  }

  /**
   * Check storage service
   */
  private async checkStorage(): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from('chat-media')
        .list('', { limit: 1 })
      
      // If bucket doesn't exist, that's okay - just checking connectivity
      return !error || error.message.includes('not found')
    } catch {
      return false
    }
  }

  /**
   * Log error
   */
  private logError(component: string, error: any) {
    console.error(`[${component}]`, error)
    
    this.errorLog.push({
      component,
      error: error.message || String(error),
      timestamp: new Date().toISOString()
    })

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }
  }

  /**
   * Record cache hit
   */
  recordCacheHit() {
    const hits = this.metricsCache.get('cacheHits') || 0
    this.metricsCache.set('cacheHits', hits + 1)
  }

  /**
   * Record cache miss
   */
  recordCacheMiss() {
    const misses = this.metricsCache.get('cacheMisses') || 0
    this.metricsCache.set('cacheMisses', misses + 1)
  }

  /**
   * Record failed message
   */
  recordFailedMessage() {
    const failed = this.metricsCache.get('failedMessages') || 0
    this.metricsCache.set('failedMessages', failed + 1)
  }

  /**
   * Record WebRTC call
   */
  recordCall(duration?: number) {
    const totalCalls = this.metricsCache.get('totalCalls') || 0
    this.metricsCache.set('totalCalls', totalCalls + 1)

    if (duration) {
      const durations = this.metricsCache.get('callDurations') || []
      durations.push(duration)
      
      // Keep only last 100 durations
      if (durations.length > 100) {
        durations.shift()
      }
      
      this.metricsCache.set('callDurations', durations)
    }
  }

  /**
   * Record failed WebRTC connection
   */
  recordFailedConnection() {
    const failed = this.metricsCache.get('failedConnections') || 0
    this.metricsCache.set('failedConnections', failed + 1)
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageResponseTime: number
    slowestOperations: Array<{ name: string; duration: number }>
    errorRate: number
  } {
    const performanceMetrics = this.metricsCache.get('performance') || []
    
    const averageResponseTime = performanceMetrics.length > 0
      ? performanceMetrics.reduce((sum: number, m: any) => sum + m.duration, 0) / performanceMetrics.length
      : 0

    const slowestOperations = [...performanceMetrics]
      .sort((a: any, b: any) => b.duration - a.duration)
      .slice(0, 5)
      .map((m: any) => ({ name: m.name, duration: m.duration }))

    const totalOperations = performanceMetrics.length
    const errors = this.errorLog.length
    const errorRate = totalOperations > 0 ? (errors / totalOperations) * 100 : 0

    return {
      averageResponseTime: Math.round(averageResponseTime),
      slowestOperations,
      errorRate: Math.round(errorRate * 100) / 100
    }
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metricsCache.clear()
    this.errorLog = []
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }
  }
}