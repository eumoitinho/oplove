"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Heart, MessageCircle, Bell, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

export interface MobileNavProps {
  className?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

/**
 * Mobile bottom navigation bar with OpenLove styling
 *
 * @example
 * ```tsx
 * <MobileNav className="md:hidden" />
 * ```
 */
export function MobileNav({ className }: MobileNavProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { href: "/feed", label: "Início", icon: Home },
    { href: "/dating", label: "Dating", icon: Heart },
    { href: "/chat", label: "Chat", icon: MessageCircle, badge: 2 },
    { href: "/notifications", label: "Notificações", icon: Bell, badge: 3 },
    { href: `/profile/${user?.username}`, label: "Perfil", icon: User },
  ]

  const isActive = (href: string) => {
    if (href === "/feed") return pathname === "/" || pathname === "/feed"
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-700 dark:bg-gray-900/80",
        className,
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item, index) => {
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2 min-w-0 flex-1"
            >
              <motion.div
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 rounded-xl px-3 py-2 transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400",
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium truncate max-w-full">{item.label}</span>
              </motion.div>

              {active && (
                <motion.div
                  className="absolute -top-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
                  layoutId="activeTab"
                  transition={{ type: "spring", duration: 0.3 }}
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}