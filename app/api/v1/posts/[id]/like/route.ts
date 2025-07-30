import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// POST /api/v1/posts/[id]/like - Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", params.id)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      return NextResponse.json(
        { error: "Post já foi curtido", success: false },
        { status: 400 }
      )
    }

    // Create like
    const { error } = await supabase
      .from("post_likes")
      .insert({
        post_id: params.id,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Get updated like count
    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", params.id)

    return NextResponse.json({
      success: true,
      data: {
        likes_count: count || 0,
        is_liked: true,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/posts/[id]/like - Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", params.id)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Get updated like count
    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", params.id)

    return NextResponse.json({
      success: true,
      data: {
        likes_count: count || 0,
        is_liked: false,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}