/**
 * Validation utilities for OpenLove platform
 *
 * Provides comprehensive validation functions for forms, files, content,
 * and user input with Brazilian-specific validations.
 */

/**
 * Email validation
 *
 * @example
 * ```ts
 * validateEmail("user@example.com") // { isValid: true }
 * validateEmail("invalid-email") // { isValid: false, error: "Email inválido" }
 * ```
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: "Email é obrigatório" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Email inválido" }
  }

  if (email.length > 254) {
    return { isValid: false, error: "Email muito longo" }
  }

  return { isValid: true }
}

/**
 * Password validation with strength checking
 *
 * @example
 * ```ts
 * validatePassword("123456") // { isValid: false, error: "Senha muito fraca" }
 * validatePassword("MyStr0ng!Pass") // { isValid: true, strength: "strong" }
 * ```
 */
export function validatePassword(password: string): ValidationResult & { strength?: PasswordStrength } {
  if (!password) {
    return { isValid: false, error: "Senha é obrigatória" }
  }

  if (password.length < 8) {
    return { isValid: false, error: "Senha deve ter pelo menos 8 caracteres" }
  }

  if (password.length > 128) {
    return { isValid: false, error: "Senha muito longa" }
  }

  // Check for common weak passwords
  const commonPasswords = [
    "12345678",
    "password",
    "123456789",
    "12345",
    "1234567",
    "password123",
    "admin",
    "qwerty",
    "letmein",
    "welcome",
  ]

  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: "Senha muito comum" }
  }

  // Calculate password strength
  const strength = calculatePasswordStrength(password)

  if (strength === "weak") {
    return { isValid: false, error: "Senha muito fraca", strength }
  }

  return { isValid: true, strength }
}

/**
 * Username validation
 *
 * @example
 * ```ts
 * validateUsername("joao123") // { isValid: true }
 * validateUsername("jo") // { isValid: false, error: "Username muito curto" }
 * ```
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: "Username é obrigatório" }
  }

  if (username.length < 3) {
    return { isValid: false, error: "Username deve ter pelo menos 3 caracteres" }
  }

  if (username.length > 30) {
    return { isValid: false, error: "Username muito longo" }
  }

  // Only allow alphanumeric characters, underscores, and dots
  const usernameRegex = /^[a-zA-Z0-9._]+$/
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: "Username pode conter apenas letras, números, pontos e underscores" }
  }

  // Cannot start or end with special characters
  if (username.startsWith(".") || username.startsWith("_") || username.endsWith(".") || username.endsWith("_")) {
    return { isValid: false, error: "Username não pode começar ou terminar com ponto ou underscore" }
  }

  // Cannot have consecutive special characters
  if (username.includes("..") || username.includes("__") || username.includes("._") || username.includes("_.")) {
    return { isValid: false, error: "Username não pode ter caracteres especiais consecutivos" }
  }

  // Reserved usernames
  const reservedUsernames = [
    "admin",
    "root",
    "api",
    "www",
    "mail",
    "support",
    "help",
    "info",
    "contact",
    "about",
    "terms",
    "privacy",
    "openlove",
    "moderator",
    "staff",
    "team",
    "official",
    "verified",
  ]

  if (reservedUsernames.includes(username.toLowerCase())) {
    return { isValid: false, error: "Username não disponível" }
  }

  return { isValid: true }
}

/**
 * Full name validation
 *
 * @example
 * ```ts
 * validateFullName("João Silva") // { isValid: true }
 * validateFullName("J") // { isValid: false, error: "Nome muito curto" }
 * ```
 */
export function validateFullName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, error: "Nome é obrigatório" }
  }

  const trimmedName = name.trim()

  if (trimmedName.length < 2) {
    return { isValid: false, error: "Nome muito curto" }
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: "Nome muito longo" }
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: "Nome contém caracteres inválidos" }
  }

  // Must have at least one space (first and last name)
  if (!trimmedName.includes(" ")) {
    return { isValid: false, error: "Digite nome e sobrenome" }
  }

  return { isValid: true }
}

/**
 * Birth date validation
 *
 * @example
 * ```ts
 * validateBirthDate("1990-01-01") // { isValid: true }
 * validateBirthDate("2010-01-01") // { isValid: false, error: "Idade mínima é 18 anos" }
 * ```
 */
export function validateBirthDate(birthDate: string): ValidationResult {
  if (!birthDate) {
    return { isValid: false, error: "Data de nascimento é obrigatória" }
  }

  const date = new Date(birthDate)
  const now = new Date()

  if (isNaN(date.getTime())) {
    return { isValid: false, error: "Data inválida" }
  }

  // Check if date is in the future
  if (date > now) {
    return { isValid: false, error: "Data não pode ser no futuro" }
  }

  // Calculate age
  const age = now.getFullYear() - date.getFullYear()
  const monthDiff = now.getMonth() - date.getMonth()
  const dayDiff = now.getDate() - date.getDate()

  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age

  // Minimum age requirement
  if (actualAge < 18) {
    return { isValid: false, error: "Idade mínima é 18 anos" }
  }

  // Maximum age (reasonable limit)
  if (actualAge > 120) {
    return { isValid: false, error: "Data de nascimento inválida" }
  }

  return { isValid: true }
}

