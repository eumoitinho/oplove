import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"

const updateProfileSchema = z.object({
  // Basic info
  name: z.string().min(2).max(50).optional(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  
  // Location
  location: z.string().max(100).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  uf: z.string().length(2).optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  // Profile details
  gender: z.enum(['male', 'female', 'non_binary', 'other', 'prefer_not_say']).optional(),
  profile_type: z.enum(['single', 'couple', 'trans', 'other']).optional(),
  birth_date: z.string().optional(),
  
  // Arrays
  interests: z.array(z.string()).optional(),
  looking_for: z.array(z.string()).optional(),
  relationship_goals: z.array(z.string()).optional(),
  
  // URLs
  website: z.string().url().optional().or(z.literal("")),
  avatar_url: z.string().url().optional(),
  cover_url: z.string().url().optional(),
  
  // Social links
  social_links: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    tiktok: z.string().optional(),
    onlyfans: z.string().optional(),
    privacy: z.string().optional(),
  }).optional(),
  
  // Privacy settings
  privacy_settings: z.object({
    profile_visibility: z.enum(['public', 'friends', 'private']).optional(),
    show_location: z.boolean().optional(),
    show_age: z.boolean().optional(),
    show_last_active: z.boolean().optional(),
    show_online_status: z.boolean().optional(),
    allow_messages: z.enum(['everyone', 'friends', 'nobody']).optional(),
  }).optional(),
  
  // Notification settings
  notification_settings: z.object({
    email_notifications: z.boolean().optional(),
    push_notifications: z.boolean().optional(),
    message_notifications: z.boolean().optional(),
    like_notifications: z.boolean().optional(),
    comment_notifications: z.boolean().optional(),
    follow_notifications: z.boolean().optional(),
    event_notifications: z.boolean().optional(),
  }).optional(),
})

