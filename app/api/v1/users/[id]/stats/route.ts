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
    
    console.log('[UserStats API] Fetching stats for user:', rawUserId)

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

    // Fetch all stats in parallel with comprehensive data
    const [
      postsResult,
      followersResult,
      followingResult,
      likesResult,
      commentsResult,
      sharesResult,
      storiesResult,
      sealsResult,
      creditsResult
    ] = await Promise.all([
      // Posts count
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false),
      
      // Followers count
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      
      // Following count
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId),
      
      // Total likes received on posts
      supabase
        .from('post_reactions')
        .select('posts!inner(*)', { count: 'exact', head: true })
        .eq('posts.user_id', userId)
        .eq('reaction_type', 'like'),
      
      // Total comments received on posts
      supabase
        .from('post_comments')
        .select('posts!inner(*)', { count: 'exact', head: true })
        .eq('posts.user_id', userId)
        .eq('is_deleted', false),
      
      // Total shares received on posts
      supabase
        .from('posts')
        .select('share_count', { count: 'exact', head: false })
        .eq('user_id', userId)
        .eq('is_deleted', false),
      
      // Stories count (active stories)
      supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString()),
      
      // Profile seals count
      supabase
        .from('user_profile_seals')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId),
      
      // User credits (only for current user or if public)
      currentUser?.id === userId ? 
        supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', userId)
          .single() : 
        Promise.resolve({ data: null, error: null })
    ])

    // Calculate total shares from posts
    const totalShares = sharesResult.data?.reduce((sum: number, post: any) => 
      sum + (post.share_count || 0), 0) || 0

    // Get additional engagement stats for the user
    const [
      mediaPostsResult,
      recentActivityResult
    ] = await Promise.all([
      // Media posts count
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .not('media_urls', 'is', null),
      
      // Recent activity (posts in last 30 days)
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    const stats = {
      // Core stats (in expected format)
      posts: postsResult.count || 0,
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
      likes: likesResult.count || 0, // Changed from likes_received
      seals: sealsResult.count || 0, // Changed from profile_seals
      
      // Extended stats
      likes_received: likesResult.count || 0,
      comments_received: commentsResult.count || 0,
      shares_received: totalShares,
      
      // Content stats
      media_posts: mediaPostsResult.count || 0,
      active_stories: storiesResult.count || 0,
      
      // Recognition stats
      profile_seals: sealsResult.count || 0,
      
      // Activity stats
      posts_last_30_days: recentActivityResult.count || 0,
      
      // Credits (only for current user)
      credits: currentUser?.id === userId ? (creditsResult.data?.balance || 0) : null,
      
      // Calculated engagement metrics
      engagement_rate: postsResult.count > 0 ? 
        ((likesResult.count || 0) + (commentsResult.count || 0)) / postsResult.count : 0,
      
      // Activity level
      activity_level: recentActivityResult.count >= 10 ? 'high' : 
                     recentActivityResult.count >= 3 ? 'medium' : 'low'
    }

    console.log('[UserStats API] Stats calculated:', stats)

    return NextResponse.json({
      data: stats,
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        calculated_at: new Date().toISOString(),
        is_current_user: currentUser?.id === userId
      }
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/v1/users/[id]/stats:', error)
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