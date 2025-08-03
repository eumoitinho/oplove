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
    const status = searchParams.get('status') || 'active' // 'active', 'expired', 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50
    const offset = parseInt(searchParams.get('offset') || '0')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Calculate offset from page if provided
    const calculatedOffset = page > 1 ? (page - 1) * limit : offset

    console.log('[UserStories API] Fetching stories for user:', userId, { status, limit, offset: calculatedOffset })

    try {
      // Build query based on status filter
      let query = supabase
        .from('stories')
        .select(`
          *,
          user:users!user_id(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          ),
          views:story_views(count),
          reactions:story_views!inner(
            reaction_type
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(calculatedOffset, calculatedOffset + limit - 1)

      // Apply status filter
      if (status === 'active') {
        query = query
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString())
      } else if (status === 'expired') {
        query = query.lt('expires_at', new Date().toISOString())
      }
      // 'all' doesn't add additional filters

      const { data: stories, error: storiesError } = await query

      if (storiesError) {
        console.error('[UserStories API] Error fetching stories:', storiesError)
        
        // If stories table doesn't exist, return empty response
        return NextResponse.json({
          data: [],
          success: true,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0",
            total: 0,
            message: "Stories feature not yet available"
          }
        })
      }

      // Get total count
      let countQuery = supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (status === 'active') {
        countQuery = countQuery
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString())
      } else if (status === 'expired') {
        countQuery = countQuery.lt('expires_at', new Date().toISOString())
      }

      const { count: totalCount, error: countError } = await countQuery

      if (countError) {
        console.error('[UserStories API] Error getting stories count:', countError)
      }

      // Format stories with comprehensive data
      const formattedStories = stories?.map(story => {
        // Calculate story metrics
        const totalViews = story.views?.[0]?.count || 0
        const reactions = story.reactions || []
        const reactionCounts = reactions.reduce((acc: any, reaction: any) => {
          const type = reaction.reaction_type || 'view'
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {})

        // Check if story is still active
        const isActive = story.status === 'active' && new Date(story.expires_at) > new Date()
        const timeRemaining = isActive ? 
          Math.max(0, new Date(story.expires_at).getTime() - Date.now()) : 0

        // Check if current user has viewed this story
        const hasViewed = currentUser ? 
          reactions.some((r: any) => r.user_id === currentUser.id) : false

        return {
          ...story,
          user: story.user,
          is_active: isActive,
          time_remaining_ms: timeRemaining,
          hours_remaining: Math.ceil(timeRemaining / (1000 * 60 * 60)),
          
          // View and interaction metrics
          total_views: totalViews,
          unique_views: story.unique_view_count || 0,
          has_viewed: hasViewed,
          
          // Reaction breakdown
          reaction_counts: reactionCounts,
          total_reactions: Object.values(reactionCounts).reduce((sum: number, count: any) => sum + count, 0),
          
          // Boost information
          is_boosted: !!story.boost_expires_at && new Date(story.boost_expires_at) > new Date(),
          boost_remaining_ms: story.boost_expires_at ? 
            Math.max(0, new Date(story.boost_expires_at).getTime() - Date.now()) : 0,
          
          // Access control
          is_current_user: currentUser?.id === userId,
          
          // Remove nested arrays from response
          views: undefined,
          reactions: undefined
        }
      }) || []

      // Calculate summary statistics
      const activeStories = formattedStories.filter(s => s.is_active).length
      const expiredStories = formattedStories.filter(s => !s.is_active).length
      const boostedStories = formattedStories.filter(s => s.is_boosted).length
      const totalViews = formattedStories.reduce((sum, s) => sum + s.total_views, 0)

      const hasMore = totalCount ? calculatedOffset + limit < totalCount : stories?.length === limit

      console.log('[UserStories API] Found stories:', formattedStories.length)

      return NextResponse.json({
        data: formattedStories,
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
          },
          filters: {
            status
          },
          summary: {
            active_stories: activeStories,
            expired_stories: expiredStories,
            boosted_stories: boostedStories,
            total_views_across_stories: totalViews,
            is_current_user: currentUser?.id === userId
          }
        }
      })

    } catch (tableError) {
      // Handle case where stories tables don't exist yet
      console.log('[UserStories API] Stories tables not available yet')
      
      return NextResponse.json({
        data: [],
        success: true,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          total: 0,
          message: "Stories feature will be available soon"
        }
      })
    }

  } catch (error) {
    console.error('Unexpected error in GET /api/v1/users/[id]/stories:', error)
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