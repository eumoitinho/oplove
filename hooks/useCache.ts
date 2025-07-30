"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export interface CacheStats {
  redis: {
    connected: boolean
    keyCount: number
    memoryUsage: string
  }
  user: {
    profileCached: boolean
    statsCached: boolean
    recommendationsCached: boolean
    followersCached: boolean
    followingCached: boolean
    totalCacheKeys: number
  } | null
  timeline: {
    timelineCacheKeys: number
    algorithmCached: boolean
    estimatedSavings: string
  } | null
  timestamp: string
  performance: {
    averageHitTime: string
    averageMissTime: string
    estimatedBandwidthSaved: string
  }
}

interface UseCacheReturn {
  stats: CacheStats | null
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
  clearUserCache: () => Promise<boolean>
  warmUpCache: () => Promise<boolean>
  cacheHitRate: number
}

/**
 * Hook para monitorar e gerenciar cache no frontend
 */
export function useCache(): UseCacheReturn {
  const { user } = useAuth()
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshStats = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cache/stats?userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching cache stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }, [user])

  const clearUserCache = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch('/api/cache/stats', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Refresh stats after clearing
      await refreshStats()
      return true
    } catch (err) {
      console.error('Error clearing cache:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear cache')
      return false
    }
  }, [user, refreshStats])

  const warmUpCache = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch('/api/cache/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: user.id,
          type: 'user'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Refresh stats after warming up
      await refreshStats()
      return true
    } catch (err) {
      console.error('Error warming up cache:', err)
      setError(err instanceof Error ? err.message : 'Failed to warm up cache')
      return false
    }
  }, [user, refreshStats])

  // Calculate cache hit rate
  const cacheHitRate = useMemo(() => {
    if (!stats?.user && !stats?.timeline) return 0

    let totalKeys = 0
    let cachedKeys = 0

    if (stats.user) {
      totalKeys += 5 // Total possible user cache types
      cachedKeys += [
        stats.user.profileCached,
        stats.user.statsCached,
        stats.user.recommendationsCached,
        stats.user.followersCached,
        stats.user.followingCached
      ].filter(Boolean).length
    }

    if (stats.timeline) {
      totalKeys += 3 // Algorithm + estimated timeline pages
      cachedKeys += stats.timeline.timelineCacheKeys
      if (stats.timeline.algorithmCached) cachedKeys += 1
    }

    return totalKeys > 0 ? (cachedKeys / totalKeys) * 100 : 0
  }, [stats])

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    if (user) {
      refreshStats()
      
      const interval = setInterval(refreshStats, 30000)
      return () => clearInterval(interval)
    }
  }, [user, refreshStats])

  return {
    stats,
    loading,
    error,
    refreshStats,
    clearUserCache,
    warmUpCache,
    cacheHitRate
  }
}

/**
 * Hook mais simples para apenas verificar se dados vêm do cache
 */
export function useCacheIndicator() {
  const [cacheHits, setCacheHits] = useState<Record<string, boolean>>({})
  
  const trackCacheHit = useCallback((key: string, wasHit: boolean) => {
    setCacheHits(prev => ({
      ...prev,
      [key]: wasHit
    }))
  }, [])
  
  const getCacheStatus = useCallback((key: string) => {
    return cacheHits[key] ?? false
  }, [cacheHits])
  
  const getTotalHitRate = useCallback(() => {
    const hits = Object.values(cacheHits)
    if (hits.length === 0) return 0
    
    const hitCount = hits.filter(Boolean).length
    return (hitCount / hits.length) * 100
  }, [cacheHits])
  
  return {
    trackCacheHit,
    getCacheStatus,
    getTotalHitRate,
    cacheHits
  }
}

/**
 * Hook para otimizações de performance baseadas em cache
 */
export function useCacheOptimizations() {
  const { user } = useAuth()
  
  const shouldPrefetch = useCallback((condition: boolean) => {
    // Only prefetch if user is premium (to avoid unnecessary load)
    return condition && user?.premium_type !== 'free'
  }, [user])
  
  const getOptimalRefreshInterval = useCallback((dataType: 'timeline' | 'profile' | 'stats') => {
    // Different refresh rates based on data type and user activity
    const intervals = {
      timeline: 5 * 60 * 1000,  // 5 minutes
      profile: 15 * 60 * 1000,  // 15 minutes  
      stats: 10 * 60 * 1000     // 10 minutes
    }
    
    return intervals[dataType]
  }, [])
  
  const shouldUseStaleWhileRevalidate = useCallback((dataAge: number, maxStaleTime: number) => {
    return dataAge < maxStaleTime
  }, [])
  
  return {
    shouldPrefetch,
    getOptimalRefreshInterval,
    shouldUseStaleWhileRevalidate
  }
}

import { useMemo } from 'react' // Add this import at the top