/**
 * CPF validation (Brazilian tax ID)
 *
 * @example
 * ```ts
 * validateCPF("123.456.789-01") // { isValid: false, error: "CPF inválido" }
 * validateCPF("111.444.777-35") // { isValid: true }
 * ```
 */
export function validateCPF(cpf: string): ValidationResult {
  if (!cpf) {
    return { isValid: false, error: "CPF é obrigatório" }
  }

  // Remove formatting
  const cleanCPF = cpf.replace(/\D/g, "")

  if (cleanCPF.length !== 11) {
    return { isValid: false, error: "CPF deve ter 11 dígitos" }
  }

  // Check for known invalid patterns
  const invalidPatterns = [
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
  ]

  if (invalidPatterns.includes(cleanCPF)) {
    return { isValid: false, error: "CPF inválido" }
  }

  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cleanCPF.charAt(9))) {
    return { isValid: false, error: "CPF inválido" }
  }

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cleanCPF.charAt(10))) {
    return { isValid: false, error: "CPF inválido" }
  }

  return { isValid: true }
}

/**
 * Phone number validation (Brazilian format)
 *
 * @example
 * ```ts
 * validatePhoneNumber("(11) 99999-9999") // { isValid: true }
 * validatePhoneNumber("123456") // { isValid: false, error: "Telefone inválido" }
 * ```
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: "Telefone é obrigatório" }
  }

  const cleanPhone = phone.replace(/\D/g, "")

  // Brazilian phone numbers: 10 digits (landline) or 11 digits (mobile)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
    return { isValid: false, error: "Telefone deve ter 10 ou 11 dígitos" }
  }

  // Area code validation (11-99)
  const areaCode = Number.parseInt(cleanPhone.substring(0, 2))
  if (areaCode < 11 || areaCode > 99) {
    return { isValid: false, error: "Código de área inválido" }
  }

  // Mobile number validation (starts with 9)
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== "9") {
    return { isValid: false, error: "Número de celular deve começar com 9" }
  }

  return { isValid: true }
}

/**
 * File validation
 *
 * @example
 * ```ts
 * validateFile(imageFile, { maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg'] })
 * // { isValid: true } or { isValid: false, error: "Arquivo muito grande" }
 * ```
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {},
): ValidationResult {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options

  if (!file) {
    return { isValid: false, error: "Arquivo é obrigatório" }
  }

  // Size validation
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return { isValid: false, error: `Arquivo deve ter no máximo ${maxSizeMB}MB` }
  }

  // Type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, error: "Tipo de arquivo não permitido" }
  }

  // Extension validation
  if (allowedExtensions.length > 0) {
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return { isValid: false, error: "Extensão de arquivo não permitida" }
    }
  }

  return { isValid: true }
}

/**
 * Image file validation
 *
 * @example
 * ```ts
 * validateImageFile(file) // Validates common image formats and size
 * ```
 */
export function validateImageFile(file: File, maxSize = 5 * 1024 * 1024): ValidationResult {
  return validateFile(file, {
    maxSize,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
  })
}

/**
 * Video file validation
 *
 * @example
 * ```ts
 * validateVideoFile(file) // Validates common video formats
 * ```
 */
export function validateVideoFile(file: File, maxSize = 50 * 1024 * 1024): ValidationResult {
  return validateFile(file, {
    maxSize,
    allowedTypes: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    allowedExtensions: ["mp4", "webm", "ogg", "mov"],
  })
}

/**
 * Post content validation
 *
 * @example
 * ```ts
 * validatePostContent("Hello world!") // { isValid: true }
 * validatePostContent("") // { isValid: false, error: "Post não pode estar vazio" }
 * ```
 */
export function validatePostContent(content: string, maxLength = 500): ValidationResult {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: "Post não pode estar vazio" }
  }

  if (content.length > maxLength) {
    return { isValid: false, error: `Post deve ter no máximo ${maxLength} caracteres` }
  }

  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /https?:\/\/[^\s]+/gi, // Multiple URLs (basic check)
  ]

  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return { isValid: false, error: "Conteúdo parece ser spam" }
    }
  }

  return { isValid: true }
}

/**
 * URL validation
 *
 * @example
 * ```ts
 * validateURL("https://example.com") // { isValid: true }
 * validateURL("not-a-url") // { isValid: false, error: "URL inválida" }
 * ```
 */
export function validateURL(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, error: "URL é obrigatória" }
  }

  try {
    new URL(url)
    return { isValid: true }
  } catch {
    return { isValid: false, error: "URL inválida" }
  }
}

/**
 * Helper function to calculate password strength
 */
function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0

  // Length bonus
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1

  // Character variety
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  // Patterns
  if (!/(.)\1{2,}/.test(password)) score += 1 // No repeated characters
  if (!/123|abc|qwe/i.test(password)) score += 1 // No common sequences

  if (score < 4) return "weak"
  if (score < 6) return "medium"
  return "strong"
}

/**
 * Types
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}

export type PasswordStrength = "weak" | "medium" | "strong"
