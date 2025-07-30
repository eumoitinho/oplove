import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"

const createPostSchema = z.object({
  content: z.string().min(1).max(500),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(["image", "video"]),
  })).optional(),
  visibility: z.enum(["public", "followers", "private"]).default("public"),
})

// GET /api/v1/posts - List posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const userId = searchParams.get("userId")
    const following = searchParams.get("following") === "true"

    const supabase = createServerClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
      .from("posts")
      .select(`
        *,
        user:users(id, username, name, avatar_url, premium_type, is_verified),
        likes:post_likes(count),
        comments:post_comments(count)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)
      .offset(offset)

    // Filter by user if specified
    if (userId) {
      query = query.eq("user_id", userId)
    }

    // Filter by following if specified
    if (following && user) {
      const { data: followingUsers } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id)

      const followingIds = followingUsers?.map(f => f.following_id) || []
      query = query.in("user_id", [...followingIds, user.id])
    }

    // Filter by visibility
    if (!user) {
      query = query.eq("visibility", "public")
    } else {
      query = query.or(`visibility.eq.public,user_id.eq.${user.id}`)
    }

    const { data: posts, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Format response
    const formattedPosts = posts?.map((post: { is_liked: any[]; likes: { count: any }[]; comments: { count: any }[] }) => ({
      ...post,
      is_liked: user ? post.is_liked?.some((like: any) => like.user_id === user.id) : false,
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0,
    }))

    return NextResponse.json({
      data: formattedPosts,
      success: true,
      pagination: {
        limit,
        offset,
        hasMore: posts?.length === limit,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// POST /api/v1/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Get user profile to check plan
    const { data: profile } = await supabase
      .from("users")
      .select("premium_type, is_verified")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado", success: false },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { content, media, visibility } = createPostSchema.parse(body)

    // Check media upload permissions based on plan
    if (media && media.length > 0) {
      if (profile.premium_type === "free") {
        return NextResponse.json(
          { error: "Usuários gratuitos não podem fazer upload de mídia", success: false },
          { status: 403 }
        )
      }

      if (profile.premium_type === "gold" && media.length > 5) {
        return NextResponse.json(
          { error: "Usuários Gold podem fazer upload de até 5 mídias por post", success: false },
          { status: 403 }
        )
      }
    }

    // Create post
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content,
        media: media || [],
        visibility,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        user:users(id, username, name, avatar_url, premium_type, is_verified)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: {
        ...post,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
      },
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