import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { StorageServerService, MediaType } from '@/lib/services/storage-server.service'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as MediaType) || 'post'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Processing upload: type=${type}, file=${file.name}, size=${file.size}`)
    }

    // Use the storage service for upload
    const result = await StorageServerService.uploadFile({
      userId: user.id,
      file,
      type
    })

    if (result.error) {
      console.error('Storage service error:', result.error)
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Upload successful: ${result.url}`)
    }

    return NextResponse.json({ 
      url: result.url,
      path: result.path,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}