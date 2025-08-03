import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/app/lib/supabase-server"

const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
})

// GET /api/v1/posts/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const supabase = await createServerClient()
    
    console.log('[Comments API GET] Fetching comments for post:', postId)

    // First try a simple query to see if the table exists
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[Comments API GET] Error fetching comments:', error)
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }
    
    console.log('[Comments API GET] Found comments:', comments?.length || 0)
    if (comments && comments.length > 0) {
      console.log('[Comments API GET] First comment:', JSON.stringify(comments[0], null, 2))
    }

    // If we have comments, get user data separately
    let formattedComments = comments || []
    if (comments && comments.length > 0) {
      const userIds = [...new Set(comments.map(c => c.user_id))]
      const { data: users } = await supabase
        .from("users")
        .select("id, username, name, avatar_url, premium_type, is_verified")
        .in("id", userIds)
      
      const usersMap = new Map(users?.map(u => [u.id, u]) || [])
      
      formattedComments = comments.map(comment => ({
        ...comment,
        user: usersMap.get(comment.user_id) || null
      }))
    }

    return NextResponse.json({
      data: formattedComments,
      success: true,
      pagination: {
        limit,
        offset,
        hasMore: comments?.length === limit,
      },
    })
  } catch (error) {
    console.error('[Comments API GET] Unexpected error:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// POST /api/v1/posts/[id]/comments - Add a comment to a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = createCommentSchema.parse(body)

    console.log('[Comments API POST] Creating comment for post:', postId, 'by user:', user.id)
    
    // Create comment
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single()

    if (error) {
      console.error('[Comments API POST] Error creating comment:', error)
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }
    
    console.log('[Comments API POST] Comment created:', comment?.id)

    // Get post author to send notification
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single()

    // Send notification to post author (if not commenting on own post)
    if (post && post.user_id !== user.id) {
      console.log('[Comments API] Creating notification for post author:', post.user_id)
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          recipient_id: post.user_id,
          sender_id: user.id,
          type: "comment",
          title: `Novo comentário`,
          content: `${user.email?.split('@')[0] || 'Alguém'} comentou no seu post`,
          message: `${user.email?.split('@')[0] || 'Alguém'} comentou no seu post`,
          entity_id: postId,
          entity_type: "post",
          related_data: JSON.stringify({ 
            post_id: postId, 
            comment_id: comment?.id, 
            comment_content: content.substring(0, 100) 
          }),
          created_at: new Date().toISOString()
        })
      
      if (notificationError) {
        console.error('[Comments API] Error creating notification:', notificationError)
      }
    }

    // Get user data for the comment
    let formattedComment = comment
    if (comment) {
      const { data: userData } = await supabase
        .from("users")
        .select("id, username, name, avatar_url, premium_type, is_verified")
        .eq("id", user.id)
        .single()
      
      formattedComment = {
        ...comment,
        user: userData || null
      }
    }

    return NextResponse.json({
      data: formattedComment,
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