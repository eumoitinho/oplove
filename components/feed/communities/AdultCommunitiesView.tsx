"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AdultCommunitiesView() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the communities page
    router.push("/communities")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  )
}