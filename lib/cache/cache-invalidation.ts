import { CacheService, CACHE_KEYS } from './redis'
import { TimelineCacheService } from './timeline-cache'
import { ProfileCacheService } from './profile-cache'

export type InvalidationEvent = 
  | 'user_updated'
  | 'post_created'
  | 'post_updated'
  | 'post_deleted'
  | 'post_liked'
  | 'user_followed'
  | 'user_unfollowed'
  | 'subscription_changed'
  | 'profile_updated'

export interface InvalidationPayload {
  event: InvalidationEvent
  userId?: string
  postId?: string
  targetUserId?: string
  data?: any
}

/**
 * Distributed cache invalidation service
 * Handles cache invalidation across multiple cache layers
 */
class CacheInvalidationService {
  private static instance: CacheInvalidationService
  
  static getInstance(): CacheInvalidationService {
    if (!CacheInvalidationService.instance) {
      CacheInvalidationService.instance = new CacheInvalidationService()
    }
    return CacheInvalidationService.instance
  }

  /**
   * Main invalidation method - routes to specific handlers
   */
  async invalidate(payload: InvalidationPayload): Promise<void> {
    console.log(`🔄 Cache invalidation triggered:`, payload)
    
    try {
      switch (payload.event) {
        case 'user_updated':
        case 'profile_updated':
          await this.handleUserProfileUpdate(payload)
          break
          
        case 'post_created':
          await this.handlePostCreated(payload)
          break
          
        case 'post_updated':
        case 'post_deleted':
          await this.handlePostUpdate(payload)
          break
          
        case 'post_liked':
          await this.handlePostInteraction(payload)
          break
          
        case 'user_followed':
        case 'user_unfollowed':
          await this.handleFollowUpdate(payload)
          break
          
        case 'subscription_changed':
          await this.handleSubscriptionChange(payload)
          break
          
        default:
          console.warn(`Unknown invalidation event: ${payload.event}`)
      }
    } catch (error) {
      console.error('Cache invalidation error:', error)
      // Don't throw - cache invalidation should not break the app
    }
  }

  /**
   * Handle user profile updates
   */
  private async handleUserProfileUpdate(payload: InvalidationPayload): Promise<void> {
    const { userId } = payload
    if (!userId) return

    const invalidations = [
      // Timeline caches
      TimelineCacheService.invalidateUserTimeline(userId),
      
      // Profile caches
      ProfileCacheService.invalidateUserCaches(userId),
      
      // User-specific caches
      CacheService.delete(CACHE_KEYS.USER_PROFILE(userId)),
      CacheService.delete(CACHE_KEYS.USER_FEED_ALGORITHM(userId)),
      CacheService.delete(CACHE_KEYS.USER_PREFERENCES(userId)),
      
      // Clear user's posts from cache
      this.invalidateUserPosts(userId)
    ]

    await Promise.allSettled(invalidations)
    console.log(`✅ Profile caches invalidated for user: ${userId}`)
  }

  /**
   * Handle new post creation
   */
  private async handlePostCreated(payload: InvalidationPayload): Promise<void> {
    const { userId, postId } = payload
    if (!userId || !postId) return

    const invalidations = [
      // Invalidate author's timeline
      TimelineCacheService.invalidateUserTimeline(userId),
      
      // Invalidate followers' timelines
      this.invalidateFollowersTimelines(userId),
      
      // Update global trending/explore feeds
      this.invalidateExploreFeed(),
      
      // Clear user's post count cache
      CacheService.delete(CACHE_KEYS.USER_POSTS_COUNT(userId))
    ]

    await Promise.allSettled(invalidations)
    console.log(`✅ Post creation caches invalidated: ${postId}`)
  }

  /**
   * Handle post updates/deletions
   */
  private async handlePostUpdate(payload: InvalidationPayload): Promise<void> {
    const { userId, postId } = payload
    if (!userId || !postId) return

    const invalidations = [
      // Post-specific cache
      CacheService.delete(CACHE_KEYS.POST_DETAILS(postId)),
      
      // Timeline caches
      TimelineCacheService.invalidateUserTimeline(userId),
      this.invalidateFollowersTimelines(userId),
      
      // Comments cache
      CacheService.delete(CACHE_KEYS.POST_COMMENTS(postId)),
      
      // Explore feed
      this.invalidateExploreFeed()
    ]

    await Promise.allSettled(invalidations)
    console.log(`✅ Post update caches invalidated: ${postId}`)
  }

  /**
   * Handle post interactions (likes, shares)
   */
  private async handlePostInteraction(payload: InvalidationPayload): Promise<void> {
    const { postId, userId } = payload
    if (!postId || !userId) return

    // Light invalidation for interactions (no need to clear entire timelines)
    const invalidations = [
      CacheService.delete(CACHE_KEYS.POST_DETAILS(postId)),
      CacheService.delete(CACHE_KEYS.POST_LIKES(postId)),
      CacheService.delete(CACHE_KEYS.USER_LIKED_POSTS(userId))
    ]

    await Promise.allSettled(invalidations)
    console.log(`✅ Post interaction caches invalidated: ${postId}`)
  }

