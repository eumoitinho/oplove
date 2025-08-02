import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"

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

// GET /api/v1/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Handle special case for "me"
    const userId = params.id === "me" ? currentUser?.id : params.id

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não encontrado", success: false },
        { status: 404 }
      )
    }

    const { data: user, error } = await supabase
      .from("users")
      .select(`
        *,
        followers:follows!following_id(count),
        following:follows!follower_id(count),
        posts:posts(count),
        is_following:follows!inner(follower_id)
      `)
      .eq("id", userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: "Usuário não encontrado", success: false },
        { status: 404 }
      )
    }

    // Format response
    const formattedUser = {
      ...user,
      followers_count: user.followers?.[0]?.count || 0,
      following_count: user.following?.[0]?.count || 0,
      posts_count: user.posts?.[0]?.count || 0,
      is_following: currentUser 
        ? user.is_following?.some((follow: any) => follow.follower_id === currentUser.id)
        : false,
      is_current_user: currentUser?.id === userId,
    }

    return NextResponse.json({
      data: formattedUser,
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/users/[id] - Update user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Can only update own profile or if "me"
    const userId = params.id === "me" ? user.id : params.id
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