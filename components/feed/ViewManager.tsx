'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ViewManagerProps {
  views: Record<string, ReactNode>
  activeView: string
  className?: string
}

export function ViewManager({ views, activeView, className }: ViewManagerProps) {
  // Keep track of which views have been loaded
  const loadedViews = useRef<Set<string>>(new Set())
  
  // Mark the active view as loaded
  useEffect(() => {
    loadedViews.current.add(activeView)
  }, [activeView])

  return (
    <div className={cn("relative", className)}>
      {Object.entries(views).map(([viewKey, ViewComponent]) => {
        // Only render views that have been loaded at least once
        const shouldRender = loadedViews.current.has(viewKey)
        const isActive = viewKey === activeView
        
        if (!shouldRender) {
          return null
        }

        return (
          <div
            key={viewKey}
            className={cn(
              "w-full",
              isActive ? "block" : "hidden"
            )}
            // Keep the view in DOM but hide it with CSS
            style={{
              display: isActive ? 'block' : 'none'
            }}
          >
            {ViewComponent}
          </div>
        )
      })}
    </div>
  )
}