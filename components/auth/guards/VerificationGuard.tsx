"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Shield, ShieldCheck, AlertTriangle } from "lucide-react"
import { useAuth } from "../providers/AuthProvider"
import { Button } from "@/components/common/button"

interface VerificationGuardProps {
  children: React.ReactNode
  requireVerification?: boolean
  fallback?: React.ReactNode
  showVerificationPrompt?: boolean
}

export function VerificationGuard({
  children,
  requireVerification = true,
  fallback,
  showVerificationPrompt = true,
}: VerificationGuardProps) {
  const { user, isAuthenticated } = useAuth()

  // If not authenticated, don't show content
  if (!isAuthenticated || !user) {
    return null
  }

  // User is verified or verification not required
  if (!requireVerification || user.is_verified) {
    return <>{children}</>
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Don't show verification prompt if disabled
  if (!showVerificationPrompt) {
    return null
  }

  // Show verification prompt
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white"
      >
        <Shield className="w-8 h-8" />
      </motion.div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Verification Required</h2>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This feature requires account verification. Verify your identity to access this content and unlock additional
        features.
      </p>

      <div className="space-y-4">
        <Button
          onClick={() => (window.location.href = "/verify")}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
        >
          <ShieldCheck className="w-5 h-5 mr-2" />
          Verify Account
        </Button>

        <Button variant="outline" onClick={() => window.history.back()} className="w-full">
          Go Back
        </Button>
      </div>

      {/* Verification benefits */}
      <div className="mt-8 text-left">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification Benefits:</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
            Increased trust and credibility
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
            Access to premium features (Free plan)
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
            Participate in events and communities
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
            Enhanced profile visibility
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
            Priority customer support
          </li>
        </ul>
      </div>

      {/* Warning for free users */}
      {user.premium_type === "free" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Limited Access</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                As a free user, verification is required to access most features. Consider upgrading to a premium plan
                for unrestricted access.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Convenience component for verified-only content
export function VerifiedOnly({ children, ...props }: Omit<VerificationGuardProps, "requireVerification">) {
  return (
    <VerificationGuard requireVerification={true} {...props}>
      {children}
    </VerificationGuard>
  )
}
