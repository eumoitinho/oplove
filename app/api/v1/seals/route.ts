import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/v1/seals - Get available profile seals
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  
  try {
    const { data: seals, error } = await supabase
      .from('profile_seals')
      .select('*')
      .eq('is_available', true)
      .order('display_order', { ascending: true })

    if (error) throw error

    return NextResponse.json({ seals: seals || [] })
  } catch (error) {
    console.error('Error fetching seals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seals' },
      { status: 500 }
    )
  }
}