interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "jpeg" | "png" | "webp"
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: "jpeg",
}

/**
 * Compress an image file
 * @param file The image file to compress
 * @param options Compression options
 * @returns Promise with the compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const settings = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        // Calculate new dimensions
        let { width, height } = img
        const { maxWidth = 1920, maxHeight = 1080 } = settings

        // Scale down if needed
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height

          if (width > height) {
            width = maxWidth
            height = width / aspectRatio
          } else {
            height = maxHeight
            width = height * aspectRatio
          }
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"))
              return
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob],
              file.name,
              {
                type: `image/${settings.format}`,
                lastModified: Date.now(),
              }
            )

            // Only use compressed version if it's smaller
            if (compressedFile.size < file.size) {
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          `image/${settings.format}`,
          settings.quality
        )
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Compress multiple images in parallel
 * @param files Array of image files
 * @param options Compression options
 * @returns Promise with array of compressed files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map((file) => compressImage(file, options))
  return Promise.all(compressionPromises)
}

/**
 * Get image dimensions from a file
 * @param file The image file
 * @returns Promise with width and height
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        })
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Check if a file is a valid image
 * @param file The file to check
 * @returns boolean indicating if file is a valid image
 */
export function isValidImage(file: File): boolean {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  return validTypes.includes(file.type)
}

/**
 * Format file size to human readable string
 * @param bytes File size in bytes
 * @returns Formatted string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Resize image to fit within max dimensions while maintaining aspect ratio
 * @param file Image file to resize
 * @param maxSize Maximum width or height
 * @returns Promise with resized file
 */
export async function resizeImage(
  file: File,
  maxSize: number
): Promise<File> {
  const dimensions = await getImageDimensions(file)
  
  // Don't resize if already within bounds
  if (dimensions.width <= maxSize && dimensions.height <= maxSize) {
    return file
  }

  // Calculate new dimensions maintaining aspect ratio
  const aspectRatio = dimensions.width / dimensions.height
  let newWidth: number
  let newHeight: number

  if (dimensions.width > dimensions.height) {
    newWidth = maxSize
    newHeight = maxSize / aspectRatio
  } else {
    newHeight = maxSize
    newWidth = maxSize * aspectRatio
  }

  return compressImage(file, {
    maxWidth: newWidth,
    maxHeight: newHeight,
    quality: 0.9,
  })
}

/**
 * Create a thumbnail from an image file
 * @param file Image file
 * @param size Thumbnail size (square)
 * @returns Promise with thumbnail file
 */
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<File> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: "jpeg",
  })
}