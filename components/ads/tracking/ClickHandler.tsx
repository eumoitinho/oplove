"use client"

import type React from "react"

import { useCallback } from "react"

interface ClickHandlerProps {
  adId: string
  targetUrl?: string
  onTrack: (data: {
    adId: string
    targetUrl?: string
    clickPosition: { x: number; y: number }
    timestamp: number
  }) => void
  children: React.ReactNode
  className?: string
}

export function ClickHandler({ adId, targetUrl, onTrack, children, className }: ClickHandlerProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      // Track click position and metadata
      const clickData = {
        adId,
        targetUrl,
        clickPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        timestamp: Date.now(),
      }

      onTrack(clickData)

      // Open URL if provided
      if (targetUrl) {
        // Prevent default to handle custom tracking
        event.preventDefault()

        // Small delay to ensure tracking completes
        setTimeout(() => {
          window.open(targetUrl, "_blank", "noopener,noreferrer")
        }, 100)
      }
    },
    [adId, targetUrl, onTrack],
  )

  return (
    <div onClick={handleClick} className={className} style={{ cursor: targetUrl ? "pointer" : "default" }}>
      {children}
    </div>
  )
}
