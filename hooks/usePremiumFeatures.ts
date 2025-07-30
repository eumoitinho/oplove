"use client"

import { useMemo } from "react"
import { useAuth } from "./useAuth"
import type { PremiumPlan } from "@/types/common"

interface PremiumFeatures {
  // Messaging
  canSendMessages: boolean
  canCreateGroups: boolean
  canVideoCall: boolean
  messagesPerDay: number
  
  // Media
  canUploadImages: boolean
  canUploadVideos: boolean
  maxImagesPerPost: number
  monthlyPhotoLimit: number
  monthlyVideoLimit: number
  
  // Content
  canCreatePolls: boolean
  canAddLocation: boolean
  canSchedulePosts: boolean
  canCreateStories: boolean
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
    canSendMessages: false, // Can only reply if premium user messages first
    canCreateGroups: false,
    canVideoCall: false,
    messagesPerDay: 0,
    
    // Media
    canUploadImages: false,
    canUploadVideos: false,
    maxImagesPerPost: 0,
    monthlyPhotoLimit: 3,
    monthlyVideoLimit: 0,
    
    // Content
    canCreatePolls: false,
    canAddLocation: false,
    canSchedulePosts: false,
    canCreateStories: false,
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
    messagesPerDay: 10, // Unlimited if verified
    
    // Media
    canUploadImages: true,
    canUploadVideos: false,
    maxImagesPerPost: 5,
    monthlyPhotoLimit: 50,
    monthlyVideoLimit: 0,
    
    // Content
    canCreatePolls: true,
    canAddLocation: true,
    canSchedulePosts: false,
    canCreateStories: false,
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
    adsFrequency: 10, // Ad every 10 posts
    hasAnalytics: false,
    hasPrioritySupport: false,
  },
  
  diamond: {
    // Messaging
    canSendMessages: true,
    canCreateGroups: true,
    canVideoCall: true,
    messagesPerDay: -1, // Unlimited
    
    // Media
    canUploadImages: true,
    canUploadVideos: true,
    maxImagesPerPost: -1, // Unlimited
    monthlyPhotoLimit: -1, // Unlimited
    monthlyVideoLimit: -1, // Unlimited
    
    // Content
    canCreatePolls: true,
    canAddLocation: true,
    canSchedulePosts: true,
    canCreateStories: true,
    canMonetizeContent: true,
    maxPostLength: 1000,
    
    // Events & Communities
    canCreateEvents: true,
    maxEventsPerMonth: -1, // Unlimited
    canJoinCommunities: true,
    maxCommunities: -1, // Unlimited
    
    // Dating
    canUseDating: true,
    dailyLikesLimit: 200,
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
    messagesPerDay: -1, // Unlimited
    
    // Media
    canUploadImages: true,
    canUploadVideos: true,
    maxImagesPerPost: -1, // Unlimited
    monthlyPhotoLimit: -1, // Unlimited
    monthlyVideoLimit: -1, // Unlimited
    
    // Content
    canCreatePolls: true,
    canAddLocation: true,
    canSchedulePosts: true,
    canCreateStories: true,
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
  
  const features = useMemo(() => {
    const plan = user?.premium_type || "free"
    const baseFeatures = planFeatures[plan]
    
    // Apply verification bonuses
    if (user?.is_verified) {
      const verifiedFeatures = { ...baseFeatures }
      
      if (plan === "gold") {
        verifiedFeatures.messagesPerDay = -1 // Unlimited messages
        verifiedFeatures.maxEventsPerMonth = -1 // Unlimited events
      }
      
      return verifiedFeatures
    }
    
    return baseFeatures
  }, [user?.premium_type, user?.is_verified])
  
  // Check if user has reached monthly limits
  const canUploadMorePhotos = useMemo(() => {
    if (!user) return false
    if (features.monthlyPhotoLimit === -1) return true // Unlimited
    return user.monthly_photo_count < features.monthlyPhotoLimit
  }, [user, features.monthlyPhotoLimit])
  
  const canUploadMoreVideos = useMemo(() => {
    if (!user) return false
    if (features.monthlyVideoLimit === -1) return true // Unlimited
    return user.monthly_video_count < features.monthlyVideoLimit
  }, [user, features.monthlyVideoLimit])
  
  const canSendMoreMessages = useMemo(() => {
    if (!user) return false
    if (features.messagesPerDay === -1) return true // Unlimited
    if (features.messagesPerDay === 0) return false // Free users can't initiate
    return user.daily_message_count < features.messagesPerDay
  }, [user, features.messagesPerDay])
  
  // Helper function to check if a feature requires upgrade
  const requiresUpgrade = (feature: keyof PremiumFeatures) => {
    return !features[feature] || 
           (typeof features[feature] === "number" && features[feature] === 0)
  }
  
  // Get minimum plan required for a feature
  const getRequiredPlan = (feature: keyof PremiumFeatures): PremiumPlan | null => {
    const plans: PremiumPlan[] = ["free", "gold", "diamond", "couple"]
    
    for (const plan of plans) {
      const planFeature = planFeatures[plan][feature]
      if (planFeature === true || 
          (typeof planFeature === "number" && planFeature > 0)) {
        return plan
      }
    }
    
    return null
  }
  
  return {
    ...features,
    
    // Computed limits
    canUploadMorePhotos,
    canUploadMoreVideos,
    canSendMoreMessages,
    
    // Helper methods
    requiresUpgrade,
    getRequiredPlan,
    
    // User info
    userPlan: user?.premium_type || "free",
    isVerified: user?.is_verified || false,
    
    // Usage stats
    photosUsed: user?.monthly_photo_count || 0,
    videosUsed: user?.monthly_video_count || 0,
    messagesUsedToday: user?.daily_message_count || 0,
  }
}
