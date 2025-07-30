import { CacheService, CACHE_KEYS, CACHE_TTL } from './redis'

export interface TimelinePost {
  id: string
  content: string
  author: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    is_verified: boolean
    premium_type: string
  }
  created_at: string
  updated_at: string
  likes_count: number
  comments_count: number
  shares_count: number
  media?: {
    type: 'image' | 'video'
    url: string
    thumbnail_url?: string
  }[]
  is_liked?: boolean
  is_saved?: boolean
}

export interface TimelineFeedResult {
  data: TimelinePost[]
  hasMore: boolean
  nextPage: number
  total: number
  cacheHit: boolean
}

export interface FeedAlgorithmData {
  userId: string
  interests: string[]
  followingIds: string[]
  recentInteractions: string[]
  lastUpdated: string
}

/**
 * Timeline Cache Service - Optimized for feed performance
 */
export class TimelineCacheService {
  
  /**
   * Get cached timeline feed
   */
  static async getTimelineFeed(
    userId: string, 
    tab: 'for-you' | 'following' | 'explore', 
    page: number
  ): Promise<TimelineFeedResult | null> {
    const cacheKey = CACHE_KEYS.USER_TIMELINE(userId, tab, page)
    
    try {
      const cached = await CacheService.get<TimelineFeedResult>(cacheKey)
      
      if (cached) {
        return {
          ...cached,
          cacheHit: true
        }
      }
      
      return null
    } catch (error) {
      console.error('Timeline cache get error:', error)
      return null
    }
  }

  /**
   * Cache timeline feed
   */
  static async setTimelineFeed(
    userId: string,
    tab: 'for-you' | 'following' | 'explore',
    page: number,
    data: Omit<TimelineFeedResult, 'cacheHit'>
  ): Promise<boolean> {
    const cacheKey = CACHE_KEYS.USER_TIMELINE(userId, tab, page)
    
    try {
      // Cache with appropriate TTL based on tab
      let ttl = CACHE_TTL.TIMELINE
      
      // Different cache strategies per tab
      switch (tab) {
        case 'for-you':
          ttl = 300 // 5 minutes - personalized, changes frequently
          break
        case 'following':
          ttl = 600 // 10 minutes - semi-static, based on following
          break
        case 'explore':
          ttl = 900 // 15 minutes - more static, global content
          break
      }
      
      return await CacheService.set(cacheKey, data, ttl)
    } catch (error) {
      console.error('Timeline cache set error:', error)
      return false
    }
  }

  /**
   * Get cached feed algorithm data
   */
  static async getFeedAlgorithmData(userId: string): Promise<FeedAlgorithmData | null> {
    const cacheKey = CACHE_KEYS.USER_FEED_ALGORITHM(userId)
    
    try {
      const cached = await CacheService.get<FeedAlgorithmData>(cacheKey)
      
      // Check if data is recent enough (within last 12 hours)
      if (cached && cached.lastUpdated) {
        const lastUpdate = new Date(cached.lastUpdated).getTime()
        const now = Date.now()
        const twelveHours = 12 * 60 * 60 * 1000
        
        if (now - lastUpdate < twelveHours) {
          return cached
        }
      }
      
      return null
    } catch (error) {
      console.error('Feed algorithm cache get error:', error)
      return null
    }
  }

  /**
   * Cache feed algorithm data
   */
  static async setFeedAlgorithmData(
    userId: string,
    data: Omit<FeedAlgorithmData, 'lastUpdated'>
  ): Promise<boolean> {
    const cacheKey = CACHE_KEYS.USER_FEED_ALGORITHM(userId)
    
    try {
      const cacheData: FeedAlgorithmData = {
        ...data,
        lastUpdated: new Date().toISOString()
      }
      
      return await CacheService.set(cacheKey, cacheData, CACHE_TTL.FEED_ALGORITHM)
    } catch (error) {
      console.error('Feed algorithm cache set error:', error)
      return false
    }
  }

