/**
 * Business-related TypeScript types for OpenLove
 * Updated to match the new schema with credits system and ad campaigns
 */

import type { User } from "./user.types"
import type { Post } from "./post.types"

// Enums matching database schema
export type AccountType = 'personal' | 'business'
export type BusinessType = 'venue' | 'content_creator' | 'service_provider' | 'event_organizer' | 'brand' | 'influencer'
export type BusinessStatus = 'pending' | 'active' | 'suspended' | 'banned'
export type AdStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected'
export type AdFormat = 'timeline' | 'sidebar' | 'story' | 'popup' | 'native'
export type CampaignObjective = 'awareness' | 'traffic' | 'conversion' | 'engagement' | 'app_installs'
export type CreditTransactionType = 'purchase' | 'spend' | 'refund' | 'bonus'

export interface BusinessProfile {
  id: string
  owner_id: string
  business_type: BusinessType
  business_name: string
  legal_name?: string
  cnpj?: string
  description?: string
  short_description?: string
  category?: string
  subcategories: string[]
  tags: string[]
  
  // Location
  address?: BusinessAddress
  coordinates?: { lat: number; lng: number }
  business_hours?: BusinessHours
  service_area_radius?: number
  
  // Contact
  contact: {
    phone: string
    whatsapp?: string
    email: string
    website?: string
  }
  social_links?: SocialLinks
  
  // Verification
  is_verified: boolean
  verified_at?: string
  verification_level: number
  verification_documents: string[]
  
  // Media
  logo_url?: string
  cover_image_url?: string
  gallery_urls: string[]
  
  // Credits and financial
  credit_balance: number
  total_credits_purchased: number
  total_credits_spent: number
  total_revenue: number
  
  // Settings and features
  settings: {
    notifications: boolean
    auto_reply: boolean
    show_in_search: boolean
    allow_reviews: boolean
  }
  features: {
    can_sell_content: boolean
    can_create_events: boolean
    can_advertise: boolean
    can_have_store: boolean
    max_products: number
    max_events_per_month: number
    commission_rate: number
  }
  
  // Stats
  stats: {
    total_followers: number
    total_views: number
    average_rating: number
    total_reviews: number
    total_sales: number
  }
  
  // Status
  status: BusinessStatus
  suspension_reason?: string
  
  // SEO
  slug?: string
  meta_description?: string
  meta_keywords?: string[]
  
  // Timestamps
  created_at: string
  updated_at: string
  last_active_at: string
}

// Keep the existing BusinessType enum for backward compatibility
export type LegacyBusinessType =
  | "restaurant"
  | "hotel"
  | "spa"
  | "photography"
  | "event_planning"
  | "coaching"
  | "consulting"
  | "fitness"
  | "beauty"
  | "fashion"
  | "travel"
  | "education"
  | "entertainment"
  | "other"

export type BusinessCategory =
  | "dating_services"
  | "wedding_services"
  | "relationship_coaching"
  | "photography"
  | "venues"
  | "catering"
  | "beauty_wellness"
  | "entertainment"
  | "travel_experiences"
  | "gifts_flowers"
  | "fashion_styling"
  | "fitness_health"
  | "education_courses"
  | "other"

export interface BusinessAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  country: string
  latitude?: number
  longitude?: number
}

export interface BusinessHours {
  monday: DayHours | null
  tuesday: DayHours | null
  wednesday: DayHours | null
  thursday: DayHours | null
  friday: DayHours | null
  saturday: DayHours | null
  sunday: DayHours | null
  timezone: string
}

export interface DayHours {
  open: string // HH:mm format
  close: string // HH:mm format
  is_closed: boolean
  breaks?: {
    start: string
    end: string
  }[]
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  tiktok?: string
  youtube?: string
  whatsapp?: string
  telegram?: string
}

export interface BusinessService {
  id: string
  business_id: string
  name: string
  description: string
  price: number
  currency: string
  duration: number // in minutes
  category: string
  images: string[]
  is_active: boolean
  booking_enabled: boolean
  advance_booking_days: number
  cancellation_policy: string
  created_at: string
  updated_at: string

  // Relations
  business: BusinessProfile
  bookings: ServiceBooking[]
}

export interface ServiceBooking {
  id: string
  service_id: string
  customer_id: string
  business_id: string
  booking_date: string
  booking_time: string
  duration: number
  total_price: number
  currency: string
  status: "pending" | "confirmed" | "completed" | "canceled" | "no_show"
  payment_status: "pending" | "paid" | "refunded"
  payment_method: string | null
  notes: string | null
  cancellation_reason: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string

