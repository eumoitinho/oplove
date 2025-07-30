"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { SWRConfig } from "swr"
import { Toaster } from "sonner"
import { fetcher } from "@/lib/fetcher"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          shouldRetryOnError: false,
        }}
      >
        {children}
        <Toaster 
          position="top-right"
          richColors
          expand
          duration={4000}
        />
      </SWRConfig>
    </ThemeProvider>
  )
}
