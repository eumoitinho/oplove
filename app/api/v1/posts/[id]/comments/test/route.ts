import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/app/lib/supabase-server"

// GET /api/v1/posts/[id]/comments/test - Test if comments can be fetched
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    
    console.log('[Comments Test API] Testing post:', postId)
    
    // First, check if post exists
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", postId)
      .single()
    
    if (postError || !post) {
      return NextResponse.json({
        success: false,
        error: "Post not found",
        postId,
        postError: postError?.message
      })
    }
    
    // Then fetch comments
    const { data: comments, error: commentsError, count } = await supabase
      .from("comments")
      .select(`
        *,
        user:users!user_id(
          id,
          username,
          name,
          avatar_url,
          premium_type,
          is_verified
        )
      `, { count: 'exact' })
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
    
    return NextResponse.json({
      success: true,
      postId,
      postExists: true,
      postOwnerId: post.user_id,
      totalComments: count || 0,
      comments: comments || [],
      error: commentsError?.message
    })
  } catch (error) {
    console.error('[Comments Test API] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}