import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// POST /api/v1/users/[id]/follow - Follow a user
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

    // Cannot follow yourself
    if (params.id === user.id) {
      return NextResponse.json(
        { error: "Você não pode seguir a si mesmo", success: false },
        { status: 400 }
      )
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", params.id)
      .single()

    if (existingFollow) {
      return NextResponse.json(
        { error: "Você já está seguindo este usuário", success: false },
        { status: 400 }
      )
    }

    // Create follow relationship
    const { error } = await supabase
      .from("follows")
      .insert({
        follower_id: user.id,
        following_id: params.id,
        created_at: new Date().toISOString(),
      })

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Create notification for the followed user
    await supabase
      .from("notifications")
      .insert({
        user_id: params.id,
        type: "follow",
        actor_id: user.id,
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      message: "Agora você está seguindo este usuário",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/users/[id]/follow - Unfollow a user
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
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", params.id)

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Você deixou de seguir este usuário",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}