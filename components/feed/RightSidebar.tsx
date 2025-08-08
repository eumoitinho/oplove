import { TrendingProfilesCard } from "./TrendingProfilesCard"
import { RecommendationsCard } from "./RecommendationsCard"
import { AdultEventsCard } from "./AdultEventsCard"
import { StatisticsPage } from "./statistics/StatisticsPage"
import { SupportPage } from "./support/SupportPage"

interface RightSidebarProps {
  className?: string
  onViewChange?: (view: string) => void
  currentView?: string
}

export function RightSidebar({ className, onViewChange, currentView }: RightSidebarProps) {
  // If showing statistics or support, render those components instead of sidebar cards
  if (currentView === 'statistics') {
    return (
      <div className={`flex-1 ${className}`}>
        <StatisticsPage />
      </div>
    )
  }

  if (currentView === 'support') {
    return (
      <div className={`flex-1 ${className}`}>
        <SupportPage />
      </div>
    )
  }

  return (
    <aside className={`sidebar-sticky  max-h-screen flex flex-col ${className}`}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-6 scrollbar-hide max-h-[calc(100vh-6rem)]" style={{willChange: 'scroll-position'}}>
        <TrendingProfilesCard onViewChange={onViewChange} />
        <RecommendationsCard onViewChange={onViewChange} />
        <AdultEventsCard onViewChange={onViewChange} />
      </div>
      <footer className="flex-shrink-0 text-xs text-center text-gray-400 dark:text-white/40 space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
        <span>© 2025 OpenLove</span>
        <span>•</span>
        <span>Plataforma +18</span>
      </footer>
    </aside>
  )
}
