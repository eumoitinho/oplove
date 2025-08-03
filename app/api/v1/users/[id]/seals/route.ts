import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient()
    const resolvedParams = await params
    const userId = resolvedParams.id

    // Get current user to check permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      )
    }

    // Get user profile seals with seal details and sender info
    const { data: userSeals, error: sealsError } = await supabase
      .from('user_profile_seals')
      .select(`
        id,
        created_at,
        seal:profile_seals(
          id,
          name,
          emoji,
          color,
          rarity,
          cost_credits
        ),
        gifted_by:users!user_profile_seals_gifted_by_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (sealsError) {
      console.error('Error fetching user seals:', sealsError)
      return NextResponse.json(
        { error: 'Erro ao buscar seals do usuário' },
        { status: 500 }
      )
    }

    // Count total seals
    const { count: totalSeals, error: countError } = await supabase
      .from('user_profile_seals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      console.error('Error counting user seals:', countError)
    }

    return NextResponse.json({
      data: userSeals || [],
      total: totalSeals || 0,
      displayed: Math.min(6, (userSeals || []).length)
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/v1/users/[id]/seals:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}