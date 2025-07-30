import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface Params {
  params: {
    storyId: string
  }
}

const boostSchema = z.object({
  credits: z.number().min(50),
  duration: z.number().min(6).max(24)
})

// POST /api/v1/stories/[storyId]/boost - Boost a story
export async function POST(request: NextRequest, { params }: Params) {
  const supabase = createClient()
  const { storyId } = params
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { credits, duration } = boostSchema.parse(body)

    // Check if user owns the story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('user_id, is_boosted')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (story.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (story.is_boosted) {
      return NextResponse.json({ error: 'Story is already boosted' }, { status: 400 })
    }

    // Check user credits
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('credit_balance')
      .eq('user_id', user.id)
      .single()

    if (creditsError || !userCredits || userCredits.credit_balance < credits) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    // Start transaction
    // Create boost record
    const boostExpiresAt = new Date(Date.now() + duration * 3600000) // hours to ms
    
    const { data: boost, error: boostError } = await supabase
      .from('story_boosts')
      .insert({
        story_id: storyId,
        user_id: user.id,
        credits_spent: credits,
        boost_duration_hours: duration,
        expires_at: boostExpiresAt.toISOString()
      })
      .select()
      .single()

    if (boostError) throw boostError

    // Update story
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        is_boosted: true,
        boost_expires_at: boostExpiresAt.toISOString(),
        boost_credits_spent: credits
      })
      .eq('id', storyId)

    if (updateError) throw updateError

    // Deduct credits
    const { error: creditError } = await supabase
      .from('user_credit_transactions')
      .insert({
        user_id: user.id,
        type: 'spend',
        amount: -credits,
        balance_before: userCredits.credit_balance,
        balance_after: userCredits.credit_balance - credits,
        reference_type: 'story_boost',
        reference_id: boost.id,
        description: `Impulsionar story por ${duration} horas`
      })

    if (creditError) throw creditError

    return NextResponse.json({ 
      success: true,
      boost,
      message: `Story impulsionado por ${duration} horas`
    })
  } catch (error) {
    console.error('Error boosting story:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to boost story' },
      { status: 500 }
    )
  }
}