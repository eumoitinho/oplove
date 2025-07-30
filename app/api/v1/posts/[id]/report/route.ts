import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

type ReportReason = 'spam' | 'harassment' | 'inappropriate_content' | 'copyright' | 'misinformation' | 'other'

const VALID_REASONS: ReportReason[] = [
  'spam', 
  'harassment', 
  'inappropriate_content', 
  'copyright', 
  'misinformation', 
  'other'
]

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const postId = params.id
    const { reason, description = '' } = await request.json()

    // Validar motivo da denúncia
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ 
        error: 'Motivo de denúncia inválido',
        valid_reasons: VALID_REASONS 
      }, { status: 400 })
    }

    // Verificar se o post existe
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id, content')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário está tentando denunciar seu próprio post
    if (post.user_id === user.id) {
      return NextResponse.json({ error: 'Você não pode denunciar seu próprio post' }, { status: 400 })
    }

    // Verificar se o usuário já denunciou este post
    const { data: existingReport } = await supabase
      .from('post_reports')
      .select('id')
      .eq('post_id', postId)
      .eq('reporter_id', user.id)
      .single()

    if (existingReport) {
      return NextResponse.json({ error: 'Você já denunciou este post' }, { status: 409 })
    }

    // Criar a denúncia
    const { data: report, error: reportError } = await supabase
      .from('post_reports')
      .insert({
        post_id: postId,
        reporter_id: user.id,
        reported_id: post.user_id,
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

    // Incrementar contador de denúncias do post
    await supabase
      .rpc('increment_post_reports', { post_id: postId })

    // Se o post recebeu muitas denúncias, marcar para revisão automática
    const { data: postStats } = await supabase
      .from('posts')
      .select('reports_count')
      .eq('id', postId)
      .single()

    if (postStats && postStats.reports_count >= 5) {
      // Marcar post para revisão automática
      await supabase
        .from('posts')
        .update({ 
          needs_review: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)

      // Criar notificação para moderadores
      await supabase
        .from('moderation_queue')
        .insert({
          content_type: 'post',
          content_id: postId,
          reporter_id: user.id,
          reported_id: post.user_id,
          reason,
          priority: 'high',
          status: 'pending'
        })
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

// Verificar se o usuário já denunciou o post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const postId = params.id

    // Verificar se o usuário já denunciou este post
    const { data: existingReport } = await supabase
      .from('post_reports')
      .select('id, reason, created_at, status')
      .eq('post_id', postId)
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