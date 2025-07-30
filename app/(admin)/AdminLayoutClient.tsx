"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Shield, 
  MessageSquare, 
  Settings, 
  FileText,
  AlertTriangle,
  Building2,
  Heart,
  Target,
  TrendingUp,
  UserCheck,
  CreditCard,
  Flag,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
  children: React.ReactNode
}

interface SidebarItemProps {
  href: string
  icon: React.ElementType
  title: string
}

function SidebarItem({ href, icon: Icon, title }: SidebarItemProps) {
  const router = useRouter()
  
  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => router.push(href)}
    >
      <Icon className="mr-2 h-4 w-4" />
      {title}
    </Button>
  )
}

export default function AdminLayoutClient({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminData, setAdminData] = useState<any>(null)
  
  // Verificar se o usuário é admin
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    // Verificar permissões de admin
    checkAdminPermissions()
  }, [user, router])
  
  const checkAdminPermissions = async () => {
    try {
      const response = await fetch('/api/v1/admin/permissions')
      
      if (!response.ok) {
        router.push('/feed')
        return
      }
      
      const data = await response.json()
      setAdminData(data)
    } catch (error) {
      console.error('Error checking admin permissions:', error)
      router.push('/feed')
    }
  }
  
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }
  
  // Mostrar loading enquanto verifica permissões
  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  const navigationItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      href: "/admin",
      permission: "dashboard.view"
    },
    {
      title: "Usuários",
      icon: Users,
      href: "/admin/users",
      permission: "users.view"
    },
    {
      title: "Financeiro",
      icon: DollarSign,
      href: "/admin/financial",
      permission: "financial.view"
    },
    {
      title: "Assinaturas",
      icon: CreditCard,
      href: "/admin/subscriptions",
      permission: "subscriptions.view"
    },
    {
      title: "Moderação",
      icon: Shield,
      href: "/admin/moderation",
      permission: "moderation.view"
    },
    {
      title: "Denúncias",
      icon: Flag,
      href: "/admin/reports",
      permission: "reports.view"
    },
    {
      title: "Empresas",
      icon: Building2,
      href: "/admin/businesses",
      permission: "businesses.view"
    },
    {
      title: "Open Dates",
      icon: Heart,
      href: "/admin/dating",
      permission: "dating.view"
    },
    {
      title: "Anúncios",
      icon: Target,
      href: "/admin/ads",
      permission: "ads.view"
    },
    {
      title: "Analytics",
      icon: TrendingUp,
      href: "/admin/analytics",
      permission: "analytics.view"
    },
    {
      title: "Verificações",
      icon: UserCheck,
      href: "/admin/verifications",
      permission: "verifications.view"
    },
    {
      title: "Conversas",
      icon: MessageSquare,
      href: "/admin/conversations",
      permission: "conversations.view"
    },
    {
      title: "Relatórios",
      icon: FileText,
      href: "/admin/reports-system",
      permission: "reports.generate"
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/admin/settings",
      permission: "settings.manage"
    }
  ]
  
  // Filtrar itens baseado nas permissões
  const allowedItems = navigationItems.filter(item => 
    adminData.permissions[item.permission]
  )
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h1>
              <p className="text-xs text-gray-500">OpenLove</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Admin Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {adminData.role}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Nível {adminData.accessLevel}
            </Badge>
          </div>
          
          {/* Departamentos */}
          <div className="mt-3 flex flex-wrap gap-1">
            {adminData.departments?.map((dept: string) => (
              <Badge key={dept} variant="outline" className="text-xs">
                {dept}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {allowedItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
            />
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "ml-0"
      )}>
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Painel Administrativo
                </h2>
                <p className="text-sm text-gray-500">
                  Gerencie todos os aspectos da plataforma OpenLove
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Status
                </p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Alertas
                </p>
                <div className="flex items-center">
                  <AlertTriangle className="w-3 h-3 text-yellow-500 mr-1" />
                  <span className="text-xs text-gray-500">3</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}