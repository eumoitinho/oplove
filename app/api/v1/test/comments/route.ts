import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/app/lib/supabase-server"

// GET /api/v1/test/comments - Test comments endpoint
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get all comments to debug
    const { data: allComments, error: allError } = await supabase
      .from("comments")
      .select("*")
      .limit(10)
      .order("created_at", { ascending: false })
    
    if (allError) {
      console.error('[Test Comments API] Error fetching all comments:', allError)
    }
    
    // Get comments with user data
    const { data: commentsWithUser, error: userError } = await supabase
      .from("comments")
      .select(`
        *,
        user:users!user_id(id, username, name, avatar_url)
      `)
      .limit(5)
      .order("created_at", { ascending: false })
    
    if (userError) {
      console.error('[Test Comments API] Error fetching comments with user:', userError)
    }
    
    // Test specific post comments
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    
    let postComments = null
    let postError = null
    
    if (postId) {
      const result = await supabase
        .from("comments")
        .select(`
          *,
          user:users!user_id(id, username, name, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
      
      postComments = result.data
      postError = result.error
    }
    
    return NextResponse.json({
      success: true,
      data: {
        totalComments: allComments?.length || 0,
        allComments: allComments || [],
        commentsWithUser: commentsWithUser || [],
        postComments: postComments || [],
        postId: postId,
        errors: {
          all: allError?.message,
          withUser: userError?.message,
          post: postError?.message
        }
      }
    })
  } catch (error) {
    console.error('[Test Comments API] Error:', error)
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    )
  }
}