import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Buscar usuários bloqueados pelo usuário atual
    const { data: blockedUsers, error } = await supabase
      .from('user_blocks')
      .select(`
        id,
        reason,
        blocked_at,
        blocked:users!user_blocks_blocked_id_fkey(
          id,
          name,
          username,
          avatar_url,
          is_verified,
          premium_type
        )
      `)
      .eq('blocker_id', user.id)
      .order('blocked_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar usuários bloqueados:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Contar total de usuários bloqueados
    const { count: totalBlocked } = await supabase
      .from('user_blocks')
      .select('id', { count: 'exact' })
      .eq('blocker_id', user.id)

    return NextResponse.json({
      blocked_users: blockedUsers?.map(block => ({
        block_id: block.id,
        reason: block.reason,
        blocked_at: block.blocked_at,
        user: block.blocked
      })) || [],
      total: totalBlocked || 0,
      pagination: {
        page,
        limit,
        hasMore: blockedUsers?.length === limit
      }
    })

  } catch (error) {
    console.error('Erro ao buscar usuários bloqueados:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}