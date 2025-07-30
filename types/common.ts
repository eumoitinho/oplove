export interface User {
  [x: string]: any
  id: string
  email: string
  username: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  is_verified: boolean
  premium_type: "free" | "gold" | "diamond" | "couple"
  daily_message_limit: number
  daily_message_count: number
  monthly_photo_limit: number
  monthly_photo_count: number
  monthly_video_limit: number
  monthly_video_count: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  user?: User
  content: string
  media_urls: string[] | null
  visibility: "public" | "friends" | "private"
  likes_count: number
  comments_count: number
  shares_count: number
  is_liked?: boolean
  is_saved?: boolean
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface NotificationData {
  id: string
  type: "like" | "comment" | "follow" | "message" | "post"
  title: string
  message: string
  read: boolean
  created_at: string
}

export type PremiumPlan = "free" | "gold" | "diamond" | "couple"
export type PostVisibility = "public" | "friends" | "private"
export type MediaType = "image" | "video" | "audio"
export type EventType = "public" | "private"
export type EventCategory = "social" | "sports" | "music" | "business" | "education" | "other"

export interface Event {
  id: string
  user_id: string
  user?: User
  name: string
  description: string
  category: EventCategory
  event_type: EventType
  banner_url?: string | null
  start_date: string
  end_date: string
  location_type: "online" | "in_person"
  location_address?: string | null
  location_url?: string | null
  max_participants?: number | null
  current_participants: number
  is_paid: boolean
  ticket_price?: number | null
  group_chat_id?: string | null
  created_at: string
  updated_at: string
  is_participating?: boolean
  is_owner?: boolean
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  user?: User
  joined_at: string
  status: "confirmed" | "pending" | "cancelled"
}

export interface AuthError {
  message: string
  code?: string
  status?: number
}
