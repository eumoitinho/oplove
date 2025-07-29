"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import Cookies from "js-cookie"

interface AdFrequencyConfig {
  free: {
    timeline: number // Show ad every N posts
    sidebar: number // Show ad every N minutes
    story: number // Show ad every N stories
    popup: number // Show popup every N hours
  }
  gold: {
    timeline: number
    sidebar: number
    story: number
    popup: number
  }
  diamond: {
    timeline: 0 // No ads
    sidebar: 0
    story: 0
    popup: 0
  }
  couple: {
    timeline: 0 // No ads
    sidebar: 0
    story: 0
    popup: 0
  }
}

const DEFAULT_CONFIG: AdFrequencyConfig = {
  free: {
    timeline: 5, // Every 5 posts
    sidebar: 30, // Every 30 minutes
    story: 3, // Every 3 stories
    popup: 120, // Every 2 hours
  },
  gold: {
    timeline: 10, // Every 10 posts
    sidebar: 60, // Every hour
    story: 5, // Every 5 stories
    popup: 240, // Every 4 hours
  },
  diamond: {
    timeline: 0,
    sidebar: 0,
    story: 0,
    popup: 0,
  },
  couple: {
    timeline: 0,
    sidebar: 0,
    story: 0,
    popup: 0,
  },
}

interface AdFrequencyState {
  timelineCount: number
  sidebarLastShown: number
  storyCount: number
  popupLastShown: number
}

export function useAdFrequency() {
  const { user } = useAuth()
  const [state, setState] = useState<AdFrequencyState>({
    timelineCount: 0,
    sidebarLastShown: 0,
    storyCount: 0,
    popupLastShown: 0,
  })

  const userPlan = user?.premium_type || "free"
  const config = DEFAULT_CONFIG[userPlan as keyof AdFrequencyConfig]

  // Load state from cookies on mount
  useEffect(() => {
    const savedState = Cookies.get("ad_frequency_state")
    if (savedState) {
      try {
        setState(JSON.parse(savedState))
      } catch (error) {
        console.error("Failed to parse ad frequency state:", error)
      }
    }
  }, [])

  // Save state to cookies when it changes
  useEffect(() => {
    Cookies.set("ad_frequency_state", JSON.stringify(state), { expires: 7 })
  }, [state])

  const shouldShowTimelineAd = useCallback(() => {
    if (config.timeline === 0) return false
    return state.timelineCount % config.timeline === 0 && state.timelineCount > 0
  }, [config.timeline, state.timelineCount])

  const shouldShowSidebarAd = useCallback(() => {
    if (config.sidebar === 0) return false
    const now = Date.now()
    const timeSinceLastAd = now - state.sidebarLastShown
    return timeSinceLastAd >= config.sidebar * 60 * 1000 // Convert minutes to milliseconds
  }, [config.sidebar, state.sidebarLastShown])

  const shouldShowStoryAd = useCallback(() => {
    if (config.story === 0) return false
    return state.storyCount % config.story === 0 && state.storyCount > 0
  }, [config.story, state.storyCount])

  const shouldShowPopupAd = useCallback(() => {
    if (config.popup === 0) return false
    const now = Date.now()
    const timeSinceLastPopup = now - state.popupLastShown
    return timeSinceLastPopup >= config.popup * 60 * 1000 // Convert minutes to milliseconds
  }, [config.popup, state.popupLastShown])

  const incrementTimelineCount = useCallback(() => {
    setState((prev) => ({ ...prev, timelineCount: prev.timelineCount + 1 }))
  }, [])

  const markSidebarAdShown = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarLastShown: Date.now() }))
  }, [])

  const incrementStoryCount = useCallback(() => {
    setState((prev) => ({ ...prev, storyCount: prev.storyCount + 1 }))
  }, [])

  const markPopupAdShown = useCallback(() => {
    setState((prev) => ({ ...prev, popupLastShown: Date.now() }))
  }, [])

  const resetCounts = useCallback(() => {
    setState({
      timelineCount: 0,
      sidebarLastShown: 0,
      storyCount: 0,
      popupLastShown: 0,
    })
  }, [])

  return {
    shouldShowTimelineAd,
    shouldShowSidebarAd,
    shouldShowStoryAd,
    shouldShowPopupAd,
    incrementTimelineCount,
    markSidebarAdShown,
    incrementStoryCount,
    markPopupAdShown,
    resetCounts,
    config,
    state,
  }
}

// Hook for detecting user plan changes
export function useUserPlanDetector() {
  const { user } = useAuth()
  const [previousPlan, setPreviousPlan] = useState(user?.premium_type)

  useEffect(() => {
    if (user?.premium_type !== previousPlan) {
      // Plan changed, reset ad frequency counters
      Cookies.remove("ad_frequency_state")
      setPreviousPlan(user?.premium_type)
    }
  }, [user?.premium_type, previousPlan])

  return {
    currentPlan: user?.premium_type || "free",
    planChanged: user?.premium_type !== previousPlan,
  }
}
