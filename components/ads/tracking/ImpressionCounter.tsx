"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

interface ImpressionCounterProps {
  adId: string
  onImpression: (data: {
    adId: string
    viewTime: number
    viewportPercentage: number
    scrollDepth: number
  }) => void
  threshold?: number
  minViewTime?: number
  children: React.ReactNode
}

export function ImpressionCounter({
  adId,
  onImpression,
  threshold = 0.5,
  minViewTime = 1000,
  children,
}: ImpressionCounterProps) {
  const [hasTracked, setHasTracked] = useState(false)
  const [viewStartTime, setViewStartTime] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  const { ref, inView, entry } = useInView({
    threshold,
    triggerOnce: false,
  })

  useEffect(() => {
    if (inView && !hasTracked) {
      // Start tracking view time
      setViewStartTime(Date.now())

      timerRef.current = setTimeout(() => {
        if (entry) {
          const viewportPercentage = Math.round((entry.intersectionRatio || 0) * 100)

          const scrollDepth = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100,
          )

          onImpression({
            adId,
            viewTime: minViewTime,
            viewportPercentage,
            scrollDepth,
          })

          setHasTracked(true)
        }
      }, minViewTime)
    } else if (!inView && viewStartTime) {
      // Clear timer if ad goes out of view
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      setViewStartTime(null)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [inView, hasTracked, entry, adId, onImpression, minViewTime, viewStartTime])

  return <div ref={ref}>{children}</div>
}
