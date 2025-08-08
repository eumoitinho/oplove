import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipientId } = body

    if (!recipientId) {
      return NextResponse.json(
        { error: "recipientId é obrigatório", success: false },
        { status: 400 }
      )
    }

    console.log('🔍 CREATE CONVERSATION API - Request:', { senderId: user.id, recipientId })

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('user_id', [user.id, recipientId])
    
    if (existingConv && existingConv.length >= 2) {
      // Find conversation that has both users
      const conversationCounts = existingConv.reduce((acc: any, conv: any) => {
        acc[conv.conversation_id] = (acc[conv.conversation_id] || 0) + 1
        return acc
      }, {})
      
      const existingConversationId = Object.keys(conversationCounts).find(
        id => conversationCounts[id] === 2
      )
      
      if (existingConversationId) {
        console.log('🔍 CREATE CONVERSATION API - Conversation already exists:', existingConversationId)
        return NextResponse.json({
          success: true,
          data: { id: existingConversationId },
          message: "Conversa já existe"
        })
      }
    }
    
    // Check if sender can create conversations
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('premium_type')
      .eq('id', user.id)
      .single()

    console.log('🔍 CREATE CONVERSATION API - Sender check:', { sender, senderError })

    if (senderError || !sender) {
      throw new Error('Erro ao verificar usuário')
    }

    // Free users cannot create conversations
    if (!sender.premium_type || sender.premium_type === 'free') {
      console.log('🔍 CREATE CONVERSATION API - Free user cannot create conversation')
      return NextResponse.json({
        success: false,
        error: "Usuários gratuitos não podem criar conversas",
        errorType: "PLAN_LIMIT",
        requiredPlan: "Gold"
      }, { status: 403 })
    }
    
    console.log('🔍 CREATE CONVERSATION API - User can create conversation, proceeding...')

    // Create conversation using direct database API call to avoid RLS issues
    const conversationId = crypto.randomUUID()
    
    // Insert conversation record directly
    const conversationResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: conversationId,
        type: 'direct',
        initiated_by: user.id,
        initiated_by_premium: true
      })
    })

    if (!conversationResponse.ok) {
      const errorText = await conversationResponse.text()
      console.error('🔍 CREATE CONVERSATION API - Conversation creation failed:', errorText)
      throw new Error(`Failed to create conversation: ${errorText}`)
    }

    const conversation = await conversationResponse.json()
    console.log('🔍 CREATE CONVERSATION API - Conversation created:', conversation)

    // Add participants using direct API call
    const participantsResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/conversation_participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([
        { conversation_id: conversationId, user_id: user.id, role: 'member' },
        { conversation_id: conversationId, user_id: recipientId, role: 'member' }
      ])
    })

    if (!participantsResponse.ok) {
      const errorText = await participantsResponse.text()
      console.error('🔍 CREATE CONVERSATION API - Participants creation failed:', errorText)
      
      // Rollback conversation
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/conversations?id=eq.${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      })
      
      throw new Error(`Failed to add participants: ${errorText}`)
    }

    const participants = await participantsResponse.json()
    console.log('🔍 CREATE CONVERSATION API - Participants added:', participants)
    
    console.log('🔍 CREATE CONVERSATION API - Conversation created successfully:', conversationId)

    return NextResponse.json({
      success: true,
      data: conversation[0] || { id: conversationId },
      message: "Conversa criada com sucesso"
    })

  } catch (error) {
    console.error('🔍 CREATE CONVERSATION API - Error:', error)
    return NextResponse.json(
      { 
        error: error.message, 
        success: false
      },
      { status: 500 }
    )
  }
}