"use client"

import { Home, Users, Bell, Mail, Bookmark, Settings, HelpCircle, BarChart, LogOut, Sparkles, User, Calendar, Heart, CreditCard, Crown, Gem, Flame, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNotifications } from "@/hooks/useNotifications"
import { useAuth } from "@/hooks/useAuth"

interface LeftSidebarProps {
  className?: string
  onLinkClick?: () => void
  onViewChange?: (view: string) => void
  onItemClick?: () => void
  currentView?: string
}

export function LeftSidebar({ className, onLinkClick, onViewChange, onItemClick, currentView = "timeline" }: LeftSidebarProps) {
  const { user, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  
  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case "gold":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "diamond":
        return <Gem className="w-4 h-4 text-purple-500" />
      case "couple":
        return <Flame className="w-4 h-4 text-red-500" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const isPremium = user?.premium_type && user.premium_type !== 'free'
  const primaryMenuItems = [
    { icon: Home, label: "Feed", view: "timeline" },
    { icon: Bell, label: "Notificações", view: "notifications", hasNotification: true },
    { icon: Mail, label: "Mensagens", view: "messages", hasNotification: true },
    { icon: Zap, label: "Open Dates", view: "open-dates" },
    { icon: Calendar, label: "Eventos", view: "events" },
    { icon: Heart, label: "Comunidades", view: "communities" },
    { icon: Users, label: "Contatos", view: "who-to-follow" },
    { icon: Bookmark, label: "Itens salvos", view: "saved-items" },
  ]

  const userMenuItems = [
    { icon: User, label: "Meu Perfil", view: "user-profile" },
    { icon: Settings, label: "Configurações", view: "settings" },
  ]

  const planMenuItem = { 
    icon: () => getPlanIcon(user?.premium_type || 'free'), 
    label: isPremium ? 
      (user?.premium_type === 'couple' ? 'Plano Dupla Hot' : `Plano ${user?.premium_type?.charAt(0).toUpperCase()}${user?.premium_type?.slice(1)}`) 
      : "Upgrade Premium", 
    view: isPremium ? "subscription" : "plans",
    isPremium: isPremium,
    isUpgrade: !isPremium
  }

  const otherMenuItems = [
    { icon: HelpCircle, label: "Suporte", view: "support" },
    { icon: BarChart, label: "Estatísticas", view: "stats" },
  ]

  const handleMenuItemClick = (view: string) => {
    onViewChange?.(view)
    onLinkClick?.() // Close mobile menu if applicable
    onItemClick?.() // Notify parent that an item was clicked
  }

  return (
    <aside className={`sticky top-24 h-[calc(100vh-6rem)] flex flex-col isolate ${className}`}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-6 px-2" style={{willChange: 'scroll-position'}}>
        <div className="space-y-6">
        {/* User Section */}
        <div className="space-y-1">
          <h2 className="px-4 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Conta</h2>
          <nav className="flex flex-col space-y-1">
            {userMenuItems.map((item) => {
              const isActive = currentView === item.view
              return (
                <Button
                  key={item.label}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => handleMenuItemClick(item.view)}
                  className={`w-full justify-start text-base h-12 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                      : "hover:bg-gray-100/50 dark:hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>
        </div>

        {/* Plan Upgrade Section */}
        <div className="space-y-1">
          <div className={`rounded-xl p-4 ${planMenuItem.isUpgrade 
            ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800' 
            : 'bg-gray-50 dark:bg-white/5'
          }`}>
            <Button
              variant="ghost"
              onClick={() => handleMenuItemClick(planMenuItem.view)}
              className={`w-full justify-start text-base h-12 rounded-xl transition-all duration-300 ${
                planMenuItem.isUpgrade 
                  ? "hover:bg-white/50 dark:hover:bg-white/10 text-purple-700 dark:text-purple-300 font-semibold" 
                  : "hover:bg-gray-100/50 dark:hover:bg-white/5"
              }`}
            >
              <planMenuItem.icon className="w-5 h-5 mr-4" />
              <span>{planMenuItem.label}</span>
              {planMenuItem.isUpgrade && (
                <div className="ml-auto">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              )}
            </Button>
            {planMenuItem.isUpgrade && (
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 px-4">
                Desbloqueie recursos premium
              </p>
            )}
          </div>
        </div>

        {/* Main Menu */}
        <div className="space-y-1">
          <h2 className="px-4 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Menu</h2>
          <nav className="flex flex-col space-y-1">
            {primaryMenuItems.map((item: any) => {
              const isActive = currentView === item.view
              const buttonContent = (
                <Button
                  key={item.label}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => handleMenuItemClick(item.view)}
                  className={`w-full justify-start text-base h-12 rounded-xl transition-all duration-300 relative ${
                    isActive
                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                      : "hover:bg-gray-100/50 dark:hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-4" />
                  <span>{item.label}</span>
                  {item.hasNotification && item.view === 'notifications' && unreadCount > 0 && (
                    <div className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-full">
                      <span className="text-xs text-white font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    </div>
                  )}
                  {item.hasNotification && item.view !== 'notifications' && (
                    <div className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-full" />
                  )}
                </Button>
              )

              return buttonContent
            })}
          </nav>
        </div>

        {/* Other Menu */}
        <div className="space-y-1">
          <h2 className="px-4 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Outros</h2>
          <nav className="flex flex-col space-y-1">
            {otherMenuItems.map((item) => {
              const isActive = currentView === item.view
              return (
                <Button
                  key={item.label}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => handleMenuItemClick(item.view)}
                  className={`w-full justify-start text-base h-12 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                      : "hover:bg-gray-100/50 dark:hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>
        </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 px-2 pb-4 space-y-4">
        {/* Create Post Button */}
        <div className="inline-flex w-full items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 p-[1px] rounded-2xl group hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <Button
            size="lg"
            className="w-full h-12 text-base bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 rounded-2xl group"
          >
            <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            Criar Post
          </Button>
        </div>

        {/* Subscription Status */}
        {isPremium ? (
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              {getPlanIcon(user?.premium_type || 'free')}
              <span className="font-semibold text-xs bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Plano {user?.premium_type?.charAt(0).toUpperCase()}{user?.premium_type?.slice(1)}
              </span>
              {user?.is_verified && (
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {user?.premium_expires_at ? 
                `Válido até ${new Date(user.premium_expires_at).toLocaleDateString('pt-BR')}` :
                'Acesso ilimitado'
              }
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMenuItemClick("subscription")}
              className="w-full text-xs h-7 rounded-lg border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              Gerenciar
            </Button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-3 h-3 text-gray-500" />
              <span className="font-medium text-xs text-gray-700 dark:text-gray-300">Plano Gratuito</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Desbloqueie recursos premium
            </p>
            <Button
              size="sm"
              onClick={() => handleMenuItemClick("plans")}
              className="w-full text-xs h-7 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              Fazer Upgrade
            </Button>
          </div>
        )}

        {/* User Profile / Logout */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 ring-2 ring-gray-200 dark:ring-white/10">
              <AvatarImage src={user?.avatar_url || "/default-avatar.png"} alt={user?.name || user?.username} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-sm truncate">{user?.name || user?.username || "Usuário"}</h2>
              <p className="text-xs text-gray-500 dark:text-white/60 truncate">@{user?.username || "username"}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full flex-shrink-0 ml-2"
            onClick={async () => {
              if (window.confirm('Deseja realmente sair?')) {
                const result = await signOut()
                if (result.success) {
                  window.location.href = '/auth/signin'
                }
              }
            }}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        </div>
      </div>
    </aside>
  )
}
