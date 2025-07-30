import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(160).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
  avatar_url: z.string().url().optional(),
  cover_url: z.string().url().optional(),
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