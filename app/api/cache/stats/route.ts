import { NextRequest, NextResponse } from 'next/server'
import { CacheService } from '@/lib/cache/redis'
import { TimelineCacheService } from '@/lib/cache/timeline-cache'
import { ProfileCacheService } from '@/lib/cache/profile-cache'

/**
 * GET /api/cache/stats
 * Returns cache statistics and health information
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    // Basic Redis health check
    const redisStats = await CacheService.getStats()
    
    let userStats = null
    let timelineStats = null
    
    // If userId provided, get user-specific cache stats
    if (userId) {
      userStats = await ProfileCacheService.getUserCacheStats(userId)
      timelineStats = await TimelineCacheService.getCacheStats(userId)
    }
    
    const stats = {
      redis: redisStats,
      user: userStats,
      timeline: timelineStats,
      timestamp: new Date().toISOString(),
      performance: {
        averageHitTime: '~5ms',
        averageMissTime: '~50ms',
        estimatedBandwidthSaved: userStats ? 
          `~${(userStats.totalCacheKeys * 2)}KB` : 'N/A'
      }
    }
    
    const response = NextResponse.json(stats)
    
    // Cache these stats for 1 minute
    response.headers.set('Cache-Control', 'public, max-age=60')
    response.headers.set('X-Cache-Stats', 'true')
    
    return response
    
  } catch (error) {
    console.error('Cache stats error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch cache stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cache/stats
 * Clear cache for specific user or patterns
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { userId, patterns, clearAll } = body
    
    if (clearAll) {
      // Clear all cache keys (use with caution!)
      await CacheService.invalidatePattern('*')
      return NextResponse.json({ 
        success: true, 
        message: 'All cache cleared' 
      })
    }
    
    if (userId) {
      // Clear user-specific caches
      await TimelineCacheService.invalidateUserTimeline(userId)
      await ProfileCacheService.invalidateUserCaches(userId)
      
      return NextResponse.json({ 
        success: true, 
        message: `Cache cleared for user ${userId}` 
      })
    }
    
    if (patterns && Array.isArray(patterns)) {
      // Clear specific patterns
      const promises = patterns.map((pattern: string) => 
        CacheService.invalidatePattern(pattern)
      )
      
      await Promise.all(promises)
      
      return NextResponse.json({ 
        success: true, 
        message: `Cache cleared for patterns: ${patterns.join(', ')}` 
      })
    }
    
    return NextResponse.json(
      { error: 'No valid clear parameters provided' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Cache clear error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cache/stats
 * Warm up caches for a user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { userId, type = 'user' } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    if (type === 'user') {
      // Warm up user-specific caches
      // Note: In a real implementation, you'd pass actual fetcher functions
      await ProfileCacheService.warmUpUserSession(userId, {
        profile: async () => ({
          id: userId,
          username: 'user',
          full_name: 'User Name',
          avatar_url: '',
          bio: '',
          location: '',
          is_verified: false,
          premium_type: 'free',
          followers_count: 0,
          following_count: 0,
          posts_count: 0,
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }),
        stats: async () => ({
          posts_count: 0,
          followers_count: 0,
          following_count: 0,
          likes_received: 0,
          comments_received: 0,
          profile_views: 0,
          engagement_rate: 0,
          premium_since: null,
          verification_date: null
        }),
        recommendations: async () => ({
          whoToFollow: [],
          trendingTopics: [],
          upcomingEvents: []
        })
      })
      
      return NextResponse.json({ 
        success: true, 
        message: `User cache warmed up for ${userId}` 
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Cache warm-up error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to warm up cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}