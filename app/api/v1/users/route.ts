import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/v1/users - Search/list users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const filter = searchParams.get("filter") // verified, premium, etc.

    const supabase = createServerClient()

    let query = supabase
      .from("users")
      .select(`
        id,
        username,
        name,
        bio,
        avatar_url,
        cover_url,
        premium_type,
        is_verified,
        created_at,
        followers:follows!following_id(count),
        following:follows!follower_id(count)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)
      .offset(offset)

    // Apply search filter
    if (search) {
      query = query.or(`username.ilike.%${search}%,name.ilike.%${search}%`)
    }

    // Apply other filters
    if (filter === "verified") {
      query = query.eq("is_verified", true)
    } else if (filter === "premium") {
      query = query.neq("premium_type", "free")
    }

    const { data: users, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Format response
    const formattedUsers = users?.map(user => ({
      ...user,
      followers_count: user.followers?.[0]?.count || 0,
      following_count: user.following?.[0]?.count || 0,
    }))

    return NextResponse.json({
      data: formattedUsers,
      success: true,
      pagination: {
        limit,
        offset,
        hasMore: users?.length === limit,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}