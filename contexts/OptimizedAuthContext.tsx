"use client"

import { createContext, useContext, useMemo, useCallback, ReactNode } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { User } from "@/types/common"

interface OptimizedAuthContextType {
  // User data
  user: User | null
  userId: string | null
  
  // Auth state
  isAuthenticated: boolean
  isLoading: boolean
  
  // User properties for optimization
  userPlan: "free" | "gold" | "diamond" | "couple"
  isVerified: boolean
  
  // Stable functions
  refreshUser: () => Promise<void>
  signOut: () => Promise<{ success: boolean; error: string | null }>
}

const OptimizedAuthContext = createContext<OptimizedAuthContextType | undefined>(undefined)

export function OptimizedAuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, refreshUser: storeRefreshUser } = useAuthStore()
  
  // Memoize derived values to prevent unnecessary recalculations
  const userId = useMemo(() => user?.id || null, [user?.id])
  const isAuthenticated = useMemo(() => !!user, [!!user])
  const userPlan = useMemo(() => user?.premium_type || "free", [user?.premium_type])
  const isVerified = useMemo(() => user?.is_verified || false, [user?.is_verified])
  
  // Memoize functions to maintain referential equality
  const refreshUser = useCallback(async () => {
    await storeRefreshUser()
  }, [storeRefreshUser])
  
  const signOut = useCallback(async () => {
    // Implementation from AuthProvider
    return { success: true, error: null }
  }, [])
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<OptimizedAuthContextType>(() => ({
    user,
    userId,
    isAuthenticated,
    isLoading,
    userPlan,
    isVerified,
    refreshUser,
    signOut
  }), [user, userId, isAuthenticated, isLoading, userPlan, isVerified, refreshUser, signOut])
  
  return (
    <OptimizedAuthContext.Provider value={contextValue}>
      {children}
    </OptimizedAuthContext.Provider>
  )
}

export function useOptimizedAuth() {
  const context = useContext(OptimizedAuthContext)
  if (context === undefined) {
    throw new Error("useOptimizedAuth must be used within an OptimizedAuthProvider")
  }
  return context
}

// Specific hooks for common use cases to prevent unnecessary re-renders
export function useUserId() {
  const { userId } = useOptimizedAuth()
  return userId
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useOptimizedAuth()
  return isAuthenticated
}

export function useUserPlan() {
  const { userPlan } = useOptimizedAuth()
  return userPlan
}

export function useIsVerified() {
  const { isVerified } = useOptimizedAuth()
  return isVerified
}