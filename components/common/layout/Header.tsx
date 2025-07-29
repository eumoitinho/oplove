"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Bell, MessageCircle, Heart, User, Settings, LogOut, Menu, X } from "lucide-react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Modal } from "../ui/Modal"
import { toast } from "../ui/Toast"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export interface HeaderProps {
  className?: string
  showSearch?: boolean
  showNotifications?: boolean
}

/**
 * Main application header with navigation and user controls
 *
 * @example
 * ```tsx
 * <Header
 *   showSearch={true}
 *   showNotifications={true}
 *   className="border-b"
 * />
 * ```
 */
export function Header({ className, showSearch = true, showNotifications = true }: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logout realizado", "Até logo!")
      router.push("/auth/login")
    } catch (error) {
      toast.error("Erro ao fazer logout", "Tente novamente.")
    }
  }

  const navigationItems = [
    { href: "/feed", label: "Feed", icon: Heart },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/notifications", label: "Notificações", icon: Bell },
  ]

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-700 dark:bg-gray-900/80",
          className,
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/feed" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                OpenLove
              </span>
            </Link>

            {/* Desktop Search */}
            {showSearch && (
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <form onSubmit={handleSearch} className="w-full">
                  <Input
                    type="search"
                    placeholder="Buscar pessoas, posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-full"
                  />
                </form>
              </div>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" size="icon" className="relative" aria-label={item.label}>
                    <item.icon className="h-5 w-5" />
                    {item.href === "/notifications" && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
                    )}
                  </Button>
                </Link>
              ))}

              {/* Profile Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="ml-2"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url || "/placeholder.svg"}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>

                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Link
                      href={`/profile/${user?.username}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Meu Perfil
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Configurações
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sair
                    </button>
                  </motion.div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 md:hidden">
              {showSearch && (
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                  <Search className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      <Modal open={isSearchOpen} onOpenChange={setIsSearchOpen} title="Buscar" size="full" className="md:hidden">
        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            type="search"
            placeholder="Buscar pessoas, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => setIsSearchOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Buscar</Button>
          </div>
        </form>
      </Modal>

      {/* Mobile Menu Modal */}
      <Modal
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        size="full"
        className="md:hidden"
        showCloseButton={false}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <hr className="border-gray-200 dark:border-gray-700" />

          <div className="space-y-2">
            <Link
              href={`/profile/${user?.username}`}
              className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span>Meu Perfil</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setIsProfileMenuOpen(false)} />}
    </>
  )
}
