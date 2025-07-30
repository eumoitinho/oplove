"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/lib/supabase-browser"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { User } from "@/types/common"

// Hook to manage auth state without causing re-render loops
export function useAuthState() {
  const { user, isLoading, setUser, setLoading, clearUser, setSession } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    if (isInitialized) return

    const supabase = createClient()
    let mounted = true

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
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
        } else {
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

    initAuth()

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        switch (event) {
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
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
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [isInitialized, setUser, setLoading, clearUser, setSession])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isInitialized
  }
}