import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

// Buscar coleção específica
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

    const collectionId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Buscar coleção
    const { data: collection, error: collectionError } = await supabase
      .from('saved_collections')
      .select(`
        id,
        name,
        description,
        is_private,
        posts_count,
        created_at,
        updated_at
      `)
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single()

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    // Buscar posts da coleção
    const { data: savedPosts, error: postsError } = await supabase
      .from('post_saves')
      .select(`
        id,
        saved_at,
        post:posts(
          id,
          content,
          media,
          created_at,
          likes_count,
          comments_count,
          shares_count,
          saves_count,
          user:users(
            id,
            name,
            username,
            avatar_url,
            is_verified
          )
        )
      `)
      .eq('collection_id', collectionId)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (postsError) {
      console.error('Erro ao buscar posts salvos:', postsError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({
      collection,
      posts: savedPosts?.map(sp => ({
        ...sp.post,
        saved_at: sp.saved_at
      })) || [],
      pagination: {
        page,
        limit,
        hasMore: savedPosts?.length === limit
      }
    })

  } catch (error) {
    console.error('Erro ao buscar coleção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Atualizar coleção
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const collectionId = params.id
    const { name, description, is_private } = await request.json()

    // Verificar se a coleção existe e pertence ao usuário
    const { data: existingCollection, error: checkError } = await supabase
      .from('saved_collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingCollection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    // Validações
    if (name && (name.trim().length === 0 || name.length > 100)) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    }

    // Se o nome está sendo alterado, verificar se não conflita
    if (name && name.trim() !== '') {
      const { data: nameConflict } = await supabase
        .from('saved_collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', name.trim())
        .neq('id', collectionId)
        .single()

      if (nameConflict) {
        return NextResponse.json({ error: 'Já existe uma coleção com esse nome' }, { status: 409 })
      }
    }

    // Preparar dados para atualização
    const updateData: any = { updated_at: new Date().toISOString() }
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (is_private !== undefined) updateData.is_private = is_private

    // Atualizar coleção
    const { data: updatedCollection, error: updateError } = await supabase
      .from('saved_collections')
      .update(updateData)
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar coleção:', updateError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      collection: updatedCollection
    })

  } catch (error) {
    console.error('Erro ao atualizar coleção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Deletar coleção
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

    const collectionId = params.id

    // Verificar se a coleção existe e pertence ao usuário
    const { data: existingCollection, error: checkError } = await supabase
      .from('saved_collections')
      .select('id, posts_count')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingCollection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    // Mover posts salvos desta coleção para "sem coleção" (null)
    if (existingCollection.posts_count > 0) {
      await supabase
        .from('post_saves')
        .update({ collection_id: null })
        .eq('collection_id', collectionId)
        .eq('user_id', user.id)
    }

    // Deletar a coleção
    const { error: deleteError } = await supabase
      .from('saved_collections')
      .delete()
      .eq('id', collectionId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Erro ao deletar coleção:', deleteError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Coleção deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar coleção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}