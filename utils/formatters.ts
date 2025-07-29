import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Date formatting utilities for OpenLove platform
 *
 * Provides consistent date formatting across the application with
 * Brazilian Portuguese locale support and relative time formatting.
 */

/**
 * Format date with Brazilian locale
 *
 * @example
 * ```ts
 * formatDate(new Date()) // "29 de janeiro de 2025"
 * formatDate("2025-01-29", "dd/MM/yyyy") // "29/01/2025"
 * ```
 */
export function formatDate(date: Date | string, formatStr = "PPP"): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: ptBR })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Data inválida"
  }
}

/**
 * Format relative time (e.g., "há 2 horas", "ontem")
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date()) // "agora"
 * formatRelativeTime(subHours(new Date(), 2)) // "há 2 horas"
 * ```
 */
export function formatRelativeTime(date: Date | string): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    const now = new Date()

    // Handle very recent times
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
    if (diffInSeconds < 60) {
      return "agora"
    }

    if (isToday(dateObj)) {
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR })
    }

    if (isYesterday(dateObj)) {
      return "ontem"
    }

    // For dates within the last week
    if (diffInSeconds < 7 * 24 * 60 * 60) {
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR })
    }

    // For older dates, show the actual date
    return format(dateObj, "dd/MM/yyyy", { locale: ptBR })
  } catch (error) {
    console.error("Error formatting relative time:", error)
    return "Data inválida"
  }
}

/**
 * Format time only (HH:mm)
 *
 * @example
 * ```ts
 * formatTime(new Date()) // "14:30"
 * ```
 */
export function formatTime(date: Date | string): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return format(dateObj, "HH:mm", { locale: ptBR })
  } catch (error) {
    console.error("Error formatting time:", error)
    return "00:00"
  }
}

/**
 * Format date and time
 *
 * @example
 * ```ts
 * formatDateTime(new Date()) // "29/01/2025 às 14:30"
 * ```
 */
export function formatDateTime(date: Date | string): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch (error) {
    console.error("Error formatting date time:", error)
    return "Data inválida"
  }
}

/**
 * Currency formatting utilities
 */

/**
 * Format Brazilian Real currency
 *
 * @example
 * ```ts
 * formatCurrency(1999) // "R$ 19,99"
 * formatCurrency(5000, { showCents: false }) // "R$ 50"
 * ```
 */
export function formatCurrency(
  cents: number,
  options: {
    showCents?: boolean
    showSymbol?: boolean
  } = {},
): string {
  const { showCents = true, showSymbol = true } = options

  try {
    const value = cents / 100
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: showSymbol ? "currency" : "decimal",
      currency: "BRL",
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0,
    })

    return formatter.format(value)
  } catch (error) {
    console.error("Error formatting currency:", error)
    return showSymbol ? "R$ 0,00" : "0,00"
  }
}

/**
 * Format price with plan context
 *
 * @example
 * ```ts
 * formatPrice(1999, 'monthly') // "R$ 19,99/mês"
 * formatPrice(19999, 'yearly') // "R$ 199,99/ano"
 * ```
 */
export function formatPrice(cents: number, period: "monthly" | "yearly" | "one-time" = "monthly"): string {
  const basePrice = formatCurrency(cents)

  const periodSuffix = {
    monthly: "/mês",
    yearly: "/ano",
    "one-time": "",
  }

  return `${basePrice}${periodSuffix[period]}`
}

/**
 * Number formatting utilities
 */

/**
 * Format large numbers with K/M suffixes
 *
 * @example
 * ```ts
 * formatNumber(1500) // "1,5K"
 * formatNumber(2500000) // "2,5M"
 * formatNumber(42) // "42"
 * ```
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(".0", "") + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(".0", "") + "K"
  }
  return num.toString()
}

/**
 * Format percentage
 *
 * @example
 * ```ts
 * formatPercentage(0.75) // "75%"
 * formatPercentage(0.333, 1) // "33,3%"
 * ```
 */
export function formatPercentage(value: number, decimals = 0): string {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  } catch (error) {
    console.error("Error formatting percentage:", error)
    return "0%"
  }
}

/**
 * Format file size
 *
 * @example
 * ```ts
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 * formatFileSize(500) // "500 B"
 * ```
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"]
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

/**
 * Format duration in seconds to human readable format
 *
 * @example
 * ```ts
 * formatDuration(65) // "1:05"
 * formatDuration(3661) // "1:01:01"
 * formatDuration(30) // "0:30"
 * ```
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

/**
 * Format phone number (Brazilian format)
 *
 * @example
 * ```ts
 * formatPhoneNumber("11999887766") // "(11) 99988-7766"
 * formatPhoneNumber("1133334444") // "(11) 3333-4444"
 * ```
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")

  if (cleaned.length === 11) {
    // Mobile: (11) 99999-9999
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    // Landline: (11) 3333-4444
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }

  return phone
}

/**
 * Format CPF (Brazilian tax ID)
 *
 * @example
 * ```ts
 * formatCPF("12345678901") // "123.456.789-01"
 * ```
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "")

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }

  return cpf
}

/**
 * Format username with @ prefix
 *
 * @example
 * ```ts
 * formatUsername("joao123") // "@joao123"
 * formatUsername("@maria") // "@maria"
 * ```
 */
export function formatUsername(username: string): string {
  return username.startsWith("@") ? username : `@${username}`
}

/**
 * Truncate text with ellipsis
 *
 * @example
 * ```ts
 * truncateText("This is a very long text", 10) // "This is a..."
 * truncateText("Short", 10) // "Short"
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

/**
 * Format hashtag
 *
 * @example
 * ```ts
 * formatHashtag("openlove") // "#openlove"
 * formatHashtag("#trending") // "#trending"
 * ```
 */
export function formatHashtag(tag: string): string {
  return tag.startsWith("#") ? tag : `#${tag}`
}
