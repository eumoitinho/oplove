/**
 * Application-wide constants for OpenLove platform
 *
 * Centralized configuration values, limits, and constants
 * used throughout the application.
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: "OpenLove",
  version: "0.3.1",
  description: "Conectando pessoas através do amor e da tecnologia",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://openlove.com.br",
  supportEmail: "suporte@openlove.com.br",
  socialMedia: {
    instagram: "@openlove_oficial",
    twitter: "@openlove_br",
    facebook: "OpenLoveBrasil",
    tiktok: "@openlove_br",
  },
} as const

/**
 * Premium plan configurations
 */
export const PREMIUM_PLANS = {
  free: {
    name: "Gratuito",
    price: 0,
    color: "gray",
    gradient: "from-gray-500 to-gray-600",
    icon: "🆓",
    features: ["Perfil básico", "Visualizar posts", "Curtir e comentar (com verificação)", "Seguir outros usuários"],
  },
  gold: {
    name: "Gold",
    price: 1990, // in cents
    color: "yellow",
    gradient: "from-yellow-400 to-yellow-600",
    icon: "⭐",
    features: [
      "Mensagens ilimitadas (com verificação)",
      "Upload de vídeos",
      "Criar enquetes",
      "Criar eventos",
      "Menos anúncios",
    ],
  },
  diamond: {
    name: "Diamond",
    price: 3990, // in cents
    color: "blue",
    gradient: "from-blue-400 to-purple-600",
    icon: "💎",
    features: [
      "Todos os recursos Gold",
      "Stories exclusivos",
      "Chamadas de voz e vídeo",
      "Criar grupos",
      "Analytics avançado",
      "Sem anúncios",
    ],
  },
  couple: {
    name: "Couple",
    price: 5990, // in cents
    color: "pink",
    gradient: "from-pink-400 to-red-500",
    icon: "💕",
    features: [
      "Todos os recursos Diamond",
      "Perfil de casal",
      "Armazenamento extra",
      "Recursos exclusivos para casais",
      "Suporte prioritário",
    ],
  },
} as const

/**
 * Content limits by plan
 */
export const CONTENT_LIMITS = {
  free: {
    maxPhotosPerPost: 1,
    maxVideoLength: 0, // seconds
    dailyMessageLimit: 0, // 0 = no messages without verification
    storageLimit: 100 * 1024 * 1024, // 100MB
    maxGroupMembers: 0,
  },
  gold: {
    maxPhotosPerPost: 10,
    maxVideoLength: 300, // 5 minutes
    dailyMessageLimit: 200, // unlimited if verified
    storageLimit: 1024 * 1024 * 1024, // 1GB
    maxGroupMembers: 0,
  },
  diamond: {
    maxPhotosPerPost: 20,
    maxVideoLength: 1800, // 30 minutes
    dailyMessageLimit: -1, // unlimited
    storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
    maxGroupMembers: 50,
  },
  couple: {
    maxPhotosPerPost: 30,
    maxVideoLength: 3600, // 1 hour
    dailyMessageLimit: -1, // unlimited
    storageLimit: 20 * 1024 * 1024 * 1024, // 20GB
    maxGroupMembers: 100,
  },
} as const

/**
 * File upload limits
 */
export const FILE_LIMITS = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
  },
  video: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    allowedExtensions: ["mp4", "webm", "ogg", "mov"],
  },
  audio: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
    allowedExtensions: ["mp3", "wav", "ogg", "m4a"],
  },
  document: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: ["pdf", "doc", "docx"],
  },
} as const

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9._]+$/,
    reservedNames: [
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
    ],
  },
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  fullName: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
  },
  postContent: {
    maxLength: 500,
    minLength: 1,
  },
  bio: {
    maxLength: 160,
  },
  eventTitle: {
    minLength: 5,
    maxLength: 100,
  },
  eventDescription: {
    maxLength: 1000,
  },
} as const

/**
 * UI constants
 */
