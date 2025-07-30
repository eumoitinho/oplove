"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { SWRConfig } from "swr"
import { Toaster } from "sonner"
import { fetcher } from "@/lib/fetcher"
import { PWARegister } from "./PWARegister"

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
        <PWARegister />
        <Toaster 
          position="bottom-right"
          richColors={false}
          expand={true}
          duration={4000}
          toastOptions={{
            style: {
              background: 'rgb(255 255 255 / 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgb(229 231 235)',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            },
            className: 'dark:bg-gray-800/90 dark:border-gray-700',
          }}
        />
      </SWRConfig>
    </ThemeProvider>
  )
}
