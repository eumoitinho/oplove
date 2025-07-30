import { NextRequest, NextResponse } from 'next/server'
import { CacheService } from '@/lib/cache/redis'
import { cacheAnalyticsService } from '@/lib/cache/cache-analytics'
import { cacheCompressionService } from '@/lib/cache/cache-compression'
import { cachePrewarmingService } from '@/lib/cache/cache-prewarming'
import { cacheInvalidationService } from '@/lib/cache/cache-invalidation'
import { swrService } from '@/lib/cache/stale-while-revalidate'
import { cacheFallbackService } from '@/lib/cache/cache-fallback'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    switch (action) {
      case 'health':
        return NextResponse.json({
          health: cacheAnalyticsService.getCacheHealthScore(),
          recommendations: cacheAnalyticsService.getRecommendations(),
          stats: await CacheService.getStats(),
          realTime: cacheAnalyticsService.getRealTimeStats()
        })

      case 'analytics':
        return NextResponse.json({
          analytics: cacheAnalyticsService.getAnalytics(),
          topKeys: cacheAnalyticsService.getTopKeys(20),
          slowOperations: cacheAnalyticsService.getSlowOperations(500),
          errorOperations: cacheAnalyticsService.getErrorOperations()
        })

      case 'compression-stats':
        return NextResponse.json({
          compressionStats: cacheCompressionService.getCompressionStats()
        })

      case 'prewarming-status':
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }
        return NextResponse.json({
          jobStatus: cachePrewarmingService.getJobStatus(userId),
          queueStatus: cachePrewarmingService.getQueueStatus(),
          activeJobs: cachePrewarmingService.getActiveJobs()
        })

      case 'circuit-breakers':
        return NextResponse.json({
          circuitBreakers: Object.fromEntries(cacheFallbackService.getCircuitBreakerStats())
        })

      case 'swr-status':
        return NextResponse.json({
          revalidation: swrService.getRevalidationStatus()
        })

      case 'export':
        const exportData = cacheAnalyticsService.exportData()
        return new NextResponse(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="cache-analytics-${Date.now()}.json"`
          }
        })

      default:
        return NextResponse.json({
          message: 'Cache Management API',
          availableActions: [
            'health',
            'analytics', 
            'compression-stats',
            'prewarming-status',
            'circuit-breakers',
            'swr-status',
            'export'
          ]
        })
    }
  } catch (error) {
    console.error('Cache management API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    switch (action) {
      case 'invalidate':
        const { event, userId, postId, targetUserId, data } = body
        await cacheInvalidationService.invalidate({
          event,
          userId,
          postId,
          targetUserId,
          data
        })
        return NextResponse.json({ success: true, message: 'Cache invalidated' })

      case 'prewarm-user':
        const { userId: prewarmUserId } = body
        if (!prewarmUserId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }
        const jobId = await cachePrewarmingService.prewarmNewUser(prewarmUserId)
        return NextResponse.json({ success: true, jobId })

      case 'prewarm-batch':
        const { userIds } = body
        if (!Array.isArray(userIds)) {
          return NextResponse.json({ error: 'userIds array required' }, { status: 400 })
        }
        const jobIds = await cachePrewarmingService.prewarmBatch(userIds)
        return NextResponse.json({ success: true, jobIds })

      case 'prewarm-premium':
        await cachePrewarmingService.prewarmPremiumUsers()
        return NextResponse.json({ success: true, message: 'Premium users prewarming started' })

      case 'mutate-swr':
        const { key, data: swrData, revalidate = true } = body
        if (!key) {
          return NextResponse.json({ error: 'key required' }, { status: 400 })
        }
        await swrService.mutate(key, swrData, revalidate)
        return NextResponse.json({ success: true, message: 'SWR cache mutated' })

      case 'preload-swr':
        const { key: preloadKey, config } = body
        if (!preloadKey || !body.fetcher) {
          return NextResponse.json({ error: 'key and fetcher required' }, { status: 400 })
        }
        // Note: Can't serialize functions, so this would need a different approach
        return NextResponse.json({ error: 'Preload requires function serialization' }, { status: 400 })

      case 'reset-circuit-breaker':
        const { key: breakerKey } = body
        if (!breakerKey) {
          return NextResponse.json({ error: 'key required' }, { status: 400 })
        }
        cacheFallbackService.resetCircuitBreaker(breakerKey)
        return NextResponse.json({ success: true, message: 'Circuit breaker reset' })

      case 'reset-all-circuit-breakers':
        cacheFallbackService.resetAllCircuitBreakers()
        return NextResponse.json({ success: true, message: 'All circuit breakers reset' })

      case 'bulk-invalidate':
        const { userIds: bulkUserIds, events } = body
        if (!Array.isArray(bulkUserIds) || !Array.isArray(events)) {
          return NextResponse.json({ error: 'userIds and events arrays required' }, { status: 400 })
        }
        await cacheInvalidationService.bulkInvalidate(bulkUserIds, events)
        return NextResponse.json({ success: true, message: 'Bulk invalidation completed' })

      case 'emergency-clear':
        await cacheInvalidationService.emergencyClear()
        return NextResponse.json({ success: true, message: 'Emergency cache clear completed' })

      case 'compress-existing':
        const { keys } = body
        if (!Array.isArray(keys)) {
          return NextResponse.json({ error: 'keys array required' }, { status: 400 })
        }
        const compressionResult = await cacheCompressionService.compressExistingKeys(keys)
        return NextResponse.json({ success: true, result: compressionResult })

      case 'update-compression-config':
        const { config: compressionConfig } = body
        cacheCompressionService.updateConfig(compressionConfig)
        return NextResponse.json({ success: true, message: 'Compression config updated' })

      case 'update-prewarming-config':
        const { config: prewarmingConfig } = body
        cachePrewarmingService.updateConfig(prewarmingConfig)
        return NextResponse.json({ success: true, message: 'Prewarming config updated' })

      case 'cancel-prewarming-job':
        const { userId: cancelUserId } = body
        if (!cancelUserId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }
        const cancelled = cachePrewarmingService.cancelJob(cancelUserId)
        return NextResponse.json({ 
          success: cancelled, 
          message: cancelled ? 'Job cancelled' : 'Job not found or not cancellable' 
        })

      case 'reset-analytics':
        cacheAnalyticsService.reset()
        return NextResponse.json({ success: true, message: 'Analytics reset' })

      case 'reset-compression-stats':
        cacheCompressionService.resetStats()
        return NextResponse.json({ success: true, message: 'Compression stats reset' })

      case 'clear-prewarming':
        cachePrewarmingService.clearAll()
        return NextResponse.json({ success: true, message: 'All prewarming jobs cleared' })

      case 'clear-swr-state':
        swrService.clearRevalidationState()
        return NextResponse.json({ success: true, message: 'SWR state cleared' })

      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: [
            'invalidate',
            'prewarm-user',
            'prewarm-batch', 
            'prewarm-premium',
            'mutate-swr',
            'reset-circuit-breaker',
            'reset-all-circuit-breakers',
            'bulk-invalidate',
            'emergency-clear',
            'compress-existing',
            'update-compression-config',
            'update-prewarming-config',
            'cancel-prewarming-job',
            'reset-analytics',
            'reset-compression-stats',
            'clear-prewarming',
            'clear-swr-state'
          ]
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Cache management POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const pattern = searchParams.get('pattern')

    if (key) {
      // Delete specific key
      const success = await CacheService.delete(key)
      return NextResponse.json({ success, message: success ? 'Key deleted' : 'Failed to delete key' })
    }

    if (pattern) {
      // Delete by pattern
      const success = await CacheService.deletePattern(pattern)
      return NextResponse.json({ success, message: success ? 'Pattern deleted' : 'Failed to delete pattern' })
    }

    return NextResponse.json({ error: 'key or pattern parameter required' }, { status: 400 })
  } catch (error) {
    console.error('Cache management DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}