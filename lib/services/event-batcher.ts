interface BatchConfig {
  maxBatchSize?: number
  maxWaitTime?: number // milliseconds
  onFlush?: (events: any[]) => void
}

interface EventBatch {
  events: any[]
  timer: NodeJS.Timeout | null
  lastEventTime: number
}

export class EventBatcher {
  private batches: Map<string, EventBatch> = new Map()
  private config: Required<BatchConfig>
  
  constructor(config: BatchConfig = {}) {
    this.config = {
      maxBatchSize: config.maxBatchSize || 50,
      maxWaitTime: config.maxWaitTime || 100, // 100ms default
      onFlush: config.onFlush || (() => {})
    }
  }
  
  /**
   * Add an event to the batch
   */
  add(batchKey: string, event: any) {
    let batch = this.batches.get(batchKey)
    
    if (!batch) {
      batch = {
        events: [],
        timer: null,
        lastEventTime: Date.now()
      }
      this.batches.set(batchKey, batch)
    }
    
    // Add event to batch
    batch.events.push(event)
    batch.lastEventTime = Date.now()
    
    // Check if we should flush immediately
    if (batch.events.length >= this.config.maxBatchSize) {
      this.flush(batchKey)
      return
    }
    
    // Setup timer if not already set
    if (!batch.timer) {
      batch.timer = setTimeout(() => {
        this.flush(batchKey)
      }, this.config.maxWaitTime)
    }
  }
  
  /**
   * Flush a specific batch
   */
  flush(batchKey: string) {
    const batch = this.batches.get(batchKey)
    if (!batch || batch.events.length === 0) return
    
    // Clear timer
    if (batch.timer) {
      clearTimeout(batch.timer)
      batch.timer = null
    }
    
    // Process events
    const events = [...batch.events]
    batch.events = []
    
    // Aggregate events by type
    const aggregated = this.aggregateEvents(events)
    
    // Call flush handler
    this.config.onFlush(aggregated)
    
    // Remove batch if empty
    if (batch.events.length === 0) {
      this.batches.delete(batchKey)
    }
  }
  
  /**
   * Flush all batches
   */
  flushAll() {
    for (const [key] of this.batches) {
      this.flush(key)
    }
  }
  
  /**
   * Aggregate events by type and entity
   */
  private aggregateEvents(events: any[]): any[] {
    const aggregated = new Map<string, any>()
    
    for (const event of events) {
      const key = `${event.type}:${event.entityId}`
      
      if (!aggregated.has(key)) {
        aggregated.set(key, {
          type: event.type,
          entityId: event.entityId,
          count: 0,
          firstTimestamp: event.timestamp,
          lastTimestamp: event.timestamp,
          data: event.data,
          changes: []
        })
      }
      
      const agg = aggregated.get(key)!
      agg.count++
      agg.lastTimestamp = event.timestamp
      
      // Merge changes
      if (event.changes) {
        agg.changes.push(...event.changes)
      }
      
      // Merge data (latest wins)
      if (event.data) {
        agg.data = { ...agg.data, ...event.data }
      }
    }
    
    return Array.from(aggregated.values())
  }
  
  /**
   * Get batch statistics
   */
  getStats() {
    const stats = {
      totalBatches: this.batches.size,
      totalEvents: 0,
      oldestBatch: null as string | null,
      largestBatch: null as string | null,
      largestBatchSize: 0
    }
    
    let oldestTime = Date.now()
    
    for (const [key, batch] of this.batches) {
      stats.totalEvents += batch.events.length
      
      if (batch.lastEventTime < oldestTime) {
        oldestTime = batch.lastEventTime
        stats.oldestBatch = key
      }
      
      if (batch.events.length > stats.largestBatchSize) {
        stats.largestBatchSize = batch.events.length
        stats.largestBatch = key
      }
    }
    
    return stats
  }
  
  /**
   * Clear all batches
   */
  clear() {
    // Clear all timers
    for (const [_, batch] of this.batches) {
      if (batch.timer) {
        clearTimeout(batch.timer)
      }
    }
    
    this.batches.clear()
  }
}

/**
 * Specialized batcher for realtime events
 */
export class RealtimeEventBatcher extends EventBatcher {
  constructor() {
    super({
      maxBatchSize: 20,
      maxWaitTime: 50, // 50ms for realtime
      onFlush: (events) => {
        // Process batched realtime events
        this.processBatchedEvents(events)
      }
    })
  }
  
  /**
   * Add a realtime event
   */
  addRealtimeEvent(eventType: string, entityId: string, data: any) {
    const event = {
      type: eventType,
      entityId,
      data,
      timestamp: Date.now()
    }
    
    // Use entity as batch key for better aggregation
    const batchKey = `${eventType}:${entityId}`
    this.add(batchKey, event)
  }
  
  /**
   * Process batched events
   */
  private processBatchedEvents(events: any[]) {
    // Group by event type
    const grouped = new Map<string, any[]>()
    
    for (const event of events) {
      if (!grouped.has(event.type)) {
        grouped.set(event.type, [])
      }
      grouped.get(event.type)!.push(event)
    }
    
    // Process each type
    for (const [type, typeEvents] of grouped) {
      switch (type) {
        case 'post_like':
          this.processLikeBatch(typeEvents)
          break
        case 'story_view':
          this.processViewBatch(typeEvents)
          break
        case 'comment':
          this.processCommentBatch(typeEvents)
          break
        default:
          console.log(`[EventBatcher] Unknown event type: ${type}`)
      }
    }
  }
  
  private processLikeBatch(events: any[]) {
    // Aggregate likes by post
    const postLikes = new Map<string, number>()
    
    for (const event of events) {
      const current = postLikes.get(event.entityId) || 0
      postLikes.set(event.entityId, current + event.count)
    }
    
    // Emit aggregated updates
    for (const [postId, count] of postLikes) {
      console.log(`[EventBatcher] Post ${postId} received ${count} likes`)
      // Emit to UI or update cache
    }
  }
  
  private processViewBatch(events: any[]) {
    // Similar aggregation for story views
    const storyViews = new Map<string, number>()
    
    for (const event of events) {
      const current = storyViews.get(event.entityId) || 0
      storyViews.set(event.entityId, current + event.count)
    }
    
    // Emit aggregated updates
    for (const [storyId, count] of storyViews) {
      console.log(`[EventBatcher] Story ${storyId} received ${count} views`)
    }
  }
  
  private processCommentBatch(events: any[]) {
    // Process comment batches
    const postComments = new Map<string, number>()
    
    for (const event of events) {
      const current = postComments.get(event.entityId) || 0
      postComments.set(event.entityId, current + event.count)
    }
    
    // Emit aggregated updates
    for (const [postId, count] of postComments) {
      console.log(`[EventBatcher] Post ${postId} received ${count} comments`)
    }
  }
}

// Export singleton instance
export const realtimeBatcher = new RealtimeEventBatcher()