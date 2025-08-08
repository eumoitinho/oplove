"use client"

import { useMemo, useCallback } from "react"
import { useAuth } from "./useAuth"
import { CONTENT_LIMITS } from "@/utils/constants"
import type { PremiumType } from "@/types/database.types"

// Type alias for backward compatibility
type PremiumPlan = PremiumType

interface PremiumFeatures {
  // Messaging
  canSendMessages: boolean
  canCreateGroups: boolean
  canVideoCall: boolean
  messagesPerDay: number
  maxGroupMembers: number
  
  // Media
  canUploadImages: boolean
  canUploadVideos: boolean
  maxImagesPerPost: number
  maxVideoLength: number // in seconds
  storageLimit: number // in bytes
  
  // Content
  canCreatePolls: boolean
  canAddLocation: boolean
  canSchedulePosts: boolean
  canCreateStories: boolean
  canPostStories: boolean
  dailyStoryLimit: number
  canBoostStories: boolean
  canMonetizeContent: boolean
  maxPostLength: number
  
  // Events & Communities
  canCreateEvents: boolean
  maxEventsPerMonth: number
  canJoinCommunities: boolean
  maxCommunities: number
  
  // Dating
  canUseDating: boolean
  dailyLikesLimit: number
  dailySuperLikesLimit: number
  canUseBoosts: boolean
  canRewind: boolean
  
  // Other
  adsFrequency: number // Show ad every N posts
  hasAnalytics: boolean
  hasPrioritySupport: boolean
}

/**
 * Premium features access control hook
 *
 * Determines what features are available based on user's premium plan
 * and verification status. Provides feature flags and upgrade prompts.
 *
 * @example
 * ```tsx
 * function CreatePost() {
 *   const { canUploadImages, canUploadMorePhotos, getRequiredPlan } = usePremiumFeatures()
 *
 *   const handleImageUpload = () => {
 *     if (!canUploadImages) {
 *       showPaywall('upload_images')
 *       return
 *     }
 *     if (!canUploadMorePhotos) {
 *       showError('Monthly photo limit reached')
 *       return
 *     }
 *     // Upload logic
 *   }
 * }
 * ```
 *
 * @returns Premium features state and controls
 */
