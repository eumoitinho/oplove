import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const { shareType = 'public', message = null } = await request.json()

    // Verificar se o post existe e está público
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id, visibility, content')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    if (post.visibility !== 'public') {
      return NextResponse.json({ error: 'Post não pode ser compartilhado' }, { status: 403 })
    }

    // Verificar se já compartilhou (evitar spam)
    const { data: existingShare } = await supabase
      .from('post_shares')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingShare) {
      return NextResponse.json({ error: 'Post já foi compartilhado' }, { status: 409 })
    }

    // Criar o compartilhamento
    const { error: shareError } = await supabase
      .from('post_shares')
      .insert({
        post_id: postId,
        user_id: user.id,
        share_type: shareType,
        message,
        shared_at: new Date().toISOString()
      })

    if (shareError) {
      console.error('Erro ao compartilhar:', shareError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Atualizar contador de compartilhamentos
    const { error: updateError } = await supabase
      .rpc('increment_post_shares', { post_id: postId })

    if (updateError) {
      console.error('Erro ao atualizar contador:', updateError)
    }

    // Criar notificação para o autor (se não for ele mesmo)
    if (post.user_id !== user.id) {
      await supabase
        .from('notifications')
        .insert({
          recipient_id: post.user_id,
          sender_id: user.id,
          type: 'post_share',
          content: `compartilhou seu post`,
          reference_id: postId,
          created_at: new Date().toISOString()
        })
    }

    // Buscar contador atualizado
    const { data: updatedPost } = await supabase
      .from('posts')
      .select('shares_count')
      .eq('id', postId)
      .single()

    return NextResponse.json({
      success: true,
      shares_count: updatedPost?.shares_count || 0
    })

  } catch (error) {
    console.error('Erro ao compartilhar post:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Remover compartilhamento
    const { error: deleteError } = await supabase
      .from('post_shares')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Erro ao desfazer compartilhamento:', deleteError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Decrementar contador
    const { error: updateError } = await supabase
      .rpc('decrement_post_shares', { post_id: postId })

    if (updateError) {
      console.error('Erro ao atualizar contador:', updateError)
    }

    // Buscar contador atualizado
    const { data: updatedPost } = await supabase
      .from('posts')
      .select('shares_count')
      .eq('id', postId)
      .single()

    return NextResponse.json({
      success: true,
      shares_count: updatedPost?.shares_count || 0
    })

  } catch (error) {
    console.error('Erro ao desfazer compartilhamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Buscar compartilhamentos de um post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    const user = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Buscar compartilhamentos com dados do usuário
    const { data: shares, error } = await supabase
      .from('post_shares')
      .select(`
        id,
        message,
        shared_at,
        share_type,
        user:users(
          id,
          name,
          username,
          avatar_url,
          is_verified
        )
      `)
      .eq('post_id', postId)
      .eq('share_type', 'public')
      .order('shared_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar compartilhamentos:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Verificar se o usuário atual compartilhou
    let userHasShared = false
    if (user) {
      const { data: userShare } = await supabase
        .from('post_shares')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()
      
      userHasShared = !!userShare
    }

    return NextResponse.json({
      shares: shares || [],
      userHasShared,
      pagination: {
        page,
        limit,
        hasMore: shares?.length === limit
      }
    })

  } catch (error) {
    console.error('Erro ao buscar compartilhamentos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}