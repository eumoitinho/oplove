import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/v1/users/[id]/following - Get users that this user follows
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
          is_verified
        ),
        created_at
      `)
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)
      .offset(offset)

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Check if current user follows each user
    const formattedFollowing = await Promise.all(
      following?.map(async ({ following, created_at }) => {
        let isFollowing = false
        
        if (currentUser && following && currentUser.id !== following.id) {
          const { data } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", currentUser.id)
            .eq("following_id", following.id)
            .single()
          
          isFollowing = !!data
        }

        return {
          ...following,
          followed_at: created_at,
          is_following: isFollowing || currentUser?.id === following?.id,
        }
      }) || []
    )

    return NextResponse.json({
      data: formattedFollowing,
      success: true,
      pagination: {
        limit,
        offset,
        hasMore: following?.length === limit,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}