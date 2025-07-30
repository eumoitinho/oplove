import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const collection_id = searchParams.get('collection_id')
    const offset = (page - 1) * limit

    // Construir query base
    let query = supabase
      .from('post_saves')
      .select(`
        id,
        saved_at,
        collection_id,
        collection:saved_collections(
          id,
          name,
          is_private
        ),
        post:posts(
          id,
          content,
          media,
          poll,
          location,
          visibility,
          is_pinned,
          hashtags,
          mentions,
          likes_count,
          comments_count,
          shares_count,
          saves_count,
          views_count,
          created_at,
          updated_at,
          user:users(
            id,
            name,
            username,
            avatar_url,
            is_verified,
            premium_type
          )
        )
      `)
      .eq('user_id', user.id)

    // Filtrar por coleção se especificado
    if (collection_id) {
      if (collection_id === 'null' || collection_id === 'uncategorized') {
        query = query.is('collection_id', null)
      } else {
        query = query.eq('collection_id', collection_id)
      }
    }

    // Aplicar ordenação e paginação
    const { data: savedPosts, error } = await query
      .order('saved_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar posts salvos:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Processar dados para incluir interações do usuário
    const postsWithInteractions = []
    
    if (savedPosts && savedPosts.length > 0) {
      const postIds = savedPosts.map(sp => sp.post.id)
      
      // Buscar interações do usuário com estes posts
      const { data: userInteractions } = await supabase
        .from('post_interactions')
        .select('post_id, type')
        .eq('user_id', user.id)
        .in('post_id', postIds)

      // Buscar likes do usuário
      const { data: userLikes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)

      // Buscar shares do usuário
      const { data: userShares } = await supabase
        .from('post_shares')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)

      // Criar mapas para lookup rápido
      const likesMap = new Set(userLikes?.map(ul => ul.post_id) || [])
      const sharesMap = new Set(userShares?.map(us => us.post_id) || [])
      const interactionsMap = new Map()
      
      userInteractions?.forEach(ui => {
        if (!interactionsMap.has(ui.post_id)) {
          interactionsMap.set(ui.post_id, new Set())
        }
        interactionsMap.get(ui.post_id).add(ui.type)
      })

      // Processar posts com dados de interação
      for (const savedPost of savedPosts) {
        const post = savedPost.post
        const postId = post.id

        postsWithInteractions.push({
          ...post,
          saved_at: savedPost.saved_at,
          collection: savedPost.collection,
          user_interaction: {
            liked: likesMap.has(postId),
            saved: true, // sempre true pois estamos listando posts salvos
            shared: sharesMap.has(postId),
            reported: interactionsMap.get(postId)?.has('report') || false
          }
        })
      }
    }

    // Buscar estatísticas gerais
    const { data: stats } = await supabase
      .from('post_saves')
      .select('collection_id')
      .eq('user_id', user.id)

    const totalSaves = stats?.length || 0
    const uncategorizedCount = stats?.filter(s => !s.collection_id).length || 0
    const categorizedCount = totalSaves - uncategorizedCount

    return NextResponse.json({
      posts: postsWithInteractions,
      stats: {
        total_saves: totalSaves,
        uncategorized_count: uncategorizedCount,
        categorized_count: categorizedCount
      },
      pagination: {
        page,
        limit,
        hasMore: savedPosts?.length === limit
      }
    })

  } catch (error) {
    console.error('Erro ao buscar posts salvos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}