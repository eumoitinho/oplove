import { createClient } from '@/app/lib/supabase-browser'

export type MediaType = 'avatar' | 'cover' | 'post' | 'story' | 'verification' | 'business'

interface UploadOptions {
  userId: string
  file: File
  type: MediaType
}

interface UploadResult {
  url: string
  path: string
  error?: string
}

export class StorageService {
  // Get the appropriate storage bucket for media type
  private static getBucketName(type: MediaType): string {
    // Use a single 'media' bucket for all content
    return 'media'
  }

  // Generate unique filename with proper structure
  private static generateFileName(userId: string, type: MediaType, file: File): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    
    // Organize files by type and user
    switch (type) {
      case 'avatar':
        return `avatars/${userId}/avatar_${timestamp}.${extension}`
      case 'cover':
        return `covers/${userId}/cover_${timestamp}.${extension}`
      case 'post':
        return `posts/${userId}/${timestamp}_${randomString}.${extension}`
      case 'story':
        return `stories/${userId}/${timestamp}_${randomString}.${extension}`
      case 'verification':
        return `verification/${userId}/${timestamp}_${randomString}.${extension}`
      case 'business':
        return `business/${userId}/${timestamp}_${randomString}.${extension}`
      default:
        return `misc/${userId}/${timestamp}_${randomString}.${extension}`
    }
  }

  // Validate file before upload
  private static validateFile(file: File, type: MediaType): { valid: boolean; error?: string } {
    // Size limits by type (in bytes)
    const sizeLimit = {
      avatar: 5 * 1024 * 1024,      // 5MB
      cover: 10 * 1024 * 1024,      // 10MB
      post: 100 * 1024 * 1024,      // 100MB
      story: 100 * 1024 * 1024,     // 100MB
      verification: 10 * 1024 * 1024, // 10MB
      business: 10 * 1024 * 1024     // 10MB
    }

    // Allowed types by media type
    const allowedTypes = {
      avatar: ['image/jpeg', 'image/png', 'image/webp'],
      cover: ['image/jpeg', 'image/png', 'image/webp'],
      post: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/mov', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
      story: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/mov', 'video/quicktime'],
      verification: ['image/jpeg', 'image/png', 'image/webp'],
      business: ['image/jpeg', 'image/png', 'image/webp']
    }

    // Check file size
    if (file.size > sizeLimit[type]) {
      const maxSizeMB = sizeLimit[type] / (1024 * 1024)
      return { valid: false, error: `File too large. Maximum size: ${maxSizeMB}MB` }
    }

    // Check file type
    if (!allowedTypes[type].includes(file.type)) {
      return { valid: false, error: `File type not allowed. Supported types: ${allowedTypes[type].join(', ')}` }
    }

    return { valid: true }
  }

  // Upload file to Supabase Storage
  static async uploadFile({ userId, file, type }: UploadOptions): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, type)
      if (!validation.valid) {
        return { url: '', path: '', error: validation.error }
      }

      // Get Supabase client
      const supabase = createClient()

      const bucketName = this.getBucketName(type)
      const fileName = this.generateFileName(userId, type, file)

      console.log(`Uploading ${type} to bucket: ${bucketName}, path: ${fileName}`)

      // For avatar and cover, remove old files first
      if (type === 'avatar' || type === 'cover') {
        const folderPath = `${type}s/${userId}/`
        const { data: existingFiles } = await supabase.storage
          .from(bucketName)
          .list(folderPath)

        if (existingFiles && existingFiles.length > 0) {
          const filesToDelete = existingFiles.map(f => `${folderPath}${f.name}`)
          await supabase.storage.from(bucketName).remove(filesToDelete)
        }
      }

      // Use File directly for client-side upload
      const fileData = file

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileData, {
          contentType: file.type,
          upsert: true
        })

      if (error) {
        console.error('Storage upload error:', error)
        return { url: '', path: '', error: error.message }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path)

      console.log(`Upload successful: ${publicUrl}`)

      return {
        url: publicUrl,
        path: data.path,
      }
    } catch (error) {
      console.error('Error in uploadFile:', error)
      return { 
        url: '', 
        path: '', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }
    }
  }

  // Delete file from storage
  static async deleteFile(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const { error } = await supabase.storage
        .from('media')
        .remove([path])

      if (error) {
        console.error('Storage delete error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in deleteFile:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      }
    }
  }

  // Get signed URL for private files (if needed)
  static async getSignedUrl(path: string, expiresIn = 3600): Promise<{ url: string; error?: string }> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.storage
        .from('media')
        .createSignedUrl(path, expiresIn)

      if (error) {
        console.error('Error creating signed URL:', error)
        return { url: '', error: error.message }
      }

      return { url: data.signedUrl }
    } catch (error) {
      console.error('Error in getSignedUrl:', error)
      return { 
        url: '', 
        error: error instanceof Error ? error.message : 'Failed to create signed URL' 
      }
    }
  }

  // Create storage buckets if they don't exist (admin function)
  static async createBuckets(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      // Create the main media bucket
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

      if (error && error.message !== 'Bucket already exists') {
        console.error('Error creating bucket:', error)
        return { success: false, error: error.message }
      }

      console.log('Storage bucket "media" ready')
      return { success: true }
    } catch (error) {
      console.error('Error in createBuckets:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create buckets' 
      }
    }
  }
}