import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/v1/users/[id]/followers - Get user's followers
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const supabase = createServerClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    const userId = params.id === "me" ? currentUser?.id : params.id

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não encontrado", success: false },
        { status: 404 }
      )
    }

    const { data: followers, error } = await supabase
      .from("follows")
      .select(`
        follower:users!follower_id(
          id,
          username,
          name,
          bio,
          avatar_url,
          premium_type,
          is_verified
        ),
        created_at
      `)
      .eq("following_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)
      .offset(offset)

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Check if current user follows each follower
    const formattedFollowers = await Promise.all(
      followers?.map(async ({ follower, created_at }) => {
        let isFollowing = false
        
        if (currentUser && follower) {
          const { data } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", currentUser.id)
            .eq("following_id", follower.id)
            .single()
          
          isFollowing = !!data
        }

        return {
          ...follower,
          followed_at: created_at,
          is_following: isFollowing,
        }
      }) || []
    )

    return NextResponse.json({
      data: formattedFollowers,
      success: true,
      pagination: {
        limit,
        offset,
        hasMore: followers?.length === limit,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}