import { useAuth } from '@/hooks/useAuth'
import { CONTENT_LIMITS } from '@/utils/constants'
import type { Conversation } from '@/lib/services/messages-service'

export function useMessagePermissions() {
  const { user } = useAuth()

  const canSendMessage = (conversation?: Conversation) => {
    if (!user) return false

    const limits = CONTENT_LIMITS[user.premium_type || 'free']

    // Free users cannot initiate messages but can reply
    if (user.premium_type === 'free') {
      // Free users can reply if a premium user initiated the conversation
      // The logic is: if conversation was initiated by someone else AND that someone was premium
      if (conversation?.initiated_by_premium && conversation.initiated_by && conversation.initiated_by !== user.id) {
        return true
      }
      // Free users cannot initiate new conversations or send messages in their own initiated conversations
      return false
    }

    // Gold users have daily limits (200/day, unlimited if verified)
    if (user.premium_type === 'gold') {
      // Check if verified (unlimited messages)
      if (user.is_verified) {
        return true
      }
      // Check daily limit
      const dailyLimit = limits.dailyMessageLimit
      return user.daily_message_count < dailyLimit
    }

    // Diamond and Couple users have unlimited
    return limits.dailyMessageLimit === -1
  }

  const canSendMedia = (type: 'photo' | 'video') => {
    if (!user) return false

    const limits = CONTENT_LIMITS[user.premium_type || 'free']
    const storageUsed = user.storage_used || 0

    // Check storage limit first
    if (storageUsed >= limits.storageLimit) {
      return false
    }

    // Free users can send 1 photo per post, no videos
    if (user.premium_type === 'free') {
      return type === 'photo' && limits.maxPhotosPerPost > 0
    }

    // Gold users can send photos and videos up to 5 minutes
    if (user.premium_type === 'gold') {
      return type === 'photo' || (type === 'video' && limits.maxVideoLength > 0)
    }

    // Diamond and Couple users have full access
    return true
  }

  const canMakeCalls = () => {
    if (!user) return false
    return user.premium_type === 'diamond' || user.premium_type === 'couple'
  }

  const canCreateGroups = () => {
    if (!user) return false
    const limits = CONTENT_LIMITS[user.premium_type || 'free']
    return limits.maxGroupMembers > 0
  }

  const getRemainingMessages = () => {
    if (!user) return 0
    
    const limits = CONTENT_LIMITS[user.premium_type || 'free']
    
    // Free users cannot send messages
    if (user.premium_type === 'free') return 0
    
    // Gold users: 200/day, unlimited if verified
    if (user.premium_type === 'gold') {
      if (user.is_verified) return Infinity
      return Math.max(0, limits.dailyMessageLimit - user.daily_message_count)
    }
    
    // Diamond and Couple: unlimited
    return Infinity
  }

  const getRemainingStorage = () => {
    if (!user) return 0
    
    const limits = CONTENT_LIMITS[user.premium_type || 'free']
    const storageUsed = user.storage_used || 0
    
    if (limits.storageLimit === -1) return Infinity
    return Math.max(0, limits.storageLimit - storageUsed)
  }

  return {
    canSendMessage,
    canSendMedia,
    canMakeCalls,
    canCreateGroups,
    getRemainingMessages,
    getRemainingStorage,
    isFreePlan: user?.premium_type === 'free',
    isGoldPlan: user?.premium_type === 'gold',
    isDiamondPlan: user?.premium_type === 'diamond',
    isCouplePlan: user?.premium_type === 'couple',
    isPremium: user?.premium_type !== 'free',
    isVerified: user?.is_verified || false,
    limits: user ? CONTENT_LIMITS[user.premium_type || 'free'] : CONTENT_LIMITS.free
  }
}