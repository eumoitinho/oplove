"use client"

import type React from "react"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Sparkles, MessageCircle, Heart } from "lucide-react"

type ToastType = "post" | "message" | "like"

interface ToastProps {
  type: ToastType
  count?: number
  onClose: () => void
}

export default function Toast({ type, count = 1, onClose }: ToastProps) {
  useEffect(() => {
    // Para posts novos, não auto-remove
    if (type === "post") return

    const timer = setTimeout(() => {
      onClose()
    }, 4000) // Toast desaparece após 4 segundos para outros tipos

    return () => clearTimeout(timer)
  }, [onClose, type])

  let message = ""
  let IconComponent: React.ElementType = Sparkles

  switch (type) {
    case "post":
      message = `${count} novo${count > 1 ? "s" : ""} post${count > 1 ? "s" : ""} no seu feed`
      IconComponent = Sparkles
      break
    case "message":
      message = `${count} nova${count > 1 ? "s" : ""} mensagem${count > 1 ? "ns" : ""}`
      IconComponent = MessageCircle
      break
    case "like":
      message = `${count} nova${count > 1 ? "s" : ""} curtida${count > 1 ? "s" : ""}`
      IconComponent = Heart
      break
    default:
      message = "Nova notificação!"
      IconComponent = Sparkles
  }

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-toast-slide-in">
      <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-full px-6 py-3 shadow-lg flex items-center gap-3 min-w-fit">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <span className="text-gray-900 dark:text-white text-sm font-medium whitespace-nowrap">{message}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:hover:text-white/80 flex-shrink-0 rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
