"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Crown, Diamond, Heart, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export type PlanType = "free" | "gold" | "diamond" | "couple"

export interface PlanBadgeProps {
  plan: PlanType
  size?: "sm" | "md" | "lg"
  variant?: "default" | "minimal" | "icon-only"
  animated?: boolean
  className?: string
}

const planConfig = {
  free: {
    label: "Free",
    icon: null,
    colors: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    gradient: null,
  },
  gold: {
    label: "Gold",
    icon: Crown,
    colors:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    gradient: "from-yellow-400 to-yellow-600",
  },
  diamond: {
    label: "Diamond",
    icon: Diamond,
    colors: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    gradient: "from-blue-400 to-purple-600",
  },
  couple: {
    label: "Couple",
    icon: Heart,
    colors: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800",
    gradient: "from-pink-400 to-red-500",
  },
}

/**
 * Plan badge component showing user subscription status
 *
 * @example
 * ```tsx
 * <PlanBadge plan="gold" size="md" animated />
 * <PlanBadge plan="diamond" variant="icon-only" />
 * <PlanBadge plan="couple" variant="minimal" size="sm" />
 * ```
 */
export function PlanBadge({ plan, size = "md", variant = "default", animated = false, className }: PlanBadgeProps) {
  const config = planConfig[plan]
  const Icon = config.icon

  // Don't render badge for free users in minimal variant
  if (plan === "free" && variant === "minimal") {
    return null
  }

  const sizeClasses = {
    sm: {
      container: "px-2 py-1 text-xs",
      icon: "h-3 w-3",
    },
    md: {
      container: "px-3 py-1.5 text-sm",
      icon: "h-4 w-4",
    },
    lg: {
      container: "px-4 py-2 text-base",
      icon: "h-5 w-5",
    },
  }

  const currentSize = sizeClasses[size]

  if (variant === "icon-only") {
    if (!Icon || plan === "free") return null

    return (
      <motion.div
        className={cn(
          "inline-flex items-center justify-center rounded-full border",
          currentSize.container,
          config.colors,
          className,
        )}
        whileHover={animated ? { scale: 1.1 } : undefined}
        whileTap={animated ? { scale: 0.95 } : undefined}
      >
        <Icon className={currentSize.icon} />
      </motion.div>
    )
  }

  const badgeContent = (
    <>
      {Icon && <Icon className={cn(currentSize.icon, variant === "default" ? "mr-1.5" : "mr-1")} />}
      {variant === "default" && config.label}
    </>
  )

  if (config.gradient && plan !== "free") {
    return (
      <motion.div
        className={cn(
          "inline-flex items-center rounded-full bg-gradient-to-r text-white font-medium shadow-sm",
          `bg-gradient-to-r ${config.gradient}`,
          currentSize.container,
          className,
        )}
        whileHover={animated ? { scale: 1.05 } : undefined}
        whileTap={animated ? { scale: 0.95 } : undefined}
      >
        {badgeContent}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.colors,
        currentSize.container,
        className,
      )}
      whileHover={animated ? { scale: 1.05 } : undefined}
      whileTap={animated ? { scale: 0.95 } : undefined}
    >
      {badgeContent}
    </motion.div>
  )
}

/**
 * Plan upgrade prompt component
 */
export function PlanUpgradePrompt({
  currentPlan,
  onUpgrade,
}: {
  currentPlan: PlanType
  onUpgrade: () => void
}) {
  if (currentPlan !== "free") return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Desbloqueie recursos premium</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Acesse mensagens, stories e muito mais!</p>
          </div>
        </div>
        <Button size="sm" onClick={onUpgrade}>
          Upgrade
        </Button>
      </div>
    </motion.div>
  )
}
