import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/app/lib/supabase-server"
import { getCurrentUser } from "@/lib/auth/auth-utils"
import { z } from "zod"

const repostSchema = z.object({
  comment: z.string().max(280).nullable().optional()
})

// POST /api/v1/posts/[id]/repost - Repost a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    const user = await getCurrentUser()
    
    console.log('[Repost API] POST request for post:', postId, 'by user:', user?.id)
    
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { comment } = repostSchema.parse(body)

    // Check if user already reposted this post
    const { data: existingRepost } = await supabase
      .from("post_reposts")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (existingRepost) {
      return NextResponse.json(
        { error: "Você já repostou este post", success: false },
        { status: 400 }
      )
    }

    // Get original post data
    const { data: originalPost } = await supabase
      .from("posts")
      .select("user_id, content")
      .eq("id", postId)
      .single()

    if (!originalPost) {
      return NextResponse.json(
        { error: "Post não encontrado", success: false },
        { status: 404 }
      )
    }

    // Create repost
    const { data: repost, error: repostError } = await supabase
      .from("post_reposts")
      .insert({
        post_id: postId,
        user_id: user.id,
        comment: comment,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (repostError) {
      console.error('[Repost API] Error creating repost:', repostError)
      return NextResponse.json(
        { error: repostError.message, success: false },
        { status: 400 }
      )
    }

    // Update repost count on original post
    const { error: updateError } = await supabase
      .rpc('increment_post_shares', { post_id: postId })

    if (updateError) {
      console.error('[Repost API] Error updating share count:', updateError)
    }

    // Send notification to original post author (if not reposting own post)
    if (originalPost.user_id !== user.id) {
      // Get username of the reposter
      const { data: reposterUser } = await supabase
        .from("users")
        .select("username, name")
        .eq("id", user.id)
        .single()
      
      const username = reposterUser?.username || reposterUser?.name || 'Alguém'
      const notificationMessage = `${username} repostou sua publicação`
      
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          recipient_id: originalPost.user_id,
          sender_id: user.id,
          type: "repost",
          title: notificationMessage,
          content: notificationMessage,
          message: notificationMessage, // For backward compatibility
          entity_id: postId,
          entity_type: "post",
          created_at: new Date().toISOString()
        })
      
      if (notificationError) {
        console.error('[Repost API] Error creating notification:', notificationError)
      }
    }

    // Get updated post with share count
    const { data: updatedPost } = await supabase
      .from("posts")
      .select("shares_count")
      .eq("id", postId)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        repost_id: repost.id,
        shares_count: updatedPost?.shares_count || 0,
        is_reposted: true
      }
    })
  } catch (error: any) {
    console.error('[Repost API] Error:', error)
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/posts/[id]/repost - Remove repost
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

    // Delete repost
    const { error } = await supabase
      .from("post_reposts")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Update repost count
    await supabase.rpc('decrement_post_shares', { post_id: postId })

    // Get updated post with share count
    const { data: post } = await supabase
      .from("posts")
      .select("shares_count")
      .eq("id", postId)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        shares_count: post?.shares_count || 0,
        is_reposted: false
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// GET /api/v1/posts/[id]/repost - Check if user reposted
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({
        success: true,
        data: { is_reposted: false }
      })
    }

    const { data: repost } = await supabase
      .from("post_reposts")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    return NextResponse.json({
      success: true,
      data: { is_reposted: !!repost }
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}