export const UI_CONFIG = {
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
} as const

/**
 * API configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  endpoints: {
    auth: "/v1/auth",
    users: "/v1/users",
    posts: "/v1/posts",
    messages: "/v1/messages",
    notifications: "/v1/notifications",
    payments: "/v1/payments",
    upload: "/v1/upload",
  },
} as const

/**
 * Real-time configuration
 */
export const REALTIME_CONFIG = {
  reconnectInterval: 5000, // 5 seconds
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000, // 30 seconds
  channels: {
    notifications: "user-notifications",
    messages: "user-messages",
    presence: "user-presence",
    posts: "timeline-posts",
  },
} as const

/**
 * Storage keys for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
  theme: "openlove-theme",
  language: "openlove-language",
  userPreferences: "openlove-user-preferences",
  draftPost: "openlove-draft-post",
  searchHistory: "openlove-search-history",
  onboardingCompleted: "openlove-onboarding-completed",
  lastActiveTab: "openlove-last-active-tab",
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  network: "Erro de conexão. Verifique sua internet.",
  unauthorized: "Você precisa estar logado para acessar este recurso.",
  forbidden: "Você não tem permissão para realizar esta ação.",
  notFound: "Recurso não encontrado.",
  serverError: "Erro interno do servidor. Tente novamente mais tarde.",
  validationError: "Dados inválidos. Verifique os campos e tente novamente.",
  rateLimit: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  fileTooBig: "Arquivo muito grande. Tamanho máximo permitido excedido.",
  fileTypeNotAllowed: "Tipo de arquivo não permitido.",
  quotaExceeded: "Limite de armazenamento excedido.",
  premiumRequired: "Este recurso requer uma assinatura premium.",
  verificationRequired: "Verificação de identidade necessária para continuar.",
  maintenanceMode: "Sistema em manutenção. Tente novamente em alguns minutos.",
} as const

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  loginSuccess: "Login realizado com sucesso!",
  registerSuccess: "Conta criada com sucesso! Verifique seu email.",
  profileUpdated: "Perfil atualizado com sucesso!",
  postCreated: "Post publicado com sucesso!",
  postUpdated: "Post atualizado com sucesso!",
  postDeleted: "Post excluído com sucesso!",
  messageSent: "Mensagem enviada!",
  fileUploaded: "Arquivo enviado com sucesso!",
  passwordChanged: "Senha alterada com sucesso!",
  emailVerified: "Email verificado com sucesso!",
  subscriptionActivated: "Assinatura ativada com sucesso!",
  subscriptionCanceled: "Assinatura cancelada com sucesso!",
  verificationSubmitted: "Documentos enviados para verificação!",
  verificationApproved: "Conta verificada com sucesso!",
} as const

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  enableStories: true,
  enableVoiceCalls: true,
  enableVideoCalls: true,
  enableGroups: true,
  enableEvents: true,
  enableMarketplace: false, // Coming soon
  enableLiveStreaming: false, // Coming soon
  enableAIModeration: true,
  enablePushNotifications: true,
  enableDarkMode: true,
  enableBetaFeatures: process.env.NODE_ENV === "development",
} as const

/**
 * Social media sharing
 */
export const SOCIAL_SHARING = {
  twitter: {
    baseUrl: "https://twitter.com/intent/tweet",
    hashtags: ["OpenLove", "Relacionamentos", "Amor"],
  },
  facebook: {
    baseUrl: "https://www.facebook.com/sharer/sharer.php",
  },
  whatsapp: {
    baseUrl: "https://wa.me",
  },
  telegram: {
    baseUrl: "https://t.me/share/url",
  },
} as const

/**
 * Analytics events
 */