  // Relations
  service: BusinessService
  customer: User
  business: BusinessProfile
  review: BusinessReview | null
}

export interface BusinessReview {
  id: string
  business_id: string
  customer_id: string
  booking_id: string | null
  rating: number // 1-5
  title: string
  comment: string
  images: string[]
  response: BusinessReviewResponse | null
  is_verified: boolean
  is_featured: boolean
  created_at: string
  updated_at: string

  // Relations
  business: BusinessProfile
  customer: User
  booking: ServiceBooking | null
}

export interface BusinessReviewResponse {
  id: string
  review_id: string
  business_id: string
  response_text: string
  responded_at: string

  // Relations
  review: BusinessReview
  business: BusinessProfile
}

export interface BusinessEvent {
  id: string
  business_id: string
  title: string
  description: string
  event_type: "workshop" | "class" | "seminar" | "networking" | "party" | "date_night" | "other"
  category: string
  image_url: string | null
  location: EventLocation
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  timezone: string
  capacity: number | null
  price: number
  currency: string
  is_free: boolean
  registration_required: boolean
  registration_deadline: string | null
  age_restriction: {
    min_age?: number
    max_age?: number
  } | null
  tags: string[]
  status: "draft" | "published" | "canceled" | "completed"
  created_at: string
  updated_at: string

  // Relations
  business: BusinessProfile
  registrations: EventRegistration[]
  posts: Post[]
}

export interface EventLocation {
  type: "physical" | "online" | "hybrid"
  venue_name?: string
  address?: BusinessAddress
  online_link?: string
  instructions?: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  status: "registered" | "confirmed" | "attended" | "no_show" | "canceled"
  payment_status: "pending" | "paid" | "refunded" | "free"
  payment_amount: number
  registration_data: Record<string, any>
  notes: string | null
  registered_at: string
  updated_at: string

  // Relations
  event: BusinessEvent
  user: User
}

// Paid content system
export interface PaidContent {
  id: string
  business_id: string
  creator_id: string
  title: string
  description: string
  content_type: "course" | "ebook" | "video" | "audio" | "template" | "consultation"
  category: string
  thumbnail_url: string | null
  preview_content: string | null
  full_content: string | null
  files: ContentFile[]
  price: number
  currency: string
  is_free: boolean
  access_type: "lifetime" | "subscription" | "rental"
  access_duration: number | null // days for rental
  tags: string[]
  difficulty_level: "beginner" | "intermediate" | "advanced"
  estimated_duration: number | null // minutes
  requirements: string[]
  what_you_learn: string[]
  rating: number
  reviews_count: number
  purchases_count: number
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string

  // Relations
  business: BusinessProfile
  creator: User
  purchases: ContentPurchase[]
  reviews: ContentReview[]
  modules: ContentModule[]
}

export interface ContentFile {
  id: string
  content_id: string
  name: string
  url: string
  type: "video" | "audio" | "document" | "image" | "archive"
  size: number
  duration: number | null // for video/audio
  order: number
  is_preview: boolean

  // Relations
  content: PaidContent
}

export interface ContentModule {
  id: string
  content_id: string
  title: string
  description: string
  order: number
  lessons: ContentLesson[]

  // Relations
  content: PaidContent
}

export interface ContentLesson {
  id: string
  module_id: string
  title: string
  description: string
  content_type: "video" | "text" | "audio" | "quiz" | "assignment"
  content_url: string | null
  content_text: string | null
  duration: number | null // minutes
  order: number
  is_preview: boolean
  quiz_data: QuizData | null

  // Relations
  module: ContentModule
}

export interface QuizData {
  questions: QuizQuestion[]
  passing_score: number
  max_attempts: number
  time_limit: number | null // minutes
}

export interface QuizQuestion {
  id: string
  question: string
  type: "multiple_choice" | "true_false" | "text"
  options: string[]
  correct_answer: string | string[]
  explanation: string | null
  points: number
}

export interface ContentPurchase {
  id: string
  content_id: string
  user_id: string
  purchase_type: "one_time" | "subscription" | "rental"
  amount_paid: number
  currency: string
  payment_method: string
  access_expires_at: string | null
  progress: ContentProgress
  purchased_at: string

  // Relations
  content: PaidContent
  user: User
}

export interface ContentProgress {
  completed_lessons: string[]
  current_lesson: string | null
  completion_percentage: number
  time_spent: number // minutes
  quiz_scores: Record<string, number>
  certificates_earned: string[]
  last_accessed: string
}

export interface ContentReview {
  id: string
  content_id: string
  user_id: string
  purchase_id: string
  rating: number // 1-5
  title: string
  comment: string
  is_verified_purchase: boolean
  helpful_votes: number
  created_at: string
  updated_at: string