// GET /api/v1/users/[id] - Get user profile with comprehensive data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string  }> }
) {
  try {
    const { id: id } = await params
    const supabase = await createServerClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Handle special case for "me"
    const userId = id === "me" ? currentUser?.id : id

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não encontrado", success: false },
        { status: 404 }
      )
    }

    // Parse query parameters for optional data inclusion
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('include_stats') === 'true'
    const includeRecentPosts = searchParams.get('include_recent_posts') === 'true'
    const includeStories = searchParams.get('include_stories') === 'true'
    const includeSeals = searchParams.get('include_seals') === 'true'

    if (process.env.NODE_ENV === 'development') {
      console.log('[UserProfile API] Fetching profile for user:', userId, {
        includeStats, includeRecentPosts, includeStories, includeSeals
      })
    }

    // Main user profile query - simplified
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (error || !user) {
      console.error('[UserProfile API] User not found:', error)
      return NextResponse.json(
        { error: "Usuário não encontrado", success: false },
        { status: 404 }
      )
    }

    // Base user data formatting
    let formattedUser = {
      ...user,
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
      is_following: false,
      is_current_user: currentUser?.id === userId,
    }

    // Parallel queries for additional data if requested
    const additionalDataQueries: Promise<any>[] = []
    
    if (includeStats) {
      additionalDataQueries.push(
        // User statistics
        Promise.all([
          // Media posts count
          supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .not('media_urls', 'is', null),
          
          // Likes received
          supabase
            .from('post_reactions')
            .select('posts!inner(*)', { count: 'exact', head: true })
            .eq('posts.user_id', userId)
            .eq('reaction_type', 'like'),
          
          // Active stories
          supabase
            .from('stories')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'active')
            .gte('expires_at', new Date().toISOString())
            .then(result => result)
            .catch(() => ({ count: 0 })),
          
          // Profile seals
          supabase
            .from('user_profile_seals')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', userId)
            .then(result => result)
            .catch(() => ({ count: 0 }))
        ]).then(([mediaResult, likesResult, storiesResult, sealsResult]) => ({
          media_posts: mediaResult.count || 0,
          likes_received: likesResult.count || 0,
          active_stories: storiesResult.count || 0,
          profile_seals: sealsResult.count || 0
        }))
      )
    }

    if (includeRecentPosts) {
      additionalDataQueries.push(
        // Recent posts (last 5)
        supabase
          .from('posts')
          .select(`
            id,
            content,
            media_urls,
            media_types,
            created_at,
            likes_count,
            comments_count,
            shares_count
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
          .then(result => ({ recent_posts: result.data || [] }))
      )
    }

    if (includeStories) {
      additionalDataQueries.push(
        // Active stories
        supabase
          .from('stories')
          .select(`
            id,
            media_url,
            media_type,
            created_at,
            expires_at,
            view_count,
            unique_view_count
          `)
          .eq('user_id', userId)
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(10)
          .then(result => ({ active_stories: result.data || [] }))
          .catch(() => ({ active_stories: [] }))
      )
    }

    if (includeSeals) {
      additionalDataQueries.push(
        // Profile seals (last 6)
        supabase
          .from('user_profile_seals')
          .select(`
            id,
            created_at,
            seal:profile_seals(
              id,
              name,
              icon_url,
              description,
              credit_cost
            )
          `)
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false })
          .limit(6)
          .then(result => {
            // Add default values for missing fields
            const seals = result.data?.map(item => ({
              ...item,
              seal: item.seal ? {
                ...item.seal,
                color_hex: '#9333ea',
                rarity: item.seal.credit_cost >= 100 ? 'legendary' :
                        item.seal.credit_cost >= 75 ? 'epic' :
                        item.seal.credit_cost >= 50 ? 'rare' : 'common'
              } : null
            })) || []
            return { profile_seals: seals }
          })
          .catch((error) => {
            console.error('[UserProfile API] Error fetching seals:', error)
            return { profile_seals: [] }
          })
      )
    }

    // Execute additional queries if any were requested
    let additionalData = {}
    if (additionalDataQueries.length > 0) {
      try {
        const results = await Promise.all(additionalDataQueries)
        additionalData = results.reduce((acc, result) => ({ ...acc, ...result }), {})
      } catch (error) {
        console.error('[UserProfile API] Error fetching additional data:', error)
        // Continue with base data if additional queries fail
      }
    }

    // Calculate profile completion percentage
    const profileFields = [
      user.name, user.bio, user.avatar_url, user.location, 
      user.birth_date, user.interests?.length, user.looking_for?.length
    ]
    const completedFields = profileFields.filter(field => 
      field && (Array.isArray(field) ? field.length > 0 : true)
    ).length
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100)

    // Merge all data
    const comprehensiveUser = {
      ...formattedUser,
      ...additionalData,
      profile_completion: profileCompletion,
      last_active: user.last_seen || user.updated_at,
    }

    return NextResponse.json({
      data: comprehensiveUser,
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        includes: {
          stats: includeStats && !!additionalData.media_posts,
          recent_posts: includeRecentPosts && !!additionalData.recent_posts,
          stories: includeStories && !!additionalData.active_stories,
          seals: includeSeals && !!additionalData.profile_seals
        }
      }
    })
  } catch (error) {
    console.error('[UserProfile API] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor", 
        success: false,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0"
        }
      },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/users/[id] - Update user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string  }> }
) {
  try {
    const { id: id } = await params
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Can only update own profile or if "me"
    const userId = id === "me" ? user.id : id
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updates = updateProfileSchema.parse(body)

    // Check if username is being changed
    if (updates.username) {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", updates.username)
        .neq("id", user.id)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: "Nome de usuário já está em uso", success: false },
          { status: 400 }
        )
      }
    }

    // Check if birth_date is being changed and validate age
    if (updates.birth_date) {
      const birthDate = new Date(updates.birth_date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (age < 18) {
        return NextResponse.json(
          { error: "Você deve ter pelo menos 18 anos", success: false },
          { status: 400 }
        )
      }
    }

    // If location is provided with city and state, build location string
    if (updates.city && updates.state && !updates.location) {
      updates.location = `${updates.city}, ${updates.state}`
    }

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: updatedUser,
      success: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}