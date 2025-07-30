import { CacheService, CACHE_KEYS, CACHE_TTL } from './redis'

export interface CachedUserProfile {
  id: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
  location: string
  is_verified: boolean
  premium_type: string
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
  last_active: string
}

export interface RecommendationData {
  whoToFollow: CachedUserProfile[]
  trendingTopics: {
    name: string
    count: number
    trend: 'up' | 'down' | 'stable'
  }[]
  upcomingEvents: {
    id: string
    title: string
    description: string
    date: string
    location: string
    attendees_count: number
    is_attending: boolean
  }[]
  lastUpdated: string
}

export interface UserStats {
  posts_count: number
  followers_count: number
  following_count: number
  likes_received: number
  comments_received: number
  profile_views: number
  engagement_rate: number
  premium_since: string | null
  verification_date: string | null
  last_calculated: string
}

/**
 * Profile and User Data Cache Service
 */
export class ProfileCacheService {

  /**
   * Get cached user profile
   */
  static async getUserProfile(userId: string): Promise<CachedUserProfile | null> {
    const cacheKey = CACHE_KEYS.USER_PROFILE(userId)
    
    try {
      return await CacheService.get<CachedUserProfile>(cacheKey)
    } catch (error) {
      console.error('Profile cache get error:', error)
      return null
    }
  }

  /**
   * Cache user profile
   */
  static async setUserProfile(userId: string, profile: CachedUserProfile): Promise<boolean> {
    const cacheKey = CACHE_KEYS.USER_PROFILE(userId)
    
    try {
      return await CacheService.set(cacheKey, profile, CACHE_TTL.USER_PROFILE)
    } catch (error) {
      console.error('Profile cache set error:', error)
      return false
    }
  }

  /**
   * Get cached user stats
   */
  static async getUserStats(userId: string): Promise<UserStats | null> {
    const cacheKey = CACHE_KEYS.USER_STATS(userId)
    
    try {
      const cached = await CacheService.get<UserStats>(cacheKey)
      
      // Check if stats are recent (within last 15 minutes)
      if (cached && cached.last_calculated) {
        const lastCalc = new Date(cached.last_calculated).getTime()
        const now = Date.now()
        const fifteenMinutes = 15 * 60 * 1000
        
        if (now - lastCalc < fifteenMinutes) {
          return cached
        }
      }
      
      return null
    } catch (error) {
      console.error('User stats cache get error:', error)
      return null
    }
  }

  /**
   * Cache user stats
   */
  static async setUserStats(userId: string, stats: Omit<UserStats, 'last_calculated'>): Promise<boolean> {
    const cacheKey = CACHE_KEYS.USER_STATS(userId)
    
    try {
      const cacheData: UserStats = {
        ...stats,
        last_calculated: new Date().toISOString()
      }
      
      return await CacheService.set(cacheKey, cacheData, CACHE_TTL.USER_STATS)
    } catch (error) {
      console.error('User stats cache set error:', error)
      return false
    }
  }

  /**
   * Get cached recommendations
   */
  static async getRecommendations(userId: string): Promise<RecommendationData | null> {
    const cacheKey = CACHE_KEYS.RECOMMENDATIONS(userId)
    
    try {
      const cached = await CacheService.get<RecommendationData>(cacheKey)
      
      // Check if recommendations are recent (within last 20 minutes)
      if (cached && cached.lastUpdated) {
        const lastUpdate = new Date(cached.lastUpdated).getTime()
        const now = Date.now()
        const twentyMinutes = 20 * 60 * 1000
        
        if (now - lastUpdate < twentyMinutes) {
          return cached
        }
      }
      
      return null
    } catch (error) {
      console.error('Recommendations cache get error:', error)
      return null
    }
  }

  /**
   * Cache recommendations
   */
  static async setRecommendations(
    userId: string, 
    recommendations: Omit<RecommendationData, 'lastUpdated'>
  ): Promise<boolean> {
    const cacheKey = CACHE_KEYS.RECOMMENDATIONS(userId)
    
    try {
      const cacheData: RecommendationData = {
        ...recommendations,
        lastUpdated: new Date().toISOString()
      }
      
      return await CacheService.set(cacheKey, cacheData, CACHE_TTL.RECOMMENDATIONS)
    } catch (error) {
      console.error('Recommendations cache set error:', error)
      return false
    }
  }

  /**
   * Get cached followers list
   */
  static async getFollowers(userId: string): Promise<string[] | null> {
    const cacheKey = CACHE_KEYS.USER_FOLLOWERS(userId)
    
    try {
      return await CacheService.get<string[]>(cacheKey)
    } catch (error) {
      console.error('Followers cache get error:', error)
      return null
    }
  }

  /**
   * Cache followers list
   */
  static async setFollowers(userId: string, followerIds: string[]): Promise<boolean> {
    const cacheKey = CACHE_KEYS.USER_FOLLOWERS(userId)
    
    try {
      return await CacheService.set(cacheKey, followerIds, CACHE_TTL.USER_FOLLOWERS)
    } catch (error) {
      console.error('Followers cache set error:', error)
      return false
    }
  }

