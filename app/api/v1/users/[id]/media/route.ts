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
    
    console.log('[UserMedia API] Fetching media for user:', rawUserId)

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
    const mediaType = searchParams.get('type') // 'photo', 'video', or 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 items
    const offset = parseInt(searchParams.get('offset') || '0')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Calculate offset from page if provided
    const calculatedOffset = page > 1 ? (page - 1) * limit : offset

    console.log('[UserMedia API] Query params:', { mediaType, limit, offset: calculatedOffset, page })

    // Get total count of media posts
    let countQuery = supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('media_urls', 'is', null)

    // Apply media type filter to count query
    if (mediaType === 'photo') {
      countQuery = countQuery.contains('media_types', ['image'])
    } else if (mediaType === 'video') {
      countQuery = countQuery.contains('media_types', ['video'])
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error('[UserMedia API] Error getting count:', countError)
    }

    // Build main query
    let query = supabase
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
      .not('media_urls', 'is', null)
      .order('created_at', { ascending: false })
      .range(calculatedOffset, calculatedOffset + limit - 1)

    // Filter by media type if specified
    if (mediaType === 'photo') {
      query = query.contains('media_types', ['image'])
    } else if (mediaType === 'video') {
      query = query.contains('media_types', ['video'])
    }

    const { data: media, error } = await query

    if (error) {
      console.error('[UserMedia API] Database error:', error)
      return NextResponse.json(
        { 
          error: 'Erro ao buscar mídia',
          details: error.message,
          success: false 
        },
        { status: 500 }
      )
    }

    console.log('[UserMedia API] Found media items:', media?.length || 0)

    // Format media posts with interaction data
    const formattedMedia = media?.map(post => {
      // Separate images and videos
      const images = post.media_urls?.filter((_: any, index: number) => 
        post.media_types?.[index] === 'image'
      ) || []
      
      const videos = post.media_urls?.filter((_: any, index: number) => 
        post.media_types?.[index] === 'video'
      ) || []

      return {
        ...post,
        has_liked: false, // Will need to fetch separately if needed
        has_saved: false, // Will need to fetch separately if needed
        images,
        videos,
        media_count: post.media_urls?.length || 0,
        is_video: videos.length > 0,
        is_image: images.length > 0 && videos.length === 0
      }
    }) || []

    const hasMore = totalCount ? calculatedOffset + limit < totalCount : media?.length === limit

    return NextResponse.json({
      data: formattedMedia,
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
          mediaType: mediaType || 'all'
        }
      }
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/v1/users/[id]/media:', error)
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