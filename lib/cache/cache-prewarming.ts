import { CacheService, CACHE_KEYS, CACHE_TTL } from './redis'
import { TimelineCacheService } from './timeline-cache'
import { ProfileCacheService } from './profile-cache'
import { feedAlgorithmService } from '@/lib/services/feed-algorithm-service'
import { createClient } from '@/app/lib/supabase-browser'

export interface PrewarmingJob {
  id: string
  userId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startedAt?: number
  completedAt?: number
  error?: string
}

export interface PrewarmingConfig {
  enabled: boolean
  batchSize: number
  delayBetweenJobs: number
  maxConcurrentJobs: number
  priorityUsers: string[] // Premium users, verified users, etc.
}

/**
 * Cache pre-warming service for new users and onboarding
 */
class CachePrewarmingService {
  private static instance: CachePrewarmingService
  private supabase = createClient()
  private activeJobs = new Map<string, PrewarmingJob>()
  private queue: string[] = []
  
  private config: PrewarmingConfig = {
    enabled: true,
    batchSize: 10,
    delayBetweenJobs: 1000, // 1 second
    maxConcurrentJobs: 3,
    priorityUsers: []
  }

  static getInstance(): CachePrewarmingService {
    if (!CachePrewarmingService.instance) {
      CachePrewarmingService.instance = new CachePrewarmingService()
    }
    return CachePrewarmingService.instance
  }

  /**
   * Prewarm cache for new user
   */
  async prewarmNewUser(userId: string): Promise<string> {
    if (!this.config.enabled) {
      console.log('Cache prewarming is disabled')
      return 'disabled'
    }

    // Check if user is already being processed
    if (this.activeJobs.has(userId)) {
      console.log(`Prewarming already in progress for user: ${userId}`)
      return this.activeJobs.get(userId)!.id
    }

    // Create job
    const job: PrewarmingJob = {
      id: `prewarm_${userId}_${Date.now()}`,
      userId,
      status: 'pending',
      progress: 0,
      startedAt: Date.now()
    }

    this.activeJobs.set(userId, job)

    // Add to queue or process immediately
    if (this.getActiveJobCount() < this.config.maxConcurrentJobs) {
      this.processJob(job)
    } else {
      this.queue.push(userId)
      console.log(`User queued for prewarming: ${userId}`)
    }

    return job.id
  }

  /**
   * Process prewarming job
   */
  private async processJob(job: PrewarmingJob): Promise<void> {
    try {
      job.status = 'running'
      console.log(`🔥 Starting cache prewarming for user: ${job.userId}`)

      // Step 1: Load user profile (10%)
      await this.prewarmUserProfile(job.userId)
      job.progress = 10

      // Step 2: Load basic recommendations (25%)
      await this.prewarmRecommendations(job.userId)
      job.progress = 25

      // Step 3: Prewarm timeline feeds (60%)
      await this.prewarmTimelineFeeds(job.userId)
      job.progress = 60

      // Step 4: Load trending content (80%)
      await this.prewarmTrendingContent(job.userId)
      job.progress = 80

      // Step 5: Load user preferences and settings (100%)
      await this.prewarmUserPreferences(job.userId)
      job.progress = 100

      // Job completed
      job.status = 'completed'
      job.completedAt = Date.now()
      
      console.log(`✅ Cache prewarming completed for user: ${job.userId} (${job.completedAt! - job.startedAt!}ms)`)

    } catch (error) {
      job.status = 'failed'
      job.error = (error as Error).message
      console.error(`❌ Cache prewarming failed for user: ${job.userId}`, error)
    } finally {
      // Clean up and process next job
      setTimeout(() => {
        this.activeJobs.delete(job.userId)
        this.processNextInQueue()
      }, this.config.delayBetweenJobs)
    }
  }

  /**
   * Prewarm user profile data
   */
  private async prewarmUserProfile(userId: string): Promise<void> {
    try {
      // Load user profile
      const { data: user } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (user) {
        await ProfileCacheService.setUserProfile(userId, user)
        console.log(`📝 User profile prewarmed: ${userId}`)
      }
    } catch (error) {
      console.warn(`Failed to prewarm user profile: ${userId}`, error)
    }
  }

  /**
   * Prewarm user recommendations
   */
  private async prewarmRecommendations(userId: string): Promise<void> {
    try {
      // Get sample users for "who to follow"
      const { data: recommendations } = await this.supabase
        .from('users')
        .select('id, username, name, avatar_url, is_verified, premium_type')
        .neq('id', userId)
        .eq('is_verified', true)
        .limit(20)

      if (recommendations) {
        await ProfileCacheService.setUserRecommendations(userId, recommendations)
        console.log(`👥 Recommendations prewarmed: ${userId}`)
      }

      // Prewarm trending topics
      const trendingTopics = [
        'OpenLove',
        'Encontros',
        'Relacionamentos',
        'Dating',
        'Love'
      ]

      await CacheService.set(
        CACHE_KEYS.TRENDING_TOPICS,
        trendingTopics,
        CACHE_TTL.TRENDING
      )

    } catch (error) {
      console.warn(`Failed to prewarm recommendations: ${userId}`, error)
    }
  }