  /**
   * Get cached following list
   */
  static async getFollowing(userId: string): Promise<string[] | null> {
    const cacheKey = CACHE_KEYS.USER_FOLLOWING(userId)
    
    try {
      return await CacheService.get<string[]>(cacheKey)
    } catch (error) {
      console.error('Following cache get error:', error)
      return null
    }
  }

  /**
   * Cache following list
   */
  static async setFollowing(userId: string, followingIds: string[]): Promise<boolean> {
    const cacheKey = CACHE_KEYS.USER_FOLLOWING(userId)
    
    try {
      return await CacheService.set(cacheKey, followingIds, CACHE_TTL.USER_FOLLOWING)
    } catch (error) {
      console.error('Following cache set error:', error)
      return false
    }
  }

  /**
   * Get cached who to follow suggestions
   */
  static async getWhoToFollow(userId: string): Promise<CachedUserProfile[] | null> {
    const cacheKey = CACHE_KEYS.WHO_TO_FOLLOW(userId)
    
    try {
      return await CacheService.get<CachedUserProfile[]>(cacheKey)
    } catch (error) {
      console.error('Who to follow cache get error:', error)
      return null
    }
  }

  /**
   * Cache who to follow suggestions
   */
  static async setWhoToFollow(userId: string, suggestions: CachedUserProfile[]): Promise<boolean> {
    const cacheKey = CACHE_KEYS.WHO_TO_FOLLOW(userId)
    
    try {
      return await CacheService.set(cacheKey, suggestions, CACHE_TTL.WHO_TO_FOLLOW)
    } catch (error) {
      console.error('Who to follow cache set error:', error)
      return false
    }
  }

  /**
   * Batch get multiple user profiles
   */
  static async getBatchUserProfiles(userIds: string[]): Promise<(CachedUserProfile | null)[]> {
    try {
      const cacheKeys = userIds.map(id => CACHE_KEYS.USER_PROFILE(id))
      return await CacheService.mget<CachedUserProfile>(cacheKeys)
    } catch (error) {
      console.error('Batch profile cache get error:', error)
      return userIds.map(() => null)
    }
  }

  /**
   * Batch set multiple user profiles
   */
  static async setBatchUserProfiles(profiles: CachedUserProfile[]): Promise<boolean> {
    try {
      const keyValuePairs: Record<string, CachedUserProfile> = {}
      
      profiles.forEach(profile => {
        const key = CACHE_KEYS.USER_PROFILE(profile.id)
        keyValuePairs[key] = profile
      })
      
      return await CacheService.mset(keyValuePairs, CACHE_TTL.USER_PROFILE)
    } catch (error) {
      console.error('Batch profile cache set error:', error)
      return false
    }
  }

  /**
   * Invalidate user-related caches when profile is updated
   */
  static async invalidateUserCaches(userId: string): Promise<boolean> {
    try {
      const keysToInvalidate = [
        CACHE_KEYS.USER_PROFILE(userId),
        CACHE_KEYS.USER_STATS(userId),
        CACHE_KEYS.RECOMMENDATIONS(userId),
        CACHE_KEYS.WHO_TO_FOLLOW(userId)
      ]
      
      await CacheService.del(keysToInvalidate)
      
      // Also invalidate timeline caches
      await CacheService.invalidatePattern(`timeline:${userId}:*`)
      
      return true
    } catch (error) {
      console.error('User cache invalidation error:', error)
      return false
    }
  }

  /**
   * Warm up caches for a new user session
   */
  static async warmUpUserSession(
    userId: string,
    fetchers: {
      profile: () => Promise<CachedUserProfile>
      stats: () => Promise<Omit<UserStats, 'last_calculated'>>
      recommendations: () => Promise<Omit<RecommendationData, 'lastUpdated'>>
    }
  ): Promise<void> {
    try {
      const promises = [
        this.setUserProfile(userId, await fetchers.profile()),
        this.setUserStats(userId, await fetchers.stats()),
        this.setRecommendations(userId, await fetchers.recommendations())
      ]
      
      await Promise.all(promises)
    } catch (error) {
      console.error('User session warm-up error:', error)
    }
  }

  /**
   * Get cache statistics for user
   */
  static async getUserCacheStats(userId: string): Promise<{
    profileCached: boolean
    statsCached: boolean
    recommendationsCached: boolean
    followersCached: boolean
    followingCached: boolean
    totalCacheKeys: number
  }> {
    try {
      const keys = [
        CACHE_KEYS.USER_PROFILE(userId),
        CACHE_KEYS.USER_STATS(userId),
        CACHE_KEYS.RECOMMENDATIONS(userId),
        CACHE_KEYS.USER_FOLLOWERS(userId),
        CACHE_KEYS.USER_FOLLOWING(userId)
      ]
      
      const existsResults = await Promise.all(
        keys.map(key => CacheService.exists(key))
      )
      
      return {
        profileCached: existsResults[0],
        statsCached: existsResults[1],
        recommendationsCached: existsResults[2],
        followersCached: existsResults[3],
        followingCached: existsResults[4],
        totalCacheKeys: existsResults.filter(Boolean).length
      }
    } catch (error) {
      console.error('User cache stats error:', error)
      return {
        profileCached: false,
        statsCached: false,
        recommendationsCached: false,
        followersCached: false,
        followingCached: false,
        totalCacheKeys: 0
      }
    }
  }
}