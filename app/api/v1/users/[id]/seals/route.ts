import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const resolvedParams = await params
    const rawUserId = resolvedParams.id

    // Get current user to check permissions
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !currentUser) {
      return NextResponse.json(
        { 
          error: 'Não autorizado',
          success: false
        }, 
        { status: 401 }
      )
    }

    // Handle "me" shortcut
    const userId = rawUserId === "me" ? currentUser?.id : rawUserId

    if (!userId) {
      return NextResponse.json(
        { 
          error: "Usuário não encontrado", 
          success: false 
        },
        { status: 404 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 50) // Default 6, max 50
    const offset = parseInt(searchParams.get('offset') || '0')
    const showAll = searchParams.get('show_all') === 'true'

    console.log('[UserSeals API] Fetching seals for user:', userId)

    try {
      // Get user's profile seals with comprehensive data
      const { data: userSeals, error: sealsError } = await supabase
        .from('user_profile_seals')
        .select(`
          id,
          created_at,
          seal:profile_seals(
            id,
            name,
            icon_url,
            color_hex,
            description,
            credits_cost,
            rarity
          ),
          gifter_id
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (sealsError) {
        console.error('[UserSeals API] Error fetching seals:', sealsError)
        
        // If table doesn't exist or other error, return empty response
        return NextResponse.json({
          data: [],
          success: true,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0",
            total: 0,
            displayed: 0,
            message: "Profile seals feature not yet available"
          }
        })
      }

      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from('user_profile_seals')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)

      if (countError) {
        console.error('[UserSeals API] Error getting seals count:', countError)
      }

      // Format seals data
      const formattedSeals = userSeals?.map(sealRecord => ({
        id: sealRecord.id,
        received_at: sealRecord.created_at,
        seal: sealRecord.seal ? {
          ...sealRecord.seal,
          // Add any computed properties if needed
        } : null,
        gifter: sealRecord.gifter ? {
          ...sealRecord.gifter,
          is_current_user: currentUser?.id === sealRecord.gifter.id
        } : null
      })).filter(seal => seal.seal !== null) || []

      // Group seals by type for better display
      const sealsByType = formattedSeals.reduce((acc: any, seal) => {
        const sealType = seal.seal?.name || 'unknown'
        if (!acc[sealType]) {
          acc[sealType] = []
        }
        acc[sealType].push(seal)
        return acc
      }, {})

      // Get rarity distribution
      const rarityDistribution = formattedSeals.reduce((acc: any, seal) => {
        const rarity = seal.seal?.rarity || 'common'
        acc[rarity] = (acc[rarity] || 0) + 1
        return acc
      }, {})

      console.log('[UserSeals API] Found seals:', formattedSeals.length)

      return NextResponse.json({
        data: showAll ? formattedSeals : formattedSeals.slice(0, 6),
        success: true,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          pagination: {
            limit,
            offset,
            total: totalCount || 0,
            hasMore: (totalCount || 0) > offset + limit
          },
          summary: {
            total_seals: totalCount || 0,
            displayed: showAll ? formattedSeals.length : Math.min(6, formattedSeals.length),
            seals_by_type: sealsByType,
            rarity_distribution: rarityDistribution,
            is_current_user: currentUser?.id === userId
          }
        }
      })

    } catch (tableError) {
      // Handle case where profile seals tables don't exist yet
      console.log('[UserSeals API] Profile seals tables not available yet')
      
      return NextResponse.json({
        data: [],
        success: true,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          total: 0,
          displayed: 0,
          message: "Profile seals feature will be available soon"
        }
      })
    }

  } catch (error) {
    console.error('Unexpected error in GET /api/v1/users/[id]/seals:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        success: false,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0"
        }
      },
      { status: 500 }
    )
  }
}