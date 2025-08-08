import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const resolvedParams = await params
    const rawUserId = resolvedParams.id
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[UserPosts API] Fetching posts for user:', rawUserId)
    }

    // Get current user for additional info
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Handle "me" shortcut
    const userId = rawUserId === "me" ? currentUser?.id : rawUserId

    if (!userId) {
      return NextResponse.json(
        { 
          error: "Usuário não encontrado", 
          success: false 
        },
        { status: 404 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 posts
    const offset = parseInt(searchParams.get('offset') || '0')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Calculate offset from page if provided
    const calculatedOffset = page > 1 ? (page - 1) * limit : offset

    if (process.env.NODE_ENV === 'development') {
      console.log('[UserPosts API] Query params:', { limit, offset: calculatedOffset, page })
    }

    // Get total count first
    const { count: totalCount, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      console.error('[UserPosts API] Error getting count:', countError)
    }

    // Fetch user posts with comprehensive data
    // First try to get posts with related data
    let query = supabase
      .from('posts')
      .select(`
        *,
        user:users(
          id,
          username,
          name,
          avatar_url,
          is_verified,
          premium_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(calculatedOffset, calculatedOffset + limit - 1)

    const { data: posts, error } = await query

    if (error) {
      console.error('[UserPosts API] Database error:', error)
      return NextResponse.json(
        { 
          error: 'Erro ao buscar posts',
          details: error.message,
          success: false 
        },
        { status: 500 }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[UserPosts API] Found posts:', posts?.length || 0)
    }

    // Get interaction counts for all posts if we have posts
    let interactionData: any = {}
    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id)
      
      // Get likes count for posts
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds)
      
      // Get saves count (if table exists)
      const { data: savesData } = await supabase
        .from('post_saves')
        .select('post_id')
        .in('post_id', postIds)
      
      // Check if current user liked/saved any posts
      let userLikes: any[] = []
      let userSaves: any[] = []
      
      if (currentUser) {
        const { data: userLikesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .in('post_id', postIds)
          .eq('user_id', currentUser.id)
        
        const { data: userSavesData } = await supabase
          .from('post_saves')
          .select('post_id')
          .in('post_id', postIds)
          .eq('user_id', currentUser.id)
        
        userLikes = userLikesData || []
        userSaves = userSavesData || []
      }
      
      // Build interaction data map
      postIds.forEach(postId => {
        interactionData[postId] = {
          likes_count: likesData?.filter(l => l.post_id === postId).length || 0,
          saves_count: savesData?.filter(s => s.post_id === postId).length || 0,
          has_liked: userLikes.some(l => l.post_id === postId),
          has_saved: userSaves.some(s => s.post_id === postId)
        }
      })
    }

    // Format posts with interaction data
    const formattedPosts = posts?.map(post => {
      const interactions = interactionData[post.id] || {}
      
      return {
        ...post,
        has_liked: interactions.has_liked || false,
        has_saved: interactions.has_saved || false,
        likes_count: interactions.likes_count || post.likes_count || 0,
        saves_count: interactions.saves_count || post.saves_count || 0,
        comments_count: post.comments_count || 0
      }
    }) || []

    const hasMore = totalCount ? calculatedOffset + limit < totalCount : posts?.length === limit

    return NextResponse.json({
      data: formattedPosts,
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        pagination: {
          limit,
          offset: calculatedOffset,
          page,
          total: totalCount || 0,
          hasMore,
          totalPages: totalCount ? Math.ceil(totalCount / limit) : 1
        }
      }
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/v1/users/[id]/posts:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        success: false,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0"
        }
      },
      { status: 500 }
    )
  }
}