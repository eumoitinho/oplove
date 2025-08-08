"use client"

import { useState } from "react"
import { Plus,import { useSearchParams } from "next/navigation"
 Image as ImageIcon, Video, BarChart, CalendarDays, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { TimelineFeed } from "@/components/feed/timeline/TimelineFeed"
import { useEngityProtection } from "@/hooks/useSecurityProtection"
import { LeftSidebar } from "@/components/feed/layouts/LeftSidebar"
import { RightSidebar } from "@/components/feed/layouts/import { Header, LeftSidebar, RightSidebar } from "@/components/feed"
import { ResponsiveFeedLayout } from "@/components/feed/layouts"


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
nt, setCurrentMainConten  const searchParams = useSearchParams()
  const [currentMainContent, setCurrentMainContent] = useState<MainContentType>("timeline")
  const [activeTab, setActiveTab] = useState<"for-you" | "following" | "explore">("for-you")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined)
  
  // Initialize engagement toasts
  useEngagementToasts()
  
  // Initialize security protection
  useSecurityProtection()
  
  // Handle query parameters for navigation
  useEffect(() => {
    const view = searchParams.get('view') as MainContentType
    const userId = searchParams.get('userId')
    
    if (view) {
      setCurrentMainContent(view)
      if (view === 'user-profile' && userId) {
        setSelectedUserId(userId)
      }
    }
  }, [searchParams])
e user's choice
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
        <div className="absolute inset-0 bg-[radial-gradient({/* ellipse_at_center,rgba(219,39,119,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))]" />
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
  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" /> */}
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Poste alguma coisa gostosa      {/* Main Content Layout - Using ResponsiveFeedLayout */}
      <main className="relative pt-20 pb-20 lg:pb-4" style={{ zIndex: 20 }}>
 <LeftSidebar 
                onViewChange={handleViewChange} 
                currentView={currentMainContent} 
              />
            }
            rightSidebar={
              // Hide right sidebar on messages view
              currentMainContent !== "messages" ? (
                <RightSidebar onViewChange={handleViewChange} currentView={currentMainContent} />
              ) : <div />
            }
          >
            <TimelineFeed
              currentMainContent={currentMainContent}
              onViewChange={handleTimelineViewChange}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </ResponsiveFeedLayout>
        ) : (
          // Mobile menu is open - show only timeline in mobile layout
          <div className="w-full max-w-[384p              userId={selectedUserId}
            />
          </ResponsiveFeedLayout>
        ) : (
          // Mobile menu is open - show only timeline in mobile layout
          <div className="w-full max-w-[384px] mx-auto px-4">
            <TimelineFeed
              currentMainContent={currentMainContent}
              onViewChange={handleTimelineViewChange}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              userId={selectedUserId}
-center gap-[230px] tablet:gap-[180px] mobile:gap-[120px] py-2.5 mt-4 relative px-2 sm:px-0">
                  <button 
                    onClick={() => setActiveTab("for-you")}
                    className={cn(
                      "text-base transition-colors",
                      activeTab === "for-you" ? "text-white" : "text-[#9099af]"
                    )}
                  >
                    Para você
                  </button>
                  <button 
                    onClick={() => setActiveTab("following")}
                    className={cn(
                      "text-base transition-colors",
                      activeTab === "following" ? "text-white" : "text-[#9099af]"
                    )}
                  >
                    Seguindo
                  </button>
                  {/* Tab indicator */}
                  <div 
                    className={cn(
                      "absolute bottom-0 h-1 w-[92px] bg-gradient-to-r from-[#e69aff] via-[#ff4bc9] to-[#ff5f5f] rounded-full transition-transform",
                      activeTab === "for-you" ? "left-0" : "left-[320px]"
                    )}
                  />
                </div>

                {/* Timeline Feed */}
                <div className="mt-6">
                  <TimelineFeed
                    currentMainContent={currentMainContent}
                    onViewChange={handleTimelineViewChange}
                    activeTab={activeTab === "for-you" ? "for-you" : "following"}
                    onTabChange={(tab: any) => setActiveTab(tab as "for-you" | "following")}
                  />
                </div>
              </>
            ) : (
              <TimelineFeed
                currentMainContent={currentMainContent}
                onViewChange={handleTimelineViewChange}
                activeTab={activeTab === "for-you" ? "for-you" : "following"}
                onTabChange={(tab: any) => setActiveTab(tab as "for-you" | "following")}
              />
            )}
          </main>

          {/* Right Sidebar - Hidden on mobile, shown on tablet/desktop */}
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only shown on mobile/tablet */}
      <MobileBottomNav 
        currentView={currentMainContent}
        onViewChange={handleViewChange}
      />

      {/* Floating Button - Responsive positioning */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-[65px] right-[103px] desktop:right-[103px] tablet:right-[50px] mobile:right-[20px] mobile:bottom-[90px] bg-gradient-to-r from-[#f093fb] to-[#f5576c] text-white font-bold px-5 py-3 tablet:px-4 tablet:py-2 rounded-full flex items-center gap-2 hover:opacity-90 transition-opacity z-40 hidden sm:flex"
      >
        <ChevronRight className="w-5 h-5 rotate-[-90deg]" />
        <span className="tablet:text-sm">Subir</span>
      </button>
    </div>
  )
}