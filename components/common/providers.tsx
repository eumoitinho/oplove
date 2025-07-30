"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { SWRConfig } from "swr"
import { fetcher } from "@/lib/fetcher"
import { PWARegister } from "./PWARegister"
import { AuthProvider } from "@/components/auth/providers/AuthProvider"
import { EngagementToastContainer } from "@/components/common/EngagementToast"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <SWRConfig
          value={{
            fetcher,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            shouldRetryOnError: false,
          }}
        >
          {children}
          <PWARegister />
          <EngagementToastContainer />
        </SWRConfig>
      </AuthProvider>
    </ThemeProvider>
  )
}
