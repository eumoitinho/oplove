import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"

const createConversationSchema = z.object({
  participant_ids: z.array(z.string().uuid()).min(1),
  type: z.enum(["direct", "group"]).default("direct"),
  name: z.string().optional(),
})

// GET /api/v1/messages/conversations - List user conversations
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Get conversations where user is a participant
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        *,
        participants:conversation_participants(
          user:users(id, username, name, avatar_url, premium_type, is_verified)
        ),
        last_message:messages(
          content,
          created_at,
          sender:users(username)
        )
      `)
      .eq("conversation_participants.user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: conversations,
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// POST /api/v1/messages/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Get user profile to check plan
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("premium_type, daily_message_count, daily_message_limit")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[POST /api/v1/messages/conversations] Profile error:", {
        error: profileError,
        userId: user.id
      })
      
      return NextResponse.json(
        { 
          error: profileError.code === 'PGRST116' 
            ? "Perfil não encontrado. Por favor, faça login novamente."
            : `Erro ao buscar perfil: ${profileError.message}`,
          success: false 
        },
        { status: profileError.code === 'PGRST116' ? 404 : 500 }
      )
    }
    
    if (!profile) {
      console.error("[POST /api/v1/messages/conversations] Profile is null for user:", user.id)
      return NextResponse.json(
        { error: "Perfil não encontrado", success: false },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { participant_ids, type, name } = createConversationSchema.parse(body)

    // Check messaging permissions based on plan
    if (profile.premium_type === "free") {
      return NextResponse.json(
        { error: "Usuários gratuitos não podem iniciar conversas", success: false },
        { status: 403 }
      )
    }

    // Check daily message limit for Gold users
    if (profile.premium_type === "gold" && profile.daily_message_count >= (profile.daily_message_limit || 10)) {
      return NextResponse.json(
        { error: "Limite diário de mensagens atingido", success: false },
        { status: 403 }
      )
    }

    // Check group chat permissions
    if (type === "group" && profile.premium_type !== "diamond" && profile.premium_type !== "couple") {
      return NextResponse.json(
        { error: "Apenas usuários Diamond ou Couple podem criar grupos", success: false },
        { status: 403 }
      )
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        type,
        name,
        initiated_by: user.id,
        initiated_by_premium: profile.premium_type !== "free",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (convError) {
      return NextResponse.json(
        { error: convError.message, success: false },
        { status: 400 }
      )
    }

    // Add participants
    const participants = [user.id, ...participant_ids].map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      joined_at: new Date().toISOString(),
    }))

    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert(participants)

    if (participantsError) {
      // Rollback conversation creation
      await supabase.from("conversations").delete().eq("id", conversation.id)
      
      return NextResponse.json(
        { error: "Erro ao adicionar participantes", success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: conversation,
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