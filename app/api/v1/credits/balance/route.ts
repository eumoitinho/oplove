import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/credits/balance - Get user's credit balance
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get or create user credits
    let { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // Create credits record if doesn't exist
      const { data: newCredits, error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          credit_balance: 0,
          total_purchased: 0,
          total_spent: 0,
          total_gifted: 0,
          total_received: 0
        })
        .select()
        .single()

      if (insertError) throw insertError
      credits = newCredits
    }

    return NextResponse.json({
      userId: user.id,
      creditBalance: credits.credit_balance,
      totalPurchased: credits.total_purchased,
      totalSpent: credits.total_spent,
      totalGifted: credits.total_gifted,
      totalReceived: credits.total_received
    })
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit balance' },
      { status: 500 }
    )
  }
}