  // Relations
  content: PaidContent
  user: User
  purchase: ContentPurchase
}

// Business analytics
export interface BusinessAnalytics {
  business_id: string
  period: string
  profile_views: number
  profile_clicks: number
  posts_reach: number
  posts_engagement: number
  followers_gained: number
  followers_lost: number
  bookings_count: number
  bookings_revenue: number
  events_registrations: number
  content_sales: number
  content_revenue: number
  reviews_received: number
  average_rating: number
  top_services: {
    service_id: string
    name: string
    bookings: number
    revenue: number
  }[]
  demographics: {
    age_groups: Record<string, number>
    genders: Record<string, number>
    locations: Record<string, number>
  }
  time_series: {
    date: string
    views: number
    bookings: number
    revenue: number
    followers: number
  }[]
}

// Business directory and search
export interface BusinessSearchResult {
  businesses: BusinessProfile[]
  total: number
  page: number
  limit: number
  has_more: boolean
  filters_applied: BusinessSearchFilters
}

export interface BusinessSearchFilters {
  query?: string
  category?: BusinessCategory
  business_type?: BusinessType
  location?: {
    city?: string
    state?: string
    radius?: number // km
    latitude?: number
    longitude?: number
  }
  rating_min?: number
  price_range?: {
    min: number
    max: number
  }
  open_now?: boolean
  verified_only?: boolean
  has_reviews?: boolean
  services?: string[]
  page?: number
  limit?: number
  sort_by?: "relevance" | "rating" | "distance" | "price" | "newest"
}

// Business promotion and advertising
export interface BusinessPromotion {
  id: string
  business_id: string
  type: "featured_listing" | "sponsored_post" | "event_promotion" | "service_highlight"
  title: string
  description: string
  target_audience: PromotionTargeting
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  status: "draft" | "active" | "paused" | "completed" | "rejected"
  starts_at: string
  ends_at: string
  created_at: string
  updated_at: string

  // Relations
  business: BusinessProfile
}

export interface PromotionTargeting {
  age_min?: number
  age_max?: number
  genders?: string[]
  locations?: string[]
  interests?: string[]
  relationship_status?: string[]
  premium_types?: string[]
}

// Business notifications
export interface BusinessNotification {
  id: string
  business_id: string
  type:
    | "new_booking"
    | "booking_canceled"
    | "new_review"
    | "payment_received"
    | "event_registration"
    | "content_purchase"
  title: string
  message: string
  data: Record<string, any>
  is_read: boolean
  created_at: string

  // Relations
  business: BusinessProfile
}

// Business subscription plans
export interface BusinessSubscription {
  id: string
  business_id: string
  plan_type: "basic" | "premium" | "enterprise"
  status: "active" | "canceled" | "past_due"
  billing_cycle: "monthly" | "yearly"
  amount: number
  currency: string
  features: BusinessPlanFeatures
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string

  // Relations
  business: BusinessProfile
}

export interface BusinessPlanFeatures {
  max_services: number | null
  max_events_per_month: number | null
  max_content_items: number | null
  analytics_access: boolean
  priority_support: boolean
  custom_branding: boolean
  api_access: boolean
  advanced_booking: boolean
  marketing_tools: boolean
  multi_location: boolean
}

// Credit System Types
export interface CreditPackage {
  id: string
  name: string
  credits: number
  bonus_credits: number
  price: number
  is_active: boolean
  is_promotional: boolean
  valid_until?: string
  description?: string
  features: string[]
  display_order: number
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  business_id: string
  type: CreditTransactionType
  amount: number // Positive for purchases, negative for spending
  balance_before: number
  balance_after: number
  description: string
  reference_id?: string
  reference_type?: string
  package_id?: string
  payment_method?: string
  payment_amount?: number
  payment_status?: string
  payment_reference?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface CreditCost {
  id: string
  action_type: string
  category: string
  credit_cost: number
  unit: string
  is_active: boolean
  min_purchase?: number
  max_purchase?: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

// Advertising Campaign Types
export interface AdCampaign {
  id: string
  business_id: string
  name: string
  description?: string
  objective: CampaignObjective
  
  // Budget (in credits)
  total_budget: number
  daily_budget?: number
  spent_credits: number
  
  // Schedule
  start_date: string
  end_date: string
  schedule_hours?: number[]
  schedule_days?: number[]
  
  // Targeting
  targeting: {
    demographics: {
      age_min: number
      age_max: number
      genders: string[]
      relationship_status?: string[]
    }
    location: {
      cities?: string[]
      states?: string[]
      radius_km?: number
      exclude_locations?: string[]
    }
    interests?: string[]
    behaviors?: {
      premium_users_only?: boolean
      verified_only?: boolean
      active_last_days?: number
    }
  }
  
  // Performance
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    spent: number
    ctr: number
    cpc: number
    roi: number
  }
  
  // Status
  status: AdStatus
  approval_status?: string
  rejection_reasons?: string[]
  
  // Timestamps
  approved_at?: string
  paused_at?: string
  created_at: string
  updated_at: string
}

export interface BusinessAd {
  id: string
  campaign_id: string
  business_id: string
  format: AdFormat
  placement_priority: number
  
