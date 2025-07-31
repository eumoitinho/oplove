import { useState, useEffect, useCallback } from 'react'

export interface CameraPermissionStatus {
  state: 'granted' | 'denied' | 'prompt' | 'unknown'
  supported: boolean
  secureContext: boolean
  devices: MediaDeviceInfo[]
  error: string | null
}

export interface CameraCapabilities {
  hasCamera: boolean
  canAccessCamera: boolean
  browserSupported: boolean
  httpsRequired: boolean
  errorMessage: string | null
}

export function useCameraPermissions() {
  const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>({
    state: 'unknown',
    supported: false,
    secureContext: false,
    devices: [],
    error: null
  })

  const [capabilities, setCapabilities] = useState<CameraCapabilities>({
    hasCamera: false,
    canAccessCamera: false,
    browserSupported: false,
    httpsRequired: false,
    errorMessage: null
  })

  const checkCapabilities = useCallback(async () => {
    console.log('🔍 Verificando capacidades da câmera...')
    
    const newCapabilities: CameraCapabilities = {
      hasCamera: false,
      canAccessCamera: false,
      browserSupported: false,
      httpsRequired: false,
      errorMessage: null
    }

    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      newCapabilities.errorMessage = 'Seu navegador não suporta acesso à câmera. Por favor, use Chrome, Firefox, Safari ou Edge atualizados.'
      setCapabilities(newCapabilities)
      return newCapabilities
    }

    newCapabilities.browserSupported = true

    // Check secure context
    if (!window.isSecureContext && !window.location.hostname.includes('localhost')) {
      newCapabilities.httpsRequired = true
      newCapabilities.errorMessage = 'Acesso à câmera requer conexão segura (HTTPS). Verifique se você está acessando o site via HTTPS.'
      setCapabilities(newCapabilities)
      return newCapabilities
    }

    try {
      // Check for available devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      console.log(`📹 Encontrados ${videoDevices.length} dispositivos de vídeo`)
      
      if (videoDevices.length === 0) {
        newCapabilities.errorMessage = 'Nenhuma câmera encontrada no dispositivo.'
        setCapabilities(newCapabilities)
        return newCapabilities
      }

      newCapabilities.hasCamera = true
      newCapabilities.canAccessCamera = true

      setCapabilities(newCapabilities)
      return newCapabilities
    } catch (error: any) {
      console.error('❌ Erro ao verificar dispositivos:', error)
      newCapabilities.errorMessage = `Erro ao verificar dispositivos: ${error.message}`
      setCapabilities(newCapabilities)
      return newCapabilities
    }
  }, [])

  const checkPermissions = useCallback(async () => {
    console.log('🔐 Verificando permissões da câmera...')
    
    if (!navigator.mediaDevices) {
      setPermissionStatus({
        state: 'denied',
        supported: false,
        secureContext: window.isSecureContext,
        devices: [],
        error: 'MediaDevices API não suportada'
      })
      return
    }

    try {
      // Check permission status if available
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
          console.log('📋 Status da permissão:', permission.state)
          
          const devices = await navigator.mediaDevices.enumerateDevices()
          const videoDevices = devices.filter(device => device.kind === 'videoinput')
          
          setPermissionStatus({
            state: permission.state as any,
            supported: true,
            secureContext: window.isSecureContext,
            devices: videoDevices,
            error: null
          })
          
          return
        } catch (permError) {
          console.warn('⚠️ Não foi possível verificar permissões via API:', permError)
        }
      }

      // Fallback: enumerate devices to check permissions
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      // If devices have labels, permission was already granted
      const hasLabels = videoDevices.some(device => device.label !== '')
      
      setPermissionStatus({
        state: hasLabels ? 'granted' : 'prompt',
        supported: true,
        secureContext: window.isSecureContext,
        devices: videoDevices,
        error: null
      })

    } catch (error: any) {
      console.error('❌ Erro ao verificar permissões:', error)
      setPermissionStatus({
        state: 'denied',
        supported: true,
        secureContext: window.isSecureContext,
        devices: [],
        error: error.message
      })
    }
  }, [])

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    console.log('🚀 Solicitando permissões da câmera...')
    
    try {
      // First check capabilities
      const caps = await checkCapabilities()
      if (!caps.canAccessCamera) {
        console.error('❌ Câmera não pode ser acessada:', caps.errorMessage)
        return false
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })

      console.log('✅ Permissão concedida')
      
      // Stop the stream immediately as we only wanted to check permissions
      stream.getTracks().forEach(track => track.stop())
      
      // Update permission status
      await checkPermissions()
      
      return true
    } catch (error: any) {
      console.error('❌ Erro ao solicitar permissões:', error)
      
      // Update permission status based on error
      let state: CameraPermissionStatus['state'] = 'denied'
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        state = 'denied'
      } else if (error.name === 'NotFoundError') {
        state = 'denied' // No camera available
      }
      
      setPermissionStatus(prev => ({
        ...prev,
        state,
        error: error.message
      }))
      
      return false
    }
  }, [checkCapabilities, checkPermissions])

  const getDiagnosticInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      isSecureContext: window.isSecureContext,
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      hasPermissionsAPI: 'permissions' in navigator,
      permissionStatus: permissionStatus.state,
      deviceCount: permissionStatus.devices.length,
      capabilities
    }
  }, [permissionStatus, capabilities])

  useEffect(() => {
    checkCapabilities()
    checkPermissions()
  }, [checkCapabilities, checkPermissions])

  return {
    permissionStatus,
    capabilities,
    checkPermissions,
    requestPermissions,
    checkCapabilities,
    getDiagnosticInfo,
    isReady: capabilities.canAccessCamera && permissionStatus.state === 'granted',
    needsPermission: permissionStatus.state === 'prompt',
    isBlocked: permissionStatus.state === 'denied' || !capabilities.canAccessCamera
  }
}