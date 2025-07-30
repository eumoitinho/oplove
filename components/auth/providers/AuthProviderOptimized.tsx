"use client"

import { createContext, useContext, useCallback } from "react"
import { useAuthState } from "@/hooks/useAuthState"
import { createClient } from "@/app/lib/supabase-browser"
import { useAuthStore } from "@/lib/stores/auth-store"
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

export function AuthProviderOptimized({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuthState()
  const { setUser, setLoading, clearUser, setSession } = useAuthStore()
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
  }, [supabase, setUser, setLoading, setSession])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      clearUser()
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }, [supabase, clearUser])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
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