"use client"

import { useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export function useSecurityProtection() {
  const { user } = useAuth()

  // Log security event
  const logSecurityEvent = useCallback(async (eventType: string, details: any) => {
    try {
      // TODO: Send to analytics/logging service
      console.warn(`[SECURITY] ${eventType}:`, {
        user: user?.username || 'anonymous',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...details
      })
      
      // Could send to backend for monitoring
      // await fetch('/api/security/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ eventType, details, user: user?.id })
      // })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }, [user])

  // Detect DevTools opening
  const detectDevTools = useCallback(() => {
    let devtools = false
    const threshold = 160

    const detect = () => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools) {
          devtools = true
          logSecurityEvent('DEVTOOLS_OPENED', {
            windowSize: {
              outer: { width: window.outerWidth, height: window.outerHeight },
              inner: { width: window.innerWidth, height: window.innerHeight }
            }
          })
          
          // Clear console and show warning
          console.clear()
          console.log(
            '%c⚠️ ACESSO NEGADO!',
            'color: #ff0000; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
          )
          console.log(
            '%cEste conteúdo é protegido por direitos autorais.\nQualquer tentativa de captura será registrada.',
            'color: #ff0000; font-size: 16px; font-weight: bold;'
          )
          console.log(
            '%cUsuário: @' + (user?.username || 'anonymous'),
            'color: #ff6600; font-size: 14px;'
          )
          console.log(
            '%cTimestamp: ' + new Date().toISOString(),
            'color: #ff6600; font-size: 14px;'
          )
        }
      } else {
        devtools = false
      }
    }

    const interval = setInterval(detect, 1000)
    return () => clearInterval(interval)
  }, [logSecurityEvent, user])

  // Detect screenshot attempts
  const detectScreenshot = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Common screenshot shortcuts
      const screenshotShortcuts = [
        { key: 'PrintScreen', ctrl: false, shift: false, alt: false },
        { key: 'F12', ctrl: false, shift: false, alt: false },
        { key: 'I', ctrl: true, shift: true, alt: false }, // Ctrl+Shift+I
        { key: 'J', ctrl: true, shift: true, alt: false }, // Ctrl+Shift+J
        { key: 'C', ctrl: true, shift: true, alt: false }, // Ctrl+Shift+C
        { key: 'U', ctrl: true, shift: false, alt: false }, // Ctrl+U
        { key: 'S', ctrl: true, shift: false, alt: false }, // Ctrl+S
      ]

      const isScreenshotAttempt = screenshotShortcuts.some(shortcut => 
        e.key === shortcut.key &&
        e.ctrlKey === shortcut.ctrl &&
        e.shiftKey === shortcut.shift &&
        e.altKey === shortcut.alt
      )

      if (isScreenshotAttempt) {
        e.preventDefault()
        e.stopPropagation()
        
        logSecurityEvent('SCREENSHOT_ATTEMPT', {
          key: e.key,
          modifiers: {
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey
          }
        })

        // Show warning message
        alert('⚠️ Captura de tela detectada!\n\nEste conteúdo é protegido por direitos autorais.\nA tentativa foi registrada com seus dados.')
        
        return false
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [logSecurityEvent])

  // Detect right-click attempts
  const detectRightClick = useCallback(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Check if target is secure media
      if (target.closest('.secure-media')) {
        e.preventDefault()
        e.stopPropagation()
        
        logSecurityEvent('RIGHT_CLICK_ATTEMPT', {
          target: target.tagName,
          className: target.className
        })
        
        return false
      }
    }

    document.addEventListener('contextmenu', handleContextMenu, true)
    return () => document.removeEventListener('contextmenu', handleContextMenu, true)
  }, [logSecurityEvent])

  // Detect drag attempts
  const detectDragAttempts = useCallback(() => {
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      
      if (target.closest('.secure-media')) {
        e.preventDefault()
        e.stopPropagation()
        
        logSecurityEvent('DRAG_ATTEMPT', {
          target: target.tagName,
          className: target.className
        })
        
        return false
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    document.addEventListener('dragstart', handleDragStart, true)
    document.addEventListener('drop', handleDrop, true)
    document.addEventListener('dragover', handleDragOver, true)
    
    return () => {
      document.removeEventListener('dragstart', handleDragStart, true)
      document.removeEventListener('drop', handleDrop, true)
      document.removeEventListener('dragover', handleDragOver, true)
    }
  }, [logSecurityEvent])

  // Detect window blur (possible screenshot tool usage)
  const detectWindowBlur = useCallback(() => {
    let blurStart: number | null = null
    
    const handleBlur = () => {
      blurStart = Date.now()
    }
    
    const handleFocus = () => {
      if (blurStart) {
        const blurDuration = Date.now() - blurStart
        
        // If window was blurred for a short time (possible screenshot tool)
        if (blurDuration < 3000 && blurDuration > 100) {
          logSecurityEvent('SUSPICIOUS_WINDOW_BLUR', {
            duration: blurDuration
          })
        }
        
        blurStart = null
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [logSecurityEvent])

  // Initialize all security measures
  useEffect(() => {
    const cleanupFunctions = [
      detectDevTools(),
      detectScreenshot(),
      detectRightClick(),
      detectDragAttempts(),
      detectWindowBlur()
    ]

    // Add some additional protection against tampering
    const protectConsole = () => {
      const originalLog = console.log
      const originalWarn = console.warn
      const originalError = console.error
      
      // Override console methods to detect tampering attempts
      console.log = (...args) => {
        if (args.some(arg => typeof arg === 'string' && arg.includes('security-watermark'))) {
          logSecurityEvent('CONSOLE_TAMPERING', { args })
        }
        originalLog.apply(console, args)
      }
    }

    protectConsole()

    // Cleanup all protection measures
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup?.())
    }
  }, [detectDevTools, detectScreenshot, detectRightClick, detectDragAttempts, detectWindowBlur, logSecurityEvent])

  return {
    logSecurityEvent
  }
}