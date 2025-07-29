"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/openlove/header"
import { LeftSidebar } from "@/components/openlove/left-sidebar"
import { MainTimeline } from "@/components/openlove/main-timeline"
import { RightSidebar } from "@/components/openlove/right-sidebar"
import Toast from "@/components/openlove/toast"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, ArrowUp } from "lucide-react"

type ActiveToast = {
  type: "post" | "message" | "like"
  count: number
} | null

type MainContentType =
  | "timeline"
  | "who-to-follow"
  | "trending-topics"
  | "upcoming-events"
  | "user-profile"
  | "notifications"
  | "messages"
  | "saved-items"
  | "settings"
  | "support"
  | "stats"

export default function OpenLovePage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeToast, setActiveToast] = useState<ActiveToast>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentMainContent, setCurrentMainContent] = useState<MainContentType>("timeline")
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [activeTab, setActiveTab] = useState<"for-you" | "following" | "explore">("for-you")

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

  // Simulate new posts/messages/likes notification
  useEffect(() => {
    const toastTypes: ActiveToast[] = [
      { type: "post", count: 5 },
      { type: "message", count: 1 },
      { type: "like", count: 3 },
      { type: "post", count: 10 },
      { type: "message", count: 2 },
    ]

    const interval = setInterval(() => {
      const randomToast = toastTypes[Math.floor(Math.random() * toastTypes.length)]
      setActiveToast(randomToast)

      // Para posts, não remove automaticamente
      if (randomToast.type !== "post") {
        setTimeout(() => setActiveToast(null), 4000)
      }
    }, 45000) // Show every 45 seconds

    return () => clearInterval(interval)
  }, [])

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollToTop(true)
      } else {
        setShowScrollToTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Reset to "for-you" tab when returning to timeline
  useEffect(() => {
    if (currentMainContent === "timeline") {
      setActiveTab("for-you")
    }
  }, [currentMainContent])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Lógica do botão flutuante esquerdo (Menu / Home) - SOME quando sidebar abre
  const handleFloatingMenuClick = () => {
    if (currentMainContent !== "timeline") {
      setCurrentMainContent("timeline") // Volta para o feed se não estiver na timeline
    } else {
      setIsMobileMenuOpen(true) // Abre a sidebar se estiver na timeline
    }
  }

  const getFloatingMenuIcon = () => {
    if (currentMainContent !== "timeline") {
      return <Home className="w-5 h-5" /> // Ícone de Home se não estiver na timeline
    } else {
      return <Menu className="w-5 h-5" /> // Ícone de Menu se estiver na timeline
    }
  }

  const getFloatingMenuLabel = () => {
    if (currentMainContent !== "timeline") {
      return "Voltar ao Feed"
    } else {
      return "Abrir Menu"
    }
  }

  // Lógica do botão flutuante direito (Voltar ao Topo / Fechar Menu)
  const handleRightFloatingButtonClick = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false) // Fecha a sidebar se estiver aberta
    } else {
      handleScrollToTop() // Volta ao topo se a sidebar estiver fechada
    }
  }

  const getRightFloatingButtonIcon = () => {
    if (isMobileMenuOpen) {
      return <X className="w-5 h-5" /> // Ícone de X se a sidebar estiver aberta
    } else {
      return <ArrowUp className="w-5 h-5" /> // Ícone de seta para cima se a sidebar estiver fechada
    }
  }

  const getRightFloatingButtonLabel = () => {
    if (isMobileMenuOpen) {
      return "Fechar Menu"
    } else {
      return "Voltar ao topo"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500">
      {/* Artistic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))]" />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-32 md:w-64 h-32 md:h-64 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 blur-3xl subtle-breathe" />
        <div
          className="absolute top-[40%] right-[10%] w-40 md:w-80 h-40 md:h-80 rounded-full bg-gradient-to-r from-pink-500/5 to-cyan-500/5 dark:from-pink-500/10 dark:to-cyan-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[15%] left-[15%] w-36 md:w-72 h-36 md:h-72 rounded-full bg-gradient-to-r from-cyan-500/5 to-orange-500/5 dark:from-cyan-500/10 dark:to-orange-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Header */}
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Layout */}
      <main className="relative z-10 max-w-screen-xl mx-auto pt-24 px-4 pb-24 lg:pb-4">
        {" "}
        {/* Added pb-24 for floating buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_320px] gap-6">
          {/* Left Sidebar (Desktop) */}
          <LeftSidebar className="hidden lg:block" onViewChange={setCurrentMainContent} />

          {/* Main Content Area */}
          <MainTimeline
            currentMainContent={currentMainContent}
            onViewChange={setCurrentMainContent}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Right Sidebar (Desktop) */}
          <RightSidebar className="hidden xl:block" onViewChange={setCurrentMainContent} />
        </div>
      </main>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="fixed top-0 left-0 w-72 h-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 animate-slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <LeftSidebar onLinkClick={() => setIsMobileMenuOpen(false)} onViewChange={setCurrentMainContent} />
          </div>
        </div>
      )}

      {/* Floating Buttons (Mobile Only) */}
      <div className="lg:hidden fixed bottom-4 w-full px-4 z-50 flex justify-between items-center">
        {/* Left Floating Button (Sidebar / Home) - SOME quando sidebar abre */}
        {!isMobileMenuOpen && (
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 p-[0.5px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <Button
              size="icon"
              className="w-12 h-12 rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 flex items-center justify-center group"
              onClick={handleFloatingMenuClick}
              aria-label={getFloatingMenuLabel()}
            >
              {getFloatingMenuIcon()}
            </Button>
          </div>
        )}

        {/* Right Floating Button (Scroll to Top / Close Sidebar) */}
        {(showScrollToTop || isMobileMenuOpen) && (
          <div
            className={`bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 p-[0.5px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl ${isMobileMenuOpen ? "ml-auto" : ""}`}
          >
            <Button
              size="icon"
              className="w-12 h-12 rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 flex items-center justify-center group"
              onClick={handleRightFloatingButtonClick}
              aria-label={getRightFloatingButtonLabel()}
            >
              {getRightFloatingButtonIcon()}
            </Button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {activeToast && <Toast type={activeToast.type} count={activeToast.count} onClose={() => setActiveToast(null)} />}
    </div>
  )
}
