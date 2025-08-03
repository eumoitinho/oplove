import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/app/lib/supabase-server"
import { getCurrentUser } from "@/lib/auth/auth-utils"

// POST /api/v1/posts/[id]/like - Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    const user = await getCurrentUser()
    
    console.log('[Like API] POST request for post:', postId, 'by user:', user?.id)
    
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

    if (existingLike) {
      return NextResponse.json(
        { error: "Post já foi curtido", success: false },
        { status: 400 }
      )
    }

    // Create like
    const { error } = await supabase
      .from("post_likes")
      .insert({
        post_id: postId,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[Like API] Error creating like:', error)
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Get updated post with like count and author info
    const { data: post } = await supabase
      .from("posts")
      .select("likes_count, user_id")
      .eq("id", postId)
      .single()

    // Send notification to post author (if not liking own post)
    if (post && post.user_id !== user.id) {
      console.log('[Like API] Creating notification for post author:', post.user_id)
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          recipient_id: post.user_id,
          sender_id: user.id,
          type: "like",
          title: `${user.username || user.name || 'Alguém'} curtiu seu post`,
          message: "Seu post recebeu uma nova curtida!",
          entity_id: postId,
          entity_type: "post",
          metadata: { post_id: postId },
          created_at: new Date().toISOString()
        })
      
      if (notificationError) {
        console.error('[Like API] Error creating notification:', notificationError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        likes_count: post?.likes_count || 0,
        is_liked: true,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/posts/[id]/like - Unlike a post
export async function DELETE(
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
        is_liked: false,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}