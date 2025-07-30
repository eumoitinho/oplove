import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { StorageServerService } from '@/lib/services/storage-server.service'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Only allow admin users to initialize storage
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('Initializing storage buckets...')

    // Create storage buckets
    const result = await StorageServerService.createBuckets()

    if (result.error) {
      console.error('Error creating buckets:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    console.log('Storage buckets initialized successfully')

    return NextResponse.json({ 
      success: true,
      message: 'Storage buckets initialized successfully'
    })

  } catch (error) {
    console.error('Error initializing storage:', error)
    return NextResponse.json(
      { error: 'Failed to initialize storage' },
      { status: 500 }
    )
  }
}