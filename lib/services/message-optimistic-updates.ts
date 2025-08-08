import { Message } from './messages-service'
import { unifiedRealtimeManager } from './unified-realtime-manager'

export interface OptimisticMessage extends Message {
  isOptimistic?: boolean
  isFailed?: boolean
  retryCount?: number
}

export interface MessageUpdate {
  type: 'add' | 'update' | 'delete' | 'retry' | 'confirm'
  message: OptimisticMessage
  conversationId: string
  tempId?: string
}

/**
 * Optimistic Message Updates Service
 * 
 * Provides instant UI updates for messages while handling real-time synchronization,
 * conflict resolution, and error recovery.
 */
class OptimisticMessageService {
  private optimisticMessages: Map<string, OptimisticMessage> = new Map()
  private pendingMessages: Map<string, OptimisticMessage> = new Map()
  private retryQueue: Map<string, OptimisticMessage> = new Map()
  private maxRetries = 3
  private retryDelay = 1000
  
  constructor() {
    this.setupRealtimeSync()
    this.startRetryProcessor()
  }
  
  /**
   * Add optimistic message (for immediate UI feedback)
   */
  addOptimisticMessage(
    conversationId: string,
    content: string,
    senderId: string,
    type: Message['type'] = 'text'
  ): OptimisticMessage {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const optimisticMessage: OptimisticMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      type,
      media_url: undefined,
      media_metadata: undefined,
      is_read: false,
      is_edited: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isOptimistic: true,
      retryCount: 0
    }
    
    // Store optimistic message
    this.optimisticMessages.set(tempId, optimisticMessage)
    this.pendingMessages.set(tempId, optimisticMessage)
    
    // Emit update for UI
    this.emitMessageUpdate({
      type: 'add',
      message: optimisticMessage,
      conversationId,
      tempId
    })
    
    return optimisticMessage
  }
  
  /**
   * Confirm optimistic message (when server responds)
   */
  confirmOptimisticMessage(tempId: string, serverMessage: Message) {
    const optimisticMessage = this.pendingMessages.get(tempId)
    if (!optimisticMessage) return
    
    // Update with server data
    const confirmedMessage: OptimisticMessage = {
      ...serverMessage,
      isOptimistic: false
    }
    
    // Remove from pending and optimistic
    this.pendingMessages.delete(tempId)
    this.optimisticMessages.delete(tempId)
    
    // Emit confirmation update
    this.emitMessageUpdate({
      type: 'confirm',
      message: confirmedMessage,
      conversationId: serverMessage.conversation_id,
      tempId
    })
  }
  
  /**
   * Handle optimistic message failure
   */
  handleOptimisticFailure(tempId: string, error: string) {
    const optimisticMessage = this.pendingMessages.get(tempId)
    if (!optimisticMessage) return
    
    optimisticMessage.isFailed = true
    optimisticMessage.retryCount = (optimisticMessage.retryCount || 0) + 1
    
    // Add to retry queue if under max retries
    if (optimisticMessage.retryCount <= this.maxRetries) {
      this.retryQueue.set(tempId, optimisticMessage)
      
      // Schedule retry
      setTimeout(() => {
        this.retryOptimisticMessage(tempId)
      }, this.retryDelay * Math.pow(2, optimisticMessage.retryCount - 1))
    } else {
      // Max retries exceeded - mark as permanently failed
      optimisticMessage.isFailed = true
      
      this.emitMessageUpdate({
        type: 'update',
        message: optimisticMessage,
        conversationId: optimisticMessage.conversation_id,
        tempId
      })
    }
  }
  
  /**
   * Retry failed optimistic message
   */
  private async retryOptimisticMessage(tempId: string) {
    const message = this.retryQueue.get(tempId)
    if (!message) return
    
    try {
      // Clear failed state
      message.isFailed = false
      
      // Emit retry update
      this.emitMessageUpdate({
        type: 'retry',
        message,
        conversationId: message.conversation_id,
        tempId
      })
      
      // Here you would call your actual send message API
      // This is handled by the component using this service
      
    } catch (error) {
      console.error('Retry failed:', error)
      this.handleOptimisticFailure(tempId, error.message)
    }
    
    this.retryQueue.delete(tempId)
  }
  
  /**
   * Handle incoming real-time message
   */
  handleRealtimeMessage(message: Message) {
    // Check if this is a confirmation of an optimistic message
    const tempId = this.findMatchingOptimistic(message)
    
    if (tempId) {
      this.confirmOptimisticMessage(tempId, message)
    } else {
      // New message from someone else
      this.emitMessageUpdate({
        type: 'add',
        message,
        conversationId: message.conversation_id
      })
    }
  }
  
  /**
   * Handle message updates (edits, deletes)
   */
  handleRealtimeMessageUpdate(message: Message) {
    this.emitMessageUpdate({
      type: 'update',
      message,
      conversationId: message.conversation_id
    })
  }
  
  /**
   * Find matching optimistic message for server confirmation
   */
  private findMatchingOptimistic(serverMessage: Message): string | null {
    // Look for pending message with same content and timestamp close to server message
    for (const [tempId, optimisticMessage] of this.pendingMessages) {
      if (
        optimisticMessage.sender_id === serverMessage.sender_id &&
        optimisticMessage.content === serverMessage.content &&
        optimisticMessage.type === serverMessage.type &&
        Math.abs(
          new Date(optimisticMessage.created_at).getTime() - 
          new Date(serverMessage.created_at).getTime()
        ) < 5000 // Within 5 seconds
      ) {
        return tempId
      }
    }
    
    return null
  }
  
  /**
   * Get optimistic messages for conversation
   */
  getOptimisticMessages(conversationId: string): OptimisticMessage[] {
    return Array.from(this.optimisticMessages.values())
      .filter(msg => msg.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }
  
  /**
   * Get pending messages count
   */
  getPendingCount(conversationId?: string): number {
    if (!conversationId) {
      return this.pendingMessages.size
    }
    
    return Array.from(this.pendingMessages.values())
      .filter(msg => msg.conversation_id === conversationId).length
  }
  
  /**
   * Clear optimistic messages for conversation
   */
  clearOptimisticMessages(conversationId: string) {
    for (const [tempId, message] of this.optimisticMessages) {
      if (message.conversation_id === conversationId) {
        this.optimisticMessages.delete(tempId)
        this.pendingMessages.delete(tempId)
        this.retryQueue.delete(tempId)
      }
    }
  }
  
  /**
   * Setup real-time sync
   */
  private setupRealtimeSync() {
    // This would be called by the components using this service
    // to setup real-time subscriptions
  }
  
  /**
   * Emit message update to subscribers
   */
  private emitMessageUpdate(update: MessageUpdate) {
    // Use custom event system or state management
    window.dispatchEvent(new CustomEvent('messageUpdate', { detail: update }))
  }
  
  /**
   * Start retry processor
   */
  private startRetryProcessor() {
    // Process retry queue periodically
    setInterval(() => {
      for (const [tempId, message] of this.retryQueue) {
        if (!message.isFailed && message.retryCount && message.retryCount > 0) {
          this.retryOptimisticMessage(tempId)
        }
      }
    }, 5000) // Check every 5 seconds
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      totalOptimistic: this.optimisticMessages.size,
      pending: this.pendingMessages.size,
      retrying: this.retryQueue.size,
      failed: Array.from(this.optimisticMessages.values()).filter(m => m.isFailed).length
    }
  }
}

// Export singleton
export const optimisticMessageService = new OptimisticMessageService()

// Export class
export { OptimisticMessageService }