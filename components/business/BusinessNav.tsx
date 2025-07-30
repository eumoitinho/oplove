'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Megaphone, 
  CreditCard, 
  BarChart3, 
  Settings,
  Calendar,
  Package,
  Users,
  FileText
} from 'lucide-react'

const businessNavItems = [
  {
    title: 'Dashboard',
    href: '/business/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Campanhas',
    href: '/business/campaigns',
    icon: Megaphone
  },
  {
    title: 'Créditos',
    href: '/business/credits',
    icon: CreditCard
  },
  {
    title: 'Analytics',
    href: '/business/analytics',
    icon: BarChart3
  },
  {
    title: 'Eventos',
    href: '/business/events',
    icon: Calendar,
    allowedTypes: ['venue', 'event_organizer']
  },
  {
    title: 'Conteúdo',
    href: '/business/content',
    icon: Package,
    allowedTypes: ['content_creator']
  },
  {
    title: 'Clientes',
    href: '/business/customers',
    icon: Users
  },
  {
    title: 'Faturas',
    href: '/business/invoices',
    icon: FileText
  },
  {
    title: 'Configurações',
    href: '/business/settings',
    icon: Settings
  }
]

interface BusinessNavProps {
  businessType?: string
  className?: string
}

export function BusinessNav({ businessType, className }: BusinessNavProps) {
  const pathname = usePathname()

  const filteredItems = businessNavItems.filter(item => {
    if (!item.allowedTypes) return true
    return item.allowedTypes.includes(businessType || '')
  })

  return (
    <nav className={cn("flex space-x-6", className)}>
      {filteredItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function BusinessNavMobile({ businessType, className }: BusinessNavProps) {
  const pathname = usePathname()

  const filteredItems = businessNavItems.filter(item => {
    if (!item.allowedTypes) return true
    return item.allowedTypes.includes(businessType || '')
  })

  return (
    <nav className={cn("grid grid-cols-3 gap-2", className)}>
      {filteredItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-3 text-xs font-medium transition-colors rounded-md",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}