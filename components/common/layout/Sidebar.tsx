"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home,
  Heart,
  MessageCircle,
  Bell,
  User,
  Search,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "../ui/Button"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export interface SidebarProps {
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  premiumOnly?: boolean
}

/**
 * Collapsible sidebar navigation with OpenLove styling
 *
 * @example
 * ```tsx
 * <Sidebar
 *   collapsible={true}
 *   defaultCollapsed={false}
 *   className="border-r"
 * />
 * ```
 */
export function Sidebar({ className, collapsible = true, defaultCollapsed = false }: SidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  const navigationItems: NavigationItem[] = [
    { href: "/feed", label: "Início", icon: Home },
    { href: "/explore", label: "Explorar", icon: Search },
    { href: "/notifications", label: "Notificações", icon: Bell, badge: 3 },
    { href: "/chat", label: "Mensagens", icon: MessageCircle, badge: 2 },
    { href: "/events", label: "Eventos", icon: Calendar },
    { href: "/communities", label: "Comunidades", icon: Users },
    { href: "/dating", label: "Open Dates", icon: Heart, premiumOnly: true },
    { href: `/profile/${user?.username}`, label: "Perfil", icon: User },
    { href: "/settings", label: "Configurações", icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === "/feed") return pathname === "/" || pathname === "/feed"
    return pathname.startsWith(href)
  }

  const canAccessItem = (item: NavigationItem) => {
    if (!item.premiumOnly) return true
    return user?.premium_type !== "free"
  }

  return (
    <motion.aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex h-full flex-col">
        {/* Collapse Toggle */}
        {collapsible && (
          <div className="flex justify-end p-2">
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navigationItems.map((item) => {
            const active = isActive(item.href)
            const accessible = canAccessItem(item)

            return (
              <Link
                key={item.href}
                href={accessible ? item.href : "#"}
                className={cn(
                  "group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : accessible
                      ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      : "text-gray-400 cursor-not-allowed dark:text-gray-600",
                  isCollapsed ? "justify-center" : "justify-start",
                )}
                onClick={(e) => {
                  if (!accessible) {
                    e.preventDefault()
                  }
                }}
              >
                <div className="relative">
                  <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}

                {!isCollapsed && item.premiumOnly && user?.premium_type === "free" && (
                  <span className="ml-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-0.5 text-xs text-white">
                    Premium
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        {!isCollapsed && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
              </div>
            </div>

            {user.premium_type !== "free" && (
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 text-xs font-medium text-white">
                  {user.premium_type === "gold" ? "Gold" : user.premium_type === "diamond" ? "Diamond" : "Couple"}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}
