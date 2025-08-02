"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Bell, X, AlertCircle } from 'lucide-react'
import { useNotificationPermission } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'

interface NotificationPermissionBannerProps {
  onPermissionGranted?: () => void
  onDismiss?: () => void
  className?: string
}

export function NotificationPermissionBanner({
  onPermissionGranted,
  onDismiss,
  className
}: NotificationPermissionBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  
  const { hasPermission, requestPermission, permissions, isAvailable } = useNotificationPermission({
    onGranted: () => {
      setIsVisible(false)
      onPermissionGranted?.()
      // Save preference
      localStorage.setItem('notification-permission-granted', 'true')
    },
    onDenied: () => {
      setIsVisible(false)
      // Save that user denied
      localStorage.setItem('notification-permission-denied', 'true')
    }
  })
  
  const notificationPermission = permissions.get('notifications')
  const canUseNotifications = isAvailable('notifications')

  useEffect(() => {
    // Check if user has already been asked or dismissed
    const hasGranted = localStorage.getItem('notification-permission-granted')
    const hasDenied = localStorage.getItem('notification-permission-denied')
    const hasDismissed = localStorage.getItem('notification-banner-dismissed')
    
    if (hasGranted || hasDenied || hasDismissed) {
      return
    }

    // Check current permission status
    if (canUseNotifications && notificationPermission?.status === 'prompt') {
      // Show banner after a delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 5000) // Show after 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [canUseNotifications, notificationPermission?.status])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    localStorage.setItem('notification-banner-dismissed', 'true')
    onDismiss?.()
  }

  const handleEnable = async () => {
    await requestPermission('notifications')
  }

  if (!canUseNotifications || isDismissed || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto",
            className
          )}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Ative as notificações
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Receba alertas de mensagens, curtidas e novos seguidores
                </p>
                
                <div className="flex gap-3 mt-3">
                  <Button
                    onClick={handleEnable}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Ativar agora
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="ghost"
                  >
                    Agora não
                  </Button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Minimal notification permission prompt
export function NotificationPermissionPrompt({ 
  className 
}: { 
  className?: string 
}) {
  const { hasPermission, requestPermission, isAvailable } = useNotificationPermission()
  
  if (!isAvailable('notifications') || hasPermission('notifications')) {
    return null
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <AlertCircle className="w-4 h-4 text-orange-500" />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Notificações desativadas
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => requestPermission('notifications')}
        className="text-purple-600 hover:text-purple-700"
      >
        Ativar
      </Button>
    </div>
  )
}