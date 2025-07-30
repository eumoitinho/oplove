"use client"

import { useRouter } from "next/navigation"
import { SearchView } from "@/components/feed/search"

export default function SearchPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return <SearchView onBack={handleBack} />
}