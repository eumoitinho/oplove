import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, AuthError } from "@/types/common"

interface AuthState {
  user: User | null
  isLoading: boolean
  error: AuthError | null
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  clearUser: () => void
  setError: (error: AuthError | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      clearUser: () => set({ user: null, isLoading: false, error: null }),
      setError: (error) => set({ error }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
