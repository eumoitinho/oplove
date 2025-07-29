"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl",
        secondary:
          "bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:bg-gray-800 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-gray-700",
        outline:
          "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-400 dark:hover:text-gray-900",
        ghost: "text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/20",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl",
        link: "text-purple-600 underline-offset-4 hover:underline dark:text-purple-400",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-6 text-base",
        lg: "h-13 px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

/**
 * Button component with OpenLove design system integration
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" loading={isLoading}>
 *   Entrar
 * </Button>
 *
 * <Button variant="outline" leftIcon={<Heart />}>
 *   Curtir
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </motion.button>
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants }
