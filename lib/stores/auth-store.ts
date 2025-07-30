import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, AuthError } from "@/types/common"

interface AuthState {
  user: User | null
  isLoading: boolean
  error: AuthError | null
  session: { access_token: string; refresh_token: string } | null
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  clearUser: () => void
  setError: (error: AuthError | null) => void
  setSession: (session: { access_token: string; refresh_token: string } | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true, // Start with loading true
      error: null,
      session: null,
      setUser: (user) => set({ user, isLoading: false, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      clearUser: () => set({ user: null, isLoading: false, error: null, session: null }),
      setError: (error) => set({ error }),
      setSession: (session) => set({ session }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, session: state.session }), // Persist session too
    },
  ),
)
