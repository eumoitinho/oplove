"use client"

import { ReactNode } from "react"
import { Header } from "@/components/feed/Header"
import { LeftSidebar } from "@/components/feed/LeftSidebar"
import { RightSidebar } from "@/components/feed/RightSidebar"

interface MainLayoutProps {
  children: ReactNode
  showLeftSidebar?: boolean
  showRightSidebar?: boolean
  leftSidebarProps?: any
  rightSidebarProps?: any
}

export function MainLayout({ 
  children, 
  showLeftSidebar = true, 
  showRightSidebar = true,
  leftSidebarProps = {},
  rightSidebarProps = {}
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 pt-20">
          {/* Left Sidebar */}
          {showLeftSidebar && (
            <div className="hidden lg:block w-64 flex-shrink-0">
              <LeftSidebar {...leftSidebarProps} />
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Right Sidebar */}
          {showRightSidebar && (
            <div className="hidden xl:block w-80 flex-shrink-0">
              <RightSidebar {...rightSidebarProps} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}