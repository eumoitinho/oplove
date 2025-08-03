import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"

const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(["image", "video", "audio"]),
  })).optional(),
})

// GET /api/v1/messages/conversations/[id]/messages - Get messages from a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string  }> }
) {
  try {
    const { id: id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Check if user is participant
    const { data: participant } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", id)
      .eq("user_id", user.id)
      .single()

    if (!participant) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 403 }
      )
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:users(id, username, name, avatar_url, premium_type, is_verified)
      `)
      .eq("conversation_id", id)
      .order("created_at", { ascending: false })
      .limit(limit)
      .offset(offset)

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Mark messages as read
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .neq("sender_id", user.id)
      .is("read_at", null)

    return NextResponse.json({
      data: messages?.reverse() || [],
      success: true,
      pagination: {
        limit,
        offset,
        hasMore: messages?.length === limit,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// POST /api/v1/messages/conversations/[id]/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string  }> }
) {
  try {
    const { id: id } = await params
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from("users")
      .select("premium_type, daily_message_count, daily_message_limit")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado", success: false },
        { status: 404 }
      )
    }

    // Check if user is participant
    const { data: participant } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", id)
      .eq("user_id", user.id)
      .single()

    if (!participant) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 403 }
      )
    }

    // Get conversation details
    const { data: conversation } = await supabase
      .from("conversations")
      .select("initiated_by, initiated_by_premium")
      .eq("id", id)
      .single()

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversa não encontrada", success: false },
        { status: 404 }
      )
    }

    // Check messaging permissions for free users
    if (profile.premium_type === "free") {
      // Free users can only reply if conversation was initiated by premium user
      if (!conversation.initiated_by_premium || conversation.initiated_by === user.id) {
        return NextResponse.json(
          { error: "Usuários gratuitos só podem responder mensagens de usuários premium", success: false },
          { status: 403 }
        )
      }
    }

    // Check daily limit for Gold users
    if (profile.premium_type === "gold" && profile.daily_message_count >= (profile.daily_message_limit || 10)) {
      return NextResponse.json(
        { error: "Limite diário de mensagens atingido", success: false },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, media } = sendMessageSchema.parse(body)

    // Create message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: id,
        sender_id: user.id,
        content,
        media: media || [],
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        sender:users(id, username, name, avatar_url, premium_type, is_verified)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Update conversation
    await supabase
      .from("conversations")
      .update({ 
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .eq("id", id)

    // Update daily message count for Gold users
    if (profile.premium_type === "gold") {
      await supabase
        .from("users")
        .update({ 
          daily_message_count: (profile.daily_message_count || 0) + 1,
        })
        .eq("id", user.id)
    }

    return NextResponse.json({
      data: message,
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