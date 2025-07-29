"use client"

import { useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"

interface ImpressionData {
  adId: string
  placement: string
  variant?: string
  viewportPercentage: number
  timestamp?: number
}

interface ClickData {
  adId: string
  placement: string
  targetUrl?: string
  timestamp?: number
}

interface EngagementData {
  adId: string
  action: string
  placement: string
  value?: string | number
  timestamp?: number
}

interface ConversionData {
  adId: string
  placement: string
  conversionType: string
  value?: number
  timestamp?: number
}

export function useAdTracker(adId?: string) {
  const { user } = useAuth()

  const trackImpression = useCallback(
    async (data: ImpressionData) => {
      try {
        const impressionData = {
          ...data,
          userId: user?.id,
          userPlan: user?.premium_type,
          timestamp: Date.now(),
          sessionId: getSessionId(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }

        // Send to analytics service
        await fetch("/api/ads/track/impression", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(impressionData),
        })

        // Store locally for offline support
        storeLocalEvent("impression", impressionData)
      } catch (error) {
        console.error("Failed to track impression:", error)
      }
    },
    [user],
  )

  const trackClick = useCallback(
    async (data: ClickData) => {
      try {
        const clickData = {
          ...data,
          userId: user?.id,
          userPlan: user?.premium_type,
          timestamp: Date.now(),
          sessionId: getSessionId(),
        }

        // Send to analytics service
        await fetch("/api/ads/track/click", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clickData),
        })

        // Store locally
        storeLocalEvent("click", clickData)
      } catch (error) {
        console.error("Failed to track click:", error)
      }
    },
    [user],
  )

  const trackEngagement = useCallback(
    async (data: EngagementData) => {
      try {
        const engagementData = {
          ...data,
          userId: user?.id,
          userPlan: user?.premium_type,
          timestamp: Date.now(),
          sessionId: getSessionId(),
        }

        // Send to analytics service
        await fetch("/api/ads/track/engagement", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(engagementData),
        })

        // Store locally
        storeLocalEvent("engagement", engagementData)
      } catch (error) {
        console.error("Failed to track engagement:", error)
      }
    },
    [user],
  )

  const trackConversion = useCallback(
    async (data: ConversionData) => {
      try {
        const conversionData = {
          ...data,
          userId: user?.id,
          userPlan: user?.premium_type,
          timestamp: Date.now(),
          sessionId: getSessionId(),
        }

        // Send to analytics service
        await fetch("/api/ads/track/conversion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(conversionData),
        })

        // Store locally
        storeLocalEvent("conversion", conversionData)
      } catch (error) {
        console.error("Failed to track conversion:", error)
      }
    },
    [user],
  )

  return {
    trackImpression,
    trackClick,
    trackEngagement,
    trackConversion,
  }
}

// Helper functions
function getSessionId(): string {
  let sessionId = sessionStorage.getItem("ad_session_id")
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem("ad_session_id", sessionId)
  }
  return sessionId
}

function storeLocalEvent(type: string, data: any) {
  try {
    const events = JSON.parse(localStorage.getItem("ad_events") || "[]")
    events.push({ type, data, stored_at: Date.now() })

    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100)
    }

    localStorage.setItem("ad_events", JSON.stringify(events))
  } catch (error) {
    console.error("Failed to store local event:", error)
  }
}

// Export for use in other components
export { getSessionId, storeLocalEvent }
