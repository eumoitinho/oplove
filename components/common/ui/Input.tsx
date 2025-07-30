"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg xs:rounded-xl border bg-white px-3 py-2 xs:px-4 xs:py-3 text-sm xs:text-base transition-all duration-200 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
  {
    variants: {
      variant: {
        default: "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600",
        error: "border-red-500 focus-visible:ring-red-500 dark:border-red-400",
        success: "border-green-500 focus-visible:ring-green-500 dark:border-green-400",
      },
      size: {
        sm: "h-8 xs:h-9 px-2 xs:px-3 py-1 xs:py-2 text-xs xs:text-sm",
        default: "h-10 xs:h-11 px-3 xs:px-4 py-2 xs:py-3 text-sm xs:text-base",
        lg: "h-12 xs:h-13 px-4 xs:px-5 py-3 xs:py-4 text-base xs:text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

/**
 * Input component with validation states and OpenLove styling
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="seu@email.com"
 *   error={errors.email}
 *   leftIcon={<Mail />}
 * />
 *
 * <Input
 *   label="Senha"
 *   type="password"
 *   showPasswordToggle
 *   success="Senha forte!"
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant, size, type, label, error, success, leftIcon, rightIcon, showPasswordToggle, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)

    const inputType = showPasswordToggle && type === "password" ? (showPassword ? "text" : "password") : type

    const currentVariant = error ? "error" : success ? "success" : variant

    return (
      <div className="w-full">
        {label && <label className="mb-1 xs:mb-2 block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-2 xs:left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{leftIcon}</div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={cn(
              inputVariants({ variant: currentVariant, size }),
              leftIcon && "pl-8 xs:pl-10",
              (rightIcon || showPasswordToggle || error || success) && "pr-8 xs:pr-10",
              className,
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          <div className="absolute right-2 xs:right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {error && <AlertCircle className="h-4 w-4 text-red-500" />}
            {success && !error && <CheckCircle className="h-4 w-4 text-green-500" />}
            {showPasswordToggle && type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 min-w-[44px] min-h-[44px] p-2 flex items-center justify-center"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            {rightIcon && !showPasswordToggle && !error && !success && rightIcon}
          </div>
        </div>

        {error && (
          <p className="mt-1 text-xs xs:text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {success && !error && <p className="mt-1 text-xs xs:text-sm text-green-600 dark:text-green-400">{success}</p>}
      </div>
    )
  },
)

Input.displayName = "Input"

export { Input, inputVariants }
