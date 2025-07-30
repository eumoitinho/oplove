import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Post = Database['public']['Tables']['posts']['Row']
type PostLike = Database['public']['Tables']['post_likes']['Row']
type PostComment = Database['public']['Tables']['post_comments']['Row']
type PostShare = Database['public']['Tables']['post_shares']['Row']
type PostSave = Database['public']['Tables']['post_saves']['Row']

export class PostInteractionsService {
  private supabase = createClient()

  // Check if user has liked a post
  async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    return !!data
  }

  // Check if user has saved a post
  async hasUserSaved(postId: string, userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('post_saves')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    return !!data
  }

  // Get post with interaction data for a specific user
  async getPostWithInteractions(postId: string, userId?: string) {
    // First get the post
    const { data: post, error: postError } = await this.supabase
      .from('posts')
      .select(`
        *,
        user:users(
          id,
          username,
          name,
          avatar_url,
          premium_type,
          is_verified,
          location
        )
      `)
      .eq('id', postId)
      .single()

    if (postError || !post) {
      throw new Error('Post not found')
    }

    // If user is logged in, check their interactions
    let userInteractions = {
      is_liked: false,
      is_saved: false,
      is_shared: false
    }

    if (userId) {
      const [liked, saved, shared] = await Promise.all([
        this.hasUserLiked(postId, userId),
        this.hasUserSaved(postId, userId),
        this.supabase
          .from('post_shares')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .single()
          .then(({ data }) => !!data)
      ])

      userInteractions = {
        is_liked: liked,
        is_saved: saved,
        is_shared: shared
      }
    }

    return {
      ...post,
      ...userInteractions
    }
  }

  // Get posts with interaction data for feed
  async getPostsWithInteractions(posts: Post[], userId?: string) {
    if (!posts.length) return []

    const postIds = posts.map(p => p.id)

    // If user is logged in, fetch their interactions in bulk
    let userLikes = new Set<string>()
    let userSaves = new Set<string>()
    let userShares = new Set<string>()

    if (userId) {
      const [likes, saves, shares] = await Promise.all([
        this.supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds),
        this.supabase
          .from('post_saves')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds),
        this.supabase
          .from('post_shares')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds)
      ])

      userLikes = new Set(likes.data?.map(l => l.post_id) || [])
      userSaves = new Set(saves.data?.map(s => s.post_id) || [])
      userShares = new Set(shares.data?.map(s => s.post_id) || [])
    }

    // Map interactions to posts
    return posts.map(post => ({
      ...post,
      is_liked: userLikes.has(post.id),
      is_saved: userSaves.has(post.id),
      is_shared: userShares.has(post.id)
    }))
  }

  // Toggle like
  async toggleLike(postId: string, userId: string) {
    const isLiked = await this.hasUserLiked(postId, userId)

    if (isLiked) {
      // Unlike
      const { error } = await this.supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      if (error) throw error

      return { liked: false }
    } else {
      // Like
      const { error } = await this.supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId
        })

      if (error) throw error

      return { liked: true }
    }
  }

  // Toggle save
  async toggleSave(postId: string, userId: string, collectionId?: string) {
    const isSaved = await this.hasUserSaved(postId, userId)

    if (isSaved) {
      // Unsave
      const { error } = await this.supabase
        .from('post_saves')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      if (error) throw error

      return { saved: false }
    } else {
      // Save
      const { error } = await this.supabase
        .from('post_saves')
        .insert({
          post_id: postId,
          user_id: userId,
          collection_id: collectionId
        })

      if (error) throw error

      return { saved: true }
    }
  }

  // Share post
  async sharePost(postId: string, userId: string, shareType: string = 'public', message?: string) {
    // Check if already shared
    const { data: existingShare } = await this.supabase
      .from('post_shares')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (existingShare) {
      throw new Error('Post already shared')
    }

    const { error } = await this.supabase
      .from('post_shares')
      .insert({
        post_id: postId,
        user_id: userId,
        share_type: shareType,
        message
      })

    if (error) throw error

    return { shared: true }
  }

  // Add comment
  async addComment(postId: string, userId: string, content: string) {
    const { data, error } = await this.supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content
      })
      .select(`
        *,
        user:users(
          id,
          username,
          name,
          avatar_url,
          premium_type,
          is_verified
        )
      `)
      .single()

    if (error) throw error

    return data
  }

  // Get comments
  async getComments(postId: string, limit: number = 20, offset: number = 0) {
    const { data, error, count } = await this.supabase
      .from('post_comments')
      .select(`
        *,
        user:users(
          id,
          username,
          name,
          avatar_url,
          premium_type,
          is_verified
        )
      `, { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      comments: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    }
  }

  // Delete comment
  async deleteComment(commentId: string, userId: string) {
    const { error } = await this.supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId)

    if (error) throw error

    return { deleted: true }
  }
}

// Export singleton instance
export const postInteractionsService = new PostInteractionsService()