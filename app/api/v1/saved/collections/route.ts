import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

// Listar coleções do usuário
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
    const offset = (page - 1) * limit

    // Buscar coleções do usuário
    const { data: collections, error } = await supabase
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
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar coleções:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({
      collections: collections || [],
      pagination: {
        page,
        limit,
        hasMore: collections?.length === limit
      }
    })

  } catch (error) {
    console.error('Erro ao buscar coleções:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Criar nova coleção
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, description = null, is_private = true } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nome da coleção é obrigatório' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'Nome muito longo (máximo 100 caracteres)' }, { status: 400 })
    }

    // Verificar se já existe uma coleção com esse nome
    const { data: existingCollection } = await supabase
      .from('saved_collections')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name.trim())
      .single()

    if (existingCollection) {
      return NextResponse.json({ error: 'Já existe uma coleção com esse nome' }, { status: 409 })
    }

    // Criar a coleção
    const { data: collection, error: createError } = await supabase
      .from('saved_collections')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        is_private,
        posts_count: 0
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar coleção:', createError)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      collection
    })

  } catch (error) {
    console.error('Erro ao criar coleção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}