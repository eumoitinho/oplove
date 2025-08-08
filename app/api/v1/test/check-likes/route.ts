import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/app/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // 1. Check if post_likes table exists and has correct structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { 
        table_schema: 'public',
        table_name: 'post_likes' 
      })
    
    // Alternative: try to select from the table
    const { data: likesTest, error: likesError } = await supabase
      .from("post_likes")
      .select("*")
      .limit(1)

    // 2. Get a test post
    const { data: testPost, error: postError } = await supabase
      .from("posts")
      .select("id, content, user_id, likes_count")
      .limit(1)
      .single()

    if (!testPost) {
      return NextResponse.json({
        error: "No posts available for testing",
        tableCheck: {
          error: likesError?.message,
          canAccess: !likesError
        }
      })
    }

    // 3. Check if user already liked this post
    const { data: existingLike, error: checkError } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", testPost.id)
      .eq("user_id", user.id)
      .maybeSingle() // Use maybeSingle instead of single to avoid error when no rows

    // 4. Try to insert a like (if not already liked)
    let insertResult = null
    if (!existingLike) {
      const { data: newLike, error: insertError } = await supabase
        .from("post_likes")
        .insert({
          post_id: testPost.id,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      insertResult = {
        success: !insertError,
        data: newLike,
        error: insertError?.message,
        errorCode: insertError?.code
      }
    }

    // 5. Check the current likes for this post
    const { data: allLikes, error: allLikesError } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", testPost.id)

    // 6. Check if notifications table is accessible
    const { data: notifTest, error: notifError } = await supabase
      .from("notifications")
      .select("recipient_id, sender_id, type")
      .limit(1)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      testPost: {
        id: testPost.id,
        content: testPost.content?.substring(0, 50),
        user_id: testPost.user_id,
        likes_count: testPost.likes_count,
        isOwnPost: testPost.user_id === user.id
      },
      tableChecks: {
        post_likes: {
          accessible: !likesError,
          error: likesError?.message,
          hasData: likesTest?.length > 0
        },
        notifications: {
          accessible: !notifError,
          error: notifError?.message,
          hasCorrectColumns: !notifError // If accessible, columns exist
        }
      },
      likeCheck: {
        alreadyLiked: !!existingLike,
        existingLike: existingLike,
        checkError: checkError?.message
      },
      insertAttempt: insertResult,
      currentLikes: {
        count: allLikes?.length || 0,
        data: allLikes,
        error: allLikesError?.message
      },
      troubleshooting: {
        hint1: "If insert fails with 23505, it's a duplicate key (already liked)",
        hint2: "If insert fails with 42P01, table doesn't exist",
        hint3: "If insert fails with 42501, RLS policy issue",
        hint4: "Run the migration file: 20250808_fix_post_likes_simple.sql"
      }
    })

  } catch (error) {
    console.error("Check likes error:", error)
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}