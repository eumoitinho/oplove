"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../providers/AuthProvider"
import { LoadingScreen } from "@/components/common/LoadingScreen"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
  fallback?: React.ReactNode
}

export function AuthGuard({ children, redirectTo = "/login", requireAuth = true, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for initialization to complete
    if (!isInitialized) return
    
    if (requireAuth && !isAuthenticated) {
      console.log("[AuthGuard] Redirecting to login - user not authenticated")
      
      // Store the current path for redirect after login
      try {
        const currentPath = window.location.pathname + window.location.search
        if (currentPath !== "/login" && currentPath !== "/register") {
          sessionStorage.setItem("redirectAfterLogin", currentPath)
        }
      } catch (e) {
        // Ignore storage errors
      }
      
      router.push(redirectTo)
      
    } else if (!requireAuth && isAuthenticated) {
      console.log("[AuthGuard] Redirecting authenticated user away from auth page")
      
      // Redirect authenticated users away from auth pages
      let redirectPath = "/feed"
      try {
        const storedPath = sessionStorage.getItem("redirectAfterLogin")
        if (storedPath) {
          redirectPath = storedPath
          sessionStorage.removeItem("redirectAfterLogin")
        }
      } catch (e) {
        // Ignore storage errors
      }
      
      router.push(redirectPath)
    }
  }, [isInitialized, isAuthenticated, requireAuth, router, redirectTo])

  // Show loading state while auth is initializing
  if (!isInitialized || isLoading) {
    if (fallback) {
      return <>{fallback}</>
    }
    return <LoadingScreen />
  }

  // Don't render protected content if not authenticated
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // Don't render public-only content if authenticated
  if (!requireAuth && isAuthenticated) {
    return null
  }

  // Render children if all conditions are met
  return <>{children}</>
}

// Convenience components for common use cases
export function ProtectedRoute({ children, ...props }: Omit<AuthGuardProps, "requireAuth">) {
  return (
    <AuthGuard requireAuth={true} {...props}>
      {children}
    </AuthGuard>
  )
}

export function PublicRoute({ children, ...props }: Omit<AuthGuardProps, "requireAuth">) {
  return (
    <AuthGuard requireAuth={false} redirectTo="/feed" {...props}>
      {children}
    </AuthGuard>
  )
}
