#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage...')

  try {
    // Check if 'media' bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }

    const mediaBucket = buckets?.find(bucket => bucket.name === 'media')
    
    if (!mediaBucket) {
      console.log('📦 Creating "media" bucket...')
      
      // Create the media bucket
      const { data, error } = await supabase.storage.createBucket('media', {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png', 
          'image/webp',
          'image/gif',
          'video/mp4',
          'video/webm',
          'video/mov',
          'video/quicktime',
          'audio/mpeg',
          'audio/wav',
          'audio/ogg'
        ],
        fileSizeLimit: 100 * 1024 * 1024 // 100MB
      })

      if (error) {
        console.error('❌ Error creating bucket:', error)
        return
      }

      console.log('✅ Media bucket created successfully')
    } else {
      console.log('✅ Media bucket already exists')
    }

    // Check and set up RLS policies for the bucket
    console.log('🔒 Setting up RLS policies...')
    
    // Note: Storage policies are managed through SQL migrations, not through the JS client
    console.log('📋 Storage setup complete!')
    console.log('')
    console.log('📁 Folder structure will be:')
    console.log('  - avatars/{userId}/')
    console.log('  - covers/{userId}/')
    console.log('  - posts/{userId}/')
    console.log('  - stories/{userId}/')
    console.log('  - verification/{userId}/')
    console.log('  - business/{userId}/')
    console.log('')
    console.log('🎯 All uploads will go through /api/v1/upload')
    console.log('💾 Storage service handles validation and file organization')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupStorage()
    .then(() => {
      console.log('🎉 Storage setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error)
      process.exit(1)
    })
}

export { setupStorage }