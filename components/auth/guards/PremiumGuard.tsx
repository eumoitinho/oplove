"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Crown, Lock, Sparkles } from "lucide-react"
import { useAuth } from "../providers/AuthProvider"
import { Button } from "@/components/common/button"
import type { PremiumPlan } from "@/types/common"

interface PremiumGuardProps {
  children: React.ReactNode
  requiredPlan: PremiumPlan
  fallback?: React.ReactNode
  showUpgrade?: boolean
}

const planHierarchy: Record<PremiumPlan, number> = {
  free: 0,
  gold: 1,
  diamond: 2,
  couple: 3,
}

const planNames: Record<PremiumPlan, string> = {
  free: "Free",
  gold: "Gold",
  diamond: "Diamond",
  couple: "Couple",
}

const planColors: Record<PremiumPlan, string> = {
  free: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  diamond: "from-blue-400 to-purple-600",
  couple: "from-pink-400 to-red-600",
}

const planIcons: Record<PremiumPlan, React.ReactNode> = {
  free: <Lock className="w-6 h-6" />,
  gold: <Crown className="w-6 h-6" />,
  diamond: <Sparkles className="w-6 h-6" />,
  couple: (
    <div className="flex">
      <Crown className="w-5 h-5" />
      <Crown className="w-5 h-5 -ml-2" />
    </div>
  ),
}

export function PremiumGuard({ children, requiredPlan, fallback, showUpgrade = true }: PremiumGuardProps) {
  const { user, isAuthenticated } = useAuth()

  // If not authenticated, don't show premium content
  if (!isAuthenticated || !user) {
    return null
  }

  const userPlanLevel = planHierarchy[user.premium_type]
  const requiredPlanLevel = planHierarchy[requiredPlan]

  // User has sufficient plan level
  if (userPlanLevel >= requiredPlanLevel) {
    return <>{children}</>
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Don't show upgrade prompt if disabled
  if (!showUpgrade) {
    return null
  }

  // Show upgrade prompt
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
        className={`w-16 h-16 bg-gradient-to-r ${planColors[requiredPlan]} rounded-full flex items-center justify-center mx-auto mb-6 text-white`}
      >
        {planIcons[requiredPlan]}
      </motion.div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{planNames[requiredPlan]} Plan Required</h2>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This feature is exclusive to {planNames[requiredPlan]} members. Upgrade your plan to unlock this and many other
        premium features.
      </p>

      <div className="space-y-4">
        <Button
          onClick={() => (window.location.href = "/premium")}
          className={`w-full bg-gradient-to-r ${planColors[requiredPlan]} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]`}
        >
          Upgrade to {planNames[requiredPlan]}
        </Button>

        <Button variant="outline" onClick={() => window.history.back()} className="w-full">
          Go Back
        </Button>
      </div>

      {/* Feature highlights based on plan */}
      <div className="mt-8 text-left">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {planNames[requiredPlan]} Features Include:
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {requiredPlan === "gold" && (
            <>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                Unlimited messaging
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                Video uploads
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                Audio messages
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                Create events
              </li>
            </>
          )}
          {requiredPlan === "diamond" && (
            <>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                All Gold features
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                Stories
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                Voice & video calls
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                Create groups
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                Priority support
              </li>
            </>
          )}
          {requiredPlan === "couple" && (
            <>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-3" />
                All Diamond features
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-3" />
                Shared couple profile
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-3" />
                Couple activities
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-3" />
                Relationship tools
              </li>
            </>
          )}
        </ul>
      </div>
    </motion.div>
  )
}

// Convenience components for specific plans
export function GoldGuard({ children, ...props }: Omit<PremiumGuardProps, "requiredPlan">) {
  return (
    <PremiumGuard requiredPlan="gold" {...props}>
      {children}
    </PremiumGuard>
  )
}

export function DiamondGuard({ children, ...props }: Omit<PremiumGuardProps, "requiredPlan">) {
  return (
    <PremiumGuard requiredPlan="diamond" {...props}>
      {children}
    </PremiumGuard>
  )
}

export function CoupleGuard({ children, ...props }: Omit<PremiumGuardProps, "requiredPlan">) {
  return (
    <PremiumGuard requiredPlan="couple" {...props}>
      {children}
    </PremiumGuard>
  )
}
