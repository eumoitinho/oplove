"use client"

import { useState, useCallback } from "react"
import { usePremiumFeatures } from "./usePremiumFeatures"
import { useRouter } from "next/navigation"

/**
 * Paywall and upgrade flow management hook
 *
 * Handles paywall display, upgrade flows, and premium feature restrictions.
 * Provides contextual upgrade prompts and conversion tracking.
 *
 * @example
 * ```tsx
 * function CreateStoryButton() {
 *   const { showPaywall, isPaywallOpen, closePaywall } = usePaywall()
 *   const { features } = usePremiumFeatures()
 *
 *   const handleCreateStory = () => {
 *     if (!features.canCreateStories) {
 *       showPaywall('stories', {
 *         title: 'Stories são exclusivos do Diamond',
 *         feature: 'Compartilhe momentos que desaparecem em 24h'
 *       })
 *       return
 *     }
 *     // Create story logic
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={handleCreateStory}>
 *         Criar Story
 *       </button>
 *       <PaywallModal
 *         isOpen={isPaywallOpen}
 *         onClose={closePaywall}
 *       />
 *     </>
 *   )
 * }
 * ```
 *
 * @returns Paywall state and controls
 */
export function usePaywall() {
  const { user, features, getUpgradeSuggestion } = usePremiumFeatures()
  const router = useRouter()

  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  const [paywallContext, setPaywallContext] = useState<{
    feature: string
    title?: string
    description?: string
    benefits?: string[]
    source?: string
  } | null>(null)

  /**
   * Show paywall with contextual information
   */
  const showPaywall = useCallback(
    (
      feature: string,
      context?: {
        title?: string
        description?: string
        benefits?: string[]
        source?: string
      },
    ) => {
      // Don't show paywall if user already has access
      if (features[feature as keyof typeof features]) {
        return false
      }

      // Get upgrade suggestion for this feature
      const suggestion = getUpgradeSuggestion(feature as keyof typeof features)

      if (!suggestion) {
        return false
      }

      // Set paywall context
      setPaywallContext({
        feature,
        title: context?.title || suggestion.title,
        description: context?.description || suggestion.description,
        benefits: context?.benefits || getFeatureBenefits(feature),
        source: context?.source || "unknown",
      })

      setIsPaywallOpen(true)

      // Track paywall impression
      trackPaywallEvent("impression", {
        feature,
        source: context?.source || "unknown",
        userPlan: user?.premium_type || "free",
      })

      return true
    },
    [features, getUpgradeSuggestion, user],
  )

  /**
   * Close paywall
   */
  const closePaywall = useCallback(() => {
    if (paywallContext) {
      // Track paywall dismissal
      trackPaywallEvent("dismiss", {
        feature: paywallContext.feature,
        source: paywallContext.source || "unknown",
        userPlan: user?.premium_type || "free",
      })
    }

    setIsPaywallOpen(false)
    setPaywallContext(null)
  }, [paywallContext, user])

  /**
   * Handle upgrade button click
   */
  const handleUpgrade = useCallback(
    (targetPlan?: string) => {
      if (paywallContext) {
        // Track conversion attempt
        trackPaywallEvent("upgrade_click", {
          feature: paywallContext.feature,
          source: paywallContext.source || "unknown",
          userPlan: user?.premium_type || "free",
          targetPlan: targetPlan || "gold",
        })
      }

      closePaywall()
      router.push(`/premium${targetPlan ? `?plan=${targetPlan}` : ""}`)
    },
    [paywallContext, user, closePaywall, router],
  )

  /**
   * Handle verification redirect
   */
  const handleVerification = useCallback(() => {
    if (paywallContext) {
      trackPaywallEvent("verification_click", {
        feature: paywallContext.feature,
        source: paywallContext.source || "unknown",
        userPlan: user?.premium_type || "free",
      })
    }

    closePaywall()
    router.push("/verification")
  }, [paywallContext, user, closePaywall, router])

  /**
   * Check if feature requires paywall
   */
  const requiresUpgrade = useCallback(
    (feature: string): boolean => {
      return !features[feature as keyof typeof features]
    },
    [features],
  )

  /**
   * Get contextual upgrade message
   */
  const getUpgradeMessage = useCallback(
    (feature: string) => {
      const messages = {
        canSendMessages: {
          free: "Verifique sua identidade para enviar mensagens",
          gold: "Mensagens ilimitadas com Gold",
        },
        canCreateStories: {
          free: "Stories disponíveis no plano Diamond",
          gold: "Upgrade para Diamond e crie stories",
        },
        canMakeVideoCalls: {
          free: "Chamadas de vídeo no plano Diamond",
          gold: "Chamadas de vídeo com Diamond",
        },
        canCreateGroups: {
          free: "Crie grupos com o plano Diamond",
          gold: "Grupos personalizados com Diamond",
        },
      }

      const userPlan = user?.premium_type || "free"
      const featureMessages = messages[feature as keyof typeof messages]

      return featureMessages?.[userPlan as keyof typeof featureMessages] || "Recurso disponível em planos premium"
    },
    [user],
  )

  return {
    // State
    isPaywallOpen,
    paywallContext,

    // Methods
    showPaywall,
    closePaywall,
    handleUpgrade,
    handleVerification,
    requiresUpgrade,
    getUpgradeMessage,
  }
}

/**
 * Get feature benefits for paywall display
 */
function getFeatureBenefits(feature: string): string[] {
  const benefits = {
    canSendMessages: ["Converse com outros usuários", "Mensagens em tempo real", "Compartilhe fotos e vídeos"],
    canCreateStories: [
      "Compartilhe momentos especiais",
      "Conteúdo que desaparece em 24h",
      "Veja quem visualizou seus stories",
    ],
    canMakeVideoCalls: ["Chamadas de vídeo HD", "Conecte-se face a face", "Conversas mais íntimas"],
    canCreateGroups: ["Crie grupos personalizados", "Até 50 membros por grupo", "Organize eventos e encontros"],
    canCreatePolls: ["Crie enquetes interativas", "Engaje sua audiência", "Tome decisões em grupo"],
  }

  return (
    benefits[feature as keyof typeof benefits] || [
      "Recurso premium exclusivo",
      "Melhore sua experiência",
      "Conecte-se de forma única",
    ]
  )
}

/**
 * Track paywall events for analytics
 */
function trackPaywallEvent(event: string, data: Record<string, any>) {
  // In a real app, this would send to analytics service
  console.log("Paywall Event:", event, data)

  // Example: Send to analytics
  // analytics.track('paywall_event', {
  //   event,
  //   ...data,
  //   timestamp: new Date().toISOString()
  // })
}
