import { create } from "zustand"
import { persist, subscribeWithSelector } from "zustand/middleware"
import type { User } from "@/types/database.types"
import { createSingletonClient, clearSingletonClient } from "@/lib/supabase-singleton"
import type { Session } from "@supabase/supabase-js"

interface AuthState {
  // Core state
  user: User | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  signOut: () => Promise<{ success: boolean; error: string | null }>
  refreshSession: () => Promise<void>
  clearAll: () => void
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        session: null,
        isLoading: true, // Start loading
        isInitialized: false,
        error: null,

        // Initialize auth state from Supabase
        initialize: async () => {
          const state = get()
          
          // Prevent double initialization
          if (state.isInitialized) {
            console.log('[AuthStore] Already initialized, skipping')
            return
          }

          console.log('[AuthStore] Initializing auth state...')
          set({ isLoading: true, error: null })

          try {
            const supabase = createSingletonClient()
            
            // Get current session
            const { data: { session }, error } = await supabase.auth.getSession()
            
            if (error) {
              console.error('[AuthStore] Session error:', error)
              set({ 
                user: null, 
                session: null, 
                isLoading: false, 
                isInitialized: true,
                error: error.message 
              })
              return
            }

            if (session?.user) {
              console.log('[AuthStore] Session found, fetching user profile...')
              
              // Fetch full user profile
              const { data: profile, error: profileError } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .single()

              if (profileError) {
                console.error('[AuthStore] Profile error:', profileError)
                set({ 
                  user: null, 
                  session: null, 
                  isLoading: false, 
                  isInitialized: true,
                  error: 'Failed to load profile' 
                })
                return
              }

              console.log('[AuthStore] User profile loaded:', profile?.username)
              set({ 
                user: profile as User, 
                session,
                isLoading: false, 
                isInitialized: true,
                error: null 
              })
            } else {
              console.log('[AuthStore] No session found')
              set({ 
                user: null, 
                session: null, 
                isLoading: false, 
                isInitialized: true,
                error: null 
              })
            }
          } catch (error) {
            console.error('[AuthStore] Initialization error:', error)
            set({ 
              user: null, 
              session: null, 
              isLoading: false, 
              isInitialized: true,
              error: error instanceof Error ? error.message : 'Unknown error' 
            })
          }
        },

        // Set user
        setUser: (user) => {
          console.log('[AuthStore] Setting user:', user?.username)
          set({ user, error: null })
        },

        // Set session
        setSession: (session) => {
          console.log('[AuthStore] Setting session:', session?.user?.id)
          set({ session, error: null })
        },

        // Set loading
        setLoading: (isLoading) => {
          set({ isLoading })
        },

        // Set error
        setError: (error) => {
          set({ error })
        },

        // Sign in
        signIn: async (email: string, password: string) => {
          console.log('[AuthStore] Signing in...')
          set({ isLoading: true, error: null })

          try {
            const supabase = createSingletonClient()
            
            const { data, error } = await supabase.auth.signInWithPassword({ 
              email, 
              password 
            })

            if (error) {
              console.error('[AuthStore] Sign in error:', error)
              set({ isLoading: false, error: error.message })
              return { success: false, error: error.message }
            }

            if (data.session?.user) {
              // Fetch full user profile
              const { data: profile, error: profileError } = await supabase
                .from("users")
                .select("*")
                .eq("id", data.session.user.id)
                .single()

              if (profileError) {
                console.error('[AuthStore] Profile fetch error:', profileError)
                set({ isLoading: false, error: 'Failed to load profile' })
                return { success: false, error: 'Failed to load profile' }
              }

              console.log('[AuthStore] Sign in successful:', profile?.username)
              set({ 
                user: profile as User, 
                session: data.session,
                isLoading: false, 
                isInitialized: true,
                error: null 
              })

              return { success: true, error: null }
            }

            set({ isLoading: false })
            return { success: false, error: 'No session returned' }
          } catch (error) {
            console.error('[AuthStore] Sign in exception:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            set({ isLoading: false, error: errorMessage })
            return { success: false, error: errorMessage }
          }
        },

        // Sign out
        signOut: async () => {
          console.log('[AuthStore] Signing out...')
          set({ isLoading: true, error: null })

          try {
            const supabase = createSingletonClient()
            const { error } = await supabase.auth.signOut()

            if (error) {
              console.error('[AuthStore] Sign out error:', error)
              // Clear state anyway
              get().clearAll()
              return { success: false, error: error.message }
            }

            console.log('[AuthStore] Sign out successful')
            get().clearAll()
            return { success: true, error: null }
          } catch (error) {
            console.error('[AuthStore] Sign out exception:', error)
            // Clear state anyway
            get().clearAll()
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
          }
        },

        // Refresh session
        refreshSession: async () => {
          console.log('[AuthStore] Refreshing session...')
          
          try {
            const supabase = createSingletonClient()
            
            const { data: { session }, error } = await supabase.auth.refreshSession()
            
            if (error) {
              console.error('[AuthStore] Refresh error:', error)
              set({ session: null, user: null, error: error.message })
              return
            }

            if (session) {
              // Fetch updated user profile
              const { data: profile } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .single()

              if (profile) {
                console.log('[AuthStore] Session refreshed:', profile.username)
                set({ 
                  user: profile as User, 
                  session,
                  error: null 
                })
              }
            } else {
              set({ session: null, user: null })
            }
          } catch (error) {
            console.error('[AuthStore] Refresh exception:', error)
            set({ error: error instanceof Error ? error.message : 'Unknown error' })
          }
        },

        // Clear all state
        clearAll: () => {
          console.log('[AuthStore] Clearing all state')
          set({ 
            user: null, 
            session: null, 
            isLoading: false, 
            isInitialized: false,
            error: null 
          })
          
          // Clear the Supabase client to ensure clean state
          clearSingletonClient()
        }
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ 
          user: state.user,
          session: state.session
          // Don't persist loading or error states
        }),
        version: 2, // Increment version for migration
        migrate: (persistedState: any, version: number) => {
          console.log('[AuthStore] Migrating from version:', version)
          
          // Clear old state structure
          if (version < 2) {
            return {
              user: null,
              session: null
            }
          }
          
          return persistedState
        }
      }
    )
  )
)

// Set up global event listeners for Supabase auth changes
if (typeof window !== 'undefined') {
  // Listen for Supabase auth events
  window.addEventListener('supabase:auth-changed', async (event: any) => {
    const { event: authEvent, session } = event.detail
    const store = useAuthStore.getState()
    
    console.log('[AuthStore] Received auth event:', authEvent)
    
    switch (authEvent) {
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
      case 'USER_UPDATED':
        if (session?.user) {
          store.setSession(session)
          
          // Fetch updated profile
          const supabase = createSingletonClient()
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()
          
          if (profile) {
            store.setUser(profile as User)
          }
        }
        break
        
      case 'SIGNED_OUT':
        store.clearAll()
        break
    }
  })
  
  // Initialize on load
  if (typeof document !== 'undefined' && document.readyState !== 'loading') {
    useAuthStore.getState().initialize()
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      useAuthStore.getState().initialize()
    })
  }
}