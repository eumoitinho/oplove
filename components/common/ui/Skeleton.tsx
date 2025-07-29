"use client"

import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rectangular" | "text"
  width?: string | number
  height?: string | number
  lines?: number
  animate?: boolean
}

/**
 * Skeleton loading component with OpenLove styling
 *
 * @example
 * ```tsx
 * // Basic skeleton
 * <Skeleton className="h-4 w-32" />
 *
 * // Circular avatar skeleton
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * // Text skeleton with multiple lines
 * <Skeleton variant="text" lines={3} />
 *
 * // Post card skeleton
 * <div className="space-y-3">
 *   <div className="flex items-center space-x-3">
 *     <Skeleton variant="circular" width={40} height={40} />
 *     <div className="space-y-2">
 *       <Skeleton className="h-4 w-24" />
 *       <Skeleton className="h-3 w-16" />
 *     </div>
 *   </div>
 *   <Skeleton className="h-32 w-full" />
 *   <Skeleton variant="text" lines={2} />
 * </div>
 * ```
 */
export function Skeleton({
  variant = "default",
  width,
  height,
  lines = 1,
  animate = true,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses =
    "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"

  const variantClasses = {
    default: "rounded-lg",
    circular: "rounded-full",
    rectangular: "rounded-none",
    text: "rounded-md",
  }

  const shimmerAnimation = {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Number.POSITIVE_INFINITY,
    },
  }

  const combinedStyle = {
    width,
    height,
    backgroundSize: "200% 100%",
    ...style,
  }

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(baseClasses, variantClasses.text, "h-4", index === lines - 1 ? "w-3/4" : "w-full", className)}
            style={combinedStyle}
            animate={animate ? shimmerAnimation : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={cn(baseClasses, variantClasses[variant], variant === "text" && "h-4", className)}
      style={combinedStyle}
      animate={animate ? shimmerAnimation : undefined}
      {...props}
    />
  )
}

/**
 * Pre-built skeleton components for common use cases
 */
export const SkeletonComponents = {
  /**
   * Avatar skeleton with optional text
   */
  Avatar: ({ showText = false, size = 40 }: { showText?: boolean; size?: number }) => (
    <div className="flex items-center space-x-3">
      <Skeleton variant="circular" width={size} height={size} />
      {showText && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      )}
    </div>
  ),

  /**
   * Post card skeleton
   */
  PostCard: () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-4">
        <SkeletonComponents.Avatar showText />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton variant="text" lines={2} />
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  ),

  /**
   * Chat message skeleton
   */
  ChatMessage: ({ isOwn = false }: { isOwn?: boolean }) => (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("flex items-end space-x-2", isOwn && "flex-row-reverse space-x-reverse")}>
        {!isOwn && <Skeleton variant="circular" width={32} height={32} />}
        <div className="space-y-1">
          <Skeleton className={cn("h-10 rounded-2xl", isOwn ? "w-32" : "w-40")} />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  ),

  /**
   * Timeline skeleton with multiple posts
   */
  Timeline: ({ count = 3 }: { count?: number }) => (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponents.PostCard key={index} />
      ))}
    </div>
  ),
}
