import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface Params {
  params: {
    id: string
  }
}

// POST /api/v1/posts/[id]/poll/vote - Vote on post poll
export async function POST(request: NextRequest, { params }: Params) {
  const supabase = await createServerClient()
  const { id: postId } = params
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { option_id: optionId } = body

    if (!optionId) {
      return NextResponse.json(
        { error: 'Option ID é obrigatório' },
        { status: 400 }
      )
    }

    // Get post with poll info
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('poll_question, poll_options, poll_expires_at')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    if (!post.poll_question || !post.poll_options) {
      return NextResponse.json({ error: 'Post não tem enquete' }, { status: 400 })
    }

    // Check if poll is expired
    if (post.poll_expires_at && new Date(post.poll_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Enquete expirada' }, { status: 410 })
    }

    // Validate option exists
    const optionIndex = parseInt(optionId) - 1
    if (isNaN(optionIndex) || !post.poll_options[optionIndex]) {
      return NextResponse.json({ error: 'Opção inválida' }, { status: 400 })
    }

    // Check if user already voted on this poll
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      return NextResponse.json({ error: 'Você já votou nesta enquete' }, { status: 409 })
    }

    // Record the vote
    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: postId,
        user_id: user.id,
        option_ids: [parseInt(optionId)]
      })

    if (voteError) {
      console.error('Error recording vote:', voteError)
      return NextResponse.json({ error: 'Erro ao registrar voto' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Voto registrado com sucesso',
      poll_id: postId,
      option_id: optionId
    })

  } catch (error) {
    console.error('Error in poll vote:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}