import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

export class UserProfileService {
  private static getSupabaseAdmin() {
    // In server-side code, we need to use a different approach
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    return createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }

  /**
   * Ensures that an authenticated user has a profile in the users table
   * Creates a basic profile if it doesn't exist
   */
  static async ensureUserProfile(authUser: User) {
    const supabaseAdmin = this.getSupabaseAdmin()
    
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email, username, premium_type')
      .eq('id', authUser.id)
      .single()

    if (existingProfile) {
      return { success: true, profile: existingProfile }
    }

    // If not found, create a basic profile
    console.log('[UserProfileService] Creating profile for user:', authUser.id)

    // Extract username from email if not provided
    const emailUsername = authUser.email?.split('@')[0] || 'user'
    const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    const username = `${emailUsername}${randomSuffix}`

    const newProfile = {
      id: authUser.id,
      auth_id: authUser.id,
      email: authUser.email,
      username: username,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || username,
      premium_type: 'free',
      is_verified: false,
      account_type: 'personal',
      created_at: new Date().toISOString(),
      // Optional fields with defaults
      bio: '',
      avatar_url: authUser.user_metadata?.avatar_url || null,
      location: '',
      // Arrays with empty defaults
      interests: [],
      looking_for: [],
      relationship_goals: []
    }

    const { data: createdProfile, error: createError } = await supabaseAdmin
      .from('users')
      .insert(newProfile)
      .select()
      .single()

    if (createError) {
      console.error('[UserProfileService] Error creating profile:', createError)
      return { 
        success: false, 
        error: createError.message,
        code: createError.code 
      }
    }

    console.log('[UserProfileService] Profile created successfully:', createdProfile?.id)
    return { success: true, profile: createdProfile }
  }

  /**
   * Updates user profile data
   */
  static async updateProfile(userId: string, updates: any) {
    const supabaseAdmin = this.getSupabaseAdmin()
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('[UserProfileService] Error updating profile:', error)
      return { success: false, error: error.message }
    }

    return { success: true, profile: data }
  }
}