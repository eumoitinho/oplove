"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { supabase } from "@/lib/supabase"
import type { User } from "@/types/common"

export function useAuth() {
  const { user, isLoading, setUser, setLoading, clearUser } = useAuthStore()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (profile) {
            setUser(profile as User)
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (profile) {
          setUser(profile as User)
        }
      } else if (event === "SIGNED_OUT") {
        clearUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, clearUser])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          username,
        })

        if (profileError) throw profileError
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      clearUser()
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  }
}
