import { createClient } from '@/app/lib/supabase-browser'
import type { Post } from '@/types/common'
import type { UserProfile, FeedAlgorithmWeights, AdultInterest, LocationData } from '@/types/adult'
import { TimelineCacheService, type TimelineFeedResult } from '@/lib/cache/timeline-cache'

class FeedAlgorithmService {
  private supabase = createClient()
  
  // Pesos do algoritmo (soma = 100%)
  private weights: FeedAlgorithmWeights = {
    location: 0.40,  // 40% baseado em localização - TODOS da região aparecem
    interests: 0.15, // 15% baseado em compatibilidade de interesses
    activity: 0.20,  // 20% baseado em engajamento (likes/comentários)
    premium: 0.20,   // 20% baseado em premium
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

      // Check if user follows anyone first
      const { data: connections, error: connError } = await this.supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)
        .limit(1)

      if (connError) {
        console.error('Error checking connections:', connError)
      }

      const isFollowingAnyone = connections && connections.length > 0

      // Generate fresh data - get posts from users the current user follows
      const posts = await this.getFollowingPosts(userId, (page - 1) * limit, limit)
      const freshData = {
        data: posts,
        hasMore: posts.length === limit,
        nextPage: page + 1,
        total: posts.length,
        isFollowingAnyone
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
        cacheHit: false,
        isFollowingAnyone: false
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

    try {
      console.log('🧠 FeedAlgorithm - Generating personalized feed for user:', userProfile.id)
      console.log('📍 User location:', userProfile.location)
      
      // BUSCAR TODOS OS POSTS PÚBLICOS (sem limite de data)
      // Priorizar posts da região, mas incluir todos se necessário
      const { data: allPosts, error } = await this.supabase
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
          visibility,
          users (
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type,
            location,
            interests
          )
        `)
        .eq('visibility', 'public')
        .neq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(500) // Buscar mais posts para ter variedade no algoritmo

      if (error) {
        console.error('Error fetching posts for algorithm:', error)
        return this.getFallbackPosts(offset, limit)
      }

      if (!allPosts || allPosts.length === 0) {
        console.log('📭 No posts found for algorithm')
        return []
      }

      console.log(`📊 Found ${allPosts.length} posts to analyze`)

      // Aplicar algoritmo melhorado - MOSTRAR TODOS OS POSTS DA REGIÃO
      const postsWithScores = allPosts.map(post => {
        let score = 100 // Score base para garantir que todos apareçam
        
        // 1. LOCALIZAÇÃO - PRIORIDADE MÁXIMA (45% do score)
        let locationScore = 0
        if (userProfile.location?.latitude && userProfile.location?.longitude && 
            post.users?.location?.latitude && post.users?.location?.longitude) {
          const distance = this.calculateDistance(
            userProfile.location.latitude,
            userProfile.location.longitude,
            post.users.location.latitude,
            post.users.location.longitude
          )
          
          // Score baseado na distância - quanto mais perto, maior o score
          if (distance <= 5) {
            locationScore = 100 // Muito perto (mesmo bairro)
          } else if (distance <= 15) {
            locationScore = 80 // Perto (mesma cidade)
          } else if (distance <= 50) {
            locationScore = 60 // Região metropolitana
          } else if (distance <= 100) {
            locationScore = 40 // Estado/região
          } else if (distance <= 300) {
            locationScore = 20 // País
          } else {
            locationScore = 5 // Longe
          }
          
          console.log(`📍 Post ${post.id} distance: ${distance.toFixed(1)}km, location score: ${locationScore}`)
        } else {
          // Posts sem localização recebem score médio para aparecerem também
          locationScore = 30
          console.log(`📍 Post ${post.id} no location data, default score: ${locationScore}`)
        }
        score += locationScore * this.weights.location

        // 2. INTERESSES/COMPATIBILIDADE - se o usuário tem preferências
        let interestScore = 0
        if (userProfile.interests?.length > 0 && post.users?.interests?.length > 0) {
          const compatibility = this.calculateInterestScore(userProfile.interests, post.users.interests)
          interestScore = compatibility * 100
          console.log(`💝 Post ${post.id} interest compatibility: ${(compatibility * 100).toFixed(1)}%`)
        } else {
          // Se não tem interesses definidos, score neutro
          interestScore = 50
        }
        // Usar peso correto para interesses
        score += interestScore * this.weights.interests

        // 3. ENGAJAMENTO (20% do score)
        const engagement = (post.likes_count || 0) + (post.comments_count || 0) * 2 + (post.shares_count || 0) * 3
        const engagementScore = Math.min(100, engagement * 2) // Normalizar engajamento
        score += engagementScore * this.weights.activity

        // 4. PREMIUM STATUS (20% do score)
        let premiumScore = 0
        if (post.users?.premium_type === 'couple') {
          premiumScore = 100
        } else if (post.users?.premium_type === 'diamond') {
          premiumScore = 80
        } else if (post.users?.premium_type === 'gold') {
          premiumScore = 60
        } else {
          premiumScore = 20 // Free users também aparecem
        }
        score += premiumScore * this.weights.premium

        // 5. VERIFICAÇÃO (5% do score)
        const verificationScore = post.users?.is_verified ? 100 : 0
        score += verificationScore * this.weights.verification

        // 6. FATOR TEMPO - posts mais recentes têm pequeno boost
        const hoursAgo = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60)
        const recencyScore = Math.max(0, 100 * (1 - hoursAgo / (24 * 30))) // Decay over 30 days
        score += recencyScore * 0.05 // 5% para recência

        const finalScore = Math.round(score)
        console.log(`📊 Post ${post.id} final score: ${finalScore} (location: ${locationScore}, engagement: ${engagementScore}, premium: ${premiumScore})`)

        return { ...post, algorithm_score: finalScore, distance: locationScore > 30 ? this.calculateDistance(
          userProfile.location?.latitude || 0,
          userProfile.location?.longitude || 0,
          post.users?.location?.latitude || 0,
          post.users?.location?.longitude || 0
        ) : 999 }
      })

      // Ordenar por score (maior primeiro) + shuffle posts com score similar para variedade
      postsWithScores.sort((a, b) => {
        // Se a diferença de score é pequena (< 10), adicionar randomização
        const scoreDiff = b.algorithm_score - a.algorithm_score
        if (Math.abs(scoreDiff) < 10) {
          return Math.random() - 0.5 // Random shuffle para posts similares
        }
        return scoreDiff
      })

      console.log(`🎯 Algorithm results - Top 5 scores: ${postsWithScores.slice(0, 5).map(p => p.algorithm_score).join(', ')}`)

      // Aplicar paginação no resultado final
      const paginatedPosts = postsWithScores.slice(offset, offset + limit)
      console.log(`📄 Returning page ${page}: posts ${offset} to ${offset + limit - 1} (${paginatedPosts.length} posts)`)

      // Formatar resposta
      return paginatedPosts.map(post => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        updated_at: post.updated_at,
        user_id: post.user_id,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        shares_count: post.shares_count,
        media_urls: post.media_urls,
        media_types: post.media_types,
        visibility: post.visibility,
        user: {
          id: post.users.id,
          username: post.users.username,
          name: post.users.name,
          avatar_url: post.users.avatar_url,
          is_verified: post.users.is_verified,
          premium_type: post.users.premium_type
        }
      }))

    } catch (error) {
      console.error('Error in getPostsWithScores:', error)
      // Usar fallback em caso de erro
      return this.getFallbackPosts(offset, limit)
    }
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
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)

      if (connError) {
        console.error('Error fetching connections:', connError)
        return []
      }

      if (!connections || connections.length === 0) {
        // If no connections, return empty array with a flag
        console.log(`User ${userId} is not following anyone`)
        return []
      }

      const followingIds = connections.map(c => c.following_id)

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