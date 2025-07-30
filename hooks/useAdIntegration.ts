"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { adTrackingService } from '@/lib/services/ad-tracking.service'

interface AdCampaign {
  id: string
  name: string
  description?: string
  objective: string
  business: {
    id: string
    business_name: string
    logo_url?: string
    description?: string
  }
  ads?: Array<{
    id: string
    format: string
    content: any
  }>
}

interface AdIntegrationOptions {
  placement: string
  adFrequency: number // Show ad every N posts
  maxAdsPerSession: number
  enabledForFreeUsers: boolean
  enabledForPremiumUsers: boolean
}

export function useAdIntegration(options: AdIntegrationOptions) {
  const { user, premiumFeatures } = useAuth()
  const [availableAds, setAvailableAds] = useState<AdCampaign[]>([])
  const [shownAds, setShownAds] = useState<Set<string>>(new Set())
  const [adsLoadingState, setAdsLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [sessionAdCount, setSessionAdCount] = useState(0)
  const [lastAdIndex, setLastAdIndex] = useState(0)

  // Check if user should see ads
  const shouldShowAds = useCallback(() => {
    if (!user) return false
    
    // Check premium status and ad settings
    if (user.premium_type !== 'free' && !options.enabledForPremiumUsers) {
      return false
    }
    
    if (user.premium_type === 'free' && !options.enabledForFreeUsers) {
      return false
    }

    // Check if user has ad-free premium
    if (premiumFeatures?.canHideAds && user.premium_type !== 'free') {
      return false
    }

    // Check session limits
    if (sessionAdCount >= options.maxAdsPerSession) {
      return false
    }

    return true
  }, [user, premiumFeatures, sessionAdCount, options])

  // Load available ads
  const loadAds = useCallback(async () => {
    if (!shouldShowAds() || adsLoadingState === 'loading') return

    setAdsLoadingState('loading')
    
    try {
      const userAge = user?.birth_date ? 
        Math.floor((Date.now() - new Date(user.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
        undefined

      const result = await adTrackingService.getActiveCampaigns({
        user_age: userAge,
        user_gender: user?.gender,
        user_location: user?.location,
        user_interests: user?.interests,
        user_is_verified: user?.is_verified,
        user_is_premium: user?.premium_type !== 'free',
        placement: options.placement,
        limit: 20
      })

      if (result.error) {
        throw new Error(result.error)
      }

      setAvailableAds(result.data)
      setAdsLoadingState('loaded')
    } catch (error) {
      console.error('Error loading ads:', error)
      setAdsLoadingState('error')
    }
  }, [shouldShowAds, adsLoadingState, user, options.placement])

  // Get next ad to show
  const getNextAd = useCallback((): AdCampaign | null => {
    if (!shouldShowAds() || availableAds.length === 0) {
      return null
    }

    // Filter out already shown ads
    const unshownAds = availableAds.filter(ad => !shownAds.has(ad.id))
    
    if (unshownAds.length === 0) {
      // All ads have been shown, reset and start over
      setShownAds(new Set())
      setLastAdIndex(0)
      return availableAds[0] || null
    }

    // Get next ad in rotation
    const nextAd = unshownAds[lastAdIndex % unshownAds.length] || unshownAds[0]
    setLastAdIndex(prev => prev + 1)
    
    return nextAd
  }, [shouldShowAds, availableAds, shownAds, lastAdIndex])

  // Mark ad as shown
  const markAdAsShown = useCallback((adId: string) => {
    setShownAds(prev => new Set([...prev, adId]))
    setSessionAdCount(prev => prev + 1)
  }, [])

  // Check if should show ad at current position
  const shouldShowAdAtPosition = useCallback((position: number, totalPosts: number): boolean => {
    if (!shouldShowAds()) return false
    
    // Show ad every N posts based on adFrequency
    const shouldShow = position > 0 && position % options.adFrequency === 0
    
    // Don't show ad if we're at the very end
    const notAtEnd = position < totalPosts - 1
    
    return shouldShow && notAtEnd
  }, [shouldShowAds, options.adFrequency])

  // Handle ad interaction
  const handleAdInteraction = useCallback((adId: string, type: 'impression' | 'click' | 'conversion') => {
    if (type === 'impression') {
      markAdAsShown(adId)
    }
    
    // Log interaction for analytics
    console.log(`Ad interaction: ${adId} - ${type}`)
  }, [markAdAsShown])

  // Integrate ads into posts array
  const integrateAdsIntoPosts = useCallback((posts: any[]): (any | { type: 'ad', campaign: AdCampaign })[] => {
    if (!shouldShowAds() || availableAds.length === 0) {
      return posts
    }

    const integratedPosts: (any | { type: 'ad', campaign: AdCampaign })[] = []
    
    posts.forEach((post, index) => {
      integratedPosts.push(post)
      
      if (shouldShowAdAtPosition(index + 1, posts.length)) {
        const nextAd = getNextAd()
        if (nextAd) {
          integratedPosts.push({
            type: 'ad',
            campaign: nextAd,
            id: `ad-${nextAd.id}-${Date.now()}` // Unique ID for React keys
          })
        }
      }
    })
    
    return integratedPosts
  }, [shouldShowAds, availableAds, shouldShowAdAtPosition, getNextAd])

  // Reset session data
  const resetSession = useCallback(() => {
    setShownAds(new Set())
    setSessionAdCount(0)
    setLastAdIndex(0)
  }, [])

  // Load ads on mount and when dependencies change
  useEffect(() => {
    loadAds()
  }, [loadAds])

  // Reset session when user changes
  useEffect(() => {
    resetSession()
  }, [user?.id, resetSession])

  return {
    // State
    availableAds,
    adsLoadingState,
    sessionAdCount,
    
    // Computed
    shouldShowAds: shouldShowAds(),
    hasAdsAvailable: availableAds.length > 0,
    
    // Actions
    loadAds,
    getNextAd,
    markAdAsShown,
    handleAdInteraction,
    integrateAdsIntoPosts,
    shouldShowAdAtPosition,
    resetSession,
    
    // Statistics
    stats: {
      totalAdsLoaded: availableAds.length,
      adsShownInSession: sessionAdCount,
      remainingSessionAds: Math.max(0, options.maxAdsPerSession - sessionAdCount),
      adsShownIds: Array.from(shownAds)
    }
  }
}