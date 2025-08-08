"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { createClient } from "@/app/lib/supabase-browser"
import type { User } from "@/types/common"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  signOut: () => Promise<{ success: boolean; error: string | null }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading, clearUser, setSession } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true) // Start loading immediately
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const initializationRef = useRef(false)
  const authListenerRef = useRef<any>(null)

  // Clear all app state when user changes
  const clearAllAppState = useCallback(() => {
    // Clear feed states, messages, notifications, etc.
    if (typeof window !== 'undefined') {
      // Clear any cached data in localStorage/sessionStorage related to the user
      const keysToRemove = [
        'feed-cache',
        'messages-cache',
        'notifications-cache'
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
    clearUser()
  }, [clearUser])

  // Check if session is expired
  const isSessionExpired = useCallback((session: any) => {
    if (!session || !session.expires_at) return true
    const now = Date.now() / 1000
    const buffer = 60 // 1 minute buffer
    return (session.expires_at - buffer) <= now
  }, [])

  // Refresh user profile
  const refreshUser = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("[AuthProvider] Session error:", sessionError)
        clearAllAppState()
        return
      }

      // Check if session is expired
      if (!session || isSessionExpired(session)) {
        console.log("[AuthProvider] Session expired, clearing user")
        clearAllAppState()
        return
      }
      
      if (session.user) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()
        
        if (profileError) {
          console.error("[AuthProvider] Profile fetch error:", profileError)
          clearAllAppState()
          return
        }
        
        if (profile) {
          setUser(profile as User)
          setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token
          })
        } else {
          console.error("[AuthProvider] Profile not found")
          clearAllAppState()
        }
      } else {
        clearAllAppState()
      }
    } catch (error) {
      console.error("[AuthProvider] Error refreshing user:", error)
      clearAllAppState()
    }
  }, [supabase, setUser, setSession, clearAllAppState, isSessionExpired])

  // Initialize auth on mount
  useEffect(() => {
    // Prevent double initialization
    if (initializationRef.current) return
    initializationRef.current = true

    let mounted = true

    const initializeAuth = async () => {
      if (!mounted) return
      
      console.log("[AuthProvider] Starting authentication initialization...")
      setIsLoading(true)
      setLoading(true)
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn("[AuthProvider] Session error:", error.message)
          if (mounted) {
            clearAllAppState()
            setIsLoading(false)
            setLoading(false)
            setIsInitialized(true)
          }
          return
        }
        
        // Check if session exists and is not expired
        if (session && !isSessionExpired(session) && session.user) {
          console.log("[AuthProvider] Valid session found for user:", session.user.id)
          
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()
          
          if (profileError) {
            console.error("[AuthProvider] Profile error:", profileError)
            if (mounted) {
              clearAllAppState()
              setIsLoading(false)
              setLoading(false)
              setIsInitialized(true)
            }
            return
          }
          
          if (profile && mounted) {
            console.log("[AuthProvider] Setting user:", profile.username)
            setUser(profile as User)
            setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            })
          } else if (mounted) {
            console.warn("[AuthProvider] Profile not found")
            clearAllAppState()
          }
        } else {
          console.log("[AuthProvider] No valid session found")
          if (mounted) clearAllAppState()
        }
      } catch (error) {
        console.error("[AuthProvider] Initialization error:", error)
        if (mounted) clearAllAppState()
      } finally {
        if (mounted) {
          console.log("[AuthProvider] Completing initialization...")
          setIsLoading(false)
          setLoading(false)
          setIsInitialized(true)
          console.log("[AuthProvider] Initialization complete, user:", user?.username || 'none')
          
          // Force a re-render if needed
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:initialized'))
          }
        }
      }
    }

    // Run initialization immediately
    initializeAuth()

    return () => {
      mounted = false
    }
  }, [supabase, setUser, setLoading, setSession, clearAllAppState, isSessionExpired])

  // Set up auth state change listener
  useEffect(() => {
    if (authListenerRef.current) return // Prevent duplicate listeners
    
    // Wait for initialization to complete before setting up listener
    if (!isInitialized) {
      console.log("[AuthProvider] Waiting for initialization before setting up listener")
      return
    }

    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log("[AuthProvider] Auth event:", event)

        switch (event) {
          case "SIGNED_IN":
            console.log("[AuthProvider] Processing SIGNED_IN event for user:", session?.user?.id)
            if (session?.user && !isSessionExpired(session)) {
              const { data: profile, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .single()
              
              if (error) {
                console.error("[AuthProvider] Error loading profile in SIGNED_IN:", error)
                clearAllAppState()
                return
              }
              
              if (profile && mounted) {
                console.log("[AuthProvider] Profile loaded in SIGNED_IN:", profile.username)
                setUser(profile as User)
                setSession({
                  access_token: session.access_token,
                  refresh_token: session.refresh_token
                })
                setIsLoading(false)
                setLoading(false)
                if (!isInitialized) {
                  setIsInitialized(true)
                }
                console.log("[AuthProvider] User state updated from SIGNED_IN event")
              }
            } else {
              console.log("[AuthProvider] Invalid or expired session in SIGNED_IN")
              clearAllAppState()
            }
            break
            
          case "SIGNED_OUT":
            console.log("[AuthProvider] User signed out")
            clearAllAppState()
            // Redirect to login after clearing state
            setTimeout(() => {
              router.push('/login')
            }, 100)
            break
            
          case "TOKEN_REFRESHED":
            console.log("[AuthProvider] Token refreshed")
            if (session?.user && !isSessionExpired(session)) {
              setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token
              })
            } else {
              console.log("[AuthProvider] Refreshed token is expired")
              clearAllAppState()
            }
            break
            
          case "USER_UPDATED":
            if (session?.user && !isSessionExpired(session)) {
              await refreshUser()
            } else {
              clearAllAppState()
            }
            break
        }
      }
    )

    authListenerRef.current = subscription

    return () => {
      mounted = false
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe()
        authListenerRef.current = null
      }
    }
  }, [supabase, setUser, setSession, clearAllAppState, refreshUser, router, isSessionExpired, isInitialized])

  const signIn = useCallback(async (email: string, password: string) => {
    console.log("[AuthProvider] Signing in user...")
    setIsLoading(true)
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      
      if (data.session?.user) {
        console.log("[AuthProvider] Login successful, loading profile...")
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single()
        
        if (profileError) {
          throw new Error("Failed to load user profile")
        }
        
        if (profile) {
          setUser(profile as User)
          setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          })
          console.log("[AuthProvider] User profile loaded successfully")
        }
      }
      
      return { success: true, error: null }
    } catch (error) {
      console.error("[AuthProvider] Sign in error:", error)
      return { success: false, error: (error as Error).message }
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }, [supabase, setUser, setSession, setLoading])

  const signOut = useCallback(async () => {
    console.log("[AuthProvider] Signing out user...")
    
    try {
      await supabase.auth.signOut()
      // Clear state immediately - listener will handle redirect
      clearAllAppState()
      return { success: true, error: null }
    } catch (error) {
      console.error("[AuthProvider] Sign out error:", error)
      // Even if sign out fails, clear local state
      clearAllAppState()
      return { success: false, error: (error as Error).message }
    }
  }, [supabase, clearAllAppState])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && isInitialized,
    signIn,
    signOut,
    refreshUser,
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