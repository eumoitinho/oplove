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
    const { collection_id = null } = await request.json()

    // Verificar se o post existe
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id, visibility')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    // Verificar se já salvou
    const { data: existingSave } = await supabase
      .from('post_saves')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingSave) {
      return NextResponse.json({ error: 'Post já foi salvo' }, { status: 409 })
    }

    // Se foi especificada uma collection, verificar se pertence ao usuário
    if (collection_id) {
      const { data: collection, error: collectionError } = await supabase
        .from('saved_collections')
        .select('id, user_id')
        .eq('id', collection_id)
        .eq('user_id', user.id)
        .single()

      if (collectionError || !collection) {
        return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
      }
    }

    // Salvar o post
    const { error: saveError } = await supabase
      .from('post_saves')
      .insert({
        post_id: postId,
        user_id: user.id,
        collection_id,
        created_at: new Date().toISOString()
      })

    if (saveError) {
      console.error('Erro ao salvar post:', saveError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Se foi salvo em uma collection, atualizar contador da collection
    if (collection_id) {
      await supabase
        .rpc('increment_collection_posts', { collection_id })
    }

    // Buscar contador atualizado
    const { data: updatedPost } = await supabase
      .from('posts')
      .select('saves_count')
      .eq('id', postId)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        saves_count: updatedPost?.saves_count || 0,
        is_saved: true
      }
    })

  } catch (error) {
    console.error('Erro ao salvar post:', error)
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

    // Buscar o save para obter a collection_id antes de deletar
    const { data: existingSave } = await supabase
      .from('post_saves')
      .select('collection_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    // Remover save
    const { error: deleteError } = await supabase
      .from('post_saves')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Erro ao remover save:', deleteError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Se estava em uma collection, decrementar contador da collection
    if (existingSave?.collection_id) {
      await supabase
        .rpc('decrement_collection_posts', { collection_id: existingSave.collection_id })
    }

    // Buscar contador atualizado
    const { data: updatedPost } = await supabase
      .from('posts')
      .select('saves_count')
      .eq('id', postId)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        saves_count: updatedPost?.saves_count || 0,
        is_saved: false
      }
    })

  } catch (error) {
    console.error('Erro ao remover save:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}