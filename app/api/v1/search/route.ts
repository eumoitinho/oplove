import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/search - Search users, posts, hashtags
export async function GET(request: NextRequest) {
  return withAuth(async (currentUser) => {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const type = searchParams.get('type') || 'all' // all, users, posts, hashtags
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (!query) {
      return {
        success: false,
        error: 'Query parameter is required'
      }
    }

    const supabase = await createServerClient()
    const results: any = {}

    // Search users
    if (type === 'all' || type === 'users') {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, bio, is_verified, premium_type')
        .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (usersError) {
        console.error('Error searching users:', usersError)
      } else {
        results.users = users || []
      }
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const { data: posts, error: postsError } = await supabase
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
        .ilike('content', `%${query}%`)
        .eq('visibility', 'public')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('Error searching posts:', postsError)
      } else {
        results.posts = posts || []
      }
    }

    // Search hashtags
    if (type === 'all' || type === 'hashtags') {
      // Extract hashtags from query
      const hashtagMatch = query.match(/#[\w]+/g)
      if (hashtagMatch) {
        const hashtag = hashtagMatch[0].substring(1) // Remove #
        
        const { data: hashtagPosts, error: hashtagError } = await supabase
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
          .ilike('content', `%#${hashtag}%`)
          .eq('visibility', 'public')
          .range(0, 9) // Top 10 posts for hashtags
          .order('created_at', { ascending: false })

        if (hashtagError) {
          console.error('Error searching hashtags:', hashtagError)
        } else {
          results.hashtags = [{
            name: hashtag,
            posts_count: hashtagPosts?.length || 0,
            recent_posts: hashtagPosts || []
          }]
        }
      }
    }

    return {
      success: true,
      data: results
    }
  })
}