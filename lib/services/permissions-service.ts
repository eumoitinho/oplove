"use client"

import { toast } from 'sonner'

// Types for permissions
export type PermissionType = 
  | 'camera'
  | 'microphone'
  | 'location'
  | 'notifications'
  | 'storage'
  | 'gallery'

export type PermissionStatus = 
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'unavailable'
  | 'checking'

interface PermissionState {
  status: PermissionStatus
  lastChecked?: Date
  error?: string
}

interface DeviceCapabilities {
  hasCamera: boolean
  hasMicrophone: boolean
  hasGeolocation: boolean
  hasNotifications: boolean
  hasFileAccess: boolean
  isIOS: boolean
  isAndroid: boolean
  isMobile: boolean
  isDesktop: boolean
  isMacOS: boolean
  isWindows: boolean
  isLinux: boolean
  browserName: string
  browserVersion: string
}

class PermissionsService {
  private permissions: Map<PermissionType, PermissionState> = new Map()
  private capabilities: DeviceCapabilities | null = null

  constructor() {
    this.detectCapabilities()
  }

  // Detect device capabilities
  private detectCapabilities() {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      this.capabilities = {
        hasCamera: false,
        hasMicrophone: false,
        hasGeolocation: false,
        hasNotifications: false,
        hasFileAccess: false,
        isIOS: false,
        isAndroid: false,
        isMobile: false,
        isDesktop: true,
        isMacOS: false,
        isWindows: false,
        isLinux: false,
        browserName: 'Unknown',
        browserVersion: '0'
      }
      return
    }

    const ua = navigator.userAgent
    const platform = navigator.platform || ''
    
