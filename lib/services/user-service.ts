import { createClient } from '@/app/lib/supabase-browser'
import type { User } from '@/types/common'

const supabase = createClient()

export class UserService {
  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<{ data: User | null; error: string | null }> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[UserService] Fetching user profile for ID:', userId)
      }
      
      // Use the API endpoint for proper data formatting
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      const result = await response.json()
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[UserService] User profile API response:', { 
          success: result.success, 
          hasData: !!result.data,
          error: result.error 
        })
      }

      if (!response.ok || !result.success) {
        console.error('Error fetching user profile from API:', result.error)
        return { data: null, error: result.error || 'Erro ao buscar perfil' }
      }

      return { data: result.data as User, error: null }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('[UserService] Fetching stats for user ID:', userId)
      }
      
      // Use the API endpoint for stats
      const response = await fetch(`/api/v1/users/${userId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[UserService] Received non-JSON response for stats')
        return { 
          data: {
            posts: 0,
            followers: 0,
            following: 0,
            likes: 0,
            views: 0,
            seals: 0
          }, 
          error: null 
        }
      }

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('[UserService] Failed to parse stats JSON:', parseError)
        return { 
          data: {
            posts: 0,
            followers: 0,
            following: 0,
            likes: 0,
            views: 0,
            seals: 0
          }, 
          error: null 
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[UserService] User stats API response:', { 
          success: result.success, 
          stats: result.data,
          error: result.error 
        })
      }

      if (!response.ok || !result.success) {
        console.error('Error fetching user stats from API:', result.error)
        return { data: null, error: result.error || 'Erro ao buscar estatísticas' }
      }

      return { data: result.data, error: null }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('[UserService] Fetching posts for user ID:', userId, 'limit:', limit, 'offset:', offset)
      }
      
      // Use the API endpoint for posts
      const response = await fetch(`/api/v1/users/${userId}/posts?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[UserService] Received non-JSON response, likely an error page')
        return { data: [], error: 'Erro ao carregar posts - resposta inválida' }
      }

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('[UserService] Failed to parse JSON response:', parseError)
        return { data: [], error: 'Erro ao processar resposta do servidor' }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[UserService] User posts API response:', { 
          success: result.success, 
          postsCount: result.data?.length || 0,
          error: result.error 
        })
      }

      if (!response.ok || !result.success) {
        console.error('Error fetching user posts from API:', result.error)
        return { data: null, error: result.error || 'Erro ao buscar posts' }
      }

      return { data: result.data || [], error: null }
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
      const response = await fetch(`/api/v1/users/${userId}/seals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })
      
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
      if (process.env.NODE_ENV === 'development') {
        console.log('[UserService] Fetching media for user ID:', userId, 'type:', mediaType, 'limit:', limit)
      }
      
      // Build query parameters
      const params = new URLSearchParams({ limit: limit.toString() })
      if (mediaType) {
        params.append('type', mediaType)
      }
      
      // Use the API endpoint for media
      const response = await fetch(`/api/v1/users/${userId}/media?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      const result = await response.json()
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[UserService] User media API response:', { 
          success: result.success, 
          mediaCount: result.data?.length || 0,
          error: result.error,
          details: result.details 
        })
      }

      if (!response.ok || !result.success) {
        console.error('Error fetching user media from API:', result.error, 'Details:', result.details)
        return { data: null, error: result.error || 'Erro ao buscar mídia' }
      }

      return { data: result.data || [], error: null }
    } catch (error) {
      console.error('Error in getUserMedia:', error)
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