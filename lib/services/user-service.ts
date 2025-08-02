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

  // Update user profile using API for better validation
  static async updateUserProfile(
    userId: string, 
    updates: Partial<User>
  ): Promise<{ data: User | null; error: string | null }> {
    try {
      // Use the API endpoint for proper validation
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error updating user profile:', result.error)
        return { data: null, error: result.error || 'Erro ao atualizar perfil' }
      }

      return { data: result.data as User, error: null }
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
      views?: number
      seals?: number
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

      // Get followers count
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)

      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)

      // Get total likes received (from post_reactions table)
      const { count: likesCount, error: likesError } = await supabase
        .from('post_reactions')
        .select('posts!inner(*)', { count: 'exact', head: true })
        .eq('posts.user_id', userId)
        .eq('reaction_type', 'like')

      // Get profile seals count
      const { count: sealsCount, error: sealsError } = await supabase
        .from('user_profile_seals')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)

      return {
        data: {
          posts: postsCount || 0,
          followers: followersCount || 0,
          following: followingCount || 0,
          likes: likesCount || 0,
          seals: sealsCount || 0
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

  // Get user's profile seals
  static async getUserSeals(userId: string): Promise<{
    data: {
      seals: any[]
      totalSeals: number
      displayedSeals: number
    } | null
    error: string | null
  }> {
    try {
      const response = await fetch(`/api/v1/users/${userId}/seals`)
      
      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: errorData.error || 'Erro ao buscar seals' }
      }
      
      const result = await response.json()
      return { data: result.data, error: null }
    } catch (error) {
      console.error('Error in getUserSeals:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Get user verification status
  static async getUserVerificationStatus(userId: string): Promise<{
    data: {
      isVerified: boolean
      verificationStatus?: 'pending' | 'approved' | 'rejected' | 'manual_review'
      canVerify: boolean
      submittedAt?: string
    } | null
    error: string | null
  }> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('is_verified')
        .eq('id', userId)
        .single()

      if (userError) {
        return { data: null, error: userError.message }
      }

      // Check verification records
      const { data: verification, error: verificationError } = await supabase
        .from('user_verifications')
        .select('status, submitted_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const canVerify = !user.is_verified && (!verification || verification.status === 'rejected')

      return {
        data: {
          isVerified: user.is_verified,
          verificationStatus: verification?.status,
          canVerify,
          submittedAt: verification?.submitted_at
        },
        error: null
      }
    } catch (error) {
      console.error('Error in getUserVerificationStatus:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Get user's media posts (photos/videos only)
  static async getUserMedia(userId: string, mediaType?: 'photo' | 'video', limit: number = 20): Promise<{
    data: any[] | null
    error: string | null
  }> {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          media_urls,
          media_types,
          created_at,
          like_count,
          comment_count
        `)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .not('media_urls', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      // Filter by media type if specified
      if (mediaType) {
        if (mediaType === 'photo') {
          query = query.contains('media_types', ['image'])
        } else if (mediaType === 'video') {
          query = query.contains('media_types', ['video'])
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching user media:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in getUserMedia:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Get user statistics (posts, followers, etc.)
  static async getUserStats(userId: string): Promise<{
    data: {
      posts: number
      followers: number
      following: number
      likes: number
      seals: number
    } | null
    error: string | null
  }> {
    try {
      const [
        postsCountResult,
        followersCountResult,
        followingCountResult,
        likesCountResult,
        sealsCountResult
      ] = await Promise.all([
        // Count posts
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        
        // Count followers
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),
        
        // Count following
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId),
        
        // Count total likes received
        supabase
          .from('post_likes')
          .select('posts!inner(user_id)', { count: 'exact', head: true })
          .eq('posts.user_id', userId),
        
        // Count profile seals received
        supabase
          .from('user_profile_seals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
      ])

      return {
        data: {
          posts: postsCountResult.count || 0,
          followers: followersCountResult.count || 0,
          following: followingCountResult.count || 0,
          likes: likesCountResult.count || 0,
          seals: sealsCountResult.count || 0
        },
        error: null
      }
    } catch (error) {
      console.error('Error in getUserStats:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Get user interests
  static async getUserInterests(userId: string): Promise<{
    data: string[] | null
    error: string | null
  }> {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching user interests:', error)
        return { data: null, error: error.message }
      }

      return { data: data?.map(item => item.interest) || [], error: null }
    } catch (error) {
      console.error('Error in getUserInterests:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Get user verification status
  static async getUserVerificationStatus(userId: string): Promise<{
    data: { is_verified: boolean; verification_pending?: boolean } | null
    error: string | null
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_verified')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching verification status:', error)
        return { data: null, error: error.message }
      }

      // Check if there's a pending verification
      const { data: verificationData } = await supabase
        .from('user_verifications')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single()

      return {
        data: {
          is_verified: data.is_verified || false,
          verification_pending: !!verificationData
        },
        error: null
      }
    } catch (error) {
      console.error('Error in getUserVerificationStatus:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Get user's stories (current active stories)
  static async getUserStories(userId: string): Promise<{
    data: any[] | null
    error: string | null
  }> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          media_url,
          media_type,
          caption,
          created_at,
          expires_at,
          view_count
        `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user stories:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in getUserStories:', error)
      return { data: null, error: (error as Error).message }
    }
  }
}