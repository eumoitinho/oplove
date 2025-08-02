import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/search/advanced - Advanced search with full-text and ranking
export async function GET(request: NextRequest) {
  return withAuth(async (currentUser) => {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const type = searchParams.get('type') || 'all' // all, users, posts, hashtags
    const filter = searchParams.get('filter') || 'relevance' // relevance, recent, popular
    const location = searchParams.get('location') // lat,lng format
    const radius = parseInt(searchParams.get('radius') || '50') // km
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (!query || query.length < 2) {
      return {
        success: false,
        error: 'Query must be at least 2 characters long'
      }
    }

    const supabase = await createServerClient()
    const results: any = {}

    // Parse location if provided
    let userLat: number | null = null
    let userLng: number | null = null
    if (location) {
      const [lat, lng] = location.split(',').map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        userLat = lat
        userLng = lng
      }
    }

    // Search users with ranking
    if (type === 'all' || type === 'users') {
      let usersQuery = supabase
        .from('users')
        .select(`
          id,
          username,
          name,
          avatar_url,
          bio,
          is_verified,
          premium_type,
          followers_count,
          location,
          created_at
        `)

      // Build search condition
      const searchCondition = `username.ilike.%${query}%,name.ilike.%${query}%,bio.ilike.%${query}%`
      usersQuery = usersQuery.or(searchCondition)

      // Apply sorting based on filter
      switch (filter) {
        case 'recent':
          usersQuery = usersQuery.order('created_at', { ascending: false })
          break
        case 'popular':
          usersQuery = usersQuery.order('followers_count', { ascending: false })
          break
        case 'relevance':
        default:
          // Prioritize exact matches, then verified users, then premium users
          usersQuery = usersQuery
            .order('is_verified', { ascending: false })
            .order('followers_count', { ascending: false })
          break
      }

      const { data: users, error: usersError } = await usersQuery
        .range(offset, offset + limit - 1)

      if (usersError) {
        console.error('Error searching users:', usersError)
      } else {
        // Calculate relevance scores
        const scoredUsers = users?.map(user => {
          let score = 0
          
          // Exact username match = highest score
          if (user.username?.toLowerCase() === query.toLowerCase()) {
            score += 100
          } else if (user.username?.toLowerCase().startsWith(query.toLowerCase())) {
            score += 50
          } else if (user.username?.toLowerCase().includes(query.toLowerCase())) {
            score += 25
          }
          
          // Name match
          if (user.name?.toLowerCase().includes(query.toLowerCase())) {
            score += 20
          }
          
          // Bio match
          if (user.bio?.toLowerCase().includes(query.toLowerCase())) {
            score += 10
          }
          
          // Verification bonus
          if (user.is_verified) {
            score += 30
          }
          
          // Premium bonus
          if (user.premium_type && user.premium_type !== 'free') {
            score += 20
          }
          
          // Popularity bonus (normalized)
          score += Math.min(user.followers_count / 100, 50)
          
          // Location proximity bonus (if location provided)
          if (userLat && userLng && user.location?.latitude && user.location?.longitude) {
            const distance = calculateDistance(
              userLat, userLng,
              user.location.latitude, user.location.longitude
            )
            if (distance <= radius) {
              score += Math.max(0, 50 * (1 - distance / radius))
            }
          }
          
          return { ...user, relevance_score: score }
        }) || []

        // Sort by relevance if that's the filter
        if (filter === 'relevance') {
          scoredUsers.sort((a, b) => b.relevance_score - a.relevance_score)
        }

        // Check if current user follows these users
        const userIds = scoredUsers.map(u => u.id)
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUser.id)
          .in('following_id', userIds)

        const followingIds = new Set(follows?.map(f => f.following_id) || [])

        results.users = scoredUsers.map(user => ({
          ...user,
          is_following: followingIds.has(user.id)
        }))
      }
    }

    // Search posts with advanced filtering
    if (type === 'all' || type === 'posts') {
      let postsQuery = supabase
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
          visibility,
          user:users!user_id (
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type,
            location
          )
        `)
        .eq('visibility', 'public')
        .ilike('content', `%${query}%`)

      // Apply date filter for recent posts
      if (filter === 'recent') {
        postsQuery = postsQuery.order('created_at', { ascending: false })
      } else if (filter === 'popular') {
        // Popular = high engagement
        postsQuery = postsQuery
          .order('likes_count', { ascending: false })
          .order('comments_count', { ascending: false })
      }

      const { data: posts, error: postsError } = await postsQuery
        .range(offset, offset + limit - 1)

      if (postsError) {
        console.error('Error searching posts:', postsError)
      } else {
        // Calculate relevance scores for posts
        const scoredPosts = posts?.map(post => {
          let score = 0
          
          // Content match quality
          const lowerContent = post.content?.toLowerCase() || ''
          const lowerQuery = query.toLowerCase()
          
          // Count occurrences
          const occurrences = (lowerContent.match(new RegExp(lowerQuery, 'g')) || []).length
          score += occurrences * 10
          
          // Engagement score
          score += (post.likes_count || 0) * 0.5
          score += (post.comments_count || 0) * 1
          score += (post.shares_count || 0) * 2
          
          // User verification/premium bonus
          if (post.user?.is_verified) {
            score += 20
          }
          if (post.user?.premium_type && post.user.premium_type !== 'free') {
            score += 15
          }
          
          // Recency bonus (posts from last 24h get bonus)
          const hoursSincePost = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60)
          if (hoursSincePost < 24) {
            score += Math.max(0, 30 * (1 - hoursSincePost / 24))
          }
          
          // Location proximity bonus
          if (userLat && userLng && post.user?.location?.latitude && post.user?.location?.longitude) {
            const distance = calculateDistance(
              userLat, userLng,
              post.user.location.latitude, post.user.location.longitude
            )
            if (distance <= radius) {
              score += Math.max(0, 40 * (1 - distance / radius))
            }
          }
          
          return { ...post, relevance_score: score }
        }) || []

        // Sort by relevance if that's the filter
        if (filter === 'relevance') {
          scoredPosts.sort((a, b) => b.relevance_score - a.relevance_score)
        }

        // Check likes
        const postIds = scoredPosts.map(p => p.id)
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', currentUser.id)
          .in('post_id', postIds)

        const likedPostIds = new Set(likes?.map(l => l.post_id) || [])

        results.posts = scoredPosts.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id)
        }))
      }
    }

    // Enhanced hashtag search
    if (type === 'all' || type === 'hashtags') {
      const hashtagPattern = /#[\w]+/g
      const queryHashtags = query.match(hashtagPattern) || [`#${query.replace('#', '')}`]
      
      const hashtagResults: any[] = []
      
      for (const hashtag of queryHashtags) {
        const cleanHashtag = hashtag.replace('#', '').toLowerCase()
        
        // Get posts with this hashtag from last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { data: hashtagPosts, count } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            created_at,
            likes_count,
            user:users!user_id (
              id,
              username,
              avatar_url,
              is_verified
            )
          `, { count: 'exact' })
          .ilike('content', `%#${cleanHashtag}%`)
          .eq('visibility', 'public')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (hashtagPosts && hashtagPosts.length > 0) {
          // Calculate trending score
          const recentPosts = hashtagPosts.filter(p => {
            const hoursSince = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60)
            return hoursSince < 24
          }).length
          
          const totalEngagement = hashtagPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0)
          
          hashtagResults.push({
            name: cleanHashtag,
            posts_count: count || 0,
            recent_posts_24h: recentPosts,
            total_engagement: totalEngagement,
            trending_score: recentPosts * 10 + totalEngagement * 0.1,
            sample_posts: hashtagPosts.slice(0, 3)
          })
        }
      }
      
      // Sort by trending score
      hashtagResults.sort((a, b) => b.trending_score - a.trending_score)
      
      results.hashtags = hashtagResults
    }

    // Add metadata
    results.meta = {
      query,
      type,
      filter,
      page,
      limit,
      location: location ? { lat: userLat, lng: userLng, radius } : null
    }

    return {
      success: true,
      data: results
    }
  })
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}