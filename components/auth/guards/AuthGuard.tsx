"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
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
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)
  const redirectTimeoutRef = useRef<NodeJS.Timeout>()
  const loadingTimeoutRef = useRef<NodeJS.Timeout>()
  const [forceShowContent, setForceShowContent] = useState(false)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  // Emergency timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn("[AuthGuard] Emergency timeout - forcing content display")
        setForceShowContent(true)
      }, 5000) // 5 seconds emergency timeout
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      setForceShowContent(false)
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [isLoading])
  
  // Listen for auth initialization event
  useEffect(() => {
    const handleAuthInitialized = () => {
      console.log("[AuthGuard] Auth initialized event received")
      setForceShowContent(false)
      // Clear any existing timeouts
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
    
    window.addEventListener('auth:initialized', handleAuthInitialized)
    
    return () => {
      window.removeEventListener('auth:initialized', handleAuthInitialized)
    }
  }, [])

  // Handle redirects with debouncing
  useEffect(() => {
    // Don't redirect if already redirected or still loading (unless emergency timeout)
    if (hasRedirected || (isLoading && !forceShowContent)) {
      return
    }

    // Clear any existing redirect timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }

    // Debounce redirects to prevent race conditions
    redirectTimeoutRef.current = setTimeout(() => {
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
        
        setHasRedirected(true)
        router.push(redirectTo)
        
      } else if (!requireAuth && isAuthenticated) {
        console.log("[AuthGuard] Redirecting authenticated user to feed")
        
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
        
        setHasRedirected(true)
        router.push(redirectPath)
      }
    }, 100) // 100ms debounce

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, router, redirectTo, hasRedirected, forceShowContent])

  // Show loading state only when actually loading and not forced
  if (isLoading && !forceShowContent) {
    if (fallback) {
      return <>{fallback}</>
    }

    return <LoadingScreen />
  }

  // Show content based on auth requirements
  if (requireAuth && !isAuthenticated && !forceShowContent) {
    return null // Will redirect
  }

  if (!requireAuth && isAuthenticated && !forceShowContent) {
    return null // Will redirect
  }

  // Show children if conditions are met or emergency timeout occurred
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
