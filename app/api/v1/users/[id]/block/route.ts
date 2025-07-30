import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const targetUserId = params.id
    const { reason = null } = await request.json()

    // Verificar se o usuário está tentando bloquear a si mesmo
    if (user.id === targetUserId) {
      return NextResponse.json({ error: 'Você não pode bloquear a si mesmo' }, { status: 400 })
    }

    // Verificar se o usuário alvo existe
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se já foi bloqueado
    const { data: existingBlock } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', user.id)
      .eq('blocked_id', targetUserId)
      .single()

    if (existingBlock) {
      return NextResponse.json({ error: 'Usuário já foi bloqueado' }, { status: 409 })
    }

    // Criar o bloqueio
    const { error: blockError } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: user.id,
        blocked_id: targetUserId,
        reason,
        blocked_at: new Date().toISOString()
      })

    if (blockError) {
      console.error('Erro ao bloquear usuário:', blockError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Se havia relação de seguir, remover
    await supabase
      .from('follows')
      .delete()
      .or(`follower_id.eq.${user.id},follower_id.eq.${targetUserId}`)
      .or(`following_id.eq.${user.id},following_id.eq.${targetUserId}`)

    // Remover conversas existentes
    await supabase
      .from('conversations')
      .delete()
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`
      )

    return NextResponse.json({
      success: true,
      message: 'Usuário bloqueado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao bloquear usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const targetUserId = params.id

    // Remover bloqueio
    const { error: unblockError } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', targetUserId)

    if (unblockError) {
      console.error('Erro ao desbloquear usuário:', unblockError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário desbloqueado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Verificar se um usuário está bloqueado
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const targetUserId = params.id

    // Verificar se o usuário foi bloqueado pelo usuário atual
    const { data: isBlocked } = await supabase
      .from('user_blocks')
      .select('id, reason, blocked_at')
      .eq('blocker_id', user.id)
      .eq('blocked_id', targetUserId)
      .single()

    // Verificar se o usuário atual foi bloqueado pelo usuário alvo
    const { data: wasBlockedBy } = await supabase
      .from('user_blocks')
      .select('id, blocked_at')
      .eq('blocker_id', targetUserId)
      .eq('blocked_id', user.id)
      .single()

    return NextResponse.json({
      isBlocked: !!isBlocked,
      wasBlockedBy: !!wasBlockedBy,
      blockDetails: isBlocked ? {
        reason: isBlocked.reason,
        blocked_at: isBlocked.blocked_at
      } : null
    })

  } catch (error) {
    console.error('Erro ao verificar bloqueio:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}