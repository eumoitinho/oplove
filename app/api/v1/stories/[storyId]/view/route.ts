import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface Params {
  params: {
    storyId: string
  }
}

const viewSchema = z.object({
  viewDuration: z.number().optional(),
  completionRate: z.number().min(0).max(100).optional(),
  deviceType: z.string().optional()
})

// POST /api/v1/stories/[storyId]/view - Mark story as viewed
export async function POST(request: NextRequest, { params }: Params) {
  const supabase = createClient()
  const { storyId } = params
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const validatedData = viewSchema.parse(body)

    // Check if already viewed
    const { data: existingView } = await supabase
      .from('story_views')
      .select('id')
      .eq('story_id', storyId)
      .eq('viewer_id', user.id)
      .single()

    if (existingView) {
      return NextResponse.json({ message: 'Already viewed' })
    }

    // Get IP address
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Create view record
    const { error } = await supabase
      .from('story_views')
      .insert({
        story_id: storyId,
        viewer_id: user.id,
        view_duration: validatedData.viewDuration,
        completion_rate: validatedData.completionRate,
        device_type: validatedData.deviceType,
        ip_address: ip
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking story as viewed:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to mark as viewed' },
      { status: 500 }
    )
  }
}