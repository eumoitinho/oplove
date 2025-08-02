import { createClient } from '@/app/lib/supabase-browser'
import type { Post } from '@/types/common'
import type { UserProfile, FeedAlgorithmWeights, AdultInterest, LocationData } from '@/types/adult'
import { TimelineCacheService, type TimelineFeedResult } from '@/lib/cache/timeline-cache'

class FeedAlgorithmService {
  private supabase = createClient()
  
  // Pesos do algoritmo (soma = 100%)
  private weights: FeedAlgorithmWeights = {
    location: 0.40,  // 40% baseado em localização
    interests: 0.30, // 30% baseado em interesses
    activity: 0.15,  // 15% baseado em atividade
    premium: 0.10,   // 10% baseado em premium
    verification: 0.05 // 5% baseado em verificação
  }

  /**
   * Gera feed personalizado para o usuário (com cache)
   */
  async generatePersonalizedFeed(userId: string, page: number = 1, limit: number = 20): Promise<TimelineFeedResult> {
    try {
      // Try to get from cache first
      const cached = await TimelineCacheService.getTimelineFeed(userId, 'for-you', page)
      if (cached) {
        // Prefetch next page in background
        if (page === 1) {
          TimelineCacheService.prefetchNextPage(userId, 'for-you', page, (nextPage) => 
            this.generatePersonalizedFeedFresh(userId, nextPage, limit)
          )
        }
        return cached
      }

      // Generate fresh feed
      const freshData = await this.generatePersonalizedFeedFresh(userId, page, limit)
      
      // Cache the result
      await TimelineCacheService.setTimelineFeed(userId, 'for-you', page, freshData)

      return {
        ...freshData,
        cacheHit: false
      }
    } catch (error) {
      console.error('Error generating personalized feed:', error)
      // Fallback to simple posts
      const fallbackPosts = await this.getFallbackPosts((page - 1) * limit, limit)
      return {
        data: fallbackPosts,
        hasMore: fallbackPosts.length === limit,
        nextPage: page + 1,
        total: fallbackPosts.length,
        cacheHit: false
      }
    }
  }

  /**
   * Generate fresh personalized feed (no cache)
   */
  private async generatePersonalizedFeedFresh(userId: string, page: number = 1, limit: number = 20) {
    // Buscar perfil do usuário
    const { data: userProfile, error: userError } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user profile:', userError)
      // Se não conseguir buscar o usuário, usar fallback simples
      const posts = await this.getFallbackPosts((page - 1) * limit, limit)
      return {
        data: posts,
        hasMore: posts.length === limit,
        nextPage: page + 1,
        total: posts.length
      }
    }

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    // Buscar posts com scores calculados
    const posts = await this.getPostsWithScores(userProfile, page, limit)