const planFeatures: Record<PremiumPlan, PremiumFeatures> = {
  free: {
    // Messaging
    canSendMessages: false, // Cannot send messages without verification
    canCreateGroups: false,
    canVideoCall: false,
    messagesPerDay: CONTENT_LIMITS.free.dailyMessageLimit,
    maxGroupMembers: CONTENT_LIMITS.free.maxGroupMembers,
    
    // Media
    canUploadImages: false, // Only verified free users can upload 1 image
    canUploadVideos: false,
    maxImagesPerPost: CONTENT_LIMITS.free.maxPhotosPerPost,
    maxVideoLength: CONTENT_LIMITS.free.maxVideoLength,
    storageLimit: CONTENT_LIMITS.free.storageLimit,
    
    // Content
    canCreatePolls: false,
    canAddLocation: false,
    canSchedulePosts: false,
    canCreateStories: false,
    canPostStories: false,
    dailyStoryLimit: 3, // Only for verified free users
    canBoostStories: false,
    canMonetizeContent: false,
    maxPostLength: 280,
    
    // Events & Communities
    canCreateEvents: false,
    maxEventsPerMonth: 0,
    canJoinCommunities: false,
    maxCommunities: 0,
    
    // Dating
    canUseDating: true,
    dailyLikesLimit: 10,
    dailySuperLikesLimit: 0,
    canUseBoosts: false,
    canRewind: false,
    
    // Other
    adsFrequency: 5, // Ad every 5 posts
    hasAnalytics: false,
    hasPrioritySupport: false,
  },
  
  gold: {
    // Messaging
    canSendMessages: true,
    canCreateGroups: false,
    canVideoCall: false,
    messagesPerDay: CONTENT_LIMITS.gold.dailyMessageLimit, // 200/day, unlimited if verified
    maxGroupMembers: CONTENT_LIMITS.gold.maxGroupMembers,
    
    // Media
    canUploadImages: true,
    canUploadVideos: true,
    maxImagesPerPost: CONTENT_LIMITS.gold.maxPhotosPerPost, // 10 photos per post
    maxVideoLength: CONTENT_LIMITS.gold.maxVideoLength, // 5 minutes
    storageLimit: CONTENT_LIMITS.gold.storageLimit, // 1GB
    
    // Content
    canCreatePolls: true,
    canAddLocation: true,
    canSchedulePosts: false,
    canCreateStories: false,
    canPostStories: true,
    dailyStoryLimit: 5, // 10 if verified
    canBoostStories: false,
    canMonetizeContent: false,
    maxPostLength: 500,
    
    // Events & Communities
    canCreateEvents: true,
    maxEventsPerMonth: 3, // Unlimited if verified
    canJoinCommunities: true,
    maxCommunities: 5,
    
    // Dating
    canUseDating: true,
    dailyLikesLimit: 50,
    dailySuperLikesLimit: 5,
    canUseBoosts: false,
    canRewind: false,
    
    // Other
    adsFrequency: 10, // Less ads
    hasAnalytics: false,
    hasPrioritySupport: false,
  },
  
  diamond: {
    // Messaging
    canSendMessages: true,
    canCreateGroups: true,
    canVideoCall: true,
    messagesPerDay: CONTENT_LIMITS.diamond.dailyMessageLimit, // Unlimited
    maxGroupMembers: CONTENT_LIMITS.diamond.maxGroupMembers, // 50 members
    
    // Media
    canUploadImages: true,
    canUploadVideos: true,
    maxImagesPerPost: CONTENT_LIMITS.diamond.maxPhotosPerPost, // 20 photos per post
    maxVideoLength: CONTENT_LIMITS.diamond.maxVideoLength, // 30 minutes
    storageLimit: CONTENT_LIMITS.diamond.storageLimit, // 10GB
    
    // Content
    canCreatePolls: true,
    canAddLocation: true,
    canSchedulePosts: true,
    canCreateStories: true,
    canPostStories: true,
    dailyStoryLimit: 10, // Unlimited if verified
    canBoostStories: true,
    canMonetizeContent: true,
    maxPostLength: 1000,
    
    // Events & Communities
    canCreateEvents: true,
    maxEventsPerMonth: -1, // Unlimited
    canJoinCommunities: true,
    maxCommunities: -1, // Unlimited
    
    // Dating
    canUseDating: true,
    dailyLikesLimit: -1, // Unlimited
    dailySuperLikesLimit: 20,
    canUseBoosts: true,
    canRewind: true,
    
    // Other
    adsFrequency: 0, // No ads
    hasAnalytics: true,
    hasPrioritySupport: true,
  },
  
  couple: {
    // Same as Diamond but for 2 accounts
    // Messaging
    canSendMessages: true,
    canCreateGroups: true,
    canVideoCall: true,
    messagesPerDay: CONTENT_LIMITS.couple.dailyMessageLimit, // Unlimited
    maxGroupMembers: CONTENT_LIMITS.couple.maxGroupMembers, // 100 members
    
    // Media
    canUploadImages: true,
    canUploadVideos: true,
    maxImagesPerPost: CONTENT_LIMITS.couple.maxPhotosPerPost, // 30 photos per post
    maxVideoLength: CONTENT_LIMITS.couple.maxVideoLength, // 1 hour
    storageLimit: CONTENT_LIMITS.couple.storageLimit, // 20GB
    
    // Content
    canCreatePolls: true,
    canAddLocation: true,
    canSchedulePosts: true,
    canCreateStories: true,
    canPostStories: true,
    dailyStoryLimit: 10, // Unlimited if verified
    canBoostStories: true,
    canMonetizeContent: true,
    maxPostLength: 1000,
    
    // Events & Communities
    canCreateEvents: true,
    maxEventsPerMonth: -1, // Unlimited
    canJoinCommunities: true,
    maxCommunities: -1, // Unlimited
    
    // Dating
    canUseDating: false, // Not available for couples
    dailyLikesLimit: 0,
    dailySuperLikesLimit: 0,
    canUseBoosts: false,
    canRewind: false,
    
    // Other
    adsFrequency: 0, // No ads
    hasAnalytics: true,
    hasPrioritySupport: true,
  },
}

