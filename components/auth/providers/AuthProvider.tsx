"use client"

import { createContext, useContext, useEffect, useRef } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: ReturnType<typeof useAuthStore>["user"]
  session: ReturnType<typeof useAuthStore>["session"]
  isLoading: ReturnType<typeof useAuthStore>["isLoading"]
  isInitialized: ReturnType<typeof useAuthStore>["isInitialized"]
  isAuthenticated: boolean
  signIn: ReturnType<typeof useAuthStore>["signIn"]
  signOut: ReturnType<typeof useAuthStore>["signOut"]
  refreshSession: ReturnType<typeof useAuthStore>["refreshSession"]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Get all state and actions from the auth store
  const {
    user,
    session,
    isLoading,
    isInitialized,
    initialize,
    signIn,
    signOut,
    refreshSession
  } = useAuthStore()
  
  const router = useRouter()
  const initRef = useRef(false)
  
  // Initialize auth on mount (only once)
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    
    console.log("[AuthProvider] Triggering auth initialization")
    initialize()
  }, [initialize])
  
  // Handle navigation on sign out
  useEffect(() => {
    // Subscribe to auth store changes
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.user,
      (user, prevUser) => {
        // If user was logged in and now is not, redirect to login
        if (prevUser && !user) {
          console.log("[AuthProvider] User signed out, redirecting to login")
          router.push("/login")
        }
      }
    )
    
    return unsubscribe
  }, [router])
  
  // Clear app-specific caches when user changes
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.user,
      (user, prevUser) => {
        // If user changed (including logout)
        if (prevUser?.id !== user?.id) {
          console.log("[AuthProvider] User changed, clearing app caches")
          
          // Clear any app-specific caches
          if (typeof window !== "undefined") {
            const keysToRemove = [
              "feed-cache",
              "messages-cache", 
              "notifications-cache"
            ]
            keysToRemove.forEach(key => {
              try {
                localStorage.removeItem(key)
                sessionStorage.removeItem(key)
              } catch (e) {
                // Ignore storage errors
              }
            })
          }
        }
      }
    )
    
    return unsubscribe
  }, [])
  
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isInitialized,
    isAuthenticated: !!user && isInitialized,
    signIn,
    signOut,
    refreshSession
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}