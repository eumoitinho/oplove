import { createClient } from '@/app/lib/supabase-browser'
import type { User } from '@/types/common'

const supabase = createClient()

export class UserService {
  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return { data: null, error: error.message }
      }

      return { data: data as User, error: null }
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string, 
    updates: Partial<Pick<User, 'bio' | 'location' | 'website' | 'avatar_url' | 'name'>>
  ): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return { data: null, error: error.message }
      }

      return { data: data as User, error: null }
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Upload avatar to Supabase Storage
  static async uploadAvatar(userId: string, file: File): Promise<{ data: string | null; error: string | null }> {
    try {
      const { StorageService } = await import('./storage.service')
      
      const result = await StorageService.uploadFile({
        userId,
        file,
        type: 'avatar',
        isServer: false
      })

      if (result.error) {
        return { data: null, error: result.error }
      }

      return { data: result.url, error: null }
    } catch (error) {
      console.error('Error in uploadAvatar:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Upload cover image to Supabase Storage
  static async uploadCover(userId: string, file: File): Promise<{ data: string | null; error: string | null }> {
    try {
      const { StorageService } = await import('./storage.service')
      
      const result = await StorageService.uploadFile({
        userId,
        file,
        type: 'cover',
        isServer: false
      })

      if (result.error) {
        return { data: null, error: result.error }
      }

      return { data: result.url, error: null }
    } catch (error) {
      console.error('Error in uploadCover:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Get user stats (posts, followers, etc.)
  static async getUserStats(userId: string): Promise<{
    data: {
      posts: number
      followers: number
      following: number
      likes: number
    } | null
    error: string | null
  }> {
    try {
      // Get posts count
      const { count: postsCount, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false)

      if (postsError) {
        console.error('Error fetching posts count:', postsError)
        return { data: null, error: postsError.message }
      }

      // TODO: Implement followers/following/likes count queries when those tables exist
      // For now, return mock data for non-posts stats
      return {
        data: {
          posts: postsCount || 0,
          followers: 0, // TODO: Get from follows table
          following: 0, // TODO: Get from follows table  
          likes: 0      // TODO: Get from post_likes table
        },
        error: null
      }
    } catch (error) {
      console.error('Error in getUserStats:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Get user posts
  static async getUserPosts(userId: string, limit: number = 10, offset: number = 0): Promise<{
    data: any[] | null
    error: string | null
  }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(*)
        `)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching user posts:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in getUserPosts:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Get user interests (from user_interests table if it exists)
  static async getUserInterests(userId: string): Promise<{
    data: string[] | null
    error: string | null
  }> {
    try {
      // TODO: Implement when user_interests table is created
      // For now return empty array
      return { data: [], error: null }
    } catch (error) {
      console.error('Error in getUserInterests:', error)
      return { data: null, error: (error as Error).message }
    }
  }
}