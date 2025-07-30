import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/explore - Get explore content (trending posts, suggested users, popular hashtags)
export async function GET(request: NextRequest) {
  return withAuth(async (currentUser) => {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // all, posts, users, hashtags
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = await createServerClient()
    const results: any = {}

    // Get trending posts (most liked in last 7 days)
    if (type === 'all' || type === 'posts') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: trendingPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          media_urls,
          media_types,
          created_at,
          likes_count,
          comments_count,
          shares_count,
          user:users!user_id (
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .eq('visibility', 'public')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('likes_count', { ascending: false })
        .range(offset, offset + limit - 1)

      if (postsError) {
        console.error('Error fetching trending posts:', postsError)
      } else {
        // Check if current user has liked these posts
        if (trendingPosts && trendingPosts.length > 0) {
          const postIds = trendingPosts.map(p => p.id)
          const { data: likes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', currentUser.id)
            .in('post_id', postIds)

          const likedPostIds = new Set(likes?.map(l => l.post_id) || [])
          
          results.posts = trendingPosts.map(post => ({
            ...post,
            is_liked: likedPostIds.has(post.id)
          }))
        } else {
          results.posts = trendingPosts || []
        }
      }
    }

    // Get suggested users (users not followed by current user)
    if (type === 'all' || type === 'users') {
      // First get users the current user is following
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id)

      const followingIds = following?.map(f => f.following_id) || []
      followingIds.push(currentUser.id) // Don't suggest self

      // Get popular users not being followed
      const { data: suggestedUsers, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          username,
          name,
          avatar_url,
          bio,
          is_verified,
          premium_type,
          followers_count
        `)
        .not('id', 'in', `(${followingIds.join(',')})`)
        .order('followers_count', { ascending: false })
        .range(offset, offset + limit - 1)

      if (usersError) {
        console.error('Error fetching suggested users:', usersError)
      } else {
        results.users = suggestedUsers || []
      }
    }

    // Get popular hashtags
    if (type === 'all' || type === 'hashtags') {
      // This is a simplified version - in production you'd have a hashtags table
      const { data: recentPosts } = await supabase
        .from('posts')
        .select('content')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (recentPosts) {
        const hashtagCounts: Record<string, number> = {}
        
        recentPosts.forEach(post => {
          const hashtags = post.content?.match(/#[\w]+/g) || []
          hashtags.forEach(tag => {
            const normalized = tag.toLowerCase()
            hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1
          })
        })

        const popularHashtags = Object.entries(hashtagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([tag, count]) => ({
            name: tag.substring(1), // Remove #
            posts_count: count
          }))

        results.hashtags = popularHashtags
      } else {
        results.hashtags = []
      }
    }

    return {
      success: true,
      data: results
    }
  })
}