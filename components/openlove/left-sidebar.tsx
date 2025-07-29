"use client"

import { Home, Users, Bell, Mail, Bookmark, Settings, HelpCircle, BarChart, LogOut, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface LeftSidebarProps {
  className?: string
  onLinkClick?: () => void
  onViewChange?: (view: string) => void
}

export function LeftSidebar({ className, onLinkClick, onViewChange }: LeftSidebarProps) {
  const menuItems = [
    { icon: Home, label: "Feed", view: "timeline", active: true },
    { icon: Users, label: "Contatos", view: "who-to-follow" },
    { icon: Bell, label: "Notificações", view: "notifications", hasNotification: true },
    { icon: Mail, label: "Mensagens", view: "messages", hasNotification: true },
    { icon: Bookmark, label: "Itens salvos", view: "saved-items" },
  ]

  const secondaryMenuItems = [
    { icon: User, label: "Perfil", view: "user-profile" }, // Added Profile
    { icon: Settings, label: "Configurações", view: "settings" },
    { icon: HelpCircle, label: "Suporte", view: "support" },
    { icon: BarChart, label: "Estatísticas", view: "stats" },
  ]

  const handleMenuItemClick = (view: string) => {
    onViewChange?.(view)
    onLinkClick?.() // Close mobile menu if applicable
  }

  return (
    <aside className={`sticky top-24 h-[calc(100vh-7rem)] flex flex-col py-6 px-2 ${className}`}>
      <div className="flex-grow">
        <h2 className="px-4 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Menu</h2>
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "secondary" : "ghost"}
              onClick={() => handleMenuItemClick(item.view)}
              className={`w-full justify-start text-base h-12 rounded-xl transition-all duration-300 relative ${
                item.active
                  ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                  : "hover:bg-gray-100/50 dark:hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5 mr-4" />
              <span>{item.label}</span>
              {item.hasNotification && (
                <div className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-full" />
              )}
            </Button>
          ))}
        </nav>

        <h2 className="px-4 mt-8 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Outros</h2>
        <nav className="flex flex-col space-y-1">
          {secondaryMenuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => handleMenuItemClick(item.view)}
              className="w-full justify-start text-base h-12 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/5"
            >
              <item.icon className="w-5 h-5 mr-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Create Post Button */}
      <div className="mb-6">
        <div className="inline-flex w-full items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 p-[1px] rounded-2xl group hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <Button
            size="lg"
            className="w-full h-14 text-lg bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 rounded-2xl group"
          >
            <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            Criar Post
          </Button>
        </div>
      </div>

      {/* User Profile / Logout */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/professional-woman-designer.png" alt="Sarah Chen" />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">SC</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-sm">Sarah Chen</h2>
            <p className="text-xs text-gray-500 dark:text-white/60">@sarahdesigns</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-500 dark:hover:text-red-400">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </aside>
  )
}