  /**
   * Prefetch next page of timeline
   */
  static async prefetchNextPage(
    userId: string,
    tab: 'for-you' | 'following' | 'explore',
    currentPage: number,
    fetcher: (page: number) => Promise<Omit<TimelineFeedResult, 'cacheHit'>>
  ): Promise<void> {
    const nextPage = currentPage + 1
    const cacheKey = CACHE_KEYS.USER_TIMELINE(userId, tab, nextPage)
    
    try {
      // Check if already cached
      const exists = await CacheService.exists(cacheKey)
      if (exists) return
      
      // Fetch and cache next page in background
      const data = await fetcher(nextPage)
      await this.setTimelineFeed(userId, tab, nextPage, data)
    } catch (error) {
      console.error('Timeline prefetch error:', error)
    }
  }

  /**
   * Invalidate user's timeline cache (when they create/delete posts)
   */
  static async invalidateUserTimeline(userId: string): Promise<boolean> {
    try {
      const patterns = [
        `timeline:${userId}:*`,
        `feed_algo:${userId}`,
        `user_stats:${userId}`
      ]
      
      const promises = patterns.map(pattern => 
        CacheService.invalidatePattern(pattern)
      )
      
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Timeline invalidation error:', error)
      return false
    }
  }

  /**
   * Invalidate timeline cache for users following the given user
   */
  static async invalidateFollowersTimeline(userId: string): Promise<boolean> {
    try {
      // Get followers from cache or skip if not cached
      const followersKey = CACHE_KEYS.USER_FOLLOWERS(userId)
      const followers = await CacheService.get<string[]>(followersKey)
      
      if (!followers) return true // Skip if followers not cached
      
      // Invalidate following feed for all followers
      const promises = followers.map(followerId => 
        CacheService.invalidatePattern(`timeline:${followerId}:following:*`)
      )
      
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Followers timeline invalidation error:', error)
      return false
    }
  }

  /**
   * Warm up cache for active user
   */
  static async warmUpUserCache(
    userId: string,
    fetchers: {
      forYou: () => Promise<Omit<TimelineFeedResult, 'cacheHit'>>
      following: () => Promise<Omit<TimelineFeedResult, 'cacheHit'>>
      explore: () => Promise<Omit<TimelineFeedResult, 'cacheHit'>>
    }
  ): Promise<void> {
    try {
      const promises = [
        this.setTimelineFeed(userId, 'for-you', 1, await fetchers.forYou()),
        this.setTimelineFeed(userId, 'following', 1, await fetchers.following()),
        this.setTimelineFeed(userId, 'explore', 1, await fetchers.explore())
      ]
      
      await Promise.all(promises)
    } catch (error) {
      console.error('Cache warm-up error:', error)
    }
  }

  /**
   * Get cache hit rate statistics
   */
  static async getCacheStats(userId: string): Promise<{
    timelineCacheKeys: number
    algorithmCached: boolean
    estimatedSavings: string
  }> {
    try {
      const timelineKeys = await CacheService.get<string[]>(`timeline:${userId}:*`)
      const algorithmExists = await CacheService.exists(CACHE_KEYS.USER_FEED_ALGORITHM(userId))
      
      const keyCount = timelineKeys ? timelineKeys.length : 0
      const savings = keyCount * 50 // Estimate 50ms saved per cached request
      
      return {
        timelineCacheKeys: keyCount,
        algorithmCached: algorithmExists,
        estimatedSavings: `${savings}ms`
      }
    } catch (error) {
      console.error('Cache stats error:', error)
      return {
        timelineCacheKeys: 0,
        algorithmCached: false,
        estimatedSavings: '0ms'
      }
    }
  }

  /**
   * Clean up old cache entries
   */
  static async cleanupOldEntries(userId: string, keepLastNPages: number = 3): Promise<boolean> {
    try {
      const tabs = ['for-you', 'following', 'explore']
      const promises: Promise<boolean>[] = []
      
      for (const tab of tabs) {
        // Keep only last N pages, delete older ones
        for (let page = keepLastNPages + 1; page <= 10; page++) {
          const key = CACHE_KEYS.USER_TIMELINE(userId, tab, page)
          promises.push(CacheService.del(key))
        }
      }
      
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Cache cleanup error:', error)
      return false
    }
  }
}