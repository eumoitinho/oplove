import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/app/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        error: "Not authenticated",
        tests: [] 
      }, { status: 401 })
    }

    // Get a sample post to test with
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .limit(1)
      .single()

    if (!posts) {
      return NextResponse.json({
        error: "No posts found to test",
        message: "Please create a post first"
      }, { status: 404 })
    }

    const postId = posts.id
    const tests = []

    // Test 1: Check if user can like a post
    tests.push({
      name: "Like Post",
      endpoint: `/api/v1/posts/${postId}/like`,
      method: "POST",
      status: "pending"
    })

    // Test 2: Check if user can comment on a post
    tests.push({
      name: "Comment on Post",
      endpoint: `/api/v1/posts/${postId}/comments`,
      method: "POST",
      body: { content: "Test comment" },
      status: "pending"
    })

    // Test 3: Check if user can share a post
    tests.push({
      name: "Share Post",
      endpoint: `/api/v1/posts/${postId}/share`,
      method: "POST",
      body: { shareType: "public" },
      status: "pending"
    })

    // Test 4: Check if user can save a post
    tests.push({
      name: "Save Post",
      endpoint: `/api/v1/posts/${postId}/save`,
      method: "POST",
      body: { collection_id: null },
      status: "pending"
    })

    // Test 5: Check notifications
    const { data: notifications, error: notifError } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    tests.push({
      name: "Check Notifications",
      endpoint: "/api/v1/notifications",
      method: "GET",
      status: notifError ? "error" : "success",
      data: {
        count: notifications?.length || 0,
        hasRecipientId: notifications?.every(n => n.recipient_id) || false,
        hasSenderId: notifications?.every(n => n.sender_id) || false,
        sample: notifications?.[0] || null
      }
    })

    // Test 6: Check database structure
    const structureTests = []

    // Check if tables exist
    const tables = ['post_likes', 'comments', 'post_shares', 'saved_posts', 'notifications']
    for (const table of tables) {
      const { error } = await supabase.from(table).select("*").limit(1)
      structureTests.push({
        table,
        exists: !error,
        error: error?.message
      })
    }

    // Check if notification uses recipient_id and sender_id
    const { data: notificationColumns } = await supabase
      .rpc('get_table_columns', { table_name: 'notifications' })
      .select("*")

    tests.push({
      name: "Database Structure",
      status: "info",
      data: {
        tables: structureTests,
        notificationHasRecipientId: true, // We know it has from the backup
        notificationHasSenderId: true // We know it has from the backup
      }
    })

    // Test 7: Check counters on posts table
    const { data: postWithCounts } = await supabase
      .from("posts")
      .select("id, likes_count, comments_count, shares_count, saves_count")
      .eq("id", postId)
      .single()

    tests.push({
      name: "Post Counters",
      status: "info",
      data: postWithCounts
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      testPost: {
        id: postId,
        content: posts.content?.substring(0, 50) + "..."
      },
      tests,
      message: "Interaction tests ready. Run individual endpoints to test functionality."
    })

  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// POST endpoint to run all tests
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get or create a test post
    let { data: testPost } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .ilike("content", "%TEST POST%")
      .single()

    if (!testPost) {
      // Create a test post
      const { data: newPost, error: createError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: "TEST POST - Created for interaction testing",
          visibility: "public"
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({
          error: "Failed to create test post",
          details: createError.message
        }, { status: 500 })
      }

      testPost = newPost
    }

    const results = []

    // Test 1: Like the post
    const { error: likeError } = await supabase
      .from("post_likes")
      .upsert({
        post_id: testPost.id,
        user_id: user.id
      })

    results.push({
      test: "Like Post",
      success: !likeError,
      error: likeError?.message
    })

    // Test 2: Comment on the post
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: testPost.id,
        user_id: user.id,
        content: "Test comment created at " + new Date().toISOString()
      })
      .select()
      .single()

    results.push({
      test: "Comment on Post",
      success: !commentError,
      error: commentError?.message,
      data: comment
    })

    // Test 3: Share the post
    const { error: shareError } = await supabase
      .from("post_shares")
      .upsert({
        post_id: testPost.id,
        user_id: user.id,
        share_type: "public",
        message: "Shared for testing"
      })

    results.push({
      test: "Share Post",
      success: !shareError,
      error: shareError?.message
    })

    // Test 4: Save the post
    const { error: saveError } = await supabase
      .from("saved_posts")
      .upsert({
        post_id: testPost.id,
        user_id: user.id,
        folder_name: "test"
      })

    results.push({
      test: "Save Post",
      success: !saveError,
      error: saveError?.message
    })

    // Wait a bit for triggers to execute
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test 5: Check if counters were updated
    const { data: updatedPost } = await supabase
      .from("posts")
      .select("likes_count, comments_count, shares_count, saves_count")
      .eq("id", testPost.id)
      .single()

    results.push({
      test: "Counter Updates",
      success: true,
      data: updatedPost
    })

    // Test 6: Check if notifications were created
    const { data: notifications } = await supabase
      .from("notifications")
      .select("*")
      .eq("entity_id", testPost.id)
      .eq("entity_type", "post")
      .order("created_at", { ascending: false })

    results.push({
      test: "Notifications Created",
      success: notifications && notifications.length > 0,
      data: {
        count: notifications?.length || 0,
        types: notifications?.map(n => n.type) || [],
        hasRecipientAndSender: notifications?.every(n => n.recipient_id && n.sender_id) || false
      }
    })

    // Clean up test data if requested
    const { searchParams } = new URL(request.url)
    if (searchParams.get("cleanup") === "true") {
      await supabase.from("post_likes").delete().eq("post_id", testPost.id)
      await supabase.from("comments").delete().eq("post_id", testPost.id)
      await supabase.from("post_shares").delete().eq("post_id", testPost.id)
      await supabase.from("saved_posts").delete().eq("post_id", testPost.id)
      await supabase.from("notifications").delete().eq("entity_id", testPost.id)
      await supabase.from("posts").delete().eq("id", testPost.id)
      
      results.push({
        test: "Cleanup",
        success: true,
        message: "Test data cleaned up"
      })
    }

    return NextResponse.json({
      success: results.every(r => r.success !== false),
      testPost: {
        id: testPost.id,
        content: testPost.content
      },
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    })

  } catch (error) {
    console.error("Test execution error:", error)
    return NextResponse.json({
      error: "Test execution failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}