    return {
      data: posts,
      hasMore: posts.length === limit,
      nextPage: page + 1,
      total: posts.length
    }
  }

  /**
   * Busca posts seguidos pelo usuário (com cache)
   */
  async getFollowingFeed(userId: string, page: number = 1, limit: number = 20): Promise<TimelineFeedResult> {
    try {
      // Try cache first
      const cached = await TimelineCacheService.getTimelineFeed(userId, 'following', page)
      if (cached) {
        return cached
      }

      // Generate fresh data - get posts from users the current user follows
      const posts = await this.getFollowingPosts(userId, (page - 1) * limit, limit)
      const freshData = {
        data: posts,
        hasMore: posts.length === limit,
        nextPage: page + 1,
        total: posts.length
      }

      // Cache result
      await TimelineCacheService.setTimelineFeed(userId, 'following', page, freshData)

      return {
        ...freshData,
        cacheHit: false
      }
    } catch (error) {
      console.error('Error in getFollowingFeed:', error)
      return {
        data: [],
        hasMore: false,
        nextPage: page + 1,
        total: 0,
        cacheHit: false
      }
    }
  }

  /**
   * Busca posts para explorar com filtros (com cache)
   */
  async getExploreFeed(userId: string, page: number = 1, limit: number = 20): Promise<TimelineFeedResult> {
    try {
      // Try cache first
      const cached = await TimelineCacheService.getTimelineFeed(userId, 'explore', page)
      if (cached) {
        return cached
      }

      // Generate fresh data - get trending/popular posts
      const posts = await this.getExplorePosts(userId, (page - 1) * limit, limit)
      const freshData = {
        data: posts,
        hasMore: posts.length === limit,
        nextPage: page + 1,
        total: posts.length
      }

      // Cache result
      await TimelineCacheService.setTimelineFeed(userId, 'explore', page, freshData)

      return {
        ...freshData,
        cacheHit: false
      }
    } catch (error) {
      console.error('Error in getExploreFeed:', error)
      return {
        data: [],
        hasMore: false,
        nextPage: page + 1,
        total: 0,
        cacheHit: false
      }
    }
  }

  /**
   * Busca posts com scores calculados baseados no algoritmo
   */
  private async getPostsWithScores(userProfile: any, page: number, limit: number) {
    const offset = (page - 1) * limit

    // Por enquanto, usar sempre o fallback até implementarmos a função RPC
    return this.getFallbackPosts(offset, limit)
  }

  /**
   * Fallback para posts simples ordenados por data
   */
  private async getFallbackPosts(offset: number, limit: number) {
    try {
      // Tentar query simples para verificar se a tabela existe
      const { data: posts, error } = await this.supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          likes_count,
          comments_count,
          shares_count,
          media_urls,
          media_types,
          users (
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        // Se a tabela posts não existir, retornar array vazio
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          return []
        }
        throw error
      }
      
      return posts || []
    } catch (error) {
      console.error('Error fetching posts:', error)
      return []
    }
  }

  /**
   * Calcula distância entre duas coordenadas (em km)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  /**
   * Calcula score de compatibilidade entre interesses
   */
  private calculateInterestScore(userInterests: AdultInterest[], postUserInterests: AdultInterest[]): number {
    if (!userInterests?.length || !postUserInterests?.length) return 0
    
    const commonInterests = userInterests.filter(interest => 
      postUserInterests.includes(interest)
    )
    
    return commonInterests.length / Math.max(userInterests.length, postUserInterests.length)
  }

  /**
   * Get posts from users that the current user follows
   */
  private async getFollowingPosts(userId: string, offset: number, limit: number) {
    try {
      // First get the list of users that current user follows
      const { data: connections, error: connError } = await this.supabase
        .from('user_connections')
        .select('connected_user_id')
        .eq('user_id', userId)

      if (connError || !connections || connections.length === 0) {
        // If no connections, return empty array
        return []
      }

      const followingIds = connections.map(c => c.connected_user_id)

      // Get posts from followed users
      const { data: posts, error } = await this.supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          likes_count,
          comments_count,
          shares_count,
          media_urls,
          media_types,
          users (
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching following posts:', error)
        return []
      }

      return posts?.map(post => ({
        ...post,
        user: post.users,
        users: undefined
      })) || []
    } catch (error) {
      console.error('Error in getFollowingPosts:', error)
      return []
    }
  }

  /**
   * Get explore posts (trending, popular, etc)
   */
  private async getExplorePosts(userId: string, offset: number, limit: number) {
    try {
      // Get posts ordered by engagement (likes + comments)
      const { data: posts, error } = await this.supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          likes_count,
          comments_count,
          shares_count,
          media_urls,
          media_types,
          users (
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .neq('user_id', userId) // Don't show user's own posts in explore
        .order('likes_count', { ascending: false })
        .order('comments_count', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching explore posts:', error)
        return []
      }

      return posts?.map(post => ({
        ...post,
        user: post.users,
        users: undefined
      })) || []
    } catch (error) {
      console.error('Error in getExplorePosts:', error)
      return []
    }
  }
}

export const feedAlgorithmService = new FeedAlgorithmService()