"use client"

import { useEffect, useCallback } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { supabase } from "@/lib/supabase"
import type { User, AuthError } from "@/types/common"

/**
 * Authentication hook for OpenLove platform
 *
 * Provides authentication state management, login/logout functionality,
 * and automatic session handling with Supabase integration.
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { user, isLoading, signIn, signOut } = useAuth()
 *
 *   const handleLogin = async () => {
 *     const result = await signIn(email, password)
 *     if (!result.success) {
 *       console.error(result.error)
 *     }
 *   }
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (user) return <Dashboard />
 *   return <LoginForm onSubmit={handleLogin} />
 * }
 * ```
 *
 * @returns Authentication state and methods
 */
export function useAuth() {
  const { user, isLoading, setUser, setLoading, clearUser, setError } = useAuthStore()

  /**
   * Initialize authentication state and listen for changes
   */
  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      if (!mounted) return

      setLoading(true)
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) throw error

        if (session?.user && mounted) {
          // Fetch complete user profile
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select(`
              *,
              premium_subscription:premium_subscriptions(
                plan_type,
                status,
                expires_at
              )
            `)
            .eq("id", session.user.id)
            .single()

          if (profileError) throw profileError
          if (profile && mounted) {
            setUser(profile as User)
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
        if (mounted) {
          setError(error as AuthError)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      try {
        if (event === "SIGNED_IN" && session?.user) {
          const { data: profile, error } = await supabase
            .from("users")
            .select(`
                *,
                premium_subscription:premium_subscriptions(
                  plan_type,
                  status,
                  expires_at
                )
              `)
            .eq("id", session.user.id)
            .single()

          if (error) throw error
          if (profile && mounted) {
            setUser(profile as User)
          }
        } else if (event === "SIGNED_OUT") {
          clearUser()
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          // Update user data on token refresh
          const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (profile && mounted) {
            setUser(profile as User)
          }
        }
      } catch (error) {
        console.error("Auth state change error:", error)
        if (mounted) {
          setError(error as AuthError)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setLoading, clearUser, setError])

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setError(null)

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        })

        if (error) throw error

        return { success: true, error: null }
      } catch (error) {
        const authError = error as AuthError
        setError(authError)
        return {
          success: false,
          error: authError.message || "Erro ao fazer login",
        }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError],
  )

  /**
   * Sign up with email, password and user data
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      userData: {
        username: string
        full_name: string
        birth_date: string
      },
    ) => {
      setLoading(true)
      setError(null)

      try {
        // Check if username is available
        const { data: existingUser } = await supabase
          .from("users")
          .select("username")
          .eq("username", userData.username.toLowerCase())
          .single()

        if (existingUser) {
          throw new Error("Nome de usuário já está em uso")
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: {
              username: userData.username.toLowerCase(),
              full_name: userData.full_name,
            },
          },
        })

        if (error) throw error

        if (data.user) {
          // Create user profile
          const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            email: email.toLowerCase().trim(),
            username: userData.username.toLowerCase(),
            full_name: userData.full_name,
            birth_date: userData.birth_date,
            premium_type: "free",
            is_verified: false,
            created_at: new Date().toISOString(),
          })

          if (profileError) throw profileError
        }

        return {
          success: true,
          error: null,
          needsVerification: !data.session,
        }
      } catch (error) {
        const authError = error as AuthError
        setError(authError)
        return {
          success: false,
          error: authError.message || "Erro ao criar conta",
        }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError],
  )

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      clearUser()
      return { success: true, error: null }
    } catch (error) {
      const authError = error as AuthError
      setError(authError)
      return {
        success: false,
        error: authError.message || "Erro ao fazer logout",
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearUser, setError])

  /**
   * Reset password via email
   */
  const resetPassword = useCallback(
    async (email: string) => {
      setLoading(true)
      setError(null)

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (error) throw error

        return { success: true, error: null }
      } catch (error) {
        const authError = error as AuthError
        setError(authError)
        return {
          success: false,
          error: authError.message || "Erro ao enviar email de recuperação",
        }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError],
  )

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return { success: false, error: "Usuário não autenticado" }

      setLoading(true)

      try {
        const { error } = await supabase.from("users").update(updates).eq("id", user.id)

        if (error) throw error

        // Update local state
        setUser({ ...user, ...updates })

        return { success: true, error: null }
      } catch (error) {
        const authError = error as AuthError
        setError(authError)
        return {
          success: false,
          error: authError.message || "Erro ao atualizar perfil",
        }
      } finally {
        setLoading(false)
      }
    },
    [user, setUser, setLoading, setError],
  )

  return {
    // State
    user,
    isLoading,
    isAuthenticated: !!user,

    // Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }
}