export function usePremiumFeatures() {
  const { user } = useAuth()
  
  // Extract only the values we need to prevent unnecessary re-renders
  const userPlan = user?.premium_type || "free"
  const isVerified = user?.is_verified || false
  const storageUsed = user?.storage_used || 0
  const dailyMessageCount = user?.daily_message_count || 0
  
  const features = useMemo(() => {
    const baseFeatures = planFeatures[userPlan]
    
    // Apply verification bonuses
    if (isVerified) {
      const verifiedFeatures = { ...baseFeatures }
      
      if (userPlan === "free") {
        verifiedFeatures.canPostStories = true // Free verified can post stories
        verifiedFeatures.canUploadImages = true // Free verified can upload 1 image
      } else if (userPlan === "gold") {
        verifiedFeatures.messagesPerDay = -1 // Unlimited messages
        verifiedFeatures.maxEventsPerMonth = -1 // Unlimited events
        verifiedFeatures.dailyStoryLimit = 10 // Increased limit
      } else if (userPlan === "diamond" || userPlan === "couple") {
        verifiedFeatures.dailyStoryLimit = -1 // Unlimited stories
      }
      
      return verifiedFeatures
    }
    
    return baseFeatures
  }, [userPlan, isVerified])
  
  // Check if user has reached storage limit
  const canUploadMoreMedia = useMemo(() => {
    if (features.storageLimit === -1) return true // Unlimited
    return storageUsed < features.storageLimit
  }, [storageUsed, features.storageLimit])
  
  const canSendMoreMessages = useMemo(() => {
    if (features.messagesPerDay === -1) return true // Unlimited
    if (features.messagesPerDay === 0) return false // Free users can't initiate
    return dailyMessageCount < features.messagesPerDay
  }, [dailyMessageCount, features.messagesPerDay])
  
  // Memoize helper functions to prevent recreation
  const requiresUpgrade = useCallback((feature: keyof PremiumFeatures) => {
    return !features[feature] || 
           (typeof features[feature] === "number" && features[feature] === 0)
  }, [features])
  
  // Get minimum plan required for a feature
  const getRequiredPlan = useCallback((feature: keyof PremiumFeatures): PremiumPlan | null => {
    const plans: PremiumPlan[] = ["free", "gold", "diamond", "couple"]
    
    for (const plan of plans) {
      const planFeature = planFeatures[plan][feature]
      if (planFeature === true || 
          (typeof planFeature === "number" && planFeature > 0)) {
        return plan
      }
    }
    
    return null
  }, [])
  
  // Get story limit based on plan and verification
  const getStoryLimit = useCallback(() => {
    if (userPlan === "free") {
      return isVerified ? 3 : 0
    } else if (userPlan === "gold") {
      return isVerified ? 10 : 5
    } else if (userPlan === "diamond" || userPlan === "couple") {
      return isVerified ? -1 : 10 // -1 means unlimited
    }
    
    return 0
  }, [userPlan, isVerified])
  
  return {
    ...features,
    
    // Computed limits
    canUploadMoreMedia,
    canSendMoreMessages,
    
    // Helper methods
    requiresUpgrade,
    getRequiredPlan,
    getStoryLimit,
    
    // User info
    userPlan,
    isVerified,
    
    // Usage stats
    storageUsed,
    messagesUsedToday: dailyMessageCount,
    
    // Helpers for UI
    formatStorageLimit: (limit: number) => {
      if (limit === -1) return "Ilimitado"
      const gb = limit / (1024 * 1024 * 1024)
      const mb = limit / (1024 * 1024)
      return gb >= 1 ? `${gb}GB` : `${mb}MB`
    },
    formatVideoLength: (seconds: number) => {
      if (seconds === 0) return "Não permitido"
      if (seconds === -1) return "Ilimitado"
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      return hours > 0 ? `${hours} hora${hours > 1 ? 's' : ''}` : `${minutes} minutos`
    }
  }
}
