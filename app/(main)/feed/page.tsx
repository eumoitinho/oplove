"use client"

import { useEffect, useState } from "react"
import { TimelineFeed } from "@/components/feed/timeline/TimelineFeed"
import { FeedLayout } from "@/components/feed/FeedLayout"
import { Button } from "@/components/ui/button"
import { useEngagementToasts } from "@/hooks/useEngagementToasts"
import StoriesCarousel from "@/components/stories/StoriesCarousel"
import { Feather, Menu, Home, ArrowUp, X } from "lucide-react"
import { useSecurityProtection } from "@/hooks/useSecurityProtection"
import { useAuth } from "@/hooks/useAuth"
import { Header, LeftSidebar, RightSidebar } from "@/components/feed"


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
  | "verification"
  | "support"
  | "stats"
  | "open-dates"
  | "communities"
  | "events"

export default function FeedPage() {
  const { user } = useAuth()
  const [currentMainContent, setCurrentMainContent] = useState<MainContentType>("timeline")
  const [activeTab, setActiveTab] = useState<"for-you" | "following" | "explore">("for-you")
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Initialize engagement toasts
  useEngagementToasts()
  
  // Initialize security protection
  useSecurityProtection()

  // Theme toggle function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Don't reset tab when returning to timeline - preserve user's choice
  // useEffect(() => {
  //   if (currentMainContent === "timeline") {
  //     setActiveTab("for-you")
  //   }
  // }, [currentMainContent])

  // Wrapper function to handle view changes
  const handleViewChange = (view: string) => {
    setCurrentMainContent(view as MainContentType)
  }

  // Wrapper function for TimelineFeed
  const handleTimelineViewChange = (view: string) => {
    setCurrentMainContent(view as MainContentType)
  }

  // Mobile menu functions
  const handleFloatingMenuClick = () => {
    if (currentMainContent === "timeline") {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    } else {
      setCurrentMainContent("timeline")
      setIsMobileMenuOpen(false)
    }
  }

  const getFloatingMenuLabel = () => {
    return currentMainContent === "timeline" ? "Menu" : "Home"
  }

  const getFloatingMenuIcon = () => {
    if (currentMainContent === "timeline") {
      return isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />
    }
    return <Home className="w-5 h-5" />
  }

  const handleRightFloatingButtonClick = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getRightFloatingButtonLabel = () => {
    return isMobileMenuOpen ? "Fechar Menu" : "Ir para o topo"
  }

  const getRightFloatingButtonIcon = () => {
    return isMobileMenuOpen ? <X className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500">
      {/* Fixed Artistic Background */}
      <div className="fixed inset-0" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))]" />
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

      {/* Stories Carousel - Full width - Only show when user is authenticated */}
      {user && (
        <div className="relative pt-20" style={{ zIndex: 30 }}>
          <StoriesCarousel />
        </div>
      )}

      {/* Main Content Layout */}
      <main className={`relative pb-20 lg:pb-4 ${user ? '' : 'pt-20'}`} style={{ zIndex: 20 }}>
        <div className="w-full layout-container px-4">
          <div className="flex gap-6 max-w-screen-2xl mx-auto items-start">
            {/* Left Sidebar (Desktop) */}
            {!isMobileMenuOpen && (
              <div className="hidden lg:block w-[280px] flex-shrink-0">
                <LeftSidebar 
                  onViewChange={handleViewChange} 
                  currentView={currentMainContent} 
                />
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 lg:px-4 xl:px-6">
              <div className="max-w-2xl mx-auto lg:max-w-none">
                <TimelineFeed
                  currentMainContent={currentMainContent}
                  onViewChange={handleTimelineViewChange}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>
            </div>

            {/* Right Sidebar (Desktop) - Hidden on messages view and mobile menu */}
            {currentMainContent !== "messages" && !isMobileMenuOpen && (
              <div className="hidden xl:block w-[320px] flex-shrink-0">
                <RightSidebar onViewChange={handleViewChange} currentView={currentMainContent} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="fixed top-0 left-0 w-72 h-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 animate-slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <LeftSidebar onLinkClick={() => setIsMobileMenuOpen(false)} onViewChange={handleViewChange} currentView={currentMainContent} />
          </div>
        </div>
      )}


      {/* Bottom Navigation Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 bottom-navigation" style={{ zIndex: 50 }}>
        <div className="flex items-center justify-around px-4 py-3">
          {/* Menu/Home Button */}
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleFloatingMenuClick}
            aria-label={getFloatingMenuLabel()}
          >
            {getFloatingMenuIcon()}
          </Button>

          {/* Create Post Button - Center */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <Button
              size="lg"
              className="w-14 h-14 rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 flex items-center justify-center group shadow-lg"
              onClick={() => {
                const createPostElement = document.querySelector('[data-create-post]') as HTMLElement;
                if (createPostElement) {
                  createPostElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  // Focus on textarea after scroll
                  setTimeout(() => {
                    const textarea = createPostElement.querySelector('textarea');
                    if (textarea) {
                      textarea.focus();
                    }
                  }, 300);
                }
              }}
              aria-label="Criar Post"
            >
              <Feather className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            </Button>
          </div>

          {/* Scroll to Top / Close Menu Button */}
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleRightFloatingButtonClick}
            aria-label={getRightFloatingButtonLabel()}
          >
            {getRightFloatingButtonIcon()}
          </Button>
        </div>
      </div>

      {/* Desktop Create Post Button - Fixed bottom right */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 flex items-center justify-center group shadow-lg"
            onClick={() => {
              const createPostElement = document.querySelector('[data-create-post]') as HTMLElement;
              if (createPostElement) {
                createPostElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Focus on textarea after scroll
                setTimeout(() => {
                  const textarea = createPostElement.querySelector('textarea');
                  if (textarea) {
                    textarea.focus();
                  }
                }, 300);
              }
            }}
            aria-label="Criar Post"
          >
            <Feather className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
          </Button>
        </div>
      </div>

    </div>
  )
}






