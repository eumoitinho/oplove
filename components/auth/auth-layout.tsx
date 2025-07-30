"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Moon, Sun } from "lucide-react"
import { Button } from "@heroui/react"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      document.documentElement.classList.toggle("dark", !prev)
      return !prev
    })
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Custom CSS for enhanced UX */}
      <style jsx global>{`
        ::selection {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.2)"};
          color: ${isDarkMode ? "#ffffff" : "#1f2937"};
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? "rgba(15, 23, 42, 0.1)" : "rgba(243, 244, 246, 0.5)"};
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.3)"};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.5)" : "rgba(190, 24, 93, 0.5)"};
        }
        /* Breathing animation */
        @keyframes subtle-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
        .subtle-breathe {
          animation: subtle-breathe 6s ease-in-out infinite;
          will-change: transform;
        }
        /* Hardware acceleration */
        .hw-accelerate {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>

    {/* Artistic Background */}
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(190,24,93,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))]" />
    <div className="fixed top-0 left-0 w-full h-full">
      <div className="absolute top-[10%] left-[5%] w-32 sm:w-64 h-32 sm:h-64 rounded-full bg-gradient-to-r from-pink-500/5 to-purple-500/5 dark:from-pink-500/10 dark:to-purple-500/10 blur-3xl subtle-breathe" />
      <div
        className="absolute top-[40%] right-[10%] w-40 sm:w-80 h-40 sm:h-80 rounded-full bg-gradient-to-r from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10 blur-3xl subtle-breathe"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-[15%] left-[15%] w-36 sm:w-72 h-36 sm:h-72 rounded-full bg-gradient-to-r from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10 blur-3xl subtle-breathe"
        style={{ animationDelay: "2s" }}
      />
    </div>

    {/* Main Content */}
    <main className="relative z-10 w-full max-w-md">
      {/* Theme Toggle */}
      <nav
        className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50"
        role="navigation"
        aria-label="Theme navigation"
      >
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className="text-sm sm:text-lg font-light text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 px-2 sm:px-4 rounded-full group"
          aria-label="Toggle between light and dark theme"
        >
          <div className="group-hover:rotate-180 transition-transform duration-500">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </div>
        </Button>
      </nav>

      {/* Auth Form Container */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-gray-900 dark:text-white">open</span>
            <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
              love
            </span>
          </h1>
          <h2 className="text-2xl font-semibold mt-4 text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-white/70 mt-2">
            {subtitle}
          </p>
        </div>

        {/* Form Content */}
        {children}
      </div>
    </main>

    {/* Footer */}
    <footer className="absolute bottom-4 text-center w-full text-gray-500 dark:text-white/50 text-sm">
      <p>© 2025 OpenLove. Todos os direitos reservados.</p>
    </footer>
  </div>
  )
}
