"use client"

import { useState, useEffect } from "react"
import { Header } from "./Header"
import { LeftSidebar } from "./LeftSidebar"
import { RightSidebar } from "./RightSidebar"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, ArrowUp } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface FeedLayoutProps {
  children: React.ReactNode
}

export function FeedLayout({ children }: FeedLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const { user } = useAuth()

  // Check system preference on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
      if (prefersDark) {
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [children])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
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

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-30">
        <div className="flex items-center justify-around py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-600 dark:text-gray-400"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleScrollToTop}
            className="text-gray-600 dark:text-gray-400"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scroll to Top Button - Desktop only */}
      {showScrollToTop && (
        <Button
          onClick={handleScrollToTop}
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 z-40",
            "bg-pink-600 hover:bg-pink-700 text-white",
            "shadow-lg hover:shadow-xl",
            "transition-all duration-300",
            "hidden md:flex"
          )}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}