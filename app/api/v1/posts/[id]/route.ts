import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"

const updatePostSchema = z.object({
  content: z.string().min(1).max(500).optional(),
  visibility: z.enum(["public", "followers", "private"]).optional(),
})

// GET /api/v1/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: post, error } = await supabase
      .from("posts")
      .select(`
        *,
        user:users(id, username, name, avatar_url, premium_type, is_verified),
        likes:post_likes(count),
        comments:post_comments(count),
        is_liked:post_likes!inner(user_id)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Post não encontrado", success: false },
        { status: 404 }
      )
    }

    // Check visibility permissions
    if (post.visibility !== "public" && (!user || post.user_id !== user.id)) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 403 }
      )
    }

    const formattedPost = {
      ...post,
      is_liked: user ? post.is_liked?.some((like: any) => like.user_id === user.id) : false,
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0,
    }

    return NextResponse.json({
      data: formattedPost,
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/posts/[id] - Update a post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Check if user owns the post
    const { data: existingPost } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (!existingPost || existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, visibility } = updatePostSchema.parse(body)

    const { data: post, error } = await supabase
      .from("posts")
      .update({
        content,
        visibility,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select(`
        *,
        user:users(id, username, name, avatar_url, premium_type, is_verified),
        likes:post_likes(count),
        comments:post_comments(count),
        is_liked:post_likes!inner(user_id)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    const formattedPost = {
      ...post,
      is_liked: post.is_liked?.some((like: any) => like.user_id === user.id),
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0,
    }

    return NextResponse.json({
      data: formattedPost,
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

// DELETE /api/v1/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Check if user owns the post
    const { data: existingPost } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (!existingPost || existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", params.id)

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Post deletado com sucesso",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}