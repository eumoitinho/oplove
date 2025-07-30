import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, MotionProps } from "framer-motion"

export interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "bordered"
  hover?: boolean
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  animate?: boolean
  motionProps?: MotionProps
}

const paddingVariants = {
  none: "",
  sm: "p-3 xs:p-4",
  md: "p-4 xs:p-5 sm:p-6",
  lg: "p-5 xs:p-6 sm:p-8",
  xl: "p-6 xs:p-8 sm:p-10"
}

const variantStyles = {
  default: "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10",
  glass: "bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10",
  gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-white/10 dark:to-white/5 border border-gray-200 dark:border-white/10",
  bordered: "bg-transparent border-2 border-gray-200 dark:border-white/20"
}

const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  ({ 
    className, 
    variant = "glass", 
    hover = true, 
    padding = "md",
    animate = true,
    motionProps,
    children,
    ...props 
  }, ref) => {
    const Component = animate ? motion.div : "div"
    
    const baseClasses = cn(
      "rounded-xl sm:rounded-2xl shadow-sm transition-all duration-300",
      variantStyles[variant],
      paddingVariants[padding],
      hover && "hover:shadow-md hover:bg-white/90 dark:hover:bg-white/10",
      className
    )
    
    if (animate) {
      return (
        <Component
          ref={ref}
          className={baseClasses}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          {...motionProps}
          {...props}
        >
          {children}
        </Component>
      )
    }
    
    return (
      <div ref={ref} className={baseClasses} {...props}>
        {children}
      </div>
    )
  }
)
BaseCard.displayName = "BaseCard"

export { BaseCard }