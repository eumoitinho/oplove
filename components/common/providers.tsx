"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { SWRConfig } from "swr"
import { Toaster } from "react-hot-toast"
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
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </SWRConfig>
    </ThemeProvider>
  )
}