export const ANALYTICS_EVENTS = {
  // User events
  userSignUp: "user_sign_up",
  userLogin: "user_login",
  userLogout: "user_logout",
  profileView: "profile_view",
  profileEdit: "profile_edit",

  // Content events
  postCreate: "post_create",
  postView: "post_view",
  postLike: "post_like",
  postShare: "post_share",
  postComment: "post_comment",

  // Social events
  userFollow: "user_follow",
  userUnfollow: "user_unfollow",
  messageSend: "message_send",
  callStart: "call_start",
  callEnd: "call_end",

  // Premium events
  paywallView: "paywall_view",
  subscriptionStart: "subscription_start",
  subscriptionCancel: "subscription_cancel",
  upgradeClick: "upgrade_click",

  // Engagement events
  searchPerform: "search_perform",
  notificationClick: "notification_click",
  linkClick: "link_click",
  appInstall: "app_install",
} as const

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  like: {
    icon: "❤️",
    color: "text-red-500",
    title: "curtiu seu post",
  },
  comment: {
    icon: "💬",
    color: "text-blue-500",
    title: "comentou em seu post",
  },
  follow: {
    icon: "👤",
    color: "text-green-500",
    title: "começou a seguir você",
  },
  message: {
    icon: "📩",
    color: "text-purple-500",
    title: "enviou uma mensagem",
  },
  mention: {
    icon: "@",
    color: "text-orange-500",
    title: "mencionou você",
  },
  story: {
    icon: "📸",
    color: "text-pink-500",
    title: "adicionou um novo story",
  },
  event: {
    icon: "📅",
    color: "text-indigo-500",
    title: "criou um evento",
  },
  verification: {
    icon: "✅",
    color: "text-green-600",
    title: "Verificação aprovada",
  },
  premium: {
    icon: "⭐",
    color: "text-yellow-500",
    title: "Assinatura ativada",
  },
} as const

/**
 * Date and time formats
 */
export const DATE_FORMATS = {
  short: "dd/MM/yyyy",
  long: "dd 'de' MMMM 'de' yyyy",
  time: "HH:mm",
  dateTime: "dd/MM/yyyy 'às' HH:mm",
  relative: "relative", // Special format for relative time
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const

/**
 * Currency configuration
 */
export const CURRENCY_CONFIG = {
  code: "BRL",
  symbol: "R$",
  locale: "pt-BR",
  precision: 2,
} as const

/**
 * Regex patterns
 */
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9._]+$/,
  phone: /^$$\d{2}$$\s\d{4,5}-\d{4}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  hashtag: /#([a-zA-Z0-9_]+)/g,
  mention: /@([a-zA-Z0-9_.]+)/g,
  emoji:
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
} as const

/**
 * Color palette
 */
export const COLORS = {
  primary: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  accent: {
    50: "#fefce8",
    100: "#fef9c3",
    200: "#fef08a",
    300: "#fde047",
    400: "#facc15",
    500: "#eab308",
    600: "#ca8a04",
    700: "#a16207",
    800: "#854d0e",
    900: "#713f12",
  },
} as const

/**
 * Environment-specific constants
 */
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
} as const

/**
 * Default values
 */
export const DEFAULTS = {
  avatar: "/images/default-avatar.png",
  cover: "/images/default-cover.jpg",
  postImage: "/images/default-post.jpg",
  language: "pt-BR",
  theme: "light",
  timezone: "America/Sao_Paulo",
  pageSize: 20,
  maxRetries: 3,
  debounceDelay: 300,
  throttleDelay: 100,
} as const

/**
 * Export all constants as a single object for easy importing
 */
export const CONSTANTS = {
  APP_CONFIG,
  PREMIUM_PLANS,
  CONTENT_LIMITS,
  FILE_LIMITS,
  VALIDATION_RULES,
  UI_CONFIG,
  API_CONFIG,
  REALTIME_CONFIG,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  SOCIAL_SHARING,
  ANALYTICS_EVENTS,
  NOTIFICATION_TYPES,
  DATE_FORMATS,
  CURRENCY_CONFIG,
  REGEX_PATTERNS,
  COLORS,
  ENV_CONFIG,
  DEFAULTS,
} as const
