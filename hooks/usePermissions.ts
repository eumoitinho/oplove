"use client"

import { useState, useEffect, useCallback } from 'react'
import { permissionsService, PermissionType, PermissionStatus, PermissionState } from '@/lib/services/permissions-service'
import { toast } from 'sonner'

interface UsePermissionsOptions {
  autoRequest?: boolean
  showToast?: boolean
  onGranted?: (type: PermissionType) => void
  onDenied?: (type: PermissionType) => void
}

interface UsePermissionsReturn {
  // Permission states
  permissions: Map<PermissionType, PermissionState>
  
  // Check methods
  checkPermission: (type: PermissionType) => Promise<PermissionStatus>
  checkMultiple: (types: PermissionType[]) => Promise<Map<PermissionType, PermissionState>>
  hasPermission: (type: PermissionType) => boolean
  isAvailable: (type: PermissionType) => boolean
  
  // Request methods
  requestPermission: (type: PermissionType) => Promise<boolean>
  requestMultiple: (types: PermissionType[]) => Promise<Map<PermissionType, PermissionState>>
  
  // Device info
  capabilities: ReturnType<typeof permissionsService.getCapabilities>
  
  // State
  isChecking: boolean
  isRequesting: boolean
  error: Error | null
  
  // Actions
  refresh: () => Promise<void>
  reset: () => void
}

export function usePermissions(
  requiredPermissions: PermissionType[] = [],
  options: UsePermissionsOptions = {}
): UsePermissionsReturn {
  const { autoRequest = false, showToast = true, onGranted, onDenied } = options
  
  const [permissions, setPermissions] = useState<Map<PermissionType, PermissionState>>(new Map())
  const [isChecking, setIsChecking] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [capabilities] = useState(() => permissionsService.getCapabilities())

  // Check all required permissions on mount
  useEffect(() => {
    if (requiredPermissions.length > 0) {
      checkMultiple(requiredPermissions)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto request permissions if needed
  useEffect(() => {
    if (autoRequest && requiredPermissions.length > 0) {
      const needsPermission = Array.from(permissions.values()).some(
        state => state.status === 'prompt'
      )
      
      if (needsPermission && !isRequesting) {
        requestMultiple(requiredPermissions.filter(type => {
          const state = permissions.get(type)
          return state?.status === 'prompt'
        }))
      }
    }
  }, [permissions, autoRequest, isRequesting]) // eslint-disable-line react-hooks/exhaustive-deps

  // Check single permission
  const checkPermission = useCallback(async (type: PermissionType): Promise<PermissionStatus> => {
    try {
      setError(null)
      const state = await permissionsService.getPermissionStatus(type)
      
      setPermissions(prev => {
        const next = new Map(prev)
        next.set(type, state)
        return next
      })
      
      return state.status
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check permission')
      setError(error)
      if (showToast) {
        toast.error(`Erro ao verificar permissão: ${error.message}`)
      }
      return 'unavailable'
    }
  }, [showToast])

  // Check multiple permissions
  const checkMultiple = useCallback(async (types: PermissionType[]): Promise<Map<PermissionType, PermissionState>> => {
    try {
      setIsChecking(true)
      setError(null)
      
      const results = await permissionsService.checkMultiplePermissions(types)
      setPermissions(results)
      
      return results
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check permissions')
      setError(error)
      if (showToast) {
        toast.error(`Erro ao verificar permissões: ${error.message}`)
      }
      return new Map()
    } finally {
      setIsChecking(false)
    }
  }, [showToast])

  // Request single permission
  const requestPermission = useCallback(async (type: PermissionType): Promise<boolean> => {
    try {
      setIsRequesting(true)
      setError(null)
      
      const state = await permissionsService.requestPermission(type)
      
      setPermissions(prev => {
        const next = new Map(prev)
        next.set(type, state)
        return next
      })
      
      if (state.status === 'granted') {
        onGranted?.(type)
        return true
      } else if (state.status === 'denied') {
        onDenied?.(type)
        return false
      }
      
      return false
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to request permission')
      setError(error)
      if (showToast) {
        toast.error(`Erro ao solicitar permissão: ${error.message}`)
      }
      return false
    } finally {
      setIsRequesting(false)
    }
  }, [onGranted, onDenied, showToast])

  // Request multiple permissions
  const requestMultiple = useCallback(async (types: PermissionType[]): Promise<Map<PermissionType, PermissionState>> => {
    try {
      setIsRequesting(true)
      setError(null)
      
      const results = await permissionsService.requestMultiplePermissions(types)
      setPermissions(results)
      
      // Call callbacks for each permission
      results.forEach((state, type) => {
        if (state.status === 'granted') {
          onGranted?.(type)
        } else if (state.status === 'denied') {
          onDenied?.(type)
        }
      })
      
      return results
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to request permissions')
      setError(error)
      if (showToast) {
        toast.error(`Erro ao solicitar permissões: ${error.message}`)
      }
      return new Map()
    } finally {
      setIsRequesting(false)
    }
  }, [onGranted, onDenied, showToast])

  // Check if has permission (from local state)
  const hasPermission = useCallback((type: PermissionType): boolean => {
    const state = permissions.get(type)
    return state?.status === 'granted'
  }, [permissions])

  // Check if permission is available on device
  const isAvailable = useCallback((type: PermissionType): boolean => {
    return permissionsService.isPermissionAvailable(type)
  }, [])

  // Refresh all permissions
  const refresh = useCallback(async () => {
    if (requiredPermissions.length > 0) {
      await checkMultiple(requiredPermissions)
    } else {
      // Refresh all cached permissions
      const cached = permissionsService.getCachedPermissions()
      if (cached.size > 0) {
        await checkMultiple(Array.from(cached.keys()))
      }
    }
  }, [requiredPermissions, checkMultiple])

  // Reset cache
  const reset = useCallback(() => {
    permissionsService.resetCache()
    setPermissions(new Map())
    setError(null)
  }, [])

  return {
    permissions,
    checkPermission,
    checkMultiple,
    hasPermission,
    isAvailable,
    requestPermission,
    requestMultiple,
    capabilities,
    isChecking,
    isRequesting,
    error,
    refresh,
    reset
  }
}

// Convenience hooks for specific permissions
export function useCameraPermission(options?: UsePermissionsOptions) {
  return usePermissions(['camera'], options)
}

export function useMicrophonePermission(options?: UsePermissionsOptions) {
  return usePermissions(['microphone'], options)
}

export function useLocationPermission(options?: UsePermissionsOptions) {
  return usePermissions(['location'], options)
}

export function useNotificationPermission(options?: UsePermissionsOptions) {
  return usePermissions(['notifications'], options)
}

export function useMediaPermissions(options?: UsePermissionsOptions) {
  return usePermissions(['camera', 'microphone'], options)
}

export function useAllPermissions(options?: UsePermissionsOptions) {
  return usePermissions(['camera', 'microphone', 'location', 'notifications', 'storage'], options)
}