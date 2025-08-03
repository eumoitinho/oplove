import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/v1/posts/with-comments - Get posts with comments included
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // First get posts
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        *,
        user:users(id, username, full_name, name, avatar_url, premium_type, is_verified, location)
      `)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(limit)
      .offset(offset)

    if (postsError) {
      console.error("[GET POSTS WITH COMMENTS] Posts error:", postsError)
      return NextResponse.json({ error: postsError.message }, { status: 400 })
    }

    // Get all post IDs
    const postIds = posts?.map(p => p.id) || []

    // Batch fetch interactions for all posts
    const [likesData, commentsData, userLikesData] = await Promise.all([
      // Get likes for all posts
      supabase
        .from("post_likes")
        .select(`
          post_id,
          user:users(id, username, name, avatar_url)
        `)
        .in("post_id", postIds),
      
      // Get comments for all posts
      supabase
        .from("comments")
        .select(`
          id,
          post_id,
          content,
          created_at,
          user:users(id, username, name, avatar_url)
        `)
        .in("post_id", postIds)
        .order("created_at", { ascending: false }),
      
      // Check which posts current user liked
      user ? supabase
        .from("post_likes")
        .select("post_id")
        .in("post_id", postIds)
        .eq("user_id", user.id)
      : { data: [] }
    ])

    // Group interactions by post
    const likesByPost = likesData.data?.reduce((acc, like) => {
      if (!acc[like.post_id]) acc[like.post_id] = []
      acc[like.post_id].push(like.user)
      return acc
    }, {} as Record<string, any[]>) || {}

    const commentsByPost = commentsData.data?.reduce((acc, comment) => {
      if (!acc[comment.post_id]) acc[comment.post_id] = []
      acc[comment.post_id].push({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user: comment.user
      })
      return acc
    }, {} as Record<string, any[]>) || {}

    const userLikedPosts = new Set(userLikesData.data?.map(l => l.post_id) || [])

    // Format posts with interactions
    const formattedPosts = posts?.map(post => ({
      ...post,
      likes: likesByPost[post.id] || [],
      likes_count: post.likes_count || likesByPost[post.id]?.length || 0,
      comments: commentsByPost[post.id] || [],
      comments_count: post.comments_count || commentsByPost[post.id]?.length || 0,
      is_liked: userLikedPosts.has(post.id),
      media_urls: post.media_urls || [],
    }))

    return NextResponse.json({
      success: true,
      data: formattedPosts,
    })
  } catch (error) {
    console.error("[GET POSTS WITH COMMENTS] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}