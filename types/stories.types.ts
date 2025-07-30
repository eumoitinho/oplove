export interface Story {
  id: string
  userId: string
  user: {
    id: string
    name: string
    username: string
    avatarUrl: string
    isVerified: boolean
    premiumType: 'free' | 'gold' | 'diamond' | 'couple' | null
  }
  
  // Content
  mediaUrl: string
  mediaType: 'image' | 'video'
  thumbnailUrl?: string
  caption?: string
  
  // Media details
  duration: number // seconds
  width?: number
  height?: number
  fileSize?: number
  
  // Features
  isPublic: boolean
  isHighlighted: boolean
  highlightColor?: string
  
  // Boost
  isBoosted: boolean
  boostExpiresAt?: string
  boostCreditsSpent: number
  boostImpressions: number
  
  // Stats
  viewCount: number
  uniqueViewCount: number
  reactionCount: number
  replyCount: number
  
  // Status
  status: 'active' | 'expired' | 'deleted'
  expiresAt: string
  createdAt: string
  deletedAt?: string
  
  // Current user interaction
  hasViewed?: boolean
  viewedAt?: string
  reaction?: StoryReaction
}

export type StoryReaction = 'like' | 'love' | 'fire' | 'wow' | 'sad' | 'angry'

export interface StoryView {
  id: string
  storyId: string
  viewerId: string
  viewer?: {
    id: string
    name: string
    username: string
    avatarUrl: string
  }
  viewerType: 'regular' | 'anonymous'
  viewedAt: string
  viewDuration?: number
  completionRate?: number
  reaction?: StoryReaction
  reactedAt?: string
}

export interface StoryReply {
  id: string
  storyId: string
  senderId: string
  sender: {
    id: string
    name: string
    username: string
    avatarUrl: string
  }
  message: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'gif'
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface StoryDailyLimit {
  userId: string
  dailyLimit: number
  storiesPostedToday: number
  lastResetDate: string
}

export interface ProfileSeal {
  id: string
  name: string
  iconUrl: string
  description: string
  creditCost: number
  isAvailable: boolean
  availableUntil?: string
  displayOrder: number
  category: 'romantic' | 'fun' | 'premium' | 'special'
  timesGifted: number
}

export interface UserProfileSeal {
  id: string
  recipientId: string
  senderId: string
  sender?: {
    id: string
    name: string
    username: string
    avatarUrl: string
  }
  seal: ProfileSeal
  message?: string
  isDisplayed: boolean
  displayOrder: number
  createdAt: string
  expiresAt?: string
}

export interface UserCredits {
  userId: string
  creditBalance: number
  totalPurchased: number
  totalSpent: number
  totalGifted: number
  totalReceived: number
}

export interface CreditTransaction {
  id: string
  userId: string
  type: 'purchase' | 'spend' | 'gift_sent' | 'gift_received' | 'refund' | 'bonus'
  amount: number // positive for added, negative for spent
  balanceBefore: number
  balanceAfter: number
  referenceType?: string
  referenceId?: string
  otherUserId?: string
  otherUser?: {
    id: string
    name: string
    username: string
    avatarUrl: string
  }
  paymentMethod?: 'credit_card' | 'pix'
  paymentAmount?: number
  paymentReference?: string
  description: string
  createdAt: string
}

export interface StoryBoost {
  id: string
  storyId: string
  userId: string
  creditsSpent: number
  boostDurationHours: number
  impressionsGained: number
  clicksGained: number
  profileVisitsGained: number
  priorityScore: number
  isActive: boolean
  expiresAt: string
  createdAt: string
}

export interface TrendingBoost {
  id: string
  userId: string
  boostType: 'trending_feed' | 'explore_page' | 'open_date'
  creditsSpent: number
  durationHours: number
  impressionsGained: number
  interactionsGained: number
  isActive: boolean
  expiresAt: string
  priorityScore: number
  createdAt: string
}

export interface CreditPackage {
  id: string
  name: string
  credits: number
  bonusCredits: number
  price: number
  isActive: boolean
  isPromotional: boolean
  validUntil?: string
  description: string
  features: string[]
  displayOrder: number
}

export interface CreateStoryInput {
  mediaUrl: string
  mediaType: 'image' | 'video'
  thumbnailUrl?: string
  caption?: string
  duration?: number
  width?: number
  height?: number
  fileSize?: number
  isPublic?: boolean
}

export interface StoryFilters {
  userId?: string
  onlyFollowing?: boolean
  includeBoosted?: boolean
  beforeDate?: string
  afterDate?: string
}