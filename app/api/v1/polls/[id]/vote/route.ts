import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// POST /api/v1/polls/[id]/vote - Vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: "Não autorizado",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 401 }
      )
    }

    const pollId = params.id
    const { optionId } = await request.json()

    if (!optionId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Option ID é obrigatório",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 400 }
      )
    }

    // Get poll details
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("*")
      .eq("id", pollId)
      .single()

    if (pollError || !poll) {
      return NextResponse.json(
        { 
          success: false,
          error: "Enquete não encontrada",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 404 }
      )
    }

    // Check if poll is expired
    if (new Date(poll.expires_at) < new Date()) {
      return NextResponse.json(
        { 
          success: false,
          error: "Enquete encerrada",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 400 }
      )
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("poll_votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      return NextResponse.json(
        { 
          success: false,
          error: "Você já votou nesta enquete",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 400 }
      )
    }

    // Validate option exists
    const optionIndex = parseInt(optionId) - 1
    if (!poll.options[optionIndex]) {
      return NextResponse.json(
        { 
          success: false,
          error: "Opção inválida",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 400 }
      )
    }

    // Create vote
    const { error: voteError } = await supabase
      .from("poll_votes")
      .insert({
        poll_id: pollId,
        user_id: user.id,
        option_ids: [parseInt(optionId)]
      })

    if (voteError) {
      return NextResponse.json(
        { 
          success: false,
          error: "Erro ao registrar voto",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 500 }
      )
    }

    // Update vote count in poll options
    const updatedOptions = [...poll.options]
    updatedOptions[optionIndex].votes += 1

    const { error: updateError } = await supabase
      .from("polls")
      .update({ options: updatedOptions })
      .eq("id", pollId)

    if (updateError) {
      console.error("Error updating poll vote count:", updateError)
    }

    return NextResponse.json({
      success: true,
      data: {
        poll_id: pollId,
        option_id: optionId,
        voted_at: new Date().toISOString()
      },
      error: null,
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    })
  } catch (error) {
    console.error("Error voting on poll:", error)
    
    return NextResponse.json(
      { 
        success: false,
        error: "Erro interno do servidor",
        data: null,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0"
        }
      },
      { status: 500 }
    )
  }
}