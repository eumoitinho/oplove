"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useAuth } from "../providers/AuthProvider"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
  fallback?: React.ReactNode
}

export function AuthGuard({ children, redirectTo = "/auth/login", requireAuth = true, fallback }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Store the current path for redirect after login
        const currentPath = window.location.pathname + window.location.search
        if (currentPath !== "/auth/login" && currentPath !== "/auth/register") {
          sessionStorage.setItem("redirectAfterLogin", currentPath)
        }
        router.push(redirectTo)
      } else if (!requireAuth && isAuthenticated) {
        // Redirect authenticated users away from auth pages
        const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/feed"
        sessionStorage.removeItem("redirectAfterLogin")
        router.push(redirectPath)
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, router, redirectTo])

  // Show loading state
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading...</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your session</p>
        </motion.div>
      </div>
    )
  }

  // Show content based on auth requirements
  if (requireAuth && !isAuthenticated) {
    return null // Will redirect
  }

  if (!requireAuth && isAuthenticated) {
    return null // Will redirect
  }

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
