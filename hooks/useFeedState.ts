"use client"

import { useState, useCallback, useRef, useMemo } from "react"

interface FeedState {
  posts: any[]
  page: number
  hasMore: boolean
  initialized: boolean
  lastUpdated: number
  lastFetched?: number // Track when data was actually fetched from API
  isFollowingAnyone?: boolean
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
    lastUpdated: 0,
    isFollowingAnyone: undefined
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
    
    // ALWAYS return cached data if we have posts
    // This prevents posts from disappearing during re-renders
    if (cached && cached.posts && cached.posts.length > 0) {
      console.log(`[useFeedState] Returning cached state with ${cached.posts.length} posts`)
      return cached
    }
    
    // Only return empty state if we truly have no data
    if (cached && cached.initialized) {
      return cached
    }
    
    // Return fresh state if cache doesn't exist
    return {
      posts: [],
      page: 1,
      hasMore: true,
      initialized: false,
      lastUpdated: 0,
      lastFetched: 0,
      isFollowingAnyone: undefined
    }
  }, [getCacheKey])

  // Update state for a specific tab
  const updateState = useCallback((tab: string, updates: Partial<FeedState>) => {
    const key = getCacheKey(tab)
    const current = stateCache.current[key] || getState(tab)
    
    // CRITICAL: Never overwrite posts with empty array unless explicitly intended
    const newState = {
      ...current,
      ...updates,
      lastUpdated: Date.now(),
      // Track when we actually fetched new data
      lastFetched: updates.posts !== undefined ? Date.now() : current.lastFetched
    }
    
    // Safety check: Don't clear posts unless we really mean to
    if (updates.posts?.length === 0 && current.posts?.length > 0 && !updates.initialized) {
      console.warn('[useFeedState] Preventing accidental post clear, keeping existing posts')
      newState.posts = current.posts
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
      lastUpdated: 0,
      isFollowingAnyone: undefined
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