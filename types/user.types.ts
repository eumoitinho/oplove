/**
 * User-related TypeScript types for OpenLove
 */

export type PremiumType = "free" | "gold" | "diamond" | "couple"

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string | null
  cover_url: string | null
  bio: string
  location: string
  website: string
  birth_date: string | null
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null
  looking_for: "friendship" | "dating" | "relationship" | "networking" | null
  premium_type: PremiumType
  is_verified: boolean
  is_online: boolean
  last_seen: string | null
  phone: string | null
  cpf: string | null
  address: UserAddress | null
  preferences: UserPreferences
  stats: UserStats
  created_at: string
  updated_at: string
}

export interface UserAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  country: string
}

export interface UserPreferences {
  language: "pt-BR" | "en-US"
  theme: "light" | "dark" | "auto"
  notifications: NotificationPreferences
  privacy: PrivacyPreferences
  content: ContentPreferences
}

export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  marketing_emails: boolean
  quiet_hours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
  }
  types: {
    likes: boolean
    comments: boolean
    follows: boolean
    messages: boolean
    mentions: boolean
    posts_from_friends: boolean
  }
}

export interface PrivacyPreferences {
  profile_visibility: "public" | "friends" | "private"
  show_online_status: boolean
  show_last_seen: boolean
  allow_messages_from: "everyone" | "friends" | "verified_only"
  show_in_search: boolean
  show_location: boolean
  show_age: boolean
}

export interface ContentPreferences {
  show_ads: boolean
  content_language: string[]
  mature_content: boolean
  auto_play_videos: boolean
  data_saver: boolean
}

export interface UserStats {
  posts_count: number
  followers_count: number
  following_count: number
  likes_received: number
  comments_received: number
  profile_views: number
  verification_score: number
}

export interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}

export interface RegisterCredentials {
  email: string
  password: string
  fullName: string
  username: string
  birthDate: string
  gender: User["gender"]
  terms_accepted: boolean
  privacy_accepted: boolean
}

export interface UpdateProfileData {
  full_name?: string
  username?: string
  bio?: string
  location?: string
  website?: string
  birth_date?: string
  gender?: User["gender"]
  looking_for?: User["looking_for"]
  phone?: string
  address?: UserAddress
  preferences?: Partial<UserPreferences>
}

export interface PasswordResetData {
  email: string
}

export interface PasswordUpdateData {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface VerificationData {
  type: "email" | "phone" | "identity"
  token: string
  code?: string
}

export interface IdentityVerificationData {
  document_type: "cpf" | "rg" | "cnh" | "passport"
  document_number: string
  document_front: File
  document_back?: File
  selfie: File
}

export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  follower: User
  following: User
}

export interface UserBlock {
  id: string
  blocker_id: string
  blocked_id: string
  reason: string
  created_at: string
  blocker: User
  blocked: User
}

export interface UserReport {
  id: string
  reporter_id: string
  reported_id: string
  reason: "spam" | "harassment" | "inappropriate_content" | "fake_profile" | "other"
  description: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  created_at: string
  updated_at: string
  reporter: User
  reported: User
}

export interface UserSession {
  id: string
  user_id: string
  device_info: string
  ip_address: string
  user_agent: string
  location: string
  is_current: boolean
  created_at: string
  last_activity: string
}

export interface UserActivity {
  id: string
  user_id: string
  type: "login" | "logout" | "post_created" | "profile_updated" | "password_changed"
  description: string
  metadata: Record<string, any>
  ip_address: string
  user_agent: string
  created_at: string
}

export interface UserSearchResult {
  users: User[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface UserSearchFilters {
  query?: string
  location?: string
  age_min?: number
  age_max?: number
  gender?: User["gender"]
  looking_for?: User["looking_for"]
  verified_only?: boolean
  online_only?: boolean
  has_photo?: boolean
  premium_only?: boolean
  page?: number
  limit?: number
}

// Premium feature flags based on user plan
export interface PremiumFeatures {
  // Messaging
  canSendMessages: boolean
  canCreateGroups: boolean
  canMakeVoiceCalls: boolean
  canMakeVideoCalls: boolean
  dailyMessageLimit: number | null

  // Content
  canUploadVideos: boolean
  canRecordAudio: boolean
  canCreatePolls: boolean
  canCreateStories: boolean
  maxImagesPerPost: number
  maxVideoLength: number // in seconds
  maxFileSize: number // in MB

  // Social
  canComment: boolean // Free users need verification
  canCreateEvents: boolean
  canJoinPremiumEvents: boolean
  canSeeWhoViewedProfile: boolean

  // Ads and UI
  showAds: boolean
  adFrequency: number // posts between ads
  canHideAds: boolean

  // Verification
  requiresVerification: boolean
  canVerifyOthers: boolean

  // Business features
  canCreateBusinessProfile: boolean
  canPromotePosts: boolean
  canSellContent: boolean
  canCreateCourses: boolean
}

export type UserRole = "user" | "moderator" | "admin" | "super_admin"

export interface UserPermissions {
  can_moderate_posts: boolean
  can_moderate_users: boolean
  can_access_admin_panel: boolean
  can_manage_payments: boolean
  can_manage_ads: boolean
  can_view_analytics: boolean
  can_manage_events: boolean
  can_manage_business: boolean
}
