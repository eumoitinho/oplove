import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/auth-utils"

// POST /api/v1/posts/[id]/toggle-like - Toggle like on a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    let isLiked = false
    
    if (existingLike) {
      // Unlike - remove the like
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id)

      if (error) {
        return NextResponse.json(
          { error: error.message, success: false },
          { status: 400 }
        )
      }
      
      isLiked = false
    } else {
      // Like - create the like
      const { error } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })

      if (error) {
        return NextResponse.json(
          { error: error.message, success: false },
          { status: 400 }
        )
      }
      
      isLiked = true

      // Get post author and send notification
      const { data: post } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single()

      // Send notification to post author (if not liking own post)
      if (post && post.user_id !== user.id) {
        await supabase
          .from("notifications")
          .insert({
            recipient_id: post.user_id,
            sender_id: user.id,
            type: "like",
            title: `${user.username || user.name || 'Alguém'} curtiu seu post`,
            content: "Seu post recebeu uma nova curtida!",
            message: "Seu post recebeu uma nova curtida!",
            entity_id: postId,
            entity_type: "post",
            related_data: { post_id: postId },
            created_at: new Date().toISOString()
          })
      }
    }

    // Get updated post with like count
    const { data: post } = await supabase
      .from("posts")
      .select("likes_count")
      .eq("id", postId)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        likes_count: post?.likes_count || 0,
        is_liked: isLiked,
      },
    })
  } catch (error) {
    console.error("[TOGGLE LIKE] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}