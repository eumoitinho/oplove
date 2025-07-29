/**
 * General utility functions for OpenLove platform
 *
 * Provides common helper functions used throughout the application
 * for data manipulation, string processing, and general utilities.
 */

/**
 * Generate unique ID
 *
 * @example
 * ```ts
 * generateId() // "k2j3h4k5j6h7k8j9"
 * generateId('user') // "user_k2j3h4k5j6h7k8j9"
 * ```
 */
export function generateId(prefix?: string): string {
  const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
  return prefix ? `${prefix}_${id}` : id
}

/**
 * Generate UUID v4
 *
 * @example
 * ```ts
 * generateUUID() // "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Deep clone object
 *
 * @example
 * ```ts
 * const original = { user: { name: 'João' } }
 * const cloned = deepClone(original)
 * cloned.user.name = 'Maria'
 * console.log(original.user.name) // 'João'
 * ```
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T
  }

  if (typeof obj === "object") {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * Debounce function
 *
 * @example
 * ```ts
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query)
 * }, 300)
 *
 * debouncedSearch('hello') // Will only execute after 300ms of no calls
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 *
 * @example
 * ```ts
 * const throttledScroll = throttle(() => {
 *   console.log('Scroll event')
 * }, 100)
 *
 * window.addEventListener('scroll', throttledScroll)
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Sleep function for async delays
 *
 * @example
 * ```ts
 * await sleep(1000) // Wait 1 second
 * console.log('After 1 second')
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Capitalize first letter of string
 *
 * @example
 * ```ts
 * capitalize('hello world') // 'Hello world'
 * capitalize('HELLO') // 'Hello'
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert string to title case
 *
 * @example
 * ```ts
 * toTitleCase('hello world') // 'Hello World'
 * toTitleCase('HELLO WORLD') // 'Hello World'
 * ```
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

/**
 * Convert string to kebab-case
 *
 * @example
 * ```ts
 * toKebabCase('Hello World') // 'hello-world'
 * toKebabCase('helloWorld') // 'hello-world'
 * ```
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
}

/**
 * Convert string to camelCase
 *
 * @example
 * ```ts
 * toCamelCase('hello-world') // 'helloWorld'
 * toCamelCase('hello_world') // 'helloWorld'
 * ```
 */
export function toCamelCase(str: string): string {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
}

/**
 * Remove accents from string
 *
 * @example
 * ```ts
 * removeAccents('João Ação') // 'Joao Acao'
 * removeAccents('Coração') // 'Coracao'
 * ```
 */
export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

/**
 * Generate slug from string
 *
 * @example
 * ```ts
 * generateSlug('Hello World!') // 'hello-world'
 * generateSlug('João & Maria') // 'joao-maria'
 * ```
 */
export function generateSlug(str: string): string {
  return removeAccents(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Extract hashtags from text
 *
 * @example
 * ```ts
 * extractHashtags('Hello #world #openlove') // ['world', 'openlove']
 * ```
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g
  const matches = text.match(hashtagRegex)
  return matches ? matches.map((tag) => tag.substring(1)) : []
}

/**
 * Extract mentions from text
 *
 * @example
 * ```ts
 * extractMentions('Hello @john @maria') // ['john', 'maria']
 * ```
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_.]+)/g
  const matches = text.match(mentionRegex)
  return matches ? matches.map((mention) => mention.substring(1)) : []
}

/**
 * Check if string contains only emojis
 *
 * @example
 * ```ts
 * isOnlyEmojis('😀😃😄') // true
 * isOnlyEmojis('Hello 😀') // false
 * ```
 */
export function isOnlyEmojis(str: string): boolean {
  const emojiRegex =
    /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]*$/u
  return emojiRegex.test(str.trim())
}

/**
 * Get random item from array
 *
 * @example
 * ```ts
 * getRandomItem([1, 2, 3, 4, 5]) // Random number from array
 * getRandomItem(['a', 'b', 'c']) // Random letter
 * ```
 */
