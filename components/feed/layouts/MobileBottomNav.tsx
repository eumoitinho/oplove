"use client"

import { Home, Search, Plus, Bell, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileBottomNavProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function MobileBottomNav({ currentView, onViewChange }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#11101a] border-t border-[#363f54] z-50 lg:hidden">
      <div className="flex items-center justify-around py-2 pb-safe">
        <button
          onClick={() => onViewChange("timeline")}
          className={cn(
            "flex flex-col items-center gap-1 p-2",
            currentView === "timeline" ? "text-white" : "text-[#9099af]"
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => onViewChange("explore")}
          className={cn(
            "flex flex-col items-center gap-1 p-2",
            currentView === "explore" ? "text-white" : "text-[#9099af]"
          )}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px]">Explorar</span>
        </button>

        <button
          className="flex flex-col items-center gap-1 p-2"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#e69aff] via-[#ff4bc9] to-[#ff5f5f] flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </button>

        <button
          onClick={() => onViewChange("notifications")}
          className={cn(
            "flex flex-col items-center gap-1 p-2 relative",
            currentView === "notifications" ? "text-white" : "text-[#9099af]"
          )}
        >
          <Bell className="w-6 h-6" />
          <span className="text-[10px]">Notificações</span>
          <div className="absolute top-1 right-2 w-2 h-2 bg-pink-500 rounded-full" />
        </button>

        <button
          onClick={() => onViewChange("user-profile")}
          className={cn(
            "flex flex-col items-center gap-1 p-2",
            currentView === "user-profile" ? "text-white" : "text-[#9099af]"
          )}
        >
          <UserCircle className="w-6 h-6" />
          <span className="text-[10px]">Perfil</span>
        </button>
      </div>
    </nav>
  )
}