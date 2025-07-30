import { useAuth } from '@/hooks/useAuth'
import type { Conversation } from '@/lib/services/messages-service'

export function useMessagePermissions() {
  const { user } = useAuth()

  const canSendMessage = (conversation?: Conversation) => {
    if (!user) return false

    // Free users cannot send messages
    if (user.premium_type === 'free') {
      // But can reply if a premium user initiated the conversation
      if (conversation?.initiated_by_premium && conversation.initiated_by !== user.id) {
        return true
      }
      return false
    }

    // Gold users have daily limits
    if (user.premium_type === 'gold') {
      // Check if verified (unlimited messages)
      if (user.is_verified && user.daily_message_limit === -1) {
        return true
      }
      // Check daily limit
      return user.daily_message_count < user.daily_message_limit
    }

    // Diamond and Couple users have unlimited
    return user.premium_type === 'diamond' || user.premium_type === 'couple'
  }

  const canSendMedia = (type: 'photo' | 'video') => {
    if (!user) return false

    // Free users have very limited media
    if (user.premium_type === 'free') {
      if (type === 'photo') {
        return user.monthly_photo_count < user.monthly_photo_limit
      }
      return false // Free users cannot send videos
    }

    // Check monthly limits
    if (type === 'photo') {
      return user.monthly_photo_limit === -1 || user.monthly_photo_count < user.monthly_photo_limit
    }
    
    if (type === 'video') {
      return user.monthly_video_limit === -1 || user.monthly_video_count < user.monthly_video_limit
    }

    return false
  }

  const canMakeCalls = () => {
    if (!user) return false
    return user.premium_type === 'diamond' || user.premium_type === 'couple'
  }

  const canCreateGroups = () => {
    if (!user) return false
    return user.premium_type === 'diamond' || user.premium_type === 'couple'
  }

  const getRemainingMessages = () => {
    if (!user) return 0
    if (user.premium_type === 'free') return 0
    if (user.daily_message_limit === -1) return Infinity
    return Math.max(0, user.daily_message_limit - user.daily_message_count)
  }

  const getRemainingPhotos = () => {
    if (!user) return 0
    if (user.monthly_photo_limit === -1) return Infinity
    return Math.max(0, user.monthly_photo_limit - user.monthly_photo_count)
  }

  const getRemainingVideos = () => {
    if (!user) return 0
    if (user.monthly_video_limit === -1) return Infinity
    return Math.max(0, user.monthly_video_limit - user.monthly_video_count)
  }

  return {
    canSendMessage,
    canSendMedia,
    canMakeCalls,
    canCreateGroups,
    getRemainingMessages,
    getRemainingPhotos,
    getRemainingVideos,
    isFreePlan: user?.premium_type === 'free',
    isGoldPlan: user?.premium_type === 'gold',
    isDiamondPlan: user?.premium_type === 'diamond',
    isCouplePlan: user?.premium_type === 'couple',
    isPremium: user?.premium_type !== 'free',
    isVerified: user?.is_verified || false
  }
}