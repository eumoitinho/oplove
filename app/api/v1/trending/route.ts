import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/trending - Get trending content with advanced metrics
export async function GET(request: NextRequest) {
  return withAuth(async (currentUser) => {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // all, posts, users, hashtags, topics
    const period = searchParams.get('period') || '24h' // 1h, 24h, 7d, 30d
    const location = searchParams.get('location') // lat,lng format
    const radius = parseInt(searchParams.get('radius') || '50') // km
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = await createServerClient()
    const results: any = {}

    // Calculate time range
    const now = new Date()
    const startDate = new Date()
    switch (period) {
      case '1h':
        startDate.setHours(now.getHours() - 1)
        break
      case '24h':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
    }

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

    // Get trending posts
    if (type === 'all' || type === 'posts') {
      const { data: trendingPosts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          media_urls,
          media_types,
          created_at,
          updated_at,
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
        .gte('created_at', startDate.toISOString())
        .order('likes_count', { ascending: false })
        .range(offset, offset + limit - 1)

      if (!error && trendingPosts) {
        // Calculate trending scores
        const scoredPosts = trendingPosts.map(post => {
          // Base engagement score
          const engagementScore = 
            (post.likes_count || 0) * 1 +
            (post.comments_count || 0) * 2 +
            (post.shares_count || 0) * 3

          // Time decay factor (newer posts get bonus)
          const hoursAgo = (now.getTime() - new Date(post.created_at).getTime()) / (1000 * 60 * 60)
          const timeFactor = Math.max(0, 1 - (hoursAgo / 168)) // Decay over 7 days

          // Velocity (engagement rate)
          const velocity = engagementScore / Math.max(1, hoursAgo)

          // Premium/verified boost
          let authorBoost = 1
          if (post.user?.is_verified) authorBoost *= 1.2
          if (post.user?.premium_type === 'diamond' || post.user?.premium_type === 'couple') {
            authorBoost *= 1.5
          } else if (post.user?.premium_type === 'gold') {
            authorBoost *= 1.3
          }

          // Location boost if within radius
          let locationBoost = 1
          if (userLat && userLng && post.user?.location?.latitude && post.user?.location?.longitude) {
            const distance = calculateDistance(
              userLat, userLng,
              post.user.location.latitude, post.user.location.longitude
            )
            if (distance <= radius) {
              locationBoost = 1 + (0.5 * (1 - distance / radius))
            }
          }

          // Calculate final trending score
          const trendingScore = (engagementScore * timeFactor * velocity * authorBoost * locationBoost) / 100

          return {
            ...post,
            metrics: {
              engagement_score: engagementScore,
              time_factor: timeFactor,
              velocity,
              author_boost: authorBoost,
              location_boost: locationBoost,
              trending_score: trendingScore
            }
          }
        })

        // Sort by trending score
        scoredPosts.sort((a, b) => b.metrics.trending_score - a.metrics.trending_score)

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

    // Get trending users (most followed in period)
    if (type === 'all' || type === 'users') {
      // Get users who gained most followers in the period
      const { data: recentFollows } = await supabase
        .from('follows')
        .select('following_id')
        .gte('created_at', startDate.toISOString())

      if (recentFollows) {
        // Count follows per user
        const followCounts: Record<string, number> = {}
        recentFollows.forEach(f => {
          followCounts[f.following_id] = (followCounts[f.following_id] || 0) + 1
        })

        // Get top users
        const topUserIds = Object.entries(followCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([userId]) => userId)

        if (topUserIds.length > 0) {
          const { data: trendingUsers } = await supabase
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
            .in('id', topUserIds)

          if (trendingUsers) {
            // Calculate trending scores for users
            const scoredUsers = trendingUsers.map(user => {
              const newFollowers = followCounts[user.id] || 0
              const growthRate = newFollowers / Math.max(1, user.followers_count - newFollowers)
              
              // Account age factor (newer users with growth get bonus)
              const accountAge = (now.getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
              const ageFactor = accountAge < 30 ? 1.5 : 1

              // Premium/verified boost
              let userBoost = 1
              if (user.is_verified) userBoost *= 1.3
              if (user.premium_type === 'diamond' || user.premium_type === 'couple') {
                userBoost *= 1.5
              } else if (user.premium_type === 'gold') {
                userBoost *= 1.2
              }

              // Location boost
              let locationBoost = 1
              if (userLat && userLng && user.location?.latitude && user.location?.longitude) {
                const distance = calculateDistance(
                  userLat, userLng,
                  user.location.latitude, user.location.longitude
                )
                if (distance <= radius) {
                  locationBoost = 1 + (0.3 * (1 - distance / radius))
                }
              }

              const trendingScore = newFollowers * growthRate * ageFactor * userBoost * locationBoost

              return {
                ...user,
                metrics: {
                  new_followers: newFollowers,
                  growth_rate: growthRate,
                  age_factor: ageFactor,
                  user_boost: userBoost,
                  location_boost: locationBoost,
                  trending_score: trendingScore
                }
              }
            })

            // Sort by trending score
            scoredUsers.sort((a, b) => b.metrics.trending_score - a.metrics.trending_score)

            // Check if following
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
      }
    }

    // Get trending hashtags
    if (type === 'all' || type === 'hashtags') {
      const { data: recentPosts } = await supabase
        .from('posts')
        .select('content, created_at, likes_count, comments_count')
        .eq('visibility', 'public')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000)

      if (recentPosts) {
        const hashtagStats: Record<string, {
          count: number
          engagement: number
          lastSeen: Date
          posts: number[]
        }> = {}

        recentPosts.forEach(post => {
          const hashtags = post.content?.match(/#[\w]+/g) || []
          hashtags.forEach(tag => {
            const normalized = tag.toLowerCase()
            if (!hashtagStats[normalized]) {
              hashtagStats[normalized] = {
                count: 0,
                engagement: 0,
                lastSeen: new Date(post.created_at),
                posts: []
              }
            }
            hashtagStats[normalized].count++
            hashtagStats[normalized].engagement += (post.likes_count || 0) + (post.comments_count || 0)
            if (new Date(post.created_at) > hashtagStats[normalized].lastSeen) {
              hashtagStats[normalized].lastSeen = new Date(post.created_at)
            }
          })
        })

        // Calculate trending scores
        const trendingHashtags = Object.entries(hashtagStats)
          .map(([tag, stats]) => {
            // Recency factor
            const hoursSinceLastUse = (now.getTime() - stats.lastSeen.getTime()) / (1000 * 60 * 60)
            const recencyFactor = Math.max(0, 1 - (hoursSinceLastUse / 24))

            // Velocity (uses per hour in period)
            const periodHours = period === '1h' ? 1 : period === '24h' ? 24 : period === '7d' ? 168 : 720
            const velocity = stats.count / periodHours

            // Engagement rate
            const engagementRate = stats.engagement / Math.max(1, stats.count)

            const trendingScore = (stats.count * velocity * recencyFactor * (1 + engagementRate / 100))

            return {
              name: tag.substring(1),
              posts_count: stats.count,
              total_engagement: stats.engagement,
              avg_engagement: engagementRate,
              last_used: stats.lastSeen.toISOString(),
              velocity,
              trending_score: trendingScore
            }
          })
          .sort((a, b) => b.trending_score - a.trending_score)
          .slice(0, 20)

        results.hashtags = trendingHashtags
      }
    }

    // Get trending topics (extracted from post content)
    if (type === 'all' || type === 'topics') {
      const { data: recentPosts } = await supabase
        .from('posts')
        .select('content, likes_count, comments_count')
        .eq('visibility', 'public')
        .gte('created_at', startDate.toISOString())
        .limit(500)

      if (recentPosts) {
        // Simple topic extraction (in production, use NLP)
        const topicWords: Record<string, number> = {}
        const stopWords = new Set(['o', 'a', 'de', 'do', 'da', 'em', 'para', 'com', 'por', 'que', 'e', 'é', 'um', 'uma'])

        recentPosts.forEach(post => {
          // Remove hashtags and mentions
          const cleanContent = post.content
            ?.replace(/#[\w]+/g, '')
            .replace(/@[\w]+/g, '')
            .toLowerCase()

          // Extract words
          const words = cleanContent?.match(/\b[\w]{4,}\b/g) || []
          words.forEach(word => {
            if (!stopWords.has(word)) {
              topicWords[word] = (topicWords[word] || 0) + 1 + 
                ((post.likes_count || 0) + (post.comments_count || 0)) * 0.1
            }
          })
        })

        // Get top topics
        const trendingTopics = Object.entries(topicWords)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([word, score]) => ({
            topic: word,
            mentions: Math.floor(score),
            trending_score: score
          }))

        results.topics = trendingTopics
      }
    }

    // Add metadata
    results.meta = {
      type,
      period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
      location: location ? { lat: userLat, lng: userLng, radius } : null
    }

    return {
      success: true,
      data: results
    }
  })
}

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
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