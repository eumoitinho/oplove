import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/v1/posts/[id]/details - Get post with all details including comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get post with user info
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(`
        *,
        user:users(id, username, full_name, name, avatar_url, premium_type, is_verified, location)
      `)
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post não encontrado", success: false },
        { status: 404 }
      )
    }

    // Get likes
    const { data: likes } = await supabase
      .from("post_likes")
      .select(`
        id,
        user_id,
        created_at,
        user:users(id, username, name, avatar_url)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false })

    // Get comments
    const { data: comments } = await supabase
      .from("post_comments")
      .select(`
        id,
        content,
        created_at,
        user_id,
        user:users(id, username, name, avatar_url)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false })

    // Check if user liked this post
    const isLiked = user && likes?.some(like => like.user_id === user.id)

    // Format response
    const formattedPost = {
      ...post,
      media_urls: post.media_urls || [],
      is_liked: isLiked,
      is_saved: false,
      likes_count: post.likes_count || likes?.length || 0,
      comments_count: post.comments_count || comments?.length || 0,
      shares_count: post.shares_count || 0,
      saves_count: post.saves_count || 0,
      likes: likes || [],
      comments: comments || [],
    }

    return NextResponse.json({
      success: true,
      data: formattedPost,
    })
  } catch (error) {
    console.error("[GET POST DETAILS] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}