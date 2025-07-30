"use client"

import { useEffect, useCallback } from "react"

import { useAuthStore } from "@/lib/stores/auth-store"
import { createClient } from "@/app/lib/supabase-browser"
import type { User } from "@/types/common"
import { TimelineCacheService } from "@/lib/cache/timeline-cache"
import { ProfileCacheService } from "@/lib/cache/profile-cache"

export function useAuth() {
  const { user, isLoading, setUser, setLoading, clearUser } = useAuthStore()
  
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()
          
          if (profile && mounted) {
            setUser(profile as User)
          }
        }
      } catch (error) {
        console.error("Auth error:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === "SIGNED_OUT") {
        clearUser()
      } else if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()
        
        if (profile && mounted) {
          setUser(profile as User)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      // Clear user caches before signing out
      if (user?.id) {
        await Promise.allSettled([
          TimelineCacheService.invalidateUserTimeline(user.id),
          ProfileCacheService.invalidateUserCaches(user.id)
        ])
      }
      
      await supabase.auth.signOut()
      clearUser()
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Cache invalidation helpers
  const invalidateUserCache = useCallback(async () => {
    if (user?.id) {
      await Promise.allSettled([
        TimelineCacheService.invalidateUserTimeline(user.id),
        ProfileCacheService.invalidateUserCaches(user.id)
      ])
    }
  }, [user?.id])

  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    if (!user?.id) return { success: false, error: 'User not found' }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setUser({ ...user, ...updates })

      // Invalidate caches
      await invalidateUserCache()

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }, [user, supabase, setUser, invalidateUserCache])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    updateUserProfile,
    invalidateUserCache,
  }
}