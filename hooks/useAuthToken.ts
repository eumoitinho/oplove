"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { createClient } from "@/app/lib/supabase-browser"

// Hook to get auth tokens for API calls
export function useAuthToken() {
  const { session } = useAuthStore()
  
  const getAccessToken = async () => {
    // If we have a token in store, return it
    if (session?.access_token) {
      return session.access_token
    }
    
    // Otherwise, verify user and get session
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    
    return currentSession?.access_token || null
  }
  
  const getHeaders = async () => {
    const token = await getAccessToken()
    
    if (!token) {
      return {}
    }
    
    return {
      Authorization: `Bearer ${token}`
    }
  }
  
  return {
    getAccessToken,
    getHeaders,
    session
  }
}