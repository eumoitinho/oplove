import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types/database.types"

// Define AuthError locally for now
interface AuthError {
  message: string
  statusCode?: number
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: AuthError | null
  session: { access_token: string; refresh_token: string; expires_at?: number } | null
  lastAuthCheck: number | null
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  clearUser: () => void
  setError: (error: AuthError | null) => void
  setSession: (session: { access_token: string; refresh_token: string; expires_at?: number } | null) => void
  updateLastAuthCheck: () => void
  isSessionExpired: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false, // Start with loading false
      error: null,
      session: null,
      lastAuthCheck: null,
      
      setUser: (user) => {
        console.log("[AuthStore] Setting user:", user?.id, "Username:", user?.username)
        set({ 
          user, 
          isLoading: false, 
          error: null, 
          lastAuthCheck: Date.now() 
        })
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      clearUser: () => {
        // Clear all user-related state
        set({ 
          user: null, 
          isLoading: false, 
          error: null, 
          session: null,
          lastAuthCheck: null
        })
        
        // Also clear any app-level caches
        if (typeof window !== 'undefined') {
          try {
            // Dispatch custom event to clear app state
            window.dispatchEvent(new CustomEvent('auth:signed-out'))
          } catch (e) {
            // Ignore errors
          }
        }
      },
      
      setError: (error) => set({ error }),
      
      setSession: (session) => set({ 
        session,
        lastAuthCheck: Date.now()
      }),
      
      updateLastAuthCheck: () => set({ lastAuthCheck: Date.now() }),
      
      isSessionExpired: () => {
        const state = get()
        if (!state.session) return true
        
        // Check if session has explicit expiry
        if (state.session.expires_at) {
          const now = Date.now() / 1000
          const buffer = 60 // 1 minute buffer
          return (state.session.expires_at - buffer) <= now
        }
        
        // Fallback: check if last auth check was more than 1 hour ago
        if (state.lastAuthCheck) {
          const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
          return (Date.now() - state.lastAuthCheck) > oneHour
        }
        
        return false
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user, 
        session: state.session,
        lastAuthCheck: state.lastAuthCheck
        // Never persist isLoading or error - they should always start fresh
      }),
      version: 1, // Version for migrations if needed
      migrate: (persistedState: any, version: number) => {
        // Handle migration from old state structure
        if (version === 0) {
          return {
            ...persistedState,
            lastAuthCheck: null
          }
        }
        return persistedState
      }
    },
  ),
)
