import type { ApiResponse } from "./api"
import { createClient } from "@/app/lib/supabase-browser"

/**
 * Storage service for file uploads and media management
 */
export class StorageService {
  private supabase = createClient()

  /**
   * Upload file to storage
   */
  async uploadFile(
    file: File,
    bucket: string,
    path?: string,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<{ url: string; path: string }>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Check user permissions and file limits
      const { data: userProfile } = await this.supabase
        .from("users")
        .select("premium_type, is_verified")
        .eq("id", user.id)
        .single()

      // Validate file size and type based on plan
      const validation = this.validateFile(file, userProfile?.premium_type || "free", userProfile?.is_verified || false)
      if (!validation.valid) {
        return {
          data: null,
          error: validation.error,
          success: false,
          status: 400,
        }
      }

      // Generate unique file path
      const fileName = path || `${user.id}/${Date.now()}_${file.name}`

      // Upload file
      const { data, error } = await this.supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        return {
          data: null,
          error: `Erro no upload: ${error.message}`,
          success: false,
          status: 400,
        }
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(bucket).getPublicUrl(fileName)

      return {
        data: {
          url: publicUrl,
          path: fileName,
        },
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado no upload",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    bucket: string,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<{ url: string; path: string }[]>> {
    try {
      const results: { url: string; path: string }[] = []
      let completed = 0

      for (const file of files) {
        const result = await this.uploadFile(file, bucket)

        if (!result.success || !result.data) {
          // Clean up already uploaded files
          await Promise.all(results.map((r) => this.deleteFile(bucket, r.path)))

          return {
            data: null,
            error: result.error || "Erro no upload de múltiplos arquivos",
            success: false,
            status: 400,
          }
        }

        results.push(result.data)
        completed++

        if (onProgress) {
          onProgress((completed / files.length) * 100)
        }
      }

      return {
        data: results,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado no upload múltiplo",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await this.supabase.storage.from(bucket).remove([path])

      if (error) {
        return {
          data: null,
          error: `Erro ao deletar arquivo: ${error.message}`,
          success: false,
          status: 400,
        }
      }

      return {
        data: null,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao deletar arquivo",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Get file URL
   */
  async getFileUrl(bucket: string, path: string): Promise<ApiResponse<{ url: string }>> {
    try {
      const { data } = this.supabase.storage.from(bucket).getPublicUrl(path)

      return {
        data: { url: data.publicUrl },
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro ao obter URL do arquivo",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Validate file based on user plan
   */
  private validateFile(file: File, planType: string, isVerified: boolean): { valid: boolean; error?: string } {
    // File size limits (in MB)
    const sizeLimits = {
      free: isVerified ? 5 : 0, // Free users need verification
      gold: 25,
      diamond: 100,
      couple: 100,
    }

    // Allowed file types
    const allowedTypes = {
      free: ["image/jpeg", "image/png", "image/webp"],
      gold: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "audio/mpeg", "audio/wav"],
      diamond: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
        "audio/mpeg",
        "audio/wav",
        "application/pdf",
      ],
      couple: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
        "audio/mpeg",
        "audio/wav",
        "application/pdf",
      ],
    }

    const maxSize = sizeLimits[planType as keyof typeof sizeLimits] || 0
    const allowedFileTypes = allowedTypes[planType as keyof typeof allowedTypes] || []

    // Check if uploads are allowed
    if (maxSize === 0) {
      return {
        valid: false,
        error: "Usuários gratuitos precisam verificar a conta para fazer upload de arquivos",
      }
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Limite: ${maxSize}MB`,
      }
    }

    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Tipo de arquivo não permitido para seu plano",
      }
    }

    return { valid: true }
  }

  /**
   * Compress image before upload
   */
  async compressImage(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080 for free users, higher for premium)
        const maxWidth = 1920
        const maxHeight = 1080

        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          file.type,
          quality,
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }
}

// Export singleton instance
export const storageService = new StorageService()