    this.capabilities = {
      hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      hasMicrophone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      hasGeolocation: 'geolocation' in navigator,
      hasNotifications: 'Notification' in window,
      hasFileAccess: 'showOpenFilePicker' in window || 'HTMLInputElement' in window,
      isIOS: /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream,
      isAndroid: /Android/.test(ua),
      isMobile: /Mobile|Android|iPhone|iPad|iPod/.test(ua),
      isDesktop: !/Mobile|Android|iPhone|iPad|iPod/.test(ua),
      isMacOS: platform.indexOf('Mac') > -1,
      isWindows: platform.indexOf('Win') > -1,
      isLinux: platform.indexOf('Linux') > -1,
      browserName: this.getBrowserName(ua),
      browserVersion: this.getBrowserVersion(ua)
    }
  }

  private getBrowserName(ua: string): string {
    if (ua.indexOf('Chrome') > -1) return 'Chrome'
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari'
    if (ua.indexOf('Firefox') > -1) return 'Firefox'
    if (ua.indexOf('Edge') > -1) return 'Edge'
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera'
    return 'Unknown'
  }

  private getBrowserVersion(ua: string): string {
    const match = ua.match(/(Chrome|Safari|Firefox|Edge|Opera|OPR)\/(\d+)/)
    return match ? match[2] : '0'
  }

  // Check if permission API is available
  private async checkPermissionAPI(name: PermissionName): Promise<PermissionStatus> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('permissions' in navigator)) {
      return 'prompt'
    }

    try {
      const result = await navigator.permissions.query({ name } as any)
      return result.state as PermissionStatus
    } catch (error) {
      // Permission API not supported for this permission
      return 'prompt'
    }
  }

  // Get current permission status
  async getPermissionStatus(type: PermissionType): Promise<PermissionState> {
    const cached = this.permissions.get(type)
    if (cached && cached.lastChecked) {
      const age = Date.now() - cached.lastChecked.getTime()
      if (age < 5000) { // Cache for 5 seconds
        return cached
      }
    }

    const state: PermissionState = {
      status: 'checking',
      lastChecked: new Date()
    }

    try {
      switch (type) {
        case 'camera':
          state.status = await this.checkCameraPermission()
          break
        case 'microphone':
          state.status = await this.checkMicrophonePermission()
          break
        case 'location':
          state.status = await this.checkLocationPermission()
          break
        case 'notifications':
          state.status = await this.checkNotificationPermission()
          break
        case 'storage':
        case 'gallery':
          state.status = await this.checkStoragePermission()
          break
        default:
          state.status = 'unavailable'
      }
    } catch (error) {
      state.status = 'unavailable'
      state.error = error instanceof Error ? error.message : 'Unknown error'
    }

    this.permissions.set(type, state)
    return state
  }

  // Check camera permission
  private async checkCameraPermission(): Promise<PermissionStatus> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !this.capabilities?.hasCamera) return 'unavailable'

    // Try permissions API first
    const apiStatus = await this.checkPermissionAPI('camera' as PermissionName)
    if (apiStatus !== 'prompt') return apiStatus

    // Check if already granted by trying to enumerate devices
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(d => d.kind === 'videoinput')
      if (cameras.some(c => c.label !== '')) {
        return 'granted'
      }
    } catch (error) {
      console.error('Error checking camera:', error)
    }

    return 'prompt'
  }

  // Check microphone permission
  private async checkMicrophonePermission(): Promise<PermissionStatus> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !this.capabilities?.hasMicrophone) return 'unavailable'

    // Try permissions API first
    const apiStatus = await this.checkPermissionAPI('microphone' as PermissionName)
    if (apiStatus !== 'prompt') return apiStatus

    // Check if already granted by trying to enumerate devices
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const mics = devices.filter(d => d.kind === 'audioinput')
      if (mics.some(m => m.label !== '')) {
        return 'granted'
      }
    } catch (error) {
      console.error('Error checking microphone:', error)
    }

    return 'prompt'
  }

  // Check location permission
  private async checkLocationPermission(): Promise<PermissionStatus> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !this.capabilities?.hasGeolocation) return 'unavailable'

    const apiStatus = await this.checkPermissionAPI('geolocation' as PermissionName)
    return apiStatus
  }

  // Check notification permission
  private async checkNotificationPermission(): Promise<PermissionStatus> {
    if (typeof window === 'undefined' || !this.capabilities?.hasNotifications) return 'unavailable'

    const permission = Notification.permission
    if (permission === 'granted') return 'granted'
    if (permission === 'denied') return 'denied'
    return 'prompt'
  }

  // Check storage/gallery permission
  private async checkStoragePermission(): Promise<PermissionStatus> {
    if (!this.capabilities?.hasFileAccess) return 'unavailable'
    
    // Storage is generally always available in browsers
    // For native apps, this would check platform-specific permissions
    return 'granted'
  }

  // Request permission with proper UI feedback
  async requestPermission(type: PermissionType): Promise<PermissionState> {
    const currentState = await this.getPermissionStatus(type)
    
    if (currentState.status === 'granted') {
      return currentState
    }

    if (currentState.status === 'denied') {
      this.showPermissionDeniedInstructions(type)
      return currentState
    }

    if (currentState.status === 'unavailable') {
      toast.error(`${this.getPermissionName(type)} não está disponível neste dispositivo`)
      return currentState
    }

    // Request permission based on type
    try {
      switch (type) {
        case 'camera':
          return await this.requestCameraPermission()
        case 'microphone':
          return await this.requestMicrophonePermission()
        case 'location':
          return await this.requestLocationPermission()
        case 'notifications':
          return await this.requestNotificationPermission()
        case 'storage':
        case 'gallery':
          return await this.requestStoragePermission()
        default:
          throw new Error('Unknown permission type')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao solicitar permissão'
      toast.error(errorMessage)
      
      return {
        status: 'denied',
        lastChecked: new Date(),
        error: errorMessage
      }
    }
  }

  // Request camera permission
  private async requestCameraPermission(): Promise<PermissionState> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      throw new Error('Camera not available in server environment')
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      
      const state: PermissionState = {
        status: 'granted',
        lastChecked: new Date()
      }
      
      this.permissions.set('camera', state)
      toast.success('Acesso à câmera permitido')
      return state
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          return {
            status: 'denied',
            lastChecked: new Date(),
            error: 'Acesso à câmera negado'
          }
        }
      }
      throw error
    }
  }

  // Request microphone permission
  private async requestMicrophonePermission(): Promise<PermissionState> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      throw new Error('Microphone not available in server environment')
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      
      const state: PermissionState = {
        status: 'granted',
        lastChecked: new Date()
      }
      
      this.permissions.set('microphone', state)
      toast.success('Acesso ao microfone permitido')
      return state
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          return {
            status: 'denied',
            lastChecked: new Date(),
            error: 'Acesso ao microfone negado'
          }
        }
      }
      throw error
    }
  }

  // Request location permission
  private async requestLocationPermission(): Promise<PermissionState> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      throw new Error('Geolocation not available in server environment')
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const state: PermissionState = {
            status: 'granted',
            lastChecked: new Date()
          }
          this.permissions.set('location', state)
          toast.success('Acesso à localização permitido')
          resolve(state)
        },
        (error) => {
          const state: PermissionState = {
            status: error.code === 1 ? 'denied' : 'unavailable',
            lastChecked: new Date(),
            error: error.message
          }
          this.permissions.set('location', state)
          resolve(state)
        },
        {
          timeout: 10000,
          maximumAge: 0,
          enableHighAccuracy: true
        }
      )
    })
  }

  // Request notification permission
  private async requestNotificationPermission(): Promise<PermissionState> {
    if (typeof window === 'undefined') {
      throw new Error('Notifications not available in server environment')
    }

    try {
      const result = await Notification.requestPermission()
      
      const state: PermissionState = {
        status: result === 'granted' ? 'granted' : result === 'denied' ? 'denied' : 'prompt',
        lastChecked: new Date()
      }
      
      this.permissions.set('notifications', state)
      
      if (result === 'granted') {
        toast.success('Notificações ativadas')
      }
      
      return state
    } catch (error) {
      throw error
    }
  }

  // Request storage/gallery permission
  private async requestStoragePermission(): Promise<PermissionState> {
    // For web, storage is generally always available
    // This is mainly for future native app support
    const state: PermissionState = {
      status: 'granted',
      lastChecked: new Date()
    }
    
    this.permissions.set('storage', state)
    this.permissions.set('gallery', state)
    
    return state
  }

  // Show instructions for denied permissions
  private showPermissionDeniedInstructions(type: PermissionType) {
    const name = this.getPermissionName(type)
    const instructions = this.getPermissionInstructions(type)
    
    toast.error(`${name} foi negado`, {
      description: instructions,
      duration: 10000,
      action: {
        label: 'Configurações',
        onClick: () => this.openSettings()
      }
    })
  }

  // Get friendly permission name
  private getPermissionName(type: PermissionType): string {
    const names: Record<PermissionType, string> = {
      camera: 'Câmera',
      microphone: 'Microfone',
      location: 'Localização',
      notifications: 'Notificações',
      storage: 'Armazenamento',
      gallery: 'Galeria'
    }
    return names[type]
  }

  // Get platform-specific instructions
  private getPermissionInstructions(type: PermissionType): string {
    const { isIOS, isAndroid, isMacOS, isWindows, browserName } = this.capabilities || {}
    
    if (isIOS) {
      return `Vá em Configurações > Safari > ${this.getPermissionName(type)} e permita o acesso`
    }
    
    if (isAndroid) {
      return `Vá em Configurações > Apps > ${browserName} > Permissões > ${this.getPermissionName(type)}`
    }
    
    if (isMacOS) {
      return `Vá em Preferências do Sistema > Segurança e Privacidade > ${this.getPermissionName(type)}`
    }
    
    if (isWindows) {
      return `Vá em Configurações > Privacidade > ${this.getPermissionName(type)}`
    }
    
    return `Verifique as configurações do navegador para ${this.getPermissionName(type)}`
  }

  // Open system settings (when possible)
  private openSettings() {
    if (typeof window === 'undefined') return
    
    // This would be implemented differently for native apps
    // For web, we can only show instructions
    const url = this.getSettingsURL()
    if (url) {
      window.open(url, '_blank')
    }
  }

  // Get settings URL based on browser
  private getSettingsURL(): string | null {
    const { browserName } = this.capabilities || {}
    
    switch (browserName) {
      case 'Chrome':
        return 'chrome://settings/content'
      case 'Firefox':
        return 'about:preferences#privacy'
      case 'Safari':
        return null // Safari doesn't support direct settings URLs
      default:
        return null
    }
  }

  // Check multiple permissions at once
  async checkMultiplePermissions(types: PermissionType[]): Promise<Map<PermissionType, PermissionState>> {
    const results = new Map<PermissionType, PermissionState>()
    
    await Promise.all(
      types.map(async (type) => {
        const state = await this.getPermissionStatus(type)
        results.set(type, state)
      })
    )
    
    return results
  }

  // Request multiple permissions
  async requestMultiplePermissions(types: PermissionType[]): Promise<Map<PermissionType, PermissionState>> {
    const results = new Map<PermissionType, PermissionState>()
    
    for (const type of types) {
      const state = await this.requestPermission(type)
      results.set(type, state)
      
      // Add delay between requests to avoid overwhelming the user
      if (state.status === 'prompt') {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    return results
  }

  // Get device capabilities
  getCapabilities(): DeviceCapabilities | null {
    return this.capabilities
  }

  // Check if permission is available on this device
  isPermissionAvailable(type: PermissionType): boolean {
    if (!this.capabilities) return false
    
    switch (type) {
      case 'camera':
        return this.capabilities.hasCamera
      case 'microphone':
        return this.capabilities.hasMicrophone
      case 'location':
        return this.capabilities.hasGeolocation
      case 'notifications':
        return this.capabilities.hasNotifications
      case 'storage':
      case 'gallery':
        return this.capabilities.hasFileAccess
      default:
        return false
    }
  }

  // Reset cached permissions
  resetCache() {
    this.permissions.clear()
  }

  // Get all cached permissions
  getCachedPermissions(): Map<PermissionType, PermissionState> {
    return new Map(this.permissions)
  }
}

// Export singleton instance
export const permissionsService = new PermissionsService()

// Export helper functions
export async function checkPermission(type: PermissionType): Promise<PermissionStatus> {
  const state = await permissionsService.getPermissionStatus(type)
  return state.status
}

export async function requestPermission(type: PermissionType): Promise<boolean> {
  const state = await permissionsService.requestPermission(type)
  return state.status === 'granted'
}

export async function hasPermission(type: PermissionType): Promise<boolean> {
  const state = await permissionsService.getPermissionStatus(type)
  return state.status === 'granted'
}

export function isPermissionAvailable(type: PermissionType): boolean {
  return permissionsService.isPermissionAvailable(type)
}

export function getDeviceCapabilities(): DeviceCapabilities | null {
  return permissionsService.getCapabilities()
}