"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Subscription {
  id: string
  plan: "free" | "gold" | "diamond" | "couple"
  status: "active" | "canceled" | "past_due" | "trialing"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  trial_end?: string
}

interface UsageStats {
  messages_sent_today: number
  events_created_this_month: number
  storage_used_mb: number
  last_reset: string
}

interface PremiumState {
  subscription: Subscription | null
  usage: UsageStats | null
  isLoading: boolean
  error: string | null

  // Actions
  setSubscription: (subscription: Subscription) => void
  setUsage: (usage: UsageStats) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  subscribeToPlan: (planId: string, annual?: boolean) => Promise<void>
  cancelSubscription: () => Promise<void>
  updateUsage: (type: keyof UsageStats, increment?: number) => void
  checkFeatureAccess: (feature: string) => boolean
  getRemainingQuota: (feature: string) => number
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      subscription: null,
      usage: null,
      isLoading: false,
      error: null,

      setSubscription: (subscription) => set({ subscription }),
      setUsage: (usage) => set({ usage }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      subscribeToPlan: async (planId: string, annual = false) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch("/api/premium/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ planId, annual }),
          })

          if (!response.ok) {
            throw new Error("Failed to subscribe to plan")
          }

          const { subscription, checkout_url } = await response.json()

          if (checkout_url) {
            // Redirect to payment page
            window.location.href = checkout_url
          } else {
            set({ subscription })
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unknown error" })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      cancelSubscription: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch("/api/premium/cancel", {
            method: "POST",
          })

          if (!response.ok) {
            throw new Error("Failed to cancel subscription")
          }

          const { subscription } = await response.json()
          set({ subscription })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unknown error" })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      updateUsage: (type: keyof UsageStats, increment = 1) => {
        const { usage } = get()
        if (!usage) return

        const today = new Date().toISOString().split("T")[0]
        const shouldReset = usage.last_reset !== today

        const newUsage = shouldReset
          ? {
              messages_sent_today: type === "messages_sent_today" ? increment : 0,
              events_created_this_month: usage.events_created_this_month,
              storage_used_mb: usage.storage_used_mb,
              last_reset: today,
            }
          : {
              ...usage,
              [type]: usage[type] + increment,
            }

        set({ usage: newUsage })
      },

      checkFeatureAccess: (feature: string) => {
        const { subscription } = get()
        if (!subscription || subscription.status !== "active") {
          return false
        }

        const featureAccess = {
          messaging: ["gold", "diamond", "couple"],
          video_upload: ["gold", "diamond", "couple"],
          group_creation: ["diamond", "couple"],
          stories: ["diamond", "couple"],
          voice_calls: ["diamond", "couple"],
          event_creation: ["gold", "diamond", "couple"],
          no_ads: ["diamond", "couple"],
          priority_support: ["diamond", "couple"],
        }

        const allowedPlans = featureAccess[feature as keyof typeof featureAccess]
        return allowedPlans?.includes(subscription.plan) || false
      },

      getRemainingQuota: (feature: string) => {
        const { subscription, usage } = get()
        if (!subscription || !usage) return 0

        const quotas = {
          messages_daily: {
            free: 0,
            gold: 10, // without verification
            diamond: -1, // unlimited
            couple: -1, // unlimited
          },
          events_monthly: {
            free: 0,
            gold: 3,
            diamond: -1, // unlimited
            couple: -1, // unlimited
          },
          storage_mb: {
            free: 100,
            gold: 1000,
            diamond: 5000,
            couple: 5000,
          },
        }

        const planQuota = quotas[feature as keyof typeof quotas]?.[subscription.plan]
        if (planQuota === -1) return -1 // unlimited

        const used = usage[`${feature.split("_")[0]}_sent_today` as keyof UsageStats] || 0
        return Math.max(0, planQuota - used)
      },
    }),
    {
      name: "premium-storage",
      partialize: (state) => ({
        subscription: state.subscription,
        usage: state.usage,
      }),
    },
  ),
)
