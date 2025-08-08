/**
 * Messaging System Constants
 * Centralized business rules and limits for the messaging system
 */

import { PremiumType } from '@/types/user.types'

/**
 * Message limits by plan type
 */
export const MESSAGE_LIMITS = {
  FREE: {
    canInitiate: false,
    canReply: true, // Only if premium user initiated
    dailyLimit: 0,
    canCreateGroups: false,
    maxGroupsJoined: 0,
    canSendMedia: false,
    canMakeVoiceCalls: false,
    canMakeVideoCalls: false,
  },
  GOLD: {
    canInitiate: true,
    canReply: true,
    dailyLimit: {
      unverified: 10,
      verified: null, // Unlimited
    },
    canCreateGroups: false,
    maxGroupsJoined: 5,
    canSendMedia: true,
    canMakeVoiceCalls: false,
    canMakeVideoCalls: false,
  },
  DIAMOND: {
    canInitiate: true,
    canReply: true,
    dailyLimit: null, // Unlimited
    canCreateGroups: true,
    maxGroupsJoined: null, // Unlimited
    maxGroupMembers: 50,
    canSendMedia: true,
    canMakeVoiceCalls: true,
    canMakeVideoCalls: true,
  },
  COUPLE: {
    canInitiate: true,
    canReply: true,
    dailyLimit: null, // Unlimited
    canCreateGroups: true,
    maxGroupsJoined: null, // Unlimited
    maxGroupMembers: 50,
    canSendMedia: true,
    canMakeVoiceCalls: true,
    canMakeVideoCalls: true,
    syncedConversations: true, // Special feature
  },
} as const

/**
 * Message types and their restrictions
 */
export const MESSAGE_TYPES = {
  TEXT: {
    maxLength: 5000,
    allowedPlans: ['free', 'gold', 'diamond', 'couple'],
  },
  IMAGE: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedPlans: ['gold', 'diamond', 'couple'],
  },
  VIDEO: {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 300, // 5 minutes
    allowedFormats: ['video/mp4', 'video/webm', 'video/quicktime'],
    allowedPlans: ['gold', 'diamond', 'couple'],
  },
  AUDIO: {
    maxSize: 20 * 1024 * 1024, // 20MB
    maxDuration: 300, // 5 minutes
    allowedFormats: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'],
    allowedPlans: ['gold', 'diamond', 'couple'],
  },
  VOICE: {
    maxDuration: 60, // 1 minute voice messages
    allowedPlans: ['diamond', 'couple'],
  },
  FILE: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedPlans: ['diamond', 'couple'],
    blockedExtensions: ['.exe', '.bat', '.cmd', '.sh', '.app'],
  },
} as const

/**
 * Group chat restrictions
 */
export const GROUP_LIMITS = {
  MIN_MEMBERS: 3,
  MAX_MEMBERS: {
    diamond: 50,
    couple: 50,
  },
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  ALLOWED_CREATORS: ['diamond', 'couple'],
} as const

/**
 * Real-time features configuration
 */
export const REALTIME_CONFIG = {
  TYPING_INDICATOR_DURATION: 3000, // 3 seconds
  ONLINE_STATUS_UPDATE_INTERVAL: 60000, // 1 minute
  MESSAGE_DELIVERY_TIMEOUT: 30000, // 30 seconds
  RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 2000, // 2 seconds base delay (exponential backoff)
} as const

/**
 * Cache TTLs (in seconds)
 */
export const CACHE_TTL = {
  CONVERSATIONS: 300, // 5 minutes
  MESSAGES: 180, // 3 minutes
  TYPING_INDICATOR: 3, // 3 seconds
  ONLINE_STATUS: 60, // 1 minute
  UNREAD_COUNT: 120, // 2 minutes
  USER_LIMITS: 3600, // 1 hour
} as const

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  MESSAGES_PER_MINUTE: {
    free: 0,
    gold: 30,
    diamond: 100,
    couple: 100,
  },
  API_CALLS_PER_MINUTE: {
    free: 20,
    gold: 60,
    diamond: 120,
    couple: 120,
  },
  FILE_UPLOADS_PER_HOUR: {
    free: 0,
    gold: 10,
    diamond: 50,
    couple: 50,
  },
} as const

/**
 * Notification settings
 */
