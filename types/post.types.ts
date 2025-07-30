/**
 * Post-related TypeScript types for OpenLove
 */

import type { User } from "./user.types"

export interface Post {
  id: string
  user_id: string
  content: string
  media: PostMedia[]
  poll: PostPoll | null
  location: PostLocation | null
  visibility?: PostVisibility
  is_pinned: boolean
  is_edited: boolean
  edit_history: PostEdit[]
  hashtags: string[]
  mentions: string[]
  stats: PostStats
  user_interaction: PostUserInteraction | null
  created_at: string
  updated_at: string

  // Relations
  user: User
  comments: Comment[]
  interactions: PostInteraction[]
}

export type PostVisibility = "public" | "friends" | "private" | "premium"

export interface PostMedia {
  id: string
  post_id: string
  url: string
  thumbnail_url?: string
  type: "image" | "video" | "audio" | "document"
  size: number
  duration?: number // for video/audio in seconds
  dimensions?: {
    width: number
    height: number
  }
  alt_text?: string
  order: number
  created_at: string
}

export interface PostPoll {
  id: string
  post_id: string
  question: string
  options: PostPollOption[]
  multiple_choice: boolean
  expires_at: string | null
  total_votes: number
  user_vote: string[] | null
  created_at: string
}

export interface PostPollOption {
  id: string
  poll_id: string
  text: string
  votes_count: number
  percentage: number
  order: number
}

export interface PostLocation {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  place_id?: string // Google Places ID
  category?: string
}

export interface PostStats {
  likes: number
  comments: number
  shares: number
  views: number
  saves: number
}

export interface PostUserInteraction {
  liked: boolean
  saved: boolean
  shared: boolean
  reported: boolean
}

export interface PostInteraction {
  id: string
  post_id: string
  user_id: string
  type: "like" | "love" | "laugh" | "angry" | "sad" | "share" | "save" | "report"
  created_at: string

  // Relations
  user: User
}

export interface PostShare {
  id: string
  post_id: string
  user_id: string
  share_type: "public" | "private" | "story"
  message: string | null
  shared_at: string
  created_at: string
  updated_at: string

  // Relations
  post: Post
  user: User
}

export interface PostSave {
  id: string
  post_id: string
  user_id: string
  collection_id: string | null
  saved_at: string
  created_at: string

  // Relations
  post: Post
  user: User
  collection: SavedCollection | null
}

export interface SavedCollection {
  id: string
  user_id: string
  name: string
  description: string | null
  is_private: boolean
  posts_count: number
  created_at: string
  updated_at: string

  // Relations
  user: User
  saved_posts: PostSave[]
}

export interface PostEdit {
  id: string
  post_id: string
  previous_content: string
  edited_at: string
  reason?: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  media_url: string | null
  media_type: "image" | "video" | "audio" | null
  is_edited: boolean
  edit_history: CommentEdit[]
  likes_count: number
  replies_count: number
  user_liked: boolean
  created_at: string
  updated_at: string

  // Relations
  user: User
  replies: Comment[]
  likes: CommentLike[]
}

export interface CommentEdit {
  id: string
  comment_id: string
  previous_content: string
  edited_at: string
}

export interface CommentLike {
  id: string
  comment_id: string
  user_id: string
  created_at: string

  // Relations
  user: User
}

export interface CreatePostData {
  content: string
  media?: File[]
  poll?: CreatePollData
  location?: PostLocation
  visibility?: PostVisibility
  hashtags?: string[]
  mentions?: string[]
}

export interface CreatePollData {
  question: string
  options: string[]
  multiple_choice: boolean
  expires_in_hours?: number
}

export interface UpdatePostData {
  content?: string
  visibility?: PostVisibility
  location?: PostLocation | null
  is_pinned?: boolean
}

export interface CreateCommentData {
  content: string
  parentId?: string
  media?: File
}

export interface UpdateCommentData {
  content: string
}

export interface PostsFilter {
  userId?: string
  currentUserId?: string
  following?: boolean
  hashtag?: string
  location?: string
  visibility?: PostVisibility[]
  hasMedia?: boolean
  hasPoll?: boolean
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
  sortBy?: "created_at" | "likes" | "comments" | "trending"
  sortOrder?: "asc" | "desc"
}

export interface PostSearchResult {
  posts: Post[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface PostAnalytics {
  post_id: string
  views: number
  unique_views: number
  likes: number
  comments: number
  shares: number
  saves: number
  click_through_rate: number
  engagement_rate: number
  reach: number
  impressions: number
  demographics: {
    age_groups: Record<string, number>
    genders: Record<string, number>
    locations: Record<string, number>
  }
  time_series: {
    date: string
    views: number
    likes: number
    comments: number
    shares: number
  }[]
}

export interface TrendingTopic {
  id: string
  hashtag: string
  posts_count: number
  growth_rate: number
  category: string
  region?: string
  created_at: string
}

export interface PostReport {
  id: string
  post_id: string
  reporter_id: string
  reason: "spam" | "harassment" | "inappropriate_content" | "copyright" | "misinformation" | "other"
  description: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  created_at: string
  updated_at: string

  // Relations
  post: Post
  reporter: User
}

export interface PostDraft {
  id: string
  user_id: string
  content: string
  media_urls: string[]
  poll_data: CreatePollData | null
  location: PostLocation | null
  visibility: PostVisibility
  scheduled_for: string | null
  created_at: string
  updated_at: string
}

export interface ScheduledPost {
  id: string
  user_id: string
  post_data: CreatePostData
  scheduled_for: string
  status: "pending" | "published" | "failed" | "canceled"
  attempts: number
  last_attempt: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

// Story types (Diamond+ feature)
export interface Story {
  id: string
  user_id: string
  media_url: string
  media_type: "image" | "video"
  duration: number // in seconds
  text_overlay?: string
  background_color?: string
  music_url?: string
  views_count: number
  expires_at: string
  created_at: string

  // Relations
  user: User
  views: StoryView[]
}

export interface StoryView {
  id: string
  story_id: string
  viewer_id: string
  viewed_at: string

  // Relations
  story: Story
  viewer: User
}

export interface CreateStoryData {
  media: File
  duration?: number
  text_overlay?: string
  background_color?: string
  music_url?: string
}

// Advertisement types
export interface Advertisement {
  id: string
  advertiser_id: string
  title: string
  description: string
  media_url: string
  media_type: "image" | "video"
  target_url: string
  call_to_action: string
  targeting: AdTargeting
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  status: "draft" | "pending" | "active" | "paused" | "completed" | "rejected"
  starts_at: string
  ends_at: string
  created_at: string
  updated_at: string

  // Relations
  advertiser: User
}

export interface AdTargeting {
  age_min?: number
  age_max?: number
  genders?: string[]
  locations?: string[]
  interests?: string[]
  behaviors?: string[]
  languages?: string[]
  device_types?: string[]
  premium_types?: string[]
}

export interface AdImpression {
  id: string
  ad_id: string
  user_id: string
  post_position: number
  viewed_at: string
  clicked: boolean
  clicked_at: string | null

  // Relations
  ad: Advertisement
  user: User
}
