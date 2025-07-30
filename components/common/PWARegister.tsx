"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration)
          
          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // Check every hour
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })

      // Handle app install prompt
      let deferredPrompt: any
      
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault()
        deferredPrompt = e
        
        // You can show a custom install button here
        // For now, we'll just log it
        console.log("App can be installed")
      })

      // Handle successful app install
      window.addEventListener("appinstalled", () => {
        console.log("PWA was installed")
        deferredPrompt = null
      })
    }
  }, [])

  return null
}