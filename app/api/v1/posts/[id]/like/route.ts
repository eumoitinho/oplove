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

    let isLiked = false
    let likesCount = 0

    if (existingLike) {
      // Unlike - remove existing like
      console.log('[Like API] Unlike - removing existing like')
      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("id", existingLike.id)

      if (deleteError) {
        console.error('[Like API] Error removing like:', deleteError)
        return NextResponse.json(
          { error: deleteError.message, success: false },
          { status: 400 }
        )
      }
      isLiked = false
    } else {
      // Like - create new like
      console.log('[Like API] Like - creating new like')
      const { error: insertError } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('[Like API] Error creating like:', insertError)
        // Check if it's a duplicate key error (race condition)
        if (insertError.code === '23505') {
          return NextResponse.json(
            { error: "Conflito de concorrência, tente novamente", success: false },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { error: insertError.message, success: false },
          { status: 400 }
        )
      }
      isLiked = true
    }

    // Get updated post with like count and author info
    const { data: post } = await supabase
      .from("posts")
      .select("likes_count, user_id")
      .eq("id", postId)
      .single()

    // Send notification to post author (only if liking, not unliking, and not own post)
    let isMutualLike = false
    let mutualUserData = null
    
    if (post && post.user_id !== user.id && isLiked) {
      console.log('[Like API] Creating notification for post author:', post.user_id)
      
      // Get username of the user who liked
      const { data: likerUser } = await supabase
        .from("users")
        .select("username, name")
        .eq("id", user.id)
        .single()
      
      // Check for mutual like - does the post author like any of this user's posts?
      const { data: mutualLikes } = await supabase
        .from("post_likes")
        .select("id")
        .eq("user_id", post.user_id)
        .in("post_id", 
          supabase
            .from("posts")
            .select("id")
            .eq("user_id", user.id)
        )
        .limit(1)
      
      if (mutualLikes && mutualLikes.length > 0) {
        isMutualLike = true
        
        // Get post author's info for mutual like notification
        const { data: postAuthor } = await supabase
          .from("users")
          .select("id, username, name")
          .eq("id", post.user_id)
          .single()
        
        mutualUserData = postAuthor
      }
      
      // Create notification with proper format
      const notificationTitle = `${likerUser?.username || 'Alguém'} curtiu sua foto`
      const notificationMessage = isMutualLike 
        ? `${likerUser?.username || 'Alguém'} também curtiu você! 💕 Que tal mandar uma mensagem?`
        : `${likerUser?.username || 'Alguém'} curtiu sua foto`
      
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          recipient_id: post.user_id,
          sender_id: user.id,
          type: isMutualLike ? "mutual_like" : "like",
          title: notificationTitle,
          message: notificationMessage,
          content: notificationMessage, // Use content field for new format
          entity_id: postId,
          entity_type: "post",
          is_read: false,
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
        is_liked: isLiked,
        action: isLiked ? 'liked' : 'unliked',
        mutual_like: isMutualLike,
        mutual_user: mutualUserData?.username,
        mutual_user_id: mutualUserData?.id
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