  // Content varies by format
  content: {
    // Timeline format
    title?: string
    description?: string
    media_url?: string
    media_type?: 'image' | 'video'
    cta_text?: string
    cta_url?: string
    
    // Sidebar format
    banner_url?: string
    alt_text?: string
    click_url?: string
    
    // Story format
    duration?: number
    interactive_elements?: any[]
  }
  
  // Variations for A/B testing
  variations?: any[]
  winning_variation?: number
  
  // Performance
  impressions: number
  unique_impressions: number
  clicks: number
  unique_clicks: number
  conversions: number
  credits_spent: number
  
  // Detailed metrics
  metrics_by_day?: Record<string, any>
  metrics_by_hour?: Record<string, any>
  metrics_by_placement?: Record<string, any>
  
  // Status
  status: AdStatus
  quality_score?: number
  
  // Timestamps
  first_served_at?: string
  last_served_at?: string
  created_at: string
  updated_at: string
}

// API Request/Response Types
export interface CreateBusinessRequest {
  business_type: BusinessType
  business_name: string
  legal_name?: string
  cnpj?: string
  description?: string
  category?: string
  subcategories?: string[]
  tags?: string[]
  contact: {
    phone: string
    whatsapp?: string
    email: string
    website?: string
  }
  address?: BusinessAddress
  social_links?: SocialLinks
}

export interface UpdateBusinessRequest extends Partial<CreateBusinessRequest> {
  logo_url?: string
  cover_image_url?: string
  gallery_urls?: string[]
  business_hours?: BusinessHours
  service_area_radius?: number
  settings?: Partial<BusinessProfile['settings']>
}

export interface PurchaseCreditsRequest {
  package_id: string
  payment_method: 'credit_card' | 'pix'
  payment_data?: {
    // For credit card
    card_token?: string
    installments?: number
    
    // For PIX
    payer_cpf?: string
    payer_name?: string
  }
}

export interface CreateCampaignRequest {
  name: string
  description?: string
  objective: CampaignObjective
  total_budget: number
  daily_budget?: number
  start_date: string
  end_date: string
  schedule_hours?: number[]
  schedule_days?: number[]
  targeting: AdCampaign['targeting']
}

export interface CreateAdRequest {
  campaign_id: string
  format: AdFormat
  content: BusinessAd['content']
  placement_priority?: number
  variations?: any[]
}

// Dashboard Types
export interface BusinessDashboard {
  overview: {
    credit_balance: number
    total_spent: number
    active_campaigns: number
    total_impressions: number
    total_clicks: number
    conversion_rate: number
  }
  
  recent_transactions: CreditTransaction[]
  active_campaigns: AdCampaign[]
  top_performing_ads: BusinessAd[]
  
  analytics: {
    impressions_by_day: Array<{ date: string; count: number }>
    clicks_by_day: Array<{ date: string; count: number }>
    spend_by_day: Array<{ date: string; amount: number }>
    demographics: {
      age: Record<string, number>
      gender: Record<string, number>
      location: Record<string, number>
    }
  }
}

// Content Creator Dashboard
export interface ContentCreatorDashboard extends BusinessDashboard {
  content_stats: {
    total_content: number
    total_sales: number
    total_revenue: number
    average_rating: number
  }
  
  top_content: Array<{
    id: string
    title: string
    sales: number
    revenue: number
    rating: number
  }>
  
  subscriber_stats: {
    total_subscribers: number
    active_subscribers: number
    monthly_revenue: number
    churn_rate: number
  }
}

// Venue Dashboard
export interface VenueDashboard extends BusinessDashboard {
  event_stats: {
    upcoming_events: number
    total_attendees: number
    ticket_sales: number
    revenue: number
  }
  
  upcoming_events: Array<{
    id: string
    name: string
    date: string
    attendees: number
    tickets_sold: number
  }>
  
  peak_times: Array<{
    day: string
    hour: number
    visitors: number
  }>
}
