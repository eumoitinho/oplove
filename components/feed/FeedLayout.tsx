"use client"

import { useState, useEffect } from "react"
import { Header } from "./Header"
import { LeftSidebar } from "./LeftSidebar"
import { RightSidebar } from "./RightSidebar"
import { Button } from "@/components/ui/button"
import { Menu, X, Home } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface FeedLayoutProps {
  children: React.ReactNode
}

export function FeedLayout({ children }: FeedLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [currentView, setCurrentView] = useState<'timeline' | 'other'>('timeline')
  const { user } = useAuth()

  // Initialize dark mode from system preference or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme")
      const prefersDark = savedTheme === "dark" || 
        (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
      
      setIsDarkMode(prefersDark)
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, []) // Only run once on mount

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    document.documentElement.classList.toggle("dark", newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFabClick = () => {
    if (isMobileMenuOpen) {
      // Close sidebar
      setIsMobileMenuOpen(false)
    } else if (currentView === 'timeline') {
      // Open sidebar
      setIsMobileMenuOpen(true)
    } else {
      // Return to timeline
      setCurrentView('timeline')
      // Could also trigger navigation here
    }
  }

  const getFabIcon = () => {
    if (isMobileMenuOpen) {
      return <X className="h-6 w-6" />
    } else if (currentView === 'timeline') {
      return <Menu className="h-6 w-6" />
    } else {
      return <Home className="h-6 w-6" />
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="h-[calc(100vh-5rem)] overflow-hidden">
        <div className="container mx-auto px-2 xs:px-4 h-full">
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 xs:gap-4 md:gap-6 h-full">
            {/* Left Sidebar - Hidden on mobile, shown as slide-out menu */}
            <div
              className={cn(
                "fixed md:relative inset-y-0 left-0 z-50 md:z-0",
                "transform transition-transform duration-300 ease-in-out",
                "md:transform-none md:col-span-3",
                "bg-white dark:bg-gray-800 md:bg-transparent",
                "w-[280px] xs:w-80 md:w-auto h-full",
                "md:block",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
              )}
            >
              <div className="h-full pt-20 md:pt-0">
                <LeftSidebar onItemClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-6 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="py-6">
                  {children}
                </div>
              </div>
            </div>
            
            {/* Right Sidebar - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-3 h-full">
              <RightSidebar />
            </div>
            </div>
          </div>
        </div>
      </main>

      {/* Polymorphic Floating Action Button */}
      <Button
        onClick={handleFabClick}
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-40 md:hidden",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-r from-purple-600 to-pink-600",
          "hover:from-purple-700 hover:to-pink-700",
          "text-white shadow-lg hover:shadow-xl",
          "transition-all duration-300",
          "transform hover:scale-110 active:scale-95"
        )}
        aria-label={
          isMobileMenuOpen 
            ? "Fechar menu" 
            : currentView === 'timeline' 
              ? "Abrir menu" 
              : "Voltar ao timeline"
        }
      >
        {getFabIcon()}
      </Button>
    </div>
  )
}