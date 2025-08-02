import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/users/[id]/seals - Get user's profile seals
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    
    // Handle special case for "me"
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const userId = params.id === "me" ? currentUser?.id : params.id

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não encontrado", success: false },
        { status: 404 }
      )
    }

    // Get user's profile seals with seal details
    const { data: userSeals, error } = await supabase
      .from('user_profile_seals')
      .select(`
        id,
        seal_id,
        gifted_at,
        is_displayed,
        display_order,
        message,
        sender:users!sender_id(
          id,
          username,
          full_name,
          avatar_url,
          is_verified
        ),
        seal:profile_seals(
          id,
          name,
          emoji,
          icon_url,
          color_scheme,
          description,
          cost_credits,
          rarity
        )
      `)
      .eq('recipient_id', userId)
      .eq('is_displayed', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching user seals:', error)
      return NextResponse.json(
        { error: "Erro ao buscar seals do usuário", success: false },
        { status: 500 }
      )
    }

    // Count total seals received (including hidden ones)
    const { count: totalSeals, error: countError } = await supabase
      .from('user_profile_seals')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)

    if (countError) {
      console.error('Error counting user seals:', countError)
    }

    return NextResponse.json({
      data: {
        seals: userSeals || [],
        totalSeals: totalSeals || 0,
        displayedSeals: userSeals?.length || 0
      },
      success: true
    })
  } catch (error) {
    console.error('Error in user seals endpoint:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}