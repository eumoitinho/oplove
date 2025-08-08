"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/app/lib/supabase-browser"
import type { User } from "@/types/database.types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  signOut: () => Promise<{ success: boolean; error: string | null }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProviderDebug({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const log = (message: string, data?: any) => {
    console.log(`[AuthProvider] ${message}`, data || '')
  }

  const fetchUserProfile = useCallback(async (userId: string) => {
    log('Fetching user profile for ID:', userId)
    
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()
    
    if (error) {
      log('Error fetching profile:', error)
      return null
    }
    
    log('Profile fetched successfully:', profile)
    return profile as User
  }, [supabase])

  const refreshUser = useCallback(async () => {
    log('Refreshing user...')
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id)
      if (profile) {
        setUser(profile)
      }
    } else {
      log('No session found')
      setUser(null)
    }
  }, [supabase, fetchUserProfile])

  // Initialize auth on mount
  useEffect(() => {
    log('Initializing auth...')
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          log('Initial session found:', session.user.id)
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
          }
        } else {
          log('No initial session')
        }
      } catch (error) {
        log('Init error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [supabase, fetchUserProfile])

  // Auth state change listener
  useEffect(() => {
    log('Setting up auth state change listener...')
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log(`Auth event: ${event}`, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      log('Cleaning up auth listener')
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserProfile])

  const signIn = async (email: string, password: string) => {
    log('Signing in with email:', email)
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        log('Sign in error:', error)
        throw error
      }
      
      log('Sign in successful:', data.user?.id)
      
      // Immediately fetch user profile
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id)
        if (profile) {
          setUser(profile)
        }
      }
      
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    log('Signing out...')
    
    try {
      await supabase.auth.signOut()
      setUser(null)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

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

export function useAuthDebug() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}