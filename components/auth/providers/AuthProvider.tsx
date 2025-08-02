"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { createClient } from "@/app/lib/supabase-browser"
import type { User } from "@/types/common"

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
  const { user, isLoading, setUser, setLoading, clearUser, setSession } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = createClient()

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()
        
        if (profile) {
          setUser(profile as User)
          setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token
          })
        }
      } else {
        clearUser()
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      clearUser()
    }
  }, [supabase, setUser, setSession, clearUser])

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      if (!mounted) return
      
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()
          
          if (profile && mounted) {
            setUser(profile as User)
            setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            })
          }
        } else if (mounted) {
          clearUser()
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          clearUser()
        }
      } finally {
        if (mounted) {
          setLoading(false)
          setIsInitialized(true)
        }
      }
    }

    if (!isInitialized) {
      initializeAuth()
    }

    return () => {
      mounted = false
    }
  }, [isInitialized, setLoading, setUser, clearUser, setSession])

  // Set up auth state change listener
  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log("Auth event:", event)

        switch (event) {
          case "SIGNED_IN":
            if (session?.user) {
              const { data: profile } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .single()
              
              if (profile && mounted) {
                setUser(profile as User)
                setSession({
                  access_token: session.access_token,
                  refresh_token: session.refresh_token
                })
              }
            }
            break
          case "SIGNED_OUT":
            clearUser()
            break
          case "TOKEN_REFRESHED":
            console.log("Token refreshed")
            break
          case "USER_UPDATED":
            if (session?.user) {
              await refreshUser()
            }
            break
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser, clearUser, setSession, refreshUser])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      
      // Immediately fetch user profile after successful login
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single()
        
        if (profile) {
          setUser(profile as User)
          setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          })
        }
      }
      
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }, [supabase, setUser, setSession, setLoading])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }, [supabase])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
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