import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // 1. Check if there are any posts at all
    const { count: totalPosts, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      return NextResponse.json({
        error: "Failed to count posts",
        details: countError
      }, { status: 500 })
    }
    
    // 2. Get sample posts with users
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        visibility,
        user_id,
        created_at,
        media_urls,
        likes_count,
        comments_count,
        users (
          id,
          username,
          name,
          avatar_url,
          premium_type,
          is_verified
        )
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (postsError) {
      return NextResponse.json({
        error: "Failed to fetch posts",
        details: postsError
      }, { status: 500 })
    }
    
    // 3. Check authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // 4. If authenticated, check user's posts
    let userPosts = null
    if (user && !authError) {
      const { data: myPosts } = await supabase
        .from('posts')
        .select('id, content, visibility, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
      
      userPosts = myPosts
    }
    
    // 5. Check table structure
    const { data: columns } = await supabase
      .from('posts')
      .select('*')
      .limit(0)
    
    const samplePost = posts && posts.length > 0 ? posts[0] : null
    
    return NextResponse.json({
      success: true,
      debug: {
        total_posts_in_db: totalPosts || 0,
        public_posts_found: posts?.length || 0,
        authenticated_user: user ? {
          id: user.id,
          email: user.email,
          user_posts: userPosts
        } : null,
        sample_posts: posts?.map(p => ({
          id: p.id,
          content: p.content?.substring(0, 50) + '...',
          visibility: p.visibility,
          user: p.users?.username || 'NO USER DATA',
          created: p.created_at
        })),
        table_structure: samplePost ? Object.keys(samplePost) : [],
        posts_with_users: posts?.filter(p => p.users).length || 0,
        posts_without_users: posts?.filter(p => !p.users).length || 0
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}