export const NOTIFICATION_CONFIG = {
  QUIET_HOURS: {
    DEFAULT_START: '22:00',
    DEFAULT_END: '08:00',
  },
  BATCH_DELAY: 1000, // 1 second to batch multiple messages
  MAX_PREVIEW_LENGTH: 100,
  SOUND_ENABLED_DEFAULT: true,
  VIBRATION_ENABLED_DEFAULT: true,
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Você não tem permissão para realizar esta ação',
  FREE_USER_INITIATE: 'Usuários gratuitos não podem iniciar conversas. Faça upgrade para Gold ou Diamond.',
  FREE_USER_GROUP: 'Apenas usuários Diamond podem criar grupos',
  DAILY_LIMIT_EXCEEDED: 'Limite diário de mensagens atingido. Verifique sua conta para mensagens ilimitadas.',
  GROUP_LIMIT_EXCEEDED: 'Você atingiu o limite máximo de grupos',
  GROUP_MEMBERS_LIMIT: 'O grupo atingiu o limite máximo de membros',
  INVALID_MEDIA_TYPE: 'Tipo de mídia não permitido para seu plano',
  FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo: {maxSize}',
  MESSAGE_TOO_LONG: 'Mensagem muito longa. Máximo de {maxLength} caracteres',
  NETWORK_ERROR: 'Erro de conexão. Suas mensagens serão enviadas quando a conexão for restaurada.',
  RATE_LIMIT_EXCEEDED: 'Muitas requisições. Por favor, aguarde um momento.',
} as const

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Mensagem enviada',
  GROUP_CREATED: 'Grupo criado com sucesso',
  MEMBER_ADDED: 'Membro adicionado ao grupo',
  MEMBER_REMOVED: 'Membro removido do grupo',
  CONVERSATION_DELETED: 'Conversa excluída',
  MESSAGES_SYNCED: 'Mensagens sincronizadas',
} as const

/**
 * Helper function to get user message permissions
 */
export function getMessagePermissions(
  planType: PremiumType,
  isVerified: boolean = false
) {
  const limits = MESSAGE_LIMITS[planType.toUpperCase() as keyof typeof MESSAGE_LIMITS]
  
  if (!limits) {
    return MESSAGE_LIMITS.FREE
  }

  // Handle daily limits for Gold users
  if (planType === 'gold' && typeof limits.dailyLimit === 'object') {
    return {
      ...limits,
      dailyLimit: isVerified ? limits.dailyLimit.verified : limits.dailyLimit.unverified,
    }
  }

  return limits
}

/**
 * Check if user can send specific message type
 */
export function canSendMessageType(
  messageType: keyof typeof MESSAGE_TYPES,
  planType: PremiumType
): boolean {
  const typeConfig = MESSAGE_TYPES[messageType]
  return typeConfig.allowedPlans.includes(planType.toLowerCase())
}

/**
 * Get rate limit for user
 */
export function getRateLimit(
  limitType: keyof typeof RATE_LIMITS,
  planType: PremiumType
): number {
  const limits = RATE_LIMITS[limitType]
  return limits[planType.toLowerCase() as keyof typeof limits] || 0
}

/**
 * Validate message content
 */
export function validateMessage(
  content: string,
  type: keyof typeof MESSAGE_TYPES = 'TEXT'
): { valid: boolean; error?: string } {
  const config = MESSAGE_TYPES[type]
  
  if (type === 'TEXT' && content.length > config.maxLength) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MESSAGE_TOO_LONG.replace('{maxLength}', config.maxLength.toString())
    }
  }

  return { valid: true }
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  planType: PremiumType
): { valid: boolean; error?: string } {
  // Determine file type category
  let fileType: keyof typeof MESSAGE_TYPES = 'FILE'
  
  if (file.type.startsWith('image/')) {
    fileType = 'IMAGE'
  } else if (file.type.startsWith('video/')) {
    fileType = 'VIDEO'
  } else if (file.type.startsWith('audio/')) {
    fileType = 'AUDIO'
  }

  // Check plan permission
  if (!canSendMessageType(fileType, planType)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_MEDIA_TYPE
    }
  }

  // Check file size
  const config = MESSAGE_TYPES[fileType]
  if ('maxSize' in config && file.size > config.maxSize) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE.replace(
        '{maxSize}',
        `${Math.round(config.maxSize / 1024 / 1024)}MB`
      )
    }
  }

  // Check file format
  if ('allowedFormats' in config && !config.allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato de arquivo não suportado'
    }
  }

  // Check blocked extensions for generic files
  if (fileType === 'FILE' && 'blockedExtensions' in config) {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (config.blockedExtensions.includes(extension)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido por questões de segurança'
      }
    }
  }

  return { valid: true }
}