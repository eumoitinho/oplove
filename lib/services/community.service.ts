import { createClient } from "@/app/lib/supabase-browser" 
import type { 
  Community, 
  CommunityMember
} from '@/types/database.types'

// TODO: These types should be added to database.types.ts when tables are available
interface CommunityPost {
  id: string
  community_id: string
  author_id: string
  title: string
  content?: string
  media_url?: string
  created_at: string
  updated_at: string
  likes_count: number
  comments_count: number
}

interface CreateCommunityPostData {
  title: string
  content?: string
  media_url?: string
}

interface CreateCommunityCommentData {
  content: string
  media_url?: string
}

interface CommunityFilters {
  theme?: string
  type?: string
  search?: string
}

interface JoinCommunityResponse {
  success: boolean
  message: string
}

interface CommunityStats {
  members_count: number
  posts_count: number
  active_members_count: number
}

interface CommunityPostComment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
}

export class CommunityService {
  private supabase = createClient()

  /**
   * Get all communities with optional filters
   */
  async getCommunities(filters?: CommunityFilters): Promise<Community[]> {
    try {
      let query = this.supabase
        .from('communities')
        .select('*')
        .order('is_official', { ascending: false })
        .order('members_count', { ascending: false })

      if (filters?.theme) {
        query = query.eq('theme', filters.theme)
      }

      if (filters?.is_official !== undefined) {
        query = query.eq('is_official', filters.is_official)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching communities:', error)
      return []
    }
  }

  /**
   * Get a single community by slug
   */
  async getCommunity(slug: string): Promise<Community | null> {
    try {
      const { data, error } = await this.supabase
        .from('communities')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching community:', error)
      return null
    }
  }

  /**
   * Check if user is a member of a community
   */
  async isMember(communityId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      return !error && !!data
    } catch (error) {
      return false
    }
  }

