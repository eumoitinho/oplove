// Re-export all auth hooks for convenient importing
export {
  useIsAuthenticated,
  useCurrentUser,
  useAuthLoading,
  useLogout,
  useRefreshAuth,
  useSupabase,
  useHasPlan,
  useIsVerified,
  useSession,
  useCanAccess,
  useDailyLimits
} from "./use-auth-helpers"

// Re-export the main auth hook from AuthProvider
export { useAuth } from "@/components/auth/providers/AuthProvider"

// Re-export the auth store for direct access when needed
export { useAuthStore } from "@/lib/stores/auth-store"