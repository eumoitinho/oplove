import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/v1/users/[id]/following - Get users that this user follows
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100) // Max 100
    const offset = parseInt(searchParams.get("offset") || "0")
    const page = parseInt(searchParams.get("page") || "1")
    
    // Calculate offset from page if provided
    const calculatedOffset = page > 1 ? (page - 1) * limit : offset

    const supabase = await createServerClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    const resolvedParams = await params
    const userId = resolvedParams.id === "me" ? currentUser?.id : resolvedParams.id

    if (!userId) {
      return NextResponse.json(
        { 
          error: "Usuário não encontrado", 
          success: false 
        },
        { status: 404 }
      )
    }

    // Get total count of following
    const { count: totalCount, error: countError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId)

    if (countError) {
      console.error("Error getting following count:", countError)
    }

    // Get following with comprehensive data
    const { data: following, error } = await supabase
      .from("follows")
      .select(`
        following:users!following_id(
          id,
          username,
          name,
          bio,
          avatar_url,
          premium_type,
          is_verified,
          location,
          followers:follows!following_id(count),
          following:follows!follower_id(count),
          posts:posts(count)
        ),
        created_at
      `)
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
      .range(calculatedOffset, calculatedOffset + limit - 1)

    if (error) {
      return NextResponse.json(
        { 
          error: error.message, 
          success: false 
        },
        { status: 400 }
      )
    }

    // Check if current user follows each user (batch query)
    const followingIds = following?.map(f => f.following?.id).filter(Boolean) || []
    
    let followingMap: Record<string, boolean> = {}
    if (currentUser && followingIds.length > 0) {
      const { data: followingData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id)
        .in("following_id", followingIds)

      followingMap = Object.fromEntries(
        followingData?.map(f => [f.following_id, true]) || []
      )
    }

    // Format following with additional data
    const formattedFollowing = following?.map(({ following, created_at }) => {
      if (!following) return null

      const isFollowing = currentUser ? 
        (followingMap[following.id] || currentUser.id === following.id) : false

      return {
        ...following,
        followed_at: created_at,
        is_following: isFollowing,
        is_current_user: currentUser?.id === following.id,
        followers_count: following.followers?.[0]?.count || 0,
        following_count: following.following?.[0]?.count || 0,
        posts_count: following.posts?.[0]?.count || 0,
        // Remove nested arrays
        followers: undefined,
        following: undefined,
        posts: undefined
      }
    }).filter(Boolean) || []

    const hasMore = totalCount ? calculatedOffset + limit < totalCount : following?.length === limit

    return NextResponse.json({
      data: formattedFollowing,
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
    console.error("Error in following API:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor", 
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