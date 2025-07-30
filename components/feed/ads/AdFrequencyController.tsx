"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"

interface AdFrequencyControllerProps {
  children: React.ReactNode
  adComponent: React.ReactNode
  frequency?: number // Show ad every N posts
}

export function AdFrequencyController({ children, adComponent, frequency = 5 }: AdFrequencyControllerProps) {
  const { user } = useAuth()
  const [postCount, setPostCount] = useState(0)

  // Don't show ads for premium users
  const shouldShowAds = user?.premium_type === "free"

  useEffect(() => {
    setPostCount((prev) => prev + 1)
  }, [children])

  // Show ad based on frequency and user plan
  const shouldShowAd = shouldShowAds && postCount % frequency === 0 && postCount > 0

  return (
    <>
      {children}
      {shouldShowAd && adComponent}
    </>
  )
}
