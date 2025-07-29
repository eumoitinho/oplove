"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import type { Conversation } from "@/types/chat"

interface MessagePermissions {
  canSend: boolean
  reason?: string
  isFreePlanReply?: boolean
  dailyLimit?: number
  remaining?: number
}

interface MessageLimit {
  hasLimit: boolean
  limit: number
  remaining: number
  resetTime?: Date
}

/**
 * Hook to check messaging permissions based on user plan and conversation context
 */
export function useMessagePermissions() {
  const { user } = useAuthStore()

  const canSendMessage = (conversation?: Conversation): MessagePermissions => {
    if (!user) {
      return {
        canSend: false,
        reason: "Faça login para enviar mensagens",
      }
    }

    // Diamond+ always can send
    if (["diamond", "couple"].includes(user.premium_type)) {
      return { canSend: true }
    }

    // Gold users check limits and verification
    if (user.premium_type === "gold") {
      if (user.is_verified) {
        return { canSend: true }
      }

      // Check daily limit for unverified Gold users
      const dailyLimit = 10
      const remaining = Math.max(0, dailyLimit - (user.daily_messages_sent || 0))

      if (remaining > 0) {
        return {
          canSend: true,
          dailyLimit,
          remaining,
        }
      }

      return {
        canSend: false,
        reason: "Limite diário atingido. Verifique sua conta para mensagens ilimitadas.",
      }
    }

    // Free users can only reply to conversations initiated by premium users
    if (user.premium_type === "free") {
      if (!conversation) {
        return {
          canSend: false,
          reason: "Usuários gratuitos só podem responder mensagens de assinantes",
        }
      }

      // Check if conversation was initiated by premium user
      const canReply = conversation.initiated_by !== user.id && conversation.initiated_by_premium === true

      if (canReply) {
        return {
          canSend: true,
          isFreePlanReply: true,
        }
      }

      return {
        canSend: false,
        reason: "Faça upgrade para enviar mensagens",
      }
    }

    return {
      canSend: false,
      reason: "Plano não reconhecido",
    }
  }

  const canCreateGroup = (): boolean => {
    if (!user) return false
    return ["diamond", "couple"].includes(user.premium_type)
  }

  const getMessageLimit = (): MessageLimit => {
    if (!user) {
      return { hasLimit: true, limit: 0, remaining: 0 }
    }

    if (user.premium_type === "free") {
      return { hasLimit: true, limit: 0, remaining: 0 }
    }

    if (user.premium_type === "gold" && !user.is_verified) {
      const limit = 10
      const remaining = Math.max(0, limit - (user.daily_messages_sent || 0))
      return {
        hasLimit: true,
        limit,
        remaining,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
      }
    }

    return { hasLimit: false, limit: -1, remaining: -1 }
  }

  const canParticipateInEvent = (): boolean => {
    if (!user) return false

    // Free users need verification
    if (user.premium_type === "free") {
      return user.is_verified
    }

    return true
  }

  const canCreateEvent = (): { canCreate: boolean; limit?: number; used?: number } => {
    if (!user) return { canCreate: false }

    if (user.premium_type === "free") {
      return { canCreate: false }
    }

    if (user.premium_type === "gold") {
      const limit = 3
      const used = user.monthly_events_created || 0
      return {
        canCreate: used < limit,
        limit,
        used,
      }
    }

    // Diamond and Couple have unlimited
    return { canCreate: true }
  }

  const canUploadVideo = (): boolean => {
    if (!user) return false
    return user.premium_type !== "free"
  }

  const canCreateStories = (): boolean => {
    if (!user) return false
    return ["diamond", "couple"].includes(user.premium_type)
  }

  const canMakeVoiceCalls = (): boolean => {
    if (!user) return false
    return ["diamond", "couple"].includes(user.premium_type)
  }

  const needsVerificationFor = (action: string): boolean => {
    if (!user) return true

    const verificationRequired = {
      comment: user.premium_type === "free",
      event_participation: user.premium_type === "free",
      unlimited_messages: user.premium_type === "gold",
      event_creation: user.premium_type === "gold",
    }

    return verificationRequired[action as keyof typeof verificationRequired] && !user.is_verified
  }

  return {
    canSendMessage,
    canCreateGroup,
    getMessageLimit,
    canParticipateInEvent,
    canCreateEvent,
    canUploadVideo,
    canCreateStories,
    canMakeVoiceCalls,
    needsVerificationFor,
    isFreePlanReply: (conv?: Conversation) => {
      const permissions = canSendMessage(conv)
      return permissions.isFreePlanReply || false
    },
  }
}