  /**
   * Prewarm timeline feeds
   */
  private async prewarmTimelineFeeds(userId: string): Promise<void> {
    try {
      // Prewarm for-you feed (first page)
      const forYouFeed = await feedAlgorithmService.generatePersonalizedFeed(userId, 1, 20)
      await TimelineCacheService.setTimelineFeed(userId, 'for-you', 1, forYouFeed)

      // Prewarm explore feed
      const exploreFeed = await feedAlgorithmService.getExploreFeed(userId, 1, 20)
      await TimelineCacheService.setTimelineFeed(userId, 'explore', 1, exploreFeed)

      console.log(`📱 Timeline feeds prewarmed: ${userId}`)
    } catch (error) {
      console.warn(`Failed to prewarm timeline feeds: ${userId}`, error)
    }
  }

  /**
   * Prewarm trending content
   */
  private async prewarmTrendingContent(userId: string): Promise<void> {
    try {
      // Get popular posts
      const { data: trendingPosts } = await this.supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          likes_count,
          comments_count,
          users (id, username, name, avatar_url, is_verified)
        `)
        .eq('visibility', 'public')
        .order('likes_count', { ascending: false })
        .limit(10)

      if (trendingPosts) {
        await CacheService.set(
          CACHE_KEYS.TRENDING_POSTS,
          trendingPosts,
          CACHE_TTL.TRENDING
        )
      }

      console.log(`🔥 Trending content prewarmed: ${userId}`)
    } catch (error) {
      console.warn(`Failed to prewarm trending content: ${userId}`, error)
    }
  }

  /**
   * Prewarm user preferences
   */
  private async prewarmUserPreferences(userId: string): Promise<void> {
    try {
      // Default preferences for new users
      const defaultPreferences = {
        notifications: {
          email: true,
          push: true,
          likes: true,
          comments: true,
          follows: true
        },
        privacy: {
          profileVisibility: 'public',
          showActivity: true,
          allowMessages: true
        },
        theme: 'dark',
        language: 'pt-BR'
      }

      await CacheService.set(
        CACHE_KEYS.USER_PREFERENCES(userId),
        defaultPreferences,
        CACHE_TTL.USER_PROFILE
      )

      console.log(`⚙️ User preferences prewarmed: ${userId}`)
    } catch (error) {
      console.warn(`Failed to prewarm user preferences: ${userId}`, error)
    }
  }

  /**
   * Process next job in queue
   */
  private processNextInQueue(): void {
    if (this.queue.length > 0 && this.getActiveJobCount() < this.config.maxConcurrentJobs) {
      const nextUserId = this.queue.shift()!
      
      const job: PrewarmingJob = {
        id: `prewarm_${nextUserId}_${Date.now()}`,
        userId: nextUserId,
        status: 'pending',
        progress: 0,
        startedAt: Date.now()
      }

      this.activeJobs.set(nextUserId, job)
      this.processJob(job)
    }
  }

  /**
   * Get number of active jobs
   */
  private getActiveJobCount(): number {
    return Array.from(this.activeJobs.values())
      .filter(job => job.status === 'running').length
  }

  /**
   * Prewarm cache for multiple users
   */
  async prewarmBatch(userIds: string[]): Promise<string[]> {
    const jobIds: string[] = []

    for (const userId of userIds) {
      const jobId = await this.prewarmNewUser(userId)
      jobIds.push(jobId)
    }

    console.log(`🔥 Batch prewarming started for ${userIds.length} users`)
    return jobIds
  }

  /**
   * Prewarm cache for premium users (priority)
   */
  async prewarmPremiumUsers(): Promise<void> {
    try {
      const { data: premiumUsers } = await this.supabase
        .from('users')
        .select('id')
        .in('premium_type', ['gold', 'diamond', 'couple'])
        .order('created_at', { ascending: false })
        .limit(50)

      if (premiumUsers) {
        const userIds = premiumUsers.map(u => u.id)
        await this.prewarmBatch(userIds)
        console.log(`💎 Premium users prewarming started: ${userIds.length} users`)
      }
    } catch (error) {
      console.error('Failed to prewarm premium users:', error)
    }
  }

  /**
   * Get job status
   */
  getJobStatus(userId: string): PrewarmingJob | null {
    return this.activeJobs.get(userId) || null
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): PrewarmingJob[] {
    return Array.from(this.activeJobs.values())
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueLength: number
    activeJobs: number
    queue: string[]
  } {
    return {
      queueLength: this.queue.length,
      activeJobs: this.getActiveJobCount(),
      queue: [...this.queue]
    }
  }

  /**
   * Cancel job
   */
  cancelJob(userId: string): boolean {
    const job = this.activeJobs.get(userId)
    if (job && job.status === 'running') {
      job.status = 'failed'
      job.error = 'Cancelled by user'
      this.activeJobs.delete(userId)
      console.log(`❌ Job cancelled: ${userId}`)
      return true
    }
    return false
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PrewarmingConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('🔥 Prewarming config updated:', this.config)
  }

  /**
   * Clear all jobs and queue
   */
  clearAll(): void {
    this.activeJobs.clear()
    this.queue.length = 0
    console.log('🧹 All prewarming jobs cleared')
  }
}

export const cachePrewarmingService = CachePrewarmingService.getInstance()

// Convenience functions
export const prewarmNewUser = (userId: string) => 
  cachePrewarmingService.prewarmNewUser(userId)

export const prewarmBatch = (userIds: string[]) => 
  cachePrewarmingService.prewarmBatch(userIds)