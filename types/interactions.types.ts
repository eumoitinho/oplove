// Post Interaction Types

export interface PostInteraction {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface PostLike extends PostInteraction {}

export interface PostComment extends PostInteraction {
  content: string
  parent_id?: string | null
  likes_count?: number
  updated_at?: string
}

export interface PostShare extends PostInteraction {
  share_type?: string
  message?: string | null
}

export interface PostSave extends PostInteraction {
  collection_id?: string | null
}

// Interaction Counters
export interface PostInteractionCounters {
  likes_count: number
  comments_count: number
  shares_count: number
  saves_count: number
}

// User Interaction State
export interface UserPostInteractions {
  user_liked: boolean
  user_saved: boolean
  user_shared: boolean
  user_commented?: boolean
}

// Combined Post with Interactions
export interface PostWithInteractions {
  id: string
  content?: string
  media_urls?: string[]
  user_id: string
  created_at: string
  updated_at?: string
  
  // Counters
  likes_count: number
  comments_count: number
  shares_count: number
  saves_count: number
  
  // User interaction state
  user_liked?: boolean
  user_saved?: boolean
  user_shared?: boolean
  
  // Relations
  likes?: PostLike[]
  comments?: PostComment[]
  shares?: PostShare[]
  saves?: PostSave[]
}

// API Response Types
export interface InteractionResponse {
  success: boolean
  data?: {
    likes_count?: number
    comments_count?: number
    shares_count?: number
    saves_count?: number
    is_liked?: boolean
    is_saved?: boolean
    is_shared?: boolean
  }
  error?: string
}

// Notification Types for Interactions
export interface InteractionNotification {
  id: string
  user_id: string // recipient
  from_user_id: string // sender
  type: 'like' | 'comment' | 'share' | 'save' | 'follow' | 'mention'
  title: string
  message: string
  entity_id?: string
  entity_type?: 'post' | 'comment' | 'user'
  is_read: boolean
  created_at: string
}

// Realtime Event Types
export interface InteractionRealtimeEvent {
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  table: 'post_likes' | 'post_comments' | 'post_shares' | 'post_saves' | 'posts'
  new?: Partial<PostInteraction | PostWithInteractions>
  old?: Partial<PostInteraction | PostWithInteractions>
}

// Hook Return Types
export interface UsePostInteractionsReturn {
  interactions: PostWithInteractions | null
  loading: boolean
  likeLoading: boolean
  saveLoading: boolean
  shareLoading: boolean
  commentLoading?: boolean
  toggleLike: (postId?: string) => Promise<void>
  toggleSave: (postId?: string) => Promise<void>
  sharePost: (postId?: string, message?: string) => Promise<void>
  addComment?: (postId?: string, content?: string) => Promise<void>
  refetch: () => void
}