import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "./button"

export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
  showCloseButton?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "full"
  variant?: "default" | "glass" | "gradient"
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md sm:max-w-lg",
  lg: "max-w-lg sm:max-w-xl lg:max-w-2xl",
  xl: "max-w-xl sm:max-w-2xl lg:max-w-4xl",
  full: "max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-4rem)]"
}

const variantStyles = {
  default: "bg-white dark:bg-gray-950",
  glass: "bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl",
  gradient: "bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  contentClassName,
  showCloseButton = true,
  size = "md",
  variant = "glass"
}: BaseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent 
            className={cn(
              "p-0 overflow-hidden border-gray-200 dark:border-white/10",
              sizeClasses[size],
              variantStyles[variant],
              "max-h-[90vh] overflow-y-auto",
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <DialogHeader className="relative px-4 xs:px-5 sm:px-6 pt-4 xs:pt-5 sm:pt-6 pb-0">
                {title && (
                  <DialogTitle className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pr-8">
                    {title}
                  </DialogTitle>
                )}
                {description && (
                  <p className="text-sm xs:text-base text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute right-2 top-2 xs:right-3 xs:top-3 h-8 w-8 xs:h-9 xs:w-9 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </DialogHeader>
            )}
            
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn("px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6", contentClassName)}
            >
              {children}
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}

// Modal Footer component for consistency
export function BaseModalFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn(
      "flex flex-col xs:flex-row gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-white/10",
      className
    )}>
      {children}
    </div>
  )
}