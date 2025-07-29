"use client"
import { motion } from "framer-motion"
import { Loader2, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "pulse" | "heart"
  className?: string
  text?: string
}

/**
 * Loading spinner component with OpenLove styling and animations
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" text="Carregando..." />
 * <LoadingSpinner variant="heart" />
 * <LoadingSpinner variant="dots" size="sm" />
 * ```
 */
export function LoadingSpinner({ size = "md", variant = "default", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-1", className)}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn(
              "rounded-full bg-gradient-to-r from-purple-600 to-pink-600",
              size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-5 w-5",
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.2,
            }}
          />
        ))}
        {text && <span className={cn("ml-3 text-gray-600 dark:text-gray-400", textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
        <motion.div
          className={cn("rounded-full bg-gradient-to-r from-purple-600 to-pink-600", sizeClasses[size])}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        {text && <span className={cn("text-gray-600 dark:text-gray-400", textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  if (variant === "heart") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Heart className={cn("text-purple-600 fill-current", sizeClasses[size])} />
        </motion.div>
        {text && <span className={cn("text-gray-600 dark:text-gray-400", textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center space-x-3", className)}>
      <Loader2 className={cn("animate-spin text-purple-600", sizeClasses[size])} />
      {text && <span className={cn("text-gray-600 dark:text-gray-400", textSizeClasses[size])}>{text}</span>}
    </div>
  )
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({
  text = "Carregando...",
  variant = "default",
}: {
  text?: string
  variant?: LoadingSpinnerProps["variant"]
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <LoadingSpinner size="xl" variant={variant} text={text} />
    </div>
  )
}
