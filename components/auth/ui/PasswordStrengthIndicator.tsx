"use client"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

interface PasswordRequirement {
  id: string
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    id: "lowercase",
    label: "One lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "One number",
    test: (password) => /\d/.test(password),
  },
  {
    id: "special",
    label: "One special character",
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
]

export function PasswordStrengthIndicator({ password, className = "" }: PasswordStrengthIndicatorProps) {
  const metRequirements = requirements.filter((req) => req.test(password))
  const strength = metRequirements.length
  const strengthPercentage = (strength / requirements.length) * 100

  const getStrengthColor = () => {
    if (strength <= 1) return "bg-red-500"
    if (strength <= 2) return "bg-orange-500"
    if (strength <= 3) return "bg-yellow-500"
    if (strength <= 4) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthLabel = () => {
    if (strength <= 1) return "Very Weak"
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Fair"
    if (strength <= 4) return "Good"
    return "Strong"
  }

  const getStrengthTextColor = () => {
    if (strength <= 1) return "text-red-600 dark:text-red-400"
    if (strength <= 2) return "text-orange-600 dark:text-orange-400"
    if (strength <= 3) return "text-yellow-600 dark:text-yellow-400"
    if (strength <= 4) return "text-blue-600 dark:text-blue-400"
    return "text-green-600 dark:text-green-400"
  }

  if (!password) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-3 ${className}`}
    >
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Strength</span>
          <span className={`text-sm font-semibold ${getStrengthTextColor()}`}>{getStrengthLabel()}</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strengthPercentage}%` }}
            transition={{ duration: 0.3 }}
            className={`h-2 rounded-full ${getStrengthColor()}`}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requirements:</span>
        <ul className="space-y-1">
          {requirements.map((requirement) => {
            const isMet = requirement.test(password)
            return (
              <motion.li
                key={requirement.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center text-sm"
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                    isMet ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {isMet ? (
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <X className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <span className={isMet ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
                  {requirement.label}
                </span>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </motion.div>
  )
}
