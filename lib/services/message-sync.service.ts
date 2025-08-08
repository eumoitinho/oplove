/**
 * Message Synchronization Service
 * Handles message ordering, conflict resolution, and offline sync
 */

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

interface PendingMessage {
  id: string
  tempId: string
  conversationId: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'file'
  mediaUrl?: string
  createdAt: string
  status: 'pending' | 'sending' | 'sent' | 'failed'
  retryCount: number
  error?: string
}

interface MessageSequence {
  conversationId: string
  lastSequenceNumber: number
  lastSyncedAt: string
}

export class MessageSyncService {
  private supabase = createClient()
  private pendingMessages: Map<string, PendingMessage> = new Map()
  private messageSequences: Map<string, MessageSequence> = new Map()
  private syncQueue: PendingMessage[] = []
  private isSyncing = false
  private syncInterval?: NodeJS.Timeout
  private offlineQueue: PendingMessage[] = []

  constructor() {
    this.initializeSync()
    this.setupOfflineDetection()
  }

  /**
   * Initialize sync mechanism
   */
  private initializeSync() {
    // Start sync interval
    this.syncInterval = setInterval(() => {
      this.processSyncQueue()
    }, 5000) // Sync every 5 seconds

    // Load offline queue from localStorage
    this.loadOfflineQueue()
  }

  /**
   * Setup offline detection
   */
  private setupOfflineDetection() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Connection restored, syncing messages...')
        this.syncOfflineMessages()
      })

      window.addEventListener('offline', () => {
        console.log('Connection lost, queuing messages...')
      })
    }
  }

  /**
   * Add message to send queue with optimistic update
   */
  async queueMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text',
    mediaUrl?: string
  ): Promise<PendingMessage> {
    const tempId = `temp_${Date.now()}_${Math.random()}`
    
    const pendingMessage: PendingMessage = {
      id: '',
      tempId,
      conversationId,
      content,
      type,
      mediaUrl,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    }

    // Add to pending messages
    this.pendingMessages.set(tempId, pendingMessage)
    
    // Add to appropriate queue
    if (navigator.onLine) {
      this.syncQueue.push(pendingMessage)
      this.processSyncQueue()
    } else {
      this.offlineQueue.push(pendingMessage)
      this.saveOfflineQueue()
    }

    return pendingMessage
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) return
    
    this.isSyncing = true

    try {
      while (this.syncQueue.length > 0) {
        const message = this.syncQueue.shift()!
        await this.sendMessage(message)
      }
    } catch (error) {
      console.error('Error processing sync queue:', error)
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Send a single message
   */
  private async sendMessage(message: PendingMessage): Promise<void> {
    try {
      message.status = 'sending'
      
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: message.conversationId,
          content: message.content,
          message_type: message.type,
          media_url: message.mediaUrl,
          sender_id: (await this.supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (error) throw error

      // Update message status
      message.id = data.id
      message.status = 'sent'
      
      // Remove from pending
      this.pendingMessages.delete(message.tempId)
      
      // Update sequence number
      this.updateSequenceNumber(message.conversationId)
      
    } catch (error: any) {
      console.error('Failed to send message:', error)
      message.status = 'failed'
      message.error = error.message
      message.retryCount++

      // Retry logic
      if (message.retryCount < 3) {
        // Exponential backoff
        setTimeout(() => {
          message.status = 'pending'
          this.syncQueue.push(message)
        }, Math.pow(2, message.retryCount) * 1000)
      } else {
        // Move to failed queue after max retries
        this.handleFailedMessage(message)
      }
    }
  }

  /**
   * Sync offline messages when connection restored
   */
  private async syncOfflineMessages() {
    if (this.offlineQueue.length === 0) return

    console.log(`Syncing ${this.offlineQueue.length} offline messages...`)
    
    // Move offline queue to sync queue
    this.syncQueue.push(...this.offlineQueue)
    this.offlineQueue = []
    this.saveOfflineQueue()
    
    // Process sync queue
    await this.processSyncQueue()
  }

  /**
   * Handle failed message
   */
  private handleFailedMessage(message: PendingMessage) {
    console.error('Message failed after max retries:', message)
    
    // Notify user about failed message
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('message-failed', {
        detail: message
      }))
    }
  }

  /**
   * Update sequence number for conversation
   */
  private updateSequenceNumber(conversationId: string) {
    const sequence = this.messageSequences.get(conversationId) || {
      conversationId,
      lastSequenceNumber: 0,
      lastSyncedAt: new Date().toISOString()
    }
    
    sequence.lastSequenceNumber++
    sequence.lastSyncedAt = new Date().toISOString()
    
    this.messageSequences.set(conversationId, sequence)
  }

  /**
   * Resolve message ordering conflicts
   */
  async resolveMessageOrder(
    conversationId: string,
    messages: Message[]
  ): Promise<Message[]> {
    // Sort by created_at and apply sequence numbers
    const sorted = messages.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime()
      const timeB = new Date(b.created_at).getTime()
      
      // If timestamps are within 1 second, use ID as tiebreaker
      if (Math.abs(timeA - timeB) < 1000) {
        return a.id.localeCompare(b.id)
      }
      
      return timeA - timeB
    })

    // Detect and mark duplicates
    const seen = new Set<string>()
    const uniqueMessages: Message[] = []
    
    for (const msg of sorted) {
      const key = `${msg.sender_id}_${msg.content}_${Math.floor(new Date(msg.created_at).getTime() / 1000)}`
      
      if (!seen.has(key)) {
        seen.add(key)
        uniqueMessages.push(msg)
      }
    }

    return uniqueMessages
  }

  /**
   * Sync messages with server (pull latest)
   */
  async syncConversation(
    conversationId: string,
    lastSyncedAt?: string
  ): Promise<Message[]> {
    try {
      let query = this.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (lastSyncedAt) {
        query = query.gt('created_at', lastSyncedAt)
      }

      const { data, error } = await query

      if (error) throw error

      // Resolve any ordering conflicts
      const resolved = await this.resolveMessageOrder(conversationId, data || [])
      
      // Update last synced timestamp
      if (resolved.length > 0) {
        const sequence = this.messageSequences.get(conversationId) || {
          conversationId,
          lastSequenceNumber: 0,
          lastSyncedAt: new Date().toISOString()
        }
        
        sequence.lastSyncedAt = resolved[resolved.length - 1].created_at
        this.messageSequences.set(conversationId, sequence)
      }

      return resolved
    } catch (error) {
      console.error('Error syncing conversation:', error)
      throw error
    }
  }

  /**
   * Load offline queue from localStorage
   */
  private loadOfflineQueue() {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('openlove_offline_messages')
      if (stored) {
        this.offlineQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading offline queue:', error)
    }
  }

  /**
   * Save offline queue to localStorage
   */
  private saveOfflineQueue() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('openlove_offline_messages', JSON.stringify(this.offlineQueue))
    } catch (error) {
      console.error('Error saving offline queue:', error)
    }
  }

  /**
   * Get pending messages for a conversation
   */
  getPendingMessages(conversationId: string): PendingMessage[] {
    return Array.from(this.pendingMessages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  /**
   * Retry failed message
   */
  retryMessage(tempId: string) {
    const message = this.pendingMessages.get(tempId)
    if (message && message.status === 'failed') {
      message.status = 'pending'
      message.retryCount = 0
      this.syncQueue.push(message)
      this.processSyncQueue()
    }
  }

  /**
   * Cancel pending message
   */
  cancelMessage(tempId: string) {
    this.pendingMessages.delete(tempId)
    this.syncQueue = this.syncQueue.filter(msg => msg.tempId !== tempId)
    this.offlineQueue = this.offlineQueue.filter(msg => msg.tempId !== tempId)
    this.saveOfflineQueue()
  }

  /**
   * Clear all pending messages for a conversation
   */
  clearPendingMessages(conversationId: string) {
    const toRemove: string[] = []
    
    this.pendingMessages.forEach((msg, tempId) => {
      if (msg.conversationId === conversationId) {
        toRemove.push(tempId)
      }
    })
    
    toRemove.forEach(tempId => this.pendingMessages.delete(tempId))
    
    this.syncQueue = this.syncQueue.filter(msg => msg.conversationId !== conversationId)
    this.offlineQueue = this.offlineQueue.filter(msg => msg.conversationId !== conversationId)
    this.saveOfflineQueue()
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    pending: number
    offline: number
    failed: number
    syncing: boolean
  } {
    const failed = Array.from(this.pendingMessages.values())
      .filter(msg => msg.status === 'failed').length

    return {
      pending: this.syncQueue.length,
      offline: this.offlineQueue.length,
      failed,
      syncing: this.isSyncing
    }
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    this.saveOfflineQueue()
  }
}