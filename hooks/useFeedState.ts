"use client"

import { useState, useCallback, useRef, useMemo } from "react"

interface FeedState {
  posts: any[]
  page: number
  hasMore: boolean
  initialized: boolean
  lastUpdated: number
}

interface UseFeedStateOptions {
  cacheTimeMs?: number // Cache duration in milliseconds
}

/**
 * Hook to manage feed state with caching and persistence
 * Maintains state across view switches to prevent skeleton loading
 */
export function useFeedState(userId?: string, options: UseFeedStateOptions = {}) {
  const { cacheTimeMs = 5 * 60 * 1000 } = options // 5 minutes default cache
  
  // Cache states for different tabs and users
  const stateCache = useRef<Record<string, FeedState>>({})
  
  const [currentState, setCurrentState] = useState<FeedState>({
    posts: [],
    page: 1,
    hasMore: true,
    initialized: false,
    lastUpdated: 0
  })

  // Generate cache key for current context
  const getCacheKey = useCallback((tab: string) => {
    if (!userId) return `guest-${tab}`
    return `${userId}-${tab}`
  }, [userId])

  // Check if cached data is still valid
  const isCacheValid = useCallback((state: FeedState) => {
    const now = Date.now()
    return (now - state.lastUpdated) < cacheTimeMs
  }, [cacheTimeMs])

  // Get state for a specific tab
  const getState = useCallback((tab: string): FeedState => {
    const key = getCacheKey(tab)
    const cached = stateCache.current[key]
    
    if (cached && cached.initialized && isCacheValid(cached)) {
      return cached
    }
    
    // Return fresh state if cache is invalid or doesn't exist
    return {
      posts: [],
      page: 1,
      hasMore: true,
      initialized: false,
      lastUpdated: 0
    }
  }, [getCacheKey, isCacheValid])

  // Update state for a specific tab
  const updateState = useCallback((tab: string, updates: Partial<FeedState>) => {
    const key = getCacheKey(tab)
    const current = stateCache.current[key] || getState(tab)
    
    const newState = {
      ...current,
      ...updates,
      lastUpdated: Date.now()
    }
    
    stateCache.current[key] = newState
    setCurrentState(newState)
    
    return newState
  }, [getCacheKey, getState])

  // Load state for a specific tab (switch to it)
  const loadState = useCallback((tab: string) => {
    const state = getState(tab)
    setCurrentState(state)
    return state
  }, [getState])

  // Clear cache for a specific tab (force refresh)
  const clearState = useCallback((tab: string) => {
    const key = getCacheKey(tab)
    delete stateCache.current[key]
    
    const freshState = {
      posts: [],
      page: 1,
      hasMore: true,
      initialized: false,
      lastUpdated: 0
    }
    
    setCurrentState(freshState)
    return freshState
  }, [getCacheKey])

  // Clear all cache (e.g., on logout)
  const clearAllStates = useCallback(() => {
    stateCache.current = {}
    setCurrentState({
      posts: [],
      page: 1,
      hasMore: true,
      initialized: false,
      lastUpdated: 0
    })
  }, [])

  // Memoize utility functions to prevent recreation
  const isCacheValidMemo = useCallback((tab: string) => {
    const key = getCacheKey(tab)
    const cached = stateCache.current[key]
    return cached ? isCacheValid(cached) : false
  }, [getCacheKey, isCacheValid])
  
  const getCacheInfoMemo = useCallback(() => ({
    keys: Object.keys(stateCache.current),
    sizes: Object.entries(stateCache.current).map(([key, state]) => ({
      key,
      posts: state.posts.length,
      lastUpdated: new Date(state.lastUpdated).toISOString()
    }))
  }), [])

  // Return object without memoization to avoid circular dependency
  // The functions are already memoized with useCallback
  return {
    // Current state
    currentState,
    
    // State management functions
    getState,
    updateState,
    loadState,
    clearState,
    clearAllStates,
    
    // Utility functions
    isCacheValid: isCacheValidMemo,
    getCacheInfo: getCacheInfoMemo
  }
}