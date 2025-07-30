import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const giftSealSchema = z.object({
  recipientId: z.string().uuid(),
  sealId: z.string().uuid(),
  message: z.string().max(200).optional()
})

// POST /api/v1/seals/gift - Gift a seal to another user
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { recipientId, sealId, message } = giftSealSchema.parse(body)

    // Can't gift to yourself
    if (recipientId === user.id) {
      return NextResponse.json({ error: 'Cannot gift seal to yourself' }, { status: 400 })
    }

    // Get seal details
    const { data: seal, error: sealError } = await supabase
      .from('profile_seals')
      .select('*')
      .eq('id', sealId)
      .eq('is_available', true)
      .single()

    if (sealError || !seal) {
      return NextResponse.json({ error: 'Seal not found or unavailable' }, { status: 404 })
    }

    // Check user credits
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('credit_balance')
      .eq('user_id', user.id)
      .single()

    if (creditsError || !userCredits || userCredits.credit_balance < seal.credit_cost) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    // Create gift transaction
    const { data: gift, error: giftError } = await supabase
      .from('user_profile_seals')
      .insert({
        recipient_id: recipientId,
        sender_id: user.id,
        seal_id: sealId,
        message: message?.trim()
      })
      .select(`
        *,
        seal:profile_seals!seal_id(*),
        sender:users!sender_id(
          id,
          name,
          username,
          avatar_url
        )
      `)
      .single()

    if (giftError) throw giftError

    // Deduct credits
    const { error: creditError } = await supabase
      .from('user_credit_transactions')
      .insert({
        user_id: user.id,
        type: 'spend',
        amount: -seal.credit_cost,
        balance_before: userCredits.credit_balance,
        balance_after: userCredits.credit_balance - seal.credit_cost,
        reference_type: 'seal_gift',
        reference_id: gift.id,
        other_user_id: recipientId,
        description: `Presente de selo: ${seal.name}`
      })

    if (creditError) throw creditError

    // Update seal gift count
    await supabase
      .from('profile_seals')
      .update({ times_gifted: seal.times_gifted + 1 })
      .eq('id', sealId)

    // Create notification for recipient
    await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        type: 'seal_received',
        title: 'Você recebeu um selo!',
        message: `${gift.sender.name} enviou o selo "${seal.name}" para você`,
        data: {
          seal_id: sealId,
          sender_id: user.id,
          gift_id: gift.id
        }
      })

    return NextResponse.json({ 
      success: true,
      gift,
      message: 'Selo enviado com sucesso!'
    })
  } catch (error) {
    console.error('Error gifting seal:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to gift seal' },
      { status: 500 }
    )
  }
}