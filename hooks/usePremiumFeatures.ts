"use client"

import { useMemo } from "react"
import { useAuth } from "./useAuth"
import type { PremiumPlan, PremiumFeatures } from "@/types/common"

/**
 * Premium features access control hook
 *
 * Determines what features are available based on user's premium plan
 * and verification status. Provides feature flags and upgrade prompts.
 *
 * @example
 * ```tsx
 * function ChatInput() {
 *   const { features, showPaywall, planType } = usePremiumFeatures()
 *
 *   const handleSendMessage = () => {
 *     if (!features.canSendMessages) {
 *       showPaywall('messaging')
 *       return
 *     }
 *     // Send message logic
 *   }
 *
 *   return (
 *     <div>
 *       <input disabled={!features.canSendMessages} />
 *       {planType === 'free' && (
 *         <p>Upgrade to Gold to send messages</p>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 *
 * @returns Premium features state and controls
 */
export function usePremiumFeatures() {
  const { user } = useAuth()

  /**
   * Calculate available features based on plan and verification
   */
  const features = useMemo((): PremiumFeatures => {
    if (!user) {
      return {
        // Unauthenticated users
        canSendMessages: false,
        canUploadMedia: false,
        canCreateStories: false,
        canMakeVoiceCalls: false,
        canMakeVideoCalls: false,
        canCreatePolls: false,
        canAccessAnalytics: false,
        canCreateEvents: false,
        canJoinGroups: false,
        canCreateGroups: false,
        showAds: true,
        maxPhotosPerPost: 0,
        maxVideoLength: 0,
        maxGroupMembers: 0,
        dailyMessageLimit: 0,
        storageLimit: 0,
      }
    }

    const planType = user.premium_type as PremiumPlan
    const isVerified = user.is_verified || false

    switch (planType) {
      case "free":
        return {
          canSendMessages: isVerified, // Free users need verification
          canUploadMedia: isVerified,
          canCreateStories: false,
          canMakeVoiceCalls: false,
          canMakeVideoCalls: false,
          canCreatePolls: false,
          canAccessAnalytics: false,
          canCreateEvents: false,
          canJoinGroups: true,
          canCreateGroups: false,
          showAds: true,
          maxPhotosPerPost: isVerified ? 3 : 1,
          maxVideoLength: isVerified ? 30 : 0, // 30 seconds
          maxGroupMembers: 0,
          dailyMessageLimit: isVerified ? 50 : 0,
          storageLimit: 100, // 100MB
        }

      case "gold":
        return {
          canSendMessages: true,
          canUploadMedia: true,
          canCreateStories: false,
          canMakeVoiceCalls: false,
          canMakeVideoCalls: false,
          canCreatePolls: true,
          canAccessAnalytics: false,
          canCreateEvents: true,
          canJoinGroups: true,
          canCreateGroups: false,
          showAds: true, // Reduced frequency
          maxPhotosPerPost: 10,
          maxVideoLength: 300, // 5 minutes
          maxGroupMembers: 0,
          dailyMessageLimit: isVerified ? -1 : 200, // Unlimited if verified
          storageLimit: 1000, // 1GB
        }

      case "diamond":
        return {
          canSendMessages: true,
          canUploadMedia: true,
          canCreateStories: true,
          canMakeVoiceCalls: true,
          canMakeVideoCalls: true,
          canCreatePolls: true,
          canAccessAnalytics: true,
          canCreateEvents: true,
          canJoinGroups: true,
          canCreateGroups: true,
          showAds: false,
          maxPhotosPerPost: 20,
          maxVideoLength: 1800, // 30 minutes
          maxGroupMembers: 50,
          dailyMessageLimit: -1, // Unlimited
          storageLimit: 10000, // 10GB
        }

      case "couple":
        return {
          canSendMessages: true,
          canUploadMedia: true,
          canCreateStories: true,
          canMakeVoiceCalls: true,
          canMakeVideoCalls: true,
          canCreatePolls: true,
          canAccessAnalytics: true,
          canCreateEvents: true,
          canJoinGroups: true,
          canCreateGroups: true,
          showAds: false,
          maxPhotosPerPost: 30,
          maxVideoLength: 3600, // 1 hour
          maxGroupMembers: 100,
          dailyMessageLimit: -1, // Unlimited
          storageLimit: 20000, // 20GB
        }

      default:
        return {
          canSendMessages: false,
          canUploadMedia: false,
          canCreateStories: false,
          canMakeVoiceCalls: false,
          canMakeVideoCalls: false,
          canCreatePolls: false,
          canAccessAnalytics: false,
          canCreateEvents: false,
          canJoinGroups: false,
          canCreateGroups: false,
          showAds: true,
          maxPhotosPerPost: 0,
          maxVideoLength: 0,
          maxGroupMembers: 0,
          dailyMessageLimit: 0,
          storageLimit: 0,
        }
    }
  }, [user])

  /**
   * Get upgrade suggestions based on attempted action
   */
  const getUpgradeSuggestion = (feature: keyof PremiumFeatures) => {
    if (!user) return null

    const planType = user.premium_type as PremiumPlan
    const isVerified = user.is_verified

    // Verification suggestions for free users
    if (planType === "free" && !isVerified) {
      const verificationFeatures = ["canSendMessages", "canUploadMedia"]

      if (verificationFeatures.includes(feature)) {
        return {
          type: "verification" as const,
          title: "Verificação Necessária",
          description: "Verifique sua identidade para acessar este recurso",
          action: "Verificar Agora",
          route: "/verification",
        }
      }
    }

    // Plan upgrade suggestions
    const upgradePaths = {
      free: {
        target: "gold" as const,
        title: "Upgrade para Gold",
        description: "Desbloqueie mensagens ilimitadas e mais recursos",
        price: "R$ 19,90/mês",
      },
      gold: {
        target: "diamond" as const,
        title: "Upgrade para Diamond",
        description: "Stories, chamadas de vídeo e sem anúncios",
        price: "R$ 39,90/mês",
      },
    }

    const currentUpgrade = upgradePaths[planType as keyof typeof upgradePaths]

    if (currentUpgrade) {
      return {
        type: "upgrade" as const,
        ...currentUpgrade,
        action: "Fazer Upgrade",
        route: "/premium",
      }
    }

    return null
  }

  /**
   * Check if user can perform specific action
   */
  const canPerform = (action: string): boolean => {
    const actionMap: Record<string, keyof PremiumFeatures> = {
      send_message: "canSendMessages",
      upload_photo: "canUploadMedia",
      upload_video: "canUploadMedia",
      create_story: "canCreateStories",
      voice_call: "canMakeVoiceCalls",
      video_call: "canMakeVideoCalls",
      create_poll: "canCreatePolls",
      view_analytics: "canAccessAnalytics",
      create_event: "canCreateEvents",
      create_group: "canCreateGroups",
    }

    const featureKey = actionMap[action]
    return featureKey ? (features[featureKey] as boolean) : false
  }

  /**
   * Get plan display information
   */
  const planInfo = useMemo(() => {
    if (!user) return null

    const planType = user.premium_type as PremiumPlan
    const planConfig = {
      free: {
        name: "Gratuito",
        color: "gray",
        gradient: "from-gray-500 to-gray-600",
        icon: "🆓",
      },
      gold: {
        name: "Gold",
        color: "yellow",
        gradient: "from-yellow-400 to-yellow-600",
        icon: "⭐",
      },
      diamond: {
        name: "Diamond",
        color: "blue",
        gradient: "from-blue-400 to-purple-600",
        icon: "💎",
      },
      couple: {
        name: "Couple",
        color: "pink",
        gradient: "from-pink-400 to-red-500",
        icon: "💕",
      },
    }

    return {
      ...planConfig[planType],
      isVerified: user.is_verified,
      expiresAt: user.premium_subscription?.expires_at,
    }
  }, [user])

  return {
    // State
    user,
    features,
    planType: (user?.premium_type as PremiumPlan) || "free",
    planInfo,
    isVerified: user?.is_verified || false,

    // Methods
    canPerform,
    getUpgradeSuggestion,
  }
}
