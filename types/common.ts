export interface User {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  is_verified: boolean
  premium_type: "free" | "gold" | "diamond" | "couple"
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
