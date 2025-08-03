import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'

const VALID_REACTIONS: ReactionType[] = ['like', 'love', 'laugh', 'wow', 'sad', 'angry']

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
    const { reaction_type } = await request.json()

    // Validar tipo de reação
    if (!reaction_type || !VALID_REACTIONS.includes(reaction_type)) {
      return NextResponse.json({ 
        error: 'Tipo de reação inválido',
        valid_types: VALID_REACTIONS 
      }, { status: 400 })
    }

    // Verificar se o post existe e está acessível
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id, visibility')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    if (post.visibility !== 'public' && post.user_id !== user.id) {
      return NextResponse.json({ error: 'Post não acessível' }, { status: 403 })
    }

    // Verificar se o usuário já reagiu a este post
    const { data: existingReaction } = await supabase
      .from('post_reactions')
      .select('id, reaction_type')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingReaction) {
      // Se a reação é a mesma, remover (toggle)
      if (existingReaction.reaction_type === reaction_type) {
        const { error: deleteError } = await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id)

        if (deleteError) {
          console.error('Erro ao remover reação:', deleteError)
          return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
        }

        // Buscar contadores atualizados
        const { data: updatedPost } = await supabase
          .from('posts')
          .select(`
            like_count, love_count, laugh_count, 
            wow_count, sad_count, angry_count
          `)
          .eq('id', postId)
          .single()

        return NextResponse.json({
          success: true,
          action: 'removed',
          reaction_type,
          counts: updatedPost || {}
        })
      } else {
        // Atualizar reação existente
        const { error: updateError } = await supabase
          .from('post_reactions')
          .update({ 
            reaction_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReaction.id)

        if (updateError) {
          console.error('Erro ao atualizar reação:', updateError)
          return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
        }

        // Buscar contadores atualizados
        const { data: updatedPost } = await supabase
          .from('posts')
          .select(`
            like_count, love_count, laugh_count, 
            wow_count, sad_count, angry_count
          `)
          .eq('id', postId)
          .single()

        return NextResponse.json({
          success: true,
          action: 'updated',
          reaction_type,
          previous_reaction: existingReaction.reaction_type,
          counts: updatedPost || {}
        })
      }
    } else {
      // Criar nova reação
      const { error: insertError } = await supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type
        })

      if (insertError) {
        console.error('Erro ao criar reação:', insertError)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
      }

      // Criar notificação para o autor (se não for ele mesmo)
      if (post.user_id !== user.id) {
        // Get user details for notification
        const { data: userData } = await supabase
          .from('users')
          .select('username, full_name')
          .eq('id', user.id)
          .single()

        await supabase
          .from('notifications')
          .insert({
            user_id: post.user_id,
            from_user_id: user.id,
            type: 'like',
            title: 'Nova reação no seu post',
            content: `${userData?.full_name || userData?.username || "Alguém"} reagiu ${getReactionText(reaction_type)} ao seu post`,
            entity_id: postId,
            entity_type: 'post',
            created_at: new Date().toISOString()
          })
      }

      // Buscar contadores atualizados
      const { data: updatedPost } = await supabase
        .from('posts')
        .select(`
          like_count, love_count, laugh_count, 
          wow_count, sad_count, angry_count
        `)
        .eq('id', postId)
        .single()

      return NextResponse.json({
        success: true,
        action: 'added',
        reaction_type,
        counts: updatedPost || {}
      })
    }

  } catch (error) {
    console.error('Erro ao reagir ao post:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Listar reações de um post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createServerClient()
    const user = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    const reaction_type = searchParams.get('type') as ReactionType | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Verificar se o post existe e está acessível
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id, visibility')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    if (post.visibility !== 'public' && (!user || post.user_id !== user.id)) {
      return NextResponse.json({ error: 'Post não acessível' }, { status: 403 })
    }

    // Construir query base
    let query = supabase
      .from('post_reactions')
      .select(`
        id,
        reaction_type,
        created_at,
        user:users(
          id,
          name,
          username,
          avatar_url,
          is_verified
        )
      `)
      .eq('post_id', postId)

    // Filtrar por tipo de reação se especificado
    if (reaction_type && VALID_REACTIONS.includes(reaction_type)) {
      query = query.eq('reaction_type', reaction_type)
    }

    // Aplicar paginação e ordenação
    const { data: reactions, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar reações:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Buscar reação do usuário atual
    let userReaction = null
    if (user) {
      const { data: userReactionData } = await supabase
        .from('post_reactions')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()
      
      userReaction = userReactionData?.reaction_type || null
    }

    // Buscar contadores de reações
    const { data: countsData } = await supabase
      .from('posts')
      .select(`
        like_count, love_count, laugh_count, 
        wow_count, sad_count, angry_count
      `)
      .eq('id', postId)
      .single()

    return NextResponse.json({
      reactions: reactions || [],
      user_reaction: userReaction,
      counts: countsData || {},
      pagination: {
        page,
        limit,
        hasMore: reactions?.length === limit
      }
    })

  } catch (error) {
    console.error('Erro ao buscar reações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

function getReactionText(reaction: ReactionType): string {
  const reactionTexts = {
    like: 'curtiu',
    love: 'amou',
    laugh: 'achou engraçado',
    wow: 'ficou impressionado com',
    sad: 'ficou triste com',
    angry: 'ficou irritado com'
  }
  return reactionTexts[reaction] || 'reagiu a'
}