/**
 * Business-related TypeScript types for OpenLove
 */

import type { User } from "./user.types"
import type { Post } from "./post.types"

export interface BusinessProfile {
  id: string
  user_id: string
  business_name: string
  business_type: BusinessType
  category: BusinessCategory
  description: string
  logo_url: string | null
  cover_url: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: BusinessAddress
  business_hours: BusinessHours
  social_links: SocialLinks
  verification_status: "pending" | "verified" | "rejected"
  verification_documents: string[]
  rating: number
  reviews_count: number
  is_featured: boolean
  subscription_type: "basic" | "premium" | "enterprise"
  created_at: string
  updated_at: string

  // Relations
  user: User
  services: BusinessService[]
  reviews: BusinessReview[]
  events: BusinessEvent[]
  content: PaidContent[]
  analytics: BusinessAnalytics | null
}

export type BusinessType =
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
