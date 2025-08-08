"use client"

import { Home, Search, Bell, Mail, Bookmark, Users, Calendar, UserCircle, Shield, Settings, Crown, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeftSidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  user?: any
}

export function LeftSidebar({ currentView, onViewChange, user }: LeftSidebarProps) {
  return (
    <aside className="left-sidebar sidebar-sticky bg-[#11101a]">
      <div className="p-10 tablet:p-6">
        {/* Logo */}
        <div className="mb-12 tablet:mb-8">
          <h1 className="text-3xl tablet:text-2xl font-bold">
            <span className="text-white">open</span>
            <span className="text-pink-500">love</span>
          </h1>
        </div>

        {/* Menu Section */}
        <div className="mb-12 tablet:mb-8">
          <h2 className="text-white text-xl tablet:text-lg font-bold mb-8 tablet:mb-6">Menu</h2>
          <nav className="space-y-7 tablet:space-y-5">
            <button 
              onClick={() => onViewChange("timeline")}
              className={cn(
                "flex items-center gap-3 transition-all w-full text-left",
                currentView === "timeline" ? "text-white font-bold" : "text-[#9099af] hover:text-white"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center",
                currentView === "timeline" ? "bg-white" : ""
              )}>
                {currentView !== "timeline" && <Home className="w-5 h-5" />}
              </div>
              <span className="tablet:text-sm">Home</span>
            </button>
            
            <button className="flex items-center gap-3 text-[#9099af] hover:text-white transition-colors w-full text-left">
              <Search className="w-5 h-5" />
              <span className="tablet:text-sm">Explorar</span>
            </button>
            
            <button 
              onClick={() => onViewChange("notifications")}
              className={cn(
                "flex items-center gap-3 transition-colors w-full text-left",
                currentView === "notifications" ? "text-white font-bold" : "text-[#9099af] hover:text-white"
              )}
            >
              <Bell className="w-5 h-5" />
              <span className="tablet:text-sm">Notificações</span>
            </button>
            
            <button 
              onClick={() => onViewChange("messages")}
              className={cn(
                "flex items-center gap-3 transition-colors w-full text-left",
                currentView === "messages" ? "text-white font-bold" : "text-[#9099af] hover:text-white"
              )}
            >
              <Mail className="w-5 h-5" />
              <span className="tablet:text-sm">Mensagens</span>
            </button>
            
            <button 
              onClick={() => onViewChange("saved-items")}
              className={cn(
                "flex items-center gap-3 transition-colors w-full text-left",
                currentView === "saved-items" ? "text-white font-bold" : "text-[#9099af] hover:text-white"
              )}
            >
              <Bookmark className="w-5 h-5" />
              <span className="tablet:text-sm">Salvos</span>
            </button>
            
            <button 
              onClick={() => onViewChange("communities")}
              className={cn(
                "flex items-center gap-3 transition-colors w-full text-left",
                currentView === "communities" ? "text-white font-bold" : "text-[#9099af] hover:text-white"
              )}
            >
              <Users className="w-5 h-5" />
              <span className="tablet:text-sm">Comunidades</span>
            </button>
            
            <button 
              onClick={() => onViewChange("events")}
              className={cn(
                "flex items-center gap-3 transition-colors w-full text-left",
                currentView === "events" ? "text-white font-bold" : "text-[#9099af] hover:text-white"
              )}
            >
              <Calendar className="w-5 h-5" />
              <span className="tablet:text-sm">Eventos</span>
            </button>
            
            <button 
              onClick={() => onViewChange("open-dates")}
              className={cn(
                "flex items-center gap-3 transition-colors w-full text-left",
                currentView === "open-dates" ? "text-white font-bold" : "text-[#9099af] hover:text-white"
              )}
            >
              <UserCircle className="w-5 h-5" />
              <span className="tablet:text-sm">Open Dates</span>
            </button>
          </nav>
        </div>

        {/* Perfil Section */}
        <div className="mb-12 tablet:mb-8">
          <h2 className="text-white text-xl tablet:text-lg font-bold mb-8 tablet:mb-6">Perfil</h2>
          <nav className="space-y-7 tablet:space-y-5">
            <button 
              onClick={() => onViewChange("user-profile")}
              className={cn(
                "flex items-center gap-3 transition-colors w-full text-left",
                currentView === "user-profile" ? "text-white font-bold" : "text-[#9099af] hover:text-white"
              )}
            >
              <UserCircle className="w-5 h-5" />
              <span className="tablet:text-sm">Minha conta</span>
            </button>
            
            <button 
              onClick={() => onViewChange("verification")}
              className={cn(
                "flex items-center gap-3 transition-colors w-full text-left",
                currentView === "verification" ? "text-white font-bold" : "text-[#9099af] hover:text-white"
              )}
            >
              <Shield className="w-5 h-5" />
              <span className="tablet:text-sm">Verificação</span>
            </button>
            
            <button 
              onClick={() => onViewChange("settings")}
              className={cn(
                "flex items-center gap-3 transition-colors w-full text-left",
                currentView === "settings" ? "text-white font-bold" : "text-[#9099af] hover:text-white"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="tablet:text-sm">Configurações</span>
            </button>
            
            <button className="flex items-center gap-3 text-[#9099af] hover:text-white transition-colors w-full text-left">
              <Crown className="w-6 h-6 text-yellow-500" />
              <span className="tablet:text-sm">Premium</span>
            </button>
          </nav>
        </div>

        {/* User Profile Bottom */}
        <div className="absolute bottom-10 left-10 tablet:bottom-6 tablet:left-6 flex items-center justify-between w-[200px] tablet:w-[180px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 tablet:w-8 tablet:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
            <div>
              <p className="text-white text-base tablet:text-sm font-medium">
                {user?.full_name || "Usuário"}
              </p>
              <p className="text-[#93a0b9] text-xs tablet:text-[10px]">
                Plano • {user?.premium_type || "Gratuito"}
              </p>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 tablet:w-4 tablet:h-4 text-[#9099af]" />
        </div>
      </div>
    </aside>
  )
}