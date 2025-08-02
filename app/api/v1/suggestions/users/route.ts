import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/suggestions/users - Get personalized user suggestions
export async function GET(request: NextRequest) {
  return withAuth(async (currentUser) => {
    const { searchParams } = new URL(request.url)
    const strategy = searchParams.get('strategy') || 'mixed' // mixed, interests, location, network, popular
    const location = searchParams.get('location') // lat,lng format
    const radius = parseInt(searchParams.get('radius') || '50') // km
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = await createServerClient()
    
    // Get current user's data for personalization
    const { data: userProfile } = await supabase
      .from('users')
      .select('location, interests, created_at, premium_type')
      .eq('id', currentUser.id)
      .single()

    // Get users the current user is already following
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id)

    const followingIds = following?.map(f => f.following_id) || []
    followingIds.push(currentUser.id) // Don't suggest self

    // Get blocked users to exclude
    const { data: blocked } = await supabase
      .from('blocks')
      .select('blocked_user_id')
      .eq('user_id', currentUser.id)

    const blockedIds = blocked?.map(b => b.blocked_user_id) || []
    const excludeIds = [...followingIds, ...blockedIds]

    // Parse location
    let userLat: number | null = null
    let userLng: number | null = null
    if (location) {
      const [lat, lng] = location.split(',').map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        userLat = lat
        userLng = lng
      }
    } else if (userProfile?.location?.latitude && userProfile?.location?.longitude) {
      userLat = userProfile.location.latitude
      userLng = userProfile.location.longitude
    }

    const suggestions: any[] = []

    // Strategy 1: Network-based (friends of friends)
    if (strategy === 'mixed' || strategy === 'network') {
      // Get users followed by people you follow
      const { data: networkSuggestions } = await supabase
        .from('follows')
        .select(`
          following_id,
          following:users!following_id (
            id,
            username,
            name,
            avatar_url,
            bio,
            is_verified,
            premium_type,
            followers_count,
            location
          )
        `)
        .in('follower_id', followingIds.slice(0, 100)) // Limit to avoid query size issues
        .not('following_id', 'in', `(${excludeIds.join(',')})`)
        .limit(50)

      if (networkSuggestions) {
        // Count how many mutual connections
        const mutualCounts: Record<string, number> = {}
        networkSuggestions.forEach(item => {
          if (item.following && item.following_id) {
            mutualCounts[item.following_id] = (mutualCounts[item.following_id] || 0) + 1
          }
        })

        // Get unique users with mutual count
        const uniqueNetworkUsers = Object.entries(mutualCounts)
          .map(([userId, mutualCount]) => {
            const user = networkSuggestions.find(s => s.following_id === userId)?.following
            if (!user) return null
            
            return {
              ...user,
              suggestion_reason: 'network',
              mutual_connections: mutualCount,
              score: mutualCount * 10 // Base score from mutual connections
            }
          })
          .filter(Boolean)
          .slice(0, Math.ceil(limit / 2))

        suggestions.push(...uniqueNetworkUsers)
      }
    }

    // Strategy 2: Location-based
    if ((strategy === 'mixed' || strategy === 'location') && userLat && userLng) {
      const { data: nearbyUsers } = await supabase
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
          location
        `)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .not('location', 'is', null)
        .limit(100) // Get more to filter by distance

      if (nearbyUsers) {
        const locationBasedUsers = nearbyUsers
          .map(user => {
            if (!user.location?.latitude || !user.location?.longitude) return null
            
            const distance = calculateDistance(
              userLat!, userLng!,
              user.location.latitude, user.location.longitude
            )
            
            if (distance > radius) return null
            
            return {
              ...user,
              suggestion_reason: 'location',
              distance,
              score: Math.max(0, 100 * (1 - distance / radius)) // Closer = higher score
            }
          })
          .filter(Boolean)
          .sort((a, b) => b!.score - a!.score)
          .slice(0, Math.ceil(limit / 3))

        suggestions.push(...locationBasedUsers)
      }
    }

    // Strategy 3: Interest-based (if interests are implemented)
    if ((strategy === 'mixed' || strategy === 'interests') && userProfile?.interests?.length > 0) {
      const { data: interestUsers } = await supabase
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
          interests
        `)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .overlaps('interests', userProfile.interests)
        .limit(50)

      if (interestUsers) {
        const interestBasedUsers = interestUsers.map(user => {
          const commonInterests = user.interests?.filter(i => 
            userProfile.interests.includes(i)
          ).length || 0
          
          return {
            ...user,
            suggestion_reason: 'interests',
            common_interests: commonInterests,
            score: commonInterests * 20
          }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.ceil(limit / 3))

        suggestions.push(...interestBasedUsers)
      }
    }

    // Strategy 4: Popular/Trending users
    if (strategy === 'mixed' || strategy === 'popular') {
      // Get users who gained most followers recently
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentFollows } = await supabase
        .from('follows')
        .select('following_id')
        .gte('created_at', sevenDaysAgo.toISOString())

      if (recentFollows) {
        const followCounts: Record<string, number> = {}
        recentFollows.forEach(f => {
          if (!excludeIds.includes(f.following_id)) {
            followCounts[f.following_id] = (followCounts[f.following_id] || 0) + 1
          }
        })

        const trendingUserIds = Object.entries(followCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .map(([userId]) => userId)

        if (trendingUserIds.length > 0) {
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
              followers_count
            `)
            .in('id', trendingUserIds)

          if (trendingUsers) {
            const popularUsers = trendingUsers.map(user => ({
              ...user,
              suggestion_reason: 'popular',
              recent_followers: followCounts[user.id] || 0,
              score: (followCounts[user.id] || 0) * 5 + (user.followers_count / 100)
            }))
            .slice(0, Math.ceil(limit / 4))

            suggestions.push(...popularUsers)
          }
        }
      }
    }

    // Deduplicate suggestions (user might appear in multiple strategies)
    const uniqueSuggestions = new Map()
    suggestions.forEach(user => {
      if (!user || !user.id) return
      
      const existing = uniqueSuggestions.get(user.id)
      if (!existing || user.score > existing.score) {
        uniqueSuggestions.set(user.id, user)
      }
    })

    // Calculate final scores with boosts
    let finalSuggestions = Array.from(uniqueSuggestions.values()).map(user => {
      let finalScore = user.score || 0

      // Verification boost
      if (user.is_verified) {
        finalScore *= 1.2
      }

      // Premium boost (prioritize premium users)
      if (user.premium_type === 'diamond' || user.premium_type === 'couple') {
        finalScore *= 1.5
      } else if (user.premium_type === 'gold') {
        finalScore *= 1.3
      }

      // New user boost (help new users get discovered)
      if (userProfile?.created_at) {
        const userAge = (Date.now() - new Date(user.created_at || 0).getTime()) / (1000 * 60 * 60 * 24)
        if (userAge < 30) {
          finalScore *= 1.1
        }
      }

      // Location proximity super boost
      if (user.distance && user.distance < 10) {
        finalScore *= 2
      }

      return {
        ...user,
        final_score: finalScore
      }
    })

    // Sort by final score and paginate
    finalSuggestions.sort((a, b) => b.final_score - a.final_score)
    const paginatedSuggestions = finalSuggestions.slice(offset, offset + limit)

    // Get additional data for suggestions
    const suggestionIds = paginatedSuggestions.map(s => s.id)
    
    // Check if current user follows any of these (shouldn't happen, but double-check)
    const { data: followCheck } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id)
      .in('following_id', suggestionIds)

    const alreadyFollowing = new Set(followCheck?.map(f => f.following_id) || [])

    // Get sample posts from suggested users
    const { data: samplePosts } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        media_urls,
        user_id,
        created_at,
        likes_count
      `)
      .in('user_id', suggestionIds)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(suggestionIds.length * 2) // Get ~2 posts per user

    // Group posts by user
    const postsByUser: Record<string, any[]> = {}
    samplePosts?.forEach(post => {
      if (!postsByUser[post.user_id]) {
        postsByUser[post.user_id] = []
      }
      if (postsByUser[post.user_id].length < 2) {
        postsByUser[post.user_id].push(post)
      }
    })

    // Format final response
    const formattedSuggestions = paginatedSuggestions
      .filter(s => !alreadyFollowing.has(s.id))
      .map(suggestion => ({
        id: suggestion.id,
        username: suggestion.username,
        name: suggestion.name,
        avatar_url: suggestion.avatar_url,
        bio: suggestion.bio,
        is_verified: suggestion.is_verified,
        premium_type: suggestion.premium_type,
        followers_count: suggestion.followers_count,
        suggestion_reason: suggestion.suggestion_reason,
        suggestion_details: {
          mutual_connections: suggestion.mutual_connections,
          distance: suggestion.distance,
          common_interests: suggestion.common_interests,
          recent_followers: suggestion.recent_followers
        },
        sample_posts: postsByUser[suggestion.id] || [],
        score: suggestion.final_score
      }))

    return {
      success: true,
      data: {
        suggestions: formattedSuggestions,
        meta: {
          strategy,
          page,
          limit,
          total: finalSuggestions.length,
          has_more: finalSuggestions.length > offset + limit
        }
      }
    }
  })
}

// Helper function
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