  /**
   * Handle follow/unfollow actions
   */
  private async handleFollowUpdate(payload: InvalidationPayload): Promise<void> {
    const { userId, targetUserId } = payload
    if (!userId || !targetUserId) return

    const invalidations = [
      // Invalidate both users' timelines
      TimelineCacheService.invalidateUserTimeline(userId),
      TimelineCacheService.invalidateUserTimeline(targetUserId),
      
      // Following/followers caches
      CacheService.delete(CACHE_KEYS.USER_FOLLOWING(userId)),
      CacheService.delete(CACHE_KEYS.USER_FOLLOWERS(targetUserId)),
      
      // Who to follow recommendations
      ProfileCacheService.invalidateRecommendations(userId),
      ProfileCacheService.invalidateRecommendations(targetUserId)
    ]

    await Promise.allSettled(invalidations)
    console.log(`✅ Follow caches invalidated: ${userId} -> ${targetUserId}`)
  }

  /**
   * Handle subscription changes
   */
  private async handleSubscriptionChange(payload: InvalidationPayload): Promise<void> {
    const { userId } = payload
    if (!userId) return

    const invalidations = [
      // User profile (premium status changed)
      ProfileCacheService.invalidateUserCaches(userId),
      
      // Timeline (may affect content visibility)
      TimelineCacheService.invalidateUserTimeline(userId),
      
      // Premium-specific caches
      CacheService.delete(CACHE_KEYS.USER_PREMIUM_CONTENT(userId)),
      CacheService.delete(CACHE_KEYS.USER_SUBSCRIPTION(userId))
    ]

    await Promise.allSettled(invalidations)
    console.log(`✅ Subscription caches invalidated for user: ${userId}`)
  }

  /**
   * Invalidate followers' timelines when user posts
   */
  private async invalidateFollowersTimelines(userId: string): Promise<void> {
    try {
      // Get user's followers (from cache if available)
      const followers = await ProfileCacheService.getUserFollowers(userId)
      
      if (followers?.length) {
        const invalidations = followers.map(followerId => 
          TimelineCacheService.invalidateUserTimeline(followerId)
        )
        await Promise.allSettled(invalidations)
        console.log(`✅ Invalidated ${followers.length} followers' timelines`)
      }
    } catch (error) {
      console.error('Error invalidating followers timelines:', error)
    }
  }

  /**
   * Invalidate explore/trending feeds
   */
  private async invalidateExploreFeed(): Promise<void> {
    try {
      const patterns = [
        'timeline:*:explore:*',
        'trending:*',
        'explore:*'
      ]
      
      const invalidations = patterns.map(pattern => 
        CacheService.deletePattern(pattern)
      )
      
      await Promise.allSettled(invalidations)
      console.log(`✅ Explore feeds invalidated`)
    } catch (error) {
      console.error('Error invalidating explore feed:', error)
    }
  }

  /**
   * Invalidate user's posts cache
   */
  private async invalidateUserPosts(userId: string): Promise<void> {
    try {
      await CacheService.deletePattern(`user_posts:${userId}:*`)
      console.log(`✅ User posts cache invalidated: ${userId}`)
    } catch (error) {
      console.error('Error invalidating user posts:', error)
    }
  }

  /**
   * Bulk invalidation for maintenance
   */
  async bulkInvalidate(userIds: string[], events: InvalidationEvent[]): Promise<void> {
    const invalidations = []
    
    for (const userId of userIds) {
      for (const event of events) {
        invalidations.push(
          this.invalidate({ event, userId })
        )
      }
    }
    
    await Promise.allSettled(invalidations)
    console.log(`✅ Bulk invalidation completed: ${userIds.length} users, ${events.length} events`)
  }

  /**
   * Emergency cache clear - use with caution
   */
  async emergencyClear(): Promise<void> {
    console.warn('🚨 Emergency cache clear initiated')
    
    try {
      await CacheService.flushAll()
      console.log('✅ Emergency cache clear completed')
    } catch (error) {
      console.error('Emergency cache clear failed:', error)
      throw error
    }
  }
}

export const cacheInvalidationService = CacheInvalidationService.getInstance()

// Convenience functions for common invalidations
export const invalidateUser = (userId: string) => 
  cacheInvalidationService.invalidate({ event: 'user_updated', userId })

export const invalidatePost = (postId: string, userId: string) => 
  cacheInvalidationService.invalidate({ event: 'post_updated', postId, userId })

export const invalidateFollow = (userId: string, targetUserId: string) => 
  cacheInvalidationService.invalidate({ event: 'user_followed', userId, targetUserId })