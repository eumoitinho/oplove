import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { createSingletonClient } from "@/lib/supabase-singleton"

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { user, isInitialized } = useAuthStore()
  return isInitialized && !!user
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { user, isInitialized } = useAuthStore()
  return isInitialized ? user : null
}

/**
 * Hook to get auth loading state
 */
export function useAuthLoading() {
  const { isLoading, isInitialized } = useAuthStore()
  return !isInitialized || isLoading
}

/**
 * Hook to handle logout with redirect
 */
export function useLogout() {
  const { signOut } = useAuthStore()
  const router = useRouter()
  
  return useCallback(async () => {
    const result = await signOut()
    if (result.success) {
      router.push("/login")
    }
    return result
  }, [signOut, router])
}

/**
 * Hook to refresh current session
 */
export function useRefreshAuth() {
  const { refreshSession } = useAuthStore()
  return refreshSession
}

/**
 * Hook to get Supabase client with auth context
 */
export function useSupabase() {
  return createSingletonClient()
}

/**
 * Hook to check if user has a specific plan
 */
export function useHasPlan(requiredPlan: "free" | "gold" | "diamond" | "couple") {
  const user = useCurrentUser()
  
  if (!user) return false
  
  const planHierarchy = {
    free: 0,
    gold: 1,
    diamond: 2,
    couple: 2
  }
  
  const userPlanLevel = planHierarchy[user.premium_type || "free"]
  const requiredPlanLevel = planHierarchy[requiredPlan]
  
  return userPlanLevel >= requiredPlanLevel
}

/**
 * Hook to check if user is verified
 */
export function useIsVerified() {
  const user = useCurrentUser()
  return user?.is_verified || false
}

/**
 * Hook to get user's session
 */
export function useSession() {
  const { session, isInitialized } = useAuthStore()
  return isInitialized ? session : null
}

/**
 * Hook to check if user can access a feature
 */
export function useCanAccess(feature: "messages" | "stories" | "groups" | "events" | "monetization") {
  const user = useCurrentUser()
  const isVerified = useIsVerified()
  
  if (!user) return false
  
  const plan = user.premium_type || "free"
  
  switch (feature) {
    case "messages":
      return plan !== "free"
      
    case "stories":
      if (plan === "free") return isVerified
      return true
      
    case "groups":
      return plan === "diamond" || plan === "couple"
      
    case "events":
      if (plan === "gold") return isVerified
      return plan === "diamond" || plan === "couple"
      
    case "monetization":
      return (plan === "diamond" || plan === "couple") && isVerified
      
    default:
      return false
  }
}

/**
 * Hook to get daily limits for features
 */
export function useDailyLimits() {
  const user = useCurrentUser()
  const isVerified = useIsVerified()
  
  if (!user) {
    return {
      messages: 0,
      stories: 0,
      events: 0
    }
  }
  
  const plan = user.premium_type || "free"
  
  switch (plan) {
    case "free":
      return {
        messages: 0,
        stories: isVerified ? 3 : 0,
        events: 0
      }
      
    case "gold":
      return {
        messages: isVerified ? Infinity : 10,
        stories: isVerified ? 10 : 5,
        events: isVerified ? Infinity : 3
      }
      
    case "diamond":
    case "couple":
      return {
        messages: Infinity,
        stories: isVerified ? Infinity : 10,
        events: Infinity
      }
      
    default:
      return {
        messages: 0,
        stories: 0,
        events: 0
      }
  }
}