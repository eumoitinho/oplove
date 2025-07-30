import { CacheService } from './redis'

export interface CacheMetrics {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
  totalRequests: number
  hitRate: number
  avgResponseTime: number
  lastReset: number
}

export interface CacheOperation {
  key: string
  operation: 'get' | 'set' | 'delete'
  hit: boolean
  responseTime: number
  timestamp: number
  size?: number
  error?: string
}

export interface CacheKeyMetrics {
  key: string
  hits: number
  misses: number
  sets: number
  totalSize: number
  avgResponseTime: number
  lastAccessed: number
  popularity: number
}

export interface CacheAnalytics {
  overall: CacheMetrics
  keyMetrics: Map<string, CacheKeyMetrics>
  recentOperations: CacheOperation[]
  trends: {
    hourly: number[]
    daily: number[]
  }
}

/**
 * Cache analytics and metrics tracking service
 */
class CacheAnalyticsService {
  private static instance: CacheAnalyticsService
  
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    totalRequests: 0,
    hitRate: 0,
    avgResponseTime: 0,
    lastReset: Date.now()
  }

  private keyMetrics = new Map<string, CacheKeyMetrics>()
  private recentOperations: CacheOperation[] = []
  private responseTimes: number[] = []
  private hourlyStats: number[] = new Array(24).fill(0)
  private dailyStats: number[] = new Array(7).fill(0)

  private readonly MAX_RECENT_OPERATIONS = 1000
  private readonly MAX_KEY_METRICS = 500

  static getInstance(): CacheAnalyticsService {
    if (!CacheAnalyticsService.instance) {
      CacheAnalyticsService.instance = new CacheAnalyticsService()
    }
    return CacheAnalyticsService.instance
  }

  /**
   * Record cache operation
   */
  recordOperation(operation: CacheOperation): void {
    const { key, operation: op, hit, responseTime, size, error } = operation

    // Update overall metrics
    this.metrics.totalRequests++
    
    if (error) {
      this.metrics.errors++
    } else {
      switch (op) {
        case 'get':
          if (hit) {
            this.metrics.hits++
          } else {
            this.metrics.misses++
          }
          break
        case 'set':
          this.metrics.sets++
          break
        case 'delete':
          this.metrics.deletes++
          break
      }
    }

    // Update response times
    this.responseTimes.push(responseTime)
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-500) // Keep last 500
    }

    // Calculate hit rate and avg response time
    this.metrics.hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0
    this.metrics.avgResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length || 0

    // Update key-specific metrics
    this.updateKeyMetrics(key, operation)

    // Add to recent operations
    this.recentOperations.push(operation)
    if (this.recentOperations.length > this.MAX_RECENT_OPERATIONS) {
      this.recentOperations = this.recentOperations.slice(-500) // Keep last 500
    }

    // Update hourly/daily trends
    this.updateTrends()

    // Log performance issues
    if (responseTime > 1000) { // Slow operation (>1s)
      console.warn(`🐌 Slow cache operation: ${op} ${key} (${responseTime}ms)`)
    }

    if (this.metrics.hitRate < 0.7 && this.metrics.totalRequests > 100) {
      console.warn(`📉 Low cache hit rate: ${(this.metrics.hitRate * 100).toFixed(1)}%`)
    }
  }

  /**
   * Update key-specific metrics
   */
  private updateKeyMetrics(key: string, operation: CacheOperation): void {
    if (!this.keyMetrics.has(key)) {
      this.keyMetrics.set(key, {
        key,
        hits: 0,
        misses: 0,
        sets: 0,
        totalSize: 0,
        avgResponseTime: 0,
        lastAccessed: 0,
        popularity: 0
      })
    }

    const keyMetric = this.keyMetrics.get(key)!
    
    switch (operation.operation) {
      case 'get':
        if (operation.hit) {
          keyMetric.hits++
        } else {
          keyMetric.misses++
        }
        break
      case 'set':
        keyMetric.sets++
        if (operation.size) {
          keyMetric.totalSize += operation.size
        }
        break
    }

    keyMetric.lastAccessed = operation.timestamp
    keyMetric.avgResponseTime = (keyMetric.avgResponseTime + operation.responseTime) / 2
    keyMetric.popularity = keyMetric.hits + keyMetric.sets

    // Clean up old metrics if we have too many
    if (this.keyMetrics.size > this.MAX_KEY_METRICS) {
      this.cleanupOldKeyMetrics()
    }
  }

  /**
   * Update hourly and daily trends
   */
  private updateTrends(): void {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()

    this.hourlyStats[hour]++
    this.dailyStats[day]++
  }

  /**
   * Clean up old key metrics
   */
  private cleanupOldKeyMetrics(): void {
    const sortedKeys = Array.from(this.keyMetrics.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      .slice(0, Math.floor(this.MAX_KEY_METRICS * 0.1)) // Remove oldest 10%

    for (const [key] of sortedKeys) {
      this.keyMetrics.delete(key)
    }

    console.log(`🧹 Cleaned up ${sortedKeys.length} old key metrics`)
  }

  /**
   * Get current analytics
   */
  getAnalytics(): CacheAnalytics {
    return {
      overall: { ...this.metrics },
      keyMetrics: new Map(this.keyMetrics),
      recentOperations: [...this.recentOperations],
      trends: {
        hourly: [...this.hourlyStats],
        daily: [...this.dailyStats]
      }
    }
  }

  /**
   * Get top performing keys
   */
  getTopKeys(limit = 10): CacheKeyMetrics[] {
    return Array.from(this.keyMetrics.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)
  }

  /**
   * Get slow operations
   */
  getSlowOperations(threshold = 500): CacheOperation[] {
    return this.recentOperations
      .filter(op => op.responseTime > threshold)
      .sort((a, b) => b.responseTime - a.responseTime)
  }

  /**
   * Get error operations
   */
  getErrorOperations(): CacheOperation[] {
    return this.recentOperations
      .filter(op => op.error)
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get cache health score (0-100)
   */
  getCacheHealthScore(): number {
    let score = 100

    // Hit rate component (0-40 points)
    score -= (1 - this.metrics.hitRate) * 40

    // Response time component (0-30 points)
    const avgResponseTime = this.metrics.avgResponseTime
    if (avgResponseTime > 100) {
      score -= Math.min(30, (avgResponseTime - 100) / 20)
    }

    // Error rate component (0-30 points)
    const errorRate = this.metrics.errors / this.metrics.totalRequests
    score -= errorRate * 30

    return Math.max(0, Math.round(score))
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.metrics.hitRate < 0.7) {
      recommendations.push('Consider increasing cache TTL or improving cache key strategies')
    }

    if (this.metrics.avgResponseTime > 500) {
      recommendations.push('High response times detected - consider cache warming or compression')
    }

    const errorRate = this.metrics.errors / this.metrics.totalRequests
    if (errorRate > 0.05) {
      recommendations.push('High error rate detected - check Redis connection and configuration')
    }

    const topKeys = this.getTopKeys(5)
    const hotKeys = topKeys.filter(k => k.popularity > this.metrics.totalRequests * 0.1)
    if (hotKeys.length > 0) {
      recommendations.push(`Hot keys detected: ${hotKeys.map(k => k.key).join(', ')} - consider partitioning`)
    }

    const slowOps = this.getSlowOperations(1000)
    if (slowOps.length > 10) {
      recommendations.push('Multiple slow operations detected - review key sizes and compression')
    }

    return recommendations
  }

  /**
   * Export analytics data
   */
  exportData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.getAnalytics(),
      health: this.getCacheHealthScore(),
      recommendations: this.getRecommendations(),
      topKeys: this.getTopKeys(20),
      slowOperations: this.getSlowOperations(100)
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalRequests: 0,
      hitRate: 0,
      avgResponseTime: 0,
      lastReset: Date.now()
    }

    this.keyMetrics.clear()
    this.recentOperations.length = 0
    this.responseTimes.length = 0
    this.hourlyStats.fill(0)
    this.dailyStats.fill(0)

    console.log('📊 Cache analytics reset')
  }

  /**
   * Start periodic reporting
   */
  startPeriodicReporting(intervalMs = 300000): void { // 5 minutes
    setInterval(() => {
      const health = this.getCacheHealthScore()
      const analytics = this.getAnalytics()
      
      console.log(`📊 Cache Health Report:
        Health Score: ${health}/100
        Hit Rate: ${(analytics.overall.hitRate * 100).toFixed(1)}%
        Avg Response: ${analytics.overall.avgResponseTime.toFixed(1)}ms
        Total Requests: ${analytics.overall.totalRequests}
        Top Key: ${this.getTopKeys(1)[0]?.key || 'N/A'}
      `)

      // Alert on poor performance
      if (health < 70) {
        console.warn(`🚨 Poor cache performance detected! Health: ${health}/100`)
        const recommendations = this.getRecommendations()
        recommendations.forEach(rec => console.warn(`💡 ${rec}`))
      }
    }, intervalMs)
  }

  /**
   * Get real-time stats for monitoring
   */
  getRealTimeStats(): {
    health: number
    hitRate: number
    avgResponseTime: number
    requestsPerMinute: number
    activeKeys: number
  } {
    const recentOps = this.recentOperations.filter(
      op => Date.now() - op.timestamp < 60000 // Last minute
    )

    return {
      health: this.getCacheHealthScore(),
      hitRate: this.metrics.hitRate,
      avgResponseTime: this.metrics.avgResponseTime,
      requestsPerMinute: recentOps.length,
      activeKeys: this.keyMetrics.size
    }
  }
}

export const cacheAnalyticsService = CacheAnalyticsService.getInstance()

// Helper function to track cache operations
export const trackCacheOperation = (operation: CacheOperation) => 
  cacheAnalyticsService.recordOperation(operation)