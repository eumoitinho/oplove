import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    
    // Filters
    const dateRange = searchParams.get("dateRange")
    const location = searchParams.get("location")
    const verifiedOnly = searchParams.get("verifiedOnly") === "true"
    const mediaType = searchParams.get("mediaType")

    if (!query || query.length < 2) {
      return NextResponse.json({
        error: "Query must be at least 2 characters long",
        success: false
      }, { status: 400 })
    }

    const supabase = createServerClient()
    const authUser = await getAuthUser(req)

    // Build queries based on type
    const results: any = {
      users: [],
      posts: [],
      totalCount: 0
    }

    // Search users
    if (type === "all" || type === "people") {
      let usersQuery = supabase
        .from("users")
        .select("*")
        .or(`username.ilike.%${query}%,name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(limit)
        .range(offset, offset + limit - 1)

      if (verifiedOnly) {
        usersQuery = usersQuery.eq("is_verified", true)
      }

      if (location) {
        usersQuery = usersQuery.ilike("location", `%${location}%`)
      }

      const { data: users, error: usersError } = await usersQuery

      if (usersError) throw usersError
      results.users = users || []
    }

    // Search posts
    if (type === "all" || type === "posts" || type === "photos" || type === "videos") {
      let postsQuery = supabase
        .from("posts")
        .select(`
          *,
          user:users(*)
        `)
        .textSearch("content", query)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1)

      // Date range filter
      if (dateRange) {
        const now = new Date()
        let startDate = new Date()
        
        switch (dateRange) {
          case "today":
            startDate.setHours(0, 0, 0, 0)
            break
          case "week":
            startDate.setDate(now.getDate() - 7)
            break
          case "month":
            startDate.setMonth(now.getMonth() - 1)
            break
          case "year":
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }
        
        postsQuery = postsQuery.gte("created_at", startDate.toISOString())
      }

      const { data: posts, error: postsError } = await postsQuery

      if (postsError) throw postsError
      
      let filteredPosts = posts || []
      
      // Filter by media type
      if (type === "photos" || mediaType === "photos") {
        filteredPosts = filteredPosts.filter(post => 
          post.media_urls && post.media_urls.some((url: string) => 
            url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          )
        )
      } else if (type === "videos" || mediaType === "videos") {
        filteredPosts = filteredPosts.filter(post => 
          post.media_urls && post.media_urls.some((url: string) => 
            url.match(/\.(mp4|webm|mov)$/i)
          )
        )
      }
      
      results.posts = filteredPosts
    }

    // Calculate total count
    results.totalCount = results.users.length + results.posts.length

    // Log search query for analytics (optional)
    if (authUser) {
      await supabase.from("search_history").insert({
        user_id: authUser.id,
        query,
        type,
        results_count: results.totalCount
      })
    }

    return NextResponse.json({
      data: results,
      success: true
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({
      error: "Failed to perform search",
      success: false
    }, { status: 500 })
  }
}

// Get trending searches
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get trending searches from the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: trending, error } = await supabase
      .from("search_history")
      .select("query, count")
      .gte("created_at", yesterday.toISOString())
      .order("count", { ascending: false })
      .limit(10)

    if (error) throw error

    // Group by query and sum counts
    const trendingMap = new Map()
    trending?.forEach(item => {
      const current = trendingMap.get(item.query) || 0
      trendingMap.set(item.query, current + (item.count || 1))
    })

    // Convert to array and sort
    const trendingSearches = Array.from(trendingMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      data: trendingSearches,
      success: true
    })
  } catch (error) {
    console.error("Trending searches error:", error)
    return NextResponse.json({
      error: "Failed to get trending searches",
      success: false
    }, { status: 500 })
  }
}