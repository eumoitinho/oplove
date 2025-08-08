"use client"

import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingScreen({ 
  message = "Carregando...", 
  fullScreen = true 
}: LoadingScreenProps) {
  const containerClass = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
    : "flex items-center justify-center p-8"

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Spinner rosa simples */}
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
        
        {/* Texto */}
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  )
}