export function getRandomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Shuffle array
 *
 * @example
 * ```ts
 * shuffleArray([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4] (random order)
 * ```
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Group array by key
 *
 * @example
 * ```ts
 * const users = [
 *   { name: 'João', city: 'SP' },
 *   { name: 'Maria', city: 'RJ' },
 *   { name: 'Pedro', city: 'SP' }
 * ]
 * groupBy(users, 'city')
 * // { SP: [João, Pedro], RJ: [Maria] }
 * ```
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>,
  )
}

/**
 * Remove duplicates from array
 *
 * @example
 * ```ts
 * removeDuplicates([1, 2, 2, 3, 3, 4]) // [1, 2, 3, 4]
 * removeDuplicates(['a', 'b', 'a', 'c']) // ['a', 'b', 'c']
 * ```
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Remove duplicates from array by key
 *
 * @example
 * ```ts
 * const users = [
 *   { id: 1, name: 'João' },
 *   { id: 2, name: 'Maria' },
 *   { id: 1, name: 'João Duplicate' }
 * ]
 * removeDuplicatesByKey(users, 'id') // [{ id: 1, name: 'João' }, { id: 2, name: 'Maria' }]
 * ```
 */
export function removeDuplicatesByKey<T, K extends keyof T>(array: T[], key: K): T[] {
  const seen = new Set()
  return array.filter((item) => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * Check if object is empty
 *
 * @example
 * ```ts
 * isEmpty({}) // true
 * isEmpty({ name: 'João' }) // false
 * isEmpty([]) // true
 * isEmpty([1, 2, 3]) // false
 * ```
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0
  return Object.keys(obj).length === 0
}

/**
 * Pick specific keys from object
 *
 * @example
 * ```ts
 * const user = { id: 1, name: 'João', email: 'joao@example.com', password: '123' }
 * pick(user, ['id', 'name']) // { id: 1, name: 'João' }
 * ```
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Omit specific keys from object
 *
 * @example
 * ```ts
 * const user = { id: 1, name: 'João', email: 'joao@example.com', password: '123' }
 * omit(user, ['password']) // { id: 1, name: 'João', email: 'joao@example.com' }
 * ```
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}

/**
 * Clamp number between min and max
 *
 * @example
 * ```ts
 * clamp(5, 0, 10) // 5
 * clamp(-5, 0, 10) // 0
 * clamp(15, 0, 10) // 10
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation between two values
 *
 * @example
 * ```ts
 * lerp(0, 100, 0.5) // 50
 * lerp(10, 20, 0.25) // 12.5
 * ```
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

/**
 * Map value from one range to another
 *
 * @example
 * ```ts
 * mapRange(5, 0, 10, 0, 100) // 50
 * mapRange(2, 0, 4, 10, 20) // 15
 * ```
 */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

/**
 * Check if value is between min and max (inclusive)
 *
 * @example
 * ```ts
 * isBetween(5, 0, 10) // true
 * isBetween(15, 0, 10) // false
 * ```
 */
export function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Format bytes to human readable format
 *
 * @example
 * ```ts
 * formatBytes(1024) // '1 KB'
 * formatBytes(1048576) // '1 MB'
 * ```
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

/**
 * Copy text to clipboard
 *
 * @example
 * ```ts
 * await copyToClipboard('Hello World!')
 * console.log('Text copied!')
 * ```
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand("copy")
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error("Failed to copy text:", error)
    return false
  }
}

/**
 * Check if device is mobile
 *
 * @example
 * ```ts
 * if (isMobile()) {
 *   console.log('Mobile device detected')
 * }
 * ```
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Check if device is iOS
 *
 * @example
 * ```ts
 * if (isIOS()) {
 *   console.log('iOS device detected')
 * }
 * ```
 */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * Get device type
 *
 * @example
 * ```ts
 * getDeviceType() // 'mobile' | 'tablet' | 'desktop'
 * ```
 */
export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop"

  const userAgent = navigator.userAgent

  if (/tablet|ipad/i.test(userAgent)) {
    return "tablet"
  }

  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return "mobile"
  }

  return "desktop"
}
