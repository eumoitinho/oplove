'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessNav, BusinessNavMobile } from '@/components/business/BusinessNav'
import { businessService } from '@/lib/services/business.service'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Building2, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function BusinessLayout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const [businessType, setBusinessType] = useState<string>('')
  const [businessName, setBusinessName] = useState<string>('')

  useEffect(() => {
    loadBusiness()
  }, [])

  const loadBusiness = async () => {
    const { data } = await businessService.getMyBusiness()
    if (data) {
      setBusinessType(data.business_type)
      setBusinessName(data.business_name)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/business/dashboard" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg hidden sm:inline">{businessName || 'Business'}</span>
            </Link>
            
            <Separator orientation="vertical" className="h-6 hidden lg:block" />
            
            {/* Desktop Navigation */}
            <BusinessNav businessType={businessType} className="hidden lg:flex" />
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/feed')}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar ao Feed</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t">
          <div className="container py-2">
            <BusinessNavMobile businessType={businessType} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}