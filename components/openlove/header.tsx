"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Sun, Moon, Gem, Sparkles } from "lucide-react"

interface HeaderProps {
  isDarkMode: boolean
  toggleTheme: () => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isOpen: boolean) => void
}

export function Header({ isDarkMode, toggleTheme, isMobileMenuOpen, setIsMobileMenuOpen }: HeaderProps) {
  const handleCreatePostClick = () => {
    const postCreationArea = document.getElementById("post-creation-area")
    if (postCreationArea) {
      postCreationArea.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 h-20 flex items-center">
      <div className="max-w-screen-xl mx-auto px-4 w-full">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile: Create Post Button | Desktop: Empty div for spacing */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-300"
              aria-label="Criar novo post"
              onClick={handleCreatePostClick}
            >
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>
          <div className="hidden lg:block w-10 h-10" /> {/* Placeholder for desktop alignment */}
          {/* Logo (Centered) */}
          <div className="flex-1 flex justify-center lg:justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold leading-none tracking-tighter group cursor-default">
              <span className="block text-gray-900 dark:text-white group-hover:tracking-wide transition-all duration-500">
                open
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 bg-clip-text text-transparent group-hover:tracking-wide transition-all duration-500">
                love
              </span>
            </h1>
          </div>
          {/* Search Bar (Hidden on Mobile) */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search OpenLove..."
                className="pl-11 h-11 rounded-full bg-gray-100 dark:bg-slate-800/50 border-0 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              />
            </div>
          </div>
          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 group"
              aria-label="Alternar tema claro/escuro"
            >
              <div className="group-hover:rotate-180 transition-transform duration-500">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
            </Button>

            <div className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer">
              <Avatar className="w-9 h-9 ring-2 ring-gray-200 dark:ring-white/10">
                <AvatarImage src="/professional-woman-designer.png" alt="Sarah Chen" />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                  SC
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold">Sarah Chen</span>
                  <Gem className="w-3 h-3 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
