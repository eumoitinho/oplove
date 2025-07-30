import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/auth-utils"

// DELETE /api/v1/posts/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
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

    // Check if user owns the comment
    const { data: comment } = await supabase
      .from("post_comments")
      .select("user_id, post_id")
      .eq("id", params.commentId)
      .single()

    if (!comment || comment.user_id !== user.id) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 403 }
      )
    }

    // Verify the comment belongs to the correct post
    if (comment.post_id !== params.id) {
      return NextResponse.json(
        { error: "Comentário não pertence a este post", success: false },
        { status: 400 }
      )
    }

    // Delete comment
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", params.commentId)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}