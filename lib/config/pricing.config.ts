/**
 * Centralized pricing configuration for OpenLove
 * Single source of truth for all plan prices and billing cycles
 */

export interface PlanPricing {
  monthly: number
  quarterly: number
  semiannual: number
  annual: number
}

export interface PlanConfiguration {
  name: string
  description: string
  color: string
  gradient: string
  icon: string
  pricing: PlanPricing
  features: string[]
  limits: {
    daily_messages: number | null // null = unlimited
    daily_likes: number | null
    max_photos_per_post: number
    max_video_length: number // seconds
    storage_limit: number // bytes
    max_group_members: number
    stories_per_day: number | null
    can_boost_stories: boolean
    can_monetize_content: boolean
    see_who_liked: boolean
    advanced_filters: boolean
    verified_badge: boolean
    priority_support: boolean
    show_ads: boolean
    ad_frequency: number // posts between ads, 0 = no ads
  }
}

// All prices in BRL (Brazilian Real) with proper formatting
export const PLAN_PRICING: Record<string, PlanConfiguration> = {
  free: {
    name: "Gratuito",
    description: "Para começar a explorar",
    color: "gray",
    gradient: "from-gray-500 to-gray-600",
    icon: "🆓",
    pricing: {
      monthly: 0,
      quarterly: 0,
      semiannual: 0,
      annual: 0,
    },
    features: [
      "Perfil básico",
      "Visualizar posts públicos",
      "Curtir e comentar (com verificação)",
      "Seguir outros usuários",
      "1 foto por post",
      "Responder mensagens recebidas",
    ],
    limits: {
      daily_messages: 0, // Cannot initiate conversations
      daily_likes: 5,
      max_photos_per_post: 1,
      max_video_length: 0,
      storage_limit: 100 * 1024 * 1024, // 100MB
      max_group_members: 0,
      stories_per_day: 0, // 3 if verified
      can_boost_stories: false,
      can_monetize_content: false,
      see_who_liked: false,
      advanced_filters: false,
      verified_badge: false,
      priority_support: false,
      show_ads: true,
      ad_frequency: 5, // Ad every 5 posts
    },
  },
  gold: {
    name: "Gold",
    description: "Para usuários ativos",
    color: "yellow",
    gradient: "from-yellow-400 to-yellow-600",
    icon: "⭐",
    pricing: {
      monthly: 25.00,
      quarterly: 67.50, // 10% discount
      semiannual: 127.50, // 15% discount
      annual: 240.00, // 20% discount
    },
    features: [
      "Todas as funcionalidades gratuitas",
      "Mensagens limitadas (ilimitadas se verificado)",
      "Upload de vídeos (5 min)",
      "Até 10 fotos por post",
      "Criar enquetes",
      "Criar eventos (3/mês, ilimitado se verificado)",
      "Entrar em comunidades (máx 5)",
      "Menos anúncios",
      "Stories (5/dia, 10 se verificado)",
    ],
    limits: {
      daily_messages: 10, // unlimited if verified
      daily_likes: null, // unlimited
      max_photos_per_post: 10,
      max_video_length: 300, // 5 minutes
      storage_limit: 1024 * 1024 * 1024, // 1GB
      max_group_members: 0,
      stories_per_day: 5, // 10 if verified
      can_boost_stories: false,
      can_monetize_content: false,
      see_who_liked: true,
      advanced_filters: false,
      verified_badge: false,
      priority_support: false,
      show_ads: true,
      ad_frequency: 10, // Ad every 10 posts
    },
  },
  diamond: {
    name: "Diamond",
    description: "Experiência premium completa",
    color: "blue",
    gradient: "from-blue-400 to-purple-600",
    icon: "💎",
    pricing: {
      monthly: 45.00,
      quarterly: 121.50, // 10% discount
      semiannual: 229.50, // 15% discount
      annual: 432.00, // 20% discount
    },
    features: [
      "Todas as funcionalidades Gold",
      "Mensagens ilimitadas",
      "Stories premium (10/dia, ilimitado se verificado)",
      "Boost de stories e perfil",
      "Chamadas de voz e vídeo",
      "Criar grupos (máx 50 membros)",
      "Analytics avançado",
      "Filtros avançados de busca",
      "Monetizar conteúdo",
      "Badge Diamond",
      "Sem anúncios",
      "Suporte prioritário",
    ],
    limits: {
      daily_messages: null, // unlimited
      daily_likes: null, // unlimited
      max_photos_per_post: 20,
      max_video_length: 1800, // 30 minutes
      storage_limit: 10 * 1024 * 1024 * 1024, // 10GB
      max_group_members: 50,
      stories_per_day: 10, // unlimited if verified
      can_boost_stories: true,
      can_monetize_content: true,
      see_who_liked: true,
      advanced_filters: true,
      verified_badge: false, // Requires separate verification
      priority_support: true,
      show_ads: false,
      ad_frequency: 0, // No ads
    },
  },
  couple: {
    name: "Dupla Hot",
    description: "Para casais apaixonados",
    color: "pink",
    gradient: "from-pink-400 to-red-500",
    icon: "💕",
    pricing: {
      monthly: 69.90,
      quarterly: 188.73, // 10% discount
      semiannual: 356.49, // 15% discount
      annual: 671.04, // 20% discount
    },
    features: [
      "Todas as funcionalidades Diamond",
      "Perfil de casal sincronizado",
      "Posts aparecem nos dois perfis",
      "Timeline compartilhada",
      "Lives e transmissões conjuntas",
      "Monetização em conjunto",
      "Badge especial 'Dupla Verificada'",
      "Armazenamento extra (20GB)",
      "Grupos de até 100 membros",
      "Suporte VIP",
    ],
    limits: {
      daily_messages: null, // unlimited
      daily_likes: null, // unlimited
      max_photos_per_post: 30,
      max_video_length: 3600, // 1 hour
      storage_limit: 20 * 1024 * 1024 * 1024, // 20GB
      max_group_members: 100,
      stories_per_day: 10, // unlimited if verified
      can_boost_stories: true,
      can_monetize_content: true,
      see_who_liked: true,
      advanced_filters: true,
      verified_badge: false, // Requires separate verification
      priority_support: true,
      show_ads: false,
      ad_frequency: 0, // No ads
    },
  },
}

// Discount percentages by billing period
export const BILLING_DISCOUNTS = {
  monthly: 0,
  quarterly: 10,
  semiannual: 15,
  annual: 20,
} as const

// Helper functions
export function getPlanPrice(planType: string, billingPeriod: keyof PlanPricing): number {
  const plan = PLAN_PRICING[planType]
  if (!plan) throw new Error(`Invalid plan type: ${planType}`)
  
  return plan.pricing[billingPeriod]
}

export function getPlanPriceInCents(planType: string, billingPeriod: keyof PlanPricing): number {
  return Math.round(getPlanPrice(planType, billingPeriod) * 100)
}

export function calculateDiscount(basePrice: number, billingPeriod: keyof PlanPricing): number {
  const discountPercentage = BILLING_DISCOUNTS[billingPeriod]
  return Math.round(basePrice * discountPercentage / 100 * 100) / 100 // Round to 2 decimals
}

export function getPlanLimits(planType: string) {
  const plan = PLAN_PRICING[planType]
  if (!plan) throw new Error(`Invalid plan type: ${planType}`)
  
  return plan.limits
}

export function getPlanFeatures(planType: string): string[] {
  const plan = PLAN_PRICING[planType]
  if (!plan) throw new Error(`Invalid plan type: ${planType}`)
  
  return plan.features
}

export function getAllPlans() {
  return Object.keys(PLAN_PRICING).filter(key => key !== 'free')
}

export function getUpgradePath(currentPlan: string): string[] {
  const plans = ['free', 'gold', 'diamond', 'couple']
  const currentIndex = plans.indexOf(currentPlan)
  
  if (currentIndex === -1) return []
  
  return plans.slice(currentIndex + 1)
}

export function canDowngradeTo(currentPlan: string, targetPlan: string): boolean {
  const plans = ['free', 'gold', 'diamond', 'couple']
  const currentIndex = plans.indexOf(currentPlan)
  const targetIndex = plans.indexOf(targetPlan)
  
  return currentIndex > targetIndex
}

// Stripe price IDs (to be configured in Stripe dashboard)
export const STRIPE_PRICE_IDS = {
  gold: {
    monthly: process.env.STRIPE_GOLD_MONTHLY_PRICE_ID,
    quarterly: process.env.STRIPE_GOLD_QUARTERLY_PRICE_ID,
    semiannual: process.env.STRIPE_GOLD_SEMIANNUAL_PRICE_ID,
    annual: process.env.STRIPE_GOLD_ANNUAL_PRICE_ID,
  },
  diamond: {
    monthly: process.env.STRIPE_DIAMOND_MONTHLY_PRICE_ID,
    quarterly: process.env.STRIPE_DIAMOND_QUARTERLY_PRICE_ID,
    semiannual: process.env.STRIPE_DIAMOND_SEMIANNUAL_PRICE_ID,
    annual: process.env.STRIPE_DIAMOND_ANNUAL_PRICE_ID,
  },
  couple: {
    monthly: process.env.STRIPE_COUPLE_MONTHLY_PRICE_ID,
    quarterly: process.env.STRIPE_COUPLE_QUARTERLY_PRICE_ID,
    semiannual: process.env.STRIPE_COUPLE_SEMIANNUAL_PRICE_ID,
    annual: process.env.STRIPE_COUPLE_ANNUAL_PRICE_ID,
  },
}

// Commission rates for content monetization
export const COMMISSION_RATES = {
  unverified: 0.20, // 20%
  verified: 0.15, // 15%
  business_verified: 0.10, // 10%
} as const

export function calculateContentCommission(amount: number, userType: 'unverified' | 'verified' | 'business_verified'): {
  commission: number
  userReceives: number
  commissionRate: number
} {
  const rate = COMMISSION_RATES[userType]
  const commission = Math.round(amount * rate * 100) / 100
  const userReceives = Math.round((amount - commission) * 100) / 100
  
  return {
    commission,
    userReceives,
    commissionRate: rate,
  }
}

// Credit system pricing
export const CREDIT_PACKAGES = [
  { credits: 100, price: 10.00, bonus: 0 },
  { credits: 500, price: 45.00, bonus: 50 }, // 10% bonus
  { credits: 1000, price: 80.00, bonus: 200 }, // 20% bonus
  { credits: 2500, price: 180.00, bonus: 600 }, // 24% bonus
  { credits: 5000, price: 300.00, bonus: 1500 }, // 30% bonus
] as const

export function getCreditPackageValue(packageIndex: number): {
  credits: number
  price: number
  bonus: number
  totalCredits: number
  pricePerCredit: number
} {
  const pkg = CREDIT_PACKAGES[packageIndex]
  if (!pkg) throw new Error(`Invalid credit package index: ${packageIndex}`)
  
  const totalCredits = pkg.credits + pkg.bonus
  const pricePerCredit = Math.round((pkg.price / totalCredits) * 1000) / 1000 // 3 decimal places
  
  return {
    ...pkg,
    totalCredits,
    pricePerCredit,
  }
}