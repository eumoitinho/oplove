import { WhoToFollowCard } from "./who-to-follow-card"
import { TrendingTopicsCard } from "./trending-topics-card"
import { UpcomingEventsCard } from "./upcoming-events-card" // Import from new file

interface RightSidebarProps {
  className?: string
  onViewChange?: (view: string) => void
}

export function RightSidebar({ className, onViewChange }: RightSidebarProps) {
  return (
    <aside
      className={`sticky top-24 h-[calc(100vh-7rem)] flex flex-col space-y-6 overflow-y-auto no-scrollbar ${className}`}
    >
      <TrendingTopicsCard onViewChange={onViewChange} />
      <WhoToFollowCard onViewChange={onViewChange} />
      <UpcomingEventsCard onViewChange={onViewChange} />
      <footer className="text-xs text-center text-gray-400 dark:text-white/40 space-x-2 p-4">
        <span>© 2025 OpenLove</span>
      </footer>
    </aside>
  )
}
