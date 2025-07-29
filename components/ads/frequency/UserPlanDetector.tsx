"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useAdFrequency } from "./AdFrequencyManager"

interface UserPlanDetectorProps {
  onPlanChange?: (newPlan: string, oldPlan: string) => void
  children: React.ReactNode
}

export function UserPlanDetector({ onPlanChange, children }: UserPlanDetectorProps) {
  const { user } = useAuth()
  const { resetCounts } = useAdFrequency()

  useEffect(() => {
    const storedPlan = localStorage.getItem("user_plan")
    const currentPlan = user?.premium_type || "free"

    if (storedPlan && storedPlan !== currentPlan) {
      // Plan changed
      onPlanChange?.(currentPlan, storedPlan)

      // Reset ad frequency counters
      resetCounts()

      // Show upgrade success message for premium plans
      if (["gold", "diamond", "couple"].includes(currentPlan) && storedPlan === "free") {
        showUpgradeSuccess(currentPlan)
      }
    }

    // Store current plan
    localStorage.setItem("user_plan", currentPlan)
  }, [user?.premium_type, onPlanChange, resetCounts])

  return <>{children}</>
}

function showUpgradeSuccess(plan: string) {
  // This would integrate with your toast/notification system
  const messages = {
    gold: "🎉 Upgrade para Gold realizado! Menos anúncios e mais recursos.",
    diamond: "💎 Bem-vindo ao Diamond! Experiência premium sem anúncios.",
    couple: "👫 Plano Couple ativado! Recursos premium para vocês dois.",
  }

  // Example toast notification
  if (typeof window !== "undefined") {
    // This would use your actual toast system
    console.log(messages[plan as keyof typeof messages])
  }
}
