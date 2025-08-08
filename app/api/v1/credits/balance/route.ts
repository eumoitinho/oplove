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
      console.log('[Credits API] No credits found for user, creating new record')
      
      // Check if it's a not found error (expected) or a real error
      if (error.code !== 'PGRST116') {
        console.error('[Credits API] Error fetching credits:', error)
      }
      
      // Try to create credits record if doesn't exist
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

      if (insertError) {
        // If insert fails, it might be because the record already exists
        // Try to fetch again
        const { data: retryCredits, error: retryError } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', user.id)
          .single()
          
        if (retryError || !retryCredits) {
          console.error('[Credits API] Failed to create or fetch credits:', insertError, retryError)
          // Return default values instead of throwing
          return NextResponse.json({
            userId: user.id,
            creditBalance: 0,
            totalPurchased: 0,
            totalSpent: 0,
            totalGifted: 0,
            totalReceived: 0
          })
        }
        
        credits = retryCredits
      } else {
        credits = newCredits
      }
    }

    return NextResponse.json({
      userId: user.id,
      creditBalance: credits?.credit_balance || 0,
      totalPurchased: credits?.total_purchased || 0,
      totalSpent: credits?.total_spent || 0,
      totalGifted: credits?.total_gifted || 0,
      totalReceived: credits?.total_received || 0
    })
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit balance' },
      { status: 500 }
    )
  }
}