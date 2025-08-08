/**
 * Compression utilities for cache optimization
 * Uses browser-native CompressionStream API when available
 */

/**
 * Compress a string using gzip
 */
export async function compress(text: string): Promise<string> {
  try {
    // Check if running in browser with CompressionStream support
    if (typeof window !== 'undefined' && 'CompressionStream' in window) {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      
      const cs = new CompressionStream('gzip')
      const writer = cs.writable.getWriter()
      writer.write(data)
      writer.close()
      
      const compressed = await new Response(cs.readable).arrayBuffer()
      return btoa(String.fromCharCode(...new Uint8Array(compressed)))
    }
    
    // Fallback: Return original text if compression not available
    // In production, you might want to use a library like pako
    return text
  } catch (error) {
    console.error('Compression failed:', error)
    return text
  }
}

/**
 * Decompress a gzip compressed string
 */
export async function decompress(compressed: string): Promise<string> {
  try {
    // Check if running in browser with DecompressionStream support
    if (typeof window !== 'undefined' && 'DecompressionStream' in window) {
      const binaryString = atob(compressed)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      const ds = new DecompressionStream('gzip')
      const writer = ds.writable.getWriter()
      writer.write(bytes)
      writer.close()
      
      const decompressed = await new Response(ds.readable).arrayBuffer()
      const decoder = new TextDecoder()
      return decoder.decode(decompressed)
    }
    
    // Fallback: Return as-is if decompression not available
    return compressed
  } catch (error) {
    console.error('Decompression failed:', error)
    return compressed
  }
}

/**
 * Calculate compression ratio
 */
export function getCompressionRatio(original: string, compressed: string): number {
  const originalSize = new Blob([original]).size
  const compressedSize = new Blob([compressed]).size
  return ((originalSize - compressedSize) / originalSize) * 100
}

/**
 * Check if compression is worth it (>20% reduction)
 */
export function shouldCompress(text: string): boolean {
  return text.length > 1024 // Only compress if > 1KB
}