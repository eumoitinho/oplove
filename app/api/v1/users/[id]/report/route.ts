import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

type ReportReason = 'spam' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'copyright' | 'misinformation' | 'other'

const VALID_REASONS: ReportReason[] = [
  'spam', 
  'harassment', 
  'inappropriate_content', 
  'fake_profile',
  'copyright', 
  'misinformation', 
  'other'
]

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

    const reportedUserId = params.id
    const { reason, description = '' } = await request.json()

    // Validar motivo da denúncia
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ 
        error: 'Motivo de denúncia inválido',
        valid_reasons: VALID_REASONS 
      }, { status: 400 })
    }

    // Verificar se o usuário existe
    const { data: reportedUser, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', reportedUserId)
      .single()

    if (userError || !reportedUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário está tentando denunciar a si mesmo
    if (reportedUserId === user.id) {
      return NextResponse.json({ error: 'Você não pode denunciar a si mesmo' }, { status: 400 })
    }

    // Verificar se o usuário já denunciou este usuário
    const { data: existingReport } = await supabase
      .from('user_reports')
      .select('id')
      .eq('reported_id', reportedUserId)
      .eq('reporter_id', user.id)
      .single()

    if (existingReport) {
      return NextResponse.json({ error: 'Você já denunciou este usuário' }, { status: 409 })
    }

    // Criar a denúncia
    const { data: report, error: reportError } = await supabase
      .from('user_reports')
      .insert({
        reported_id: reportedUserId,
        reporter_id: user.id,
        reason,
        description: description.trim(),
        status: 'pending'
      })
      .select()
      .single()

    if (reportError) {
      console.error('Erro ao criar denúncia:', reportError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Contar quantas denúncias este usuário recebeu
    const { count: reportCount } = await supabase
      .from('user_reports')
      .select('id', { count: 'exact' })
      .eq('reported_id', reportedUserId)
      .eq('status', 'pending')

    // Se o usuário recebeu muitas denúncias, marcar para revisão automática
    if (reportCount && reportCount >= 3) {
      // Criar item na fila de moderação
      await supabase
        .from('moderation_queue')
        .insert({
          content_type: 'user',
          content_id: reportedUserId,
          reporter_id: user.id,
          reported_id: reportedUserId,
          reason,
          priority: 'high',
          status: 'pending',
          metadata: { report_count: reportCount }
        })

      // Se muitas denúncias, suspender temporariamente
      if (reportCount >= 10) {
        await supabase
          .from('users')
          .update({ 
            is_suspended: true,
            suspension_reason: 'Multiple reports - automatic suspension',
            suspended_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', reportedUserId)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Denúncia enviada com sucesso',
      report_id: report.id
    })

  } catch (error) {
    console.error('Erro ao criar denúncia:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Verificar se o usuário já denunciou outro usuário
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

    const reportedUserId = params.id

    // Verificar se o usuário já denunciou este usuário
    const { data: existingReport } = await supabase
      .from('user_reports')
      .select('id, reason, created_at, status')
      .eq('reported_id', reportedUserId)
      .eq('reporter_id', user.id)
      .single()

    return NextResponse.json({
      has_reported: !!existingReport,
      report: existingReport || null
    })

  } catch (error) {
    console.error('Erro ao verificar denúncia:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}