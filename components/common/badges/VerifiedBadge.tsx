"use client"
import { motion } from "framer-motion"
import { CheckCircle, Shield, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export type VerificationType = "identity" | "business" | "creator" | "none"

export interface VerifiedBadgeProps {
  type: VerificationType
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  animated?: boolean
  className?: string
}

const verificationConfig = {
  identity: {
    label: "Verificado",
    icon: CheckCircle,
    colors: "text-blue-600 dark:text-blue-400",
    description: "Identidade verificada",
  },
  business: {
    label: "Empresa",
    icon: Shield,
    colors: "text-green-600 dark:text-green-400",
    description: "Perfil empresarial verificado",
  },
  creator: {
    label: "Criador",
    icon: Star,
    colors: "text-purple-600 dark:text-purple-400",
    description: "Criador de conteúdo verificado",
  },
}

/**
 * Verification badge component for user status
 *
 * @example
 * ```tsx
 * <VerifiedBadge type="identity" size="md" showLabel />
 * <VerifiedBadge type="business" animated />
 * <VerifiedBadge type="creator" size="sm" />
 * ```
 */
export function VerifiedBadge({
  type,
  size = "md",
  showLabel = false,
  animated = false,
  className,
}: VerifiedBadgeProps) {
  if (type === "none") return null

  const config = verificationConfig[type]
  const Icon = config.icon

  const sizeClasses = {
    sm: {
      icon: "h-4 w-4",
      text: "text-xs",
      container: "space-x-1",
    },
    md: {
      icon: "h-5 w-5",
      text: "text-sm",
      container: "space-x-1.5",
    },
    lg: {
      icon: "h-6 w-6",
      text: "text-base",
      container: "space-x-2",
    },
  }

  const currentSize = sizeClasses[size]

  return (
    <motion.div
      className={cn("inline-flex items-center", currentSize.container, className)}
      whileHover={animated ? { scale: 1.1 } : undefined}
      title={config.description}
    >
      <motion.div
        animate={
          animated
            ? {
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1],
              }
            : undefined
        }
        transition={
          animated
            ? {
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3,
              }
            : undefined
        }
      >
        <Icon className={cn(currentSize.icon, config.colors, "fill-current")} />
      </motion.div>

      {showLabel && <span className={cn("font-medium", config.colors, currentSize.text)}>{config.label}</span>}
    </motion.div>
  )
}

/**
 * Verification status component with detailed info
 */
export function VerificationStatus({
  type,
  verifiedAt,
}: {
  type: VerificationType
  verifiedAt?: string
}) {
  if (type === "none") {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Não verificado</span>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Complete a verificação para ganhar credibilidade
        </p>
      </div>
    )
  }

  const config = verificationConfig[type]
  const Icon = config.icon

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-green-600 dark:text-green-400 fill-current" />
        <span className="text-sm font-medium text-green-800 dark:text-green-300">{config.label}</span>
      </div>
      <p className="mt-1 text-xs text-green-600 dark:text-green-400">
        {config.description}
        {verifiedAt && ` • Verificado em ${new Date(verifiedAt).toLocaleDateString("pt-BR")}`}
      </p>
    </div>
  )
}