  /**
   * Get community members
   */
  async getMembers(communityId: string, limit = 20, offset = 0): Promise<CommunityMember[]> {
    try {
      const { data, error } = await this.supabase
        .from('community_members')
        .select(`
          *,
          user:users(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .eq('community_id', communityId)
        .eq('status', 'active')
        .order('role', { ascending: true })
        .order('joined_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching members:', error)
      return []
    }
  }

  /**
   * Join a community
   */
  async joinCommunity(communityId: string, userId: string): Promise<JoinCommunityResponse> {
    try {
      // Check if user is verified (for adult communities)
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('is_verified')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Check if community requires verification
      const { data: communityData, error: communityError } = await this.supabase
        .from('communities')
        .select('requires_verification, name')
        .eq('id', communityId)
        .single()

      if (communityError) throw communityError

      if (communityData.requires_verification && !userData.is_verified) {
        return {
          success: false,
          message: 'Você precisa verificar sua conta para entrar nesta comunidade.'
        }
      }

      // Check if already a member
      const { data: existingMember } = await this.supabase
        .from('community_members')
        .select('id, status')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        if (existingMember.status === 'banned') {
          return {
            success: false,
            message: 'Você foi banido desta comunidade.'
          }
        }
        return {
          success: false,
          message: 'Você já é membro desta comunidade.'
        }
      }

      // Join the community
      const { data: newMember, error: joinError } = await this.supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: userId,
          role: 'member',
          status: 'active'
        })
        .select()
        .single()

      if (joinError) throw joinError

      return {
        success: true,
        message: `Bem-vindo(a) à comunidade ${communityData.name}!`,
        member: newMember
      }
    } catch (error) {
      console.error('Error joining community:', error)
      return {
        success: false,
        message: 'Erro ao entrar na comunidade. Tente novamente.'
      }
    }
  }

  /**
   * Leave a community
   */
  async leaveCommunity(communityId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error leaving community:', error)
      return false
    }
  }

  /**
   * Get community posts
   */
  async getPosts(communityId: string, limit = 20, offset = 0): Promise<CommunityPost[]> {
    try {
      const { data, error } = await this.supabase
        .from('community_posts')
        .select(`
          *,
          user:users(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .eq('community_id', communityId)
        .eq('is_hidden', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Check if current user has liked posts
      if (data && data.length > 0) {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (user) {
          const postIds = data.map(post => post.id)
          const { data: interactions } = await this.supabase
            .from('community_post_interactions')
            .select('post_id, type')
            .in('post_id', postIds)
            .eq('user_id', user.id)

          // Map interactions to posts
          data.forEach(post => {
            const userInteractions = interactions?.filter(i => i.post_id === post.id) || []
            post.has_liked = userInteractions.some(i => i.type === 'like')
            post.has_viewed = userInteractions.some(i => i.type === 'view')
          })
        }
      }

      return data || []
    } catch (error) {
      console.error('Error fetching posts:', error)
      return []
    }
  }

  /**
   * Create a new post in a community
   */
  async createPost(data: CreateCommunityPostData): Promise<CommunityPost | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: post, error } = await this.supabase
        .from('community_posts')
        .insert({
          ...data,
          user_id: user.id
        })
        .select(`
          *,
          user:users(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .single()

      if (error) throw error
      return post
    } catch (error) {
      console.error('Error creating post:', error)
      return null
    }
  }

  /**
   * Like/unlike a post
   */
  async toggleLike(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return false

      // Check if already liked
      const { data: existing } = await this.supabase
        .from('community_post_interactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('type', 'like')
        .single()

      if (existing) {
        // Unlike
        const { error } = await this.supabase
          .from('community_post_interactions')
          .delete()
          .eq('id', existing.id)

        if (error) throw error

        // Update count
        await this.supabase.rpc('decrement_community_post_likes', { post_id: postId })
      } else {
        // Like
        const { error } = await this.supabase
          .from('community_post_interactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            type: 'like'
          })

        if (error) throw error

        // Update count
        await this.supabase.rpc('increment_community_post_likes', { post_id: postId })
      }

      return true
    } catch (error) {
      console.error('Error toggling like:', error)
      return false
    }
  }

  /**
   * Get post comments
   */
  async getComments(postId: string): Promise<CommunityPostComment[]> {
    try {
      const { data, error } = await this.supabase
        .from('community_post_comments')
        .select(`
          *,
          user:users(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .eq('post_id', postId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  }

  /**
   * Create a comment
   */
  async createComment(data: CreateCommunityCommentData): Promise<CommunityPostComment | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: comment, error } = await this.supabase
        .from('community_post_comments')
        .insert({
          ...data,
          user_id: user.id
        })
        .select(`
          *,
          user:users(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .single()

      if (error) throw error

      // Update post comment count
      await this.supabase.rpc('increment_community_post_comments', { post_id: data.post_id })

      return comment
    } catch (error) {
      console.error('Error creating comment:', error)
      return null
    }
  }

  /**
   * Get community statistics
   */
  async getStats(communityId: string): Promise<CommunityStats | null> {
    try {
      // Get basic stats from community
      const { data: community } = await this.supabase
        .from('communities')
        .select('members_count, posts_count')
        .eq('id', communityId)
        .single()

      if (!community) return null

      // Get active members (last 7 days)
      const { count: activeMembers } = await this.supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId)
        .eq('status', 'active')
        .gte('last_activity', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      // Get posts today
      const { count: postsToday } = await this.supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId)
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

      // Get posts this week
      const { count: postsThisWeek } = await this.supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      // Get most active users
      const { data: topUsers } = await this.supabase
        .from('community_members')
        .select(`
          posts_count,
          user:users(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .eq('community_id', communityId)
        .eq('status', 'active')
        .gt('posts_count', 0)
        .order('posts_count', { ascending: false })
        .limit(5)

      return {
        total_members: community.members_count,
        active_members: activeMembers || 0,
        total_posts: community.posts_count,
        posts_today: postsToday || 0,
        posts_this_week: postsThisWeek || 0,
        most_active_users: topUsers?.map(u => ({
          user: u.user as any,
          posts_count: u.posts_count
        })) || []
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      return null
    }
  }

  /**
   * Get user's communities
   */
  async getUserCommunities(userId: string): Promise<Community[]> {
    try {
      const { data, error } = await this.supabase
        .from('community_members')
        .select(`
          community:communities(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false })

      if (error) throw error
      return (data?.flatMap(item => item.community ? [item.community as Community] : []) as Community[]) || []
    } catch (error) {
      console.error('Error fetching user communities:', error)
      return []
    }
  }
}

// Export singleton instance
export const communityService = new CommunityService()