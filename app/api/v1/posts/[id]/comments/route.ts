import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/auth-utils"

const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
})

// GET /api/v1/posts/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const supabase = await createServerClient()

    const { data: comments, error } = await supabase
      .from("post_comments")
      .select(`
        *,
        user:users(id, username, name, avatar_url, premium_type, is_verified)
      `)
      .eq("post_id", params.id)
      .order("created_at", { ascending: false })
      .limit(limit)
      .offset(offset)

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: comments,
      success: true,
      pagination: {
        limit,
        offset,
        hasMore: comments?.length === limit,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// POST /api/v1/posts/[id]/comments - Add a comment to a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = createCommentSchema.parse(body)

    // Create comment
    const { data: comment, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: params.id,
        user_id: user.id,
        content,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        user:users(id, username, name, avatar_url, premium_type, is_verified)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: comment,
      success: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}