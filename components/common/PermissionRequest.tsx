"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Camera, 
  Mic, 
  MapPin, 
  Bell, 
  Folder, 
  Image,
  Smartphone,
  Monitor,
  AlertCircle,
  Check,
  X,
  Settings,
  ChevronRight
} from 'lucide-react'
import { PermissionType, PermissionStatus } from '@/lib/services/permissions-service'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'

interface PermissionRequestProps {
  permissions: PermissionType[]
  title?: string
  description?: string
  onSuccess?: () => void
  onCancel?: () => void
  showInstructions?: boolean
  className?: string
}

interface PermissionInfo {
  type: PermissionType
  icon: React.ElementType
  title: string
  description: string
  reason: string
}

const permissionInfo: Record<PermissionType, PermissionInfo> = {
  camera: {
    type: 'camera',
    icon: Camera,
    title: 'Câmera',
    description: 'Tire fotos e grave vídeos',
    reason: 'Necessário para tirar fotos de perfil, criar stories e fazer videochamadas'
  },
  microphone: {
    type: 'microphone',
    icon: Mic,
    title: 'Microfone',
    description: 'Grave áudios e faça chamadas',
    reason: 'Necessário para mensagens de voz, chamadas e lives'
  },
  location: {
    type: 'location',
    icon: MapPin,
    title: 'Localização',
    description: 'Compartilhe sua localização',
    reason: 'Encontre pessoas próximas e eventos na sua região'
  },
  notifications: {
    type: 'notifications',
    icon: Bell,
    title: 'Notificações',
    description: 'Receba alertas importantes',
    reason: 'Fique por dentro de mensagens, curtidas e novos seguidores'
  },
  storage: {
    type: 'storage',
    icon: Folder,
    title: 'Armazenamento',
    description: 'Acesse seus arquivos',
    reason: 'Salve fotos e vídeos no seu dispositivo'
  },
  gallery: {
    type: 'gallery',
    icon: Image,
    title: 'Galeria',
    description: 'Escolha fotos e vídeos',
    reason: 'Compartilhe mídia da sua galeria'
  }
}

export function PermissionRequest({
  permissions,
  title = "Permissões necessárias",
  description = "Para usar todos os recursos, precisamos de algumas permissões",
  onSuccess,
  onCancel,
  showInstructions = true,
  className
}: PermissionRequestProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [currentPermission, setCurrentPermission] = useState(0)
  const [deniedPermissions, setDeniedPermissions] = useState<PermissionType[]>([])
  
  const { 
    permissions: permissionStates,
    requestPermission,
    capabilities,
    isRequesting
  } = usePermissions(permissions)

  const handleRequestNext = async () => {
    if (currentPermission >= permissions.length) {
      handleComplete()
      return
    }

    const permission = permissions[currentPermission]
    const granted = await requestPermission(permission)

    if (!granted) {
      setDeniedPermissions(prev => [...prev, permission])
    }

    if (currentPermission < permissions.length - 1) {
      setCurrentPermission(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    const allGranted = permissions.every(p => {
      const state = permissionStates.get(p)
      return state?.status === 'granted'
    })

    if (allGranted) {
      onSuccess?.()
      setIsOpen(false)
    } else if (deniedPermissions.length > 0 && showInstructions) {
      // Show instructions for denied permissions
    } else {
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    setIsOpen(false)
  }

  const currentPermissionInfo = permissions[currentPermission] 
    ? permissionInfo[permissions[currentPermission]]
    : null

  const getDeviceIcon = () => {
    if (capabilities?.isMobile) return Smartphone
    return Monitor
  }

  const DeviceIcon = getDeviceIcon()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={cn("max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          {permissions.length > 1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progresso</span>
                <span>{currentPermission + 1} de {permissions.length}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                  style={{ width: `${((currentPermission + 1) / permissions.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Current Permission */}
          <AnimatePresence mode="wait">
            {currentPermissionInfo && (
              <motion.div
                key={currentPermissionInfo.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-4"
              >
                <div className="relative inline-flex">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                    <currentPermissionInfo.icon className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <DeviceIcon className="absolute -bottom-2 -right-2 w-8 h-8 text-gray-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{currentPermissionInfo.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {currentPermissionInfo.description}
                  </p>
                </div>

                <Alert className="text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Por que precisamos?</strong><br />
                    {currentPermissionInfo.reason}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Permission Status */}
          {permissions.length > 1 && (
            <div className="space-y-2">
              {permissions.map((permission, index) => {
                const info = permissionInfo[permission]
                const state = permissionStates.get(permission)
                const status = state?.status || 'prompt'
                const isCurrent = index === currentPermission
                const isPast = index < currentPermission

                return (
                  <div
                    key={permission}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all",
                      isCurrent && "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",
                      !isCurrent && !isPast && "opacity-50"
                    )}
                  >
                    <info.icon className="w-5 h-5 text-gray-400" />
                    <span className="flex-1 text-sm">{info.title}</span>
                    {status === 'granted' && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {status === 'denied' && (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    {status === 'prompt' && !isPast && (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Denied Permissions Instructions */}
          {deniedPermissions.length > 0 && showInstructions && currentPermission >= permissions.length - 1 && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Algumas permissões foram negadas</strong><br />
                Você pode ativá-las nas configurações do seu dispositivo a qualquer momento.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRequestNext}
              disabled={isRequesting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isRequesting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Solicitando...
                </div>
              ) : currentPermission >= permissions.length - 1 ? (
                'Concluir'
              ) : (
                'Próxima'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Convenience components for specific permission requests
export function CameraPermissionRequest(props: Omit<PermissionRequestProps, 'permissions'>) {
  return <PermissionRequest {...props} permissions={['camera']} />
}

export function MediaPermissionRequest(props: Omit<PermissionRequestProps, 'permissions'>) {
  return <PermissionRequest {...props} permissions={['camera', 'microphone']} />
}

export function LocationPermissionRequest(props: Omit<PermissionRequestProps, 'permissions'>) {
  return <PermissionRequest {...props} permissions={['location']} />
}

export function NotificationPermissionRequest(props: Omit<PermissionRequestProps, 'permissions'>) {
  return <PermissionRequest {...props} permissions={['notifications']} />
}

export function AllPermissionsRequest(props: Omit<PermissionRequestProps, 'permissions'>) {
  return (
    <PermissionRequest 
      {...props} 
      permissions={['camera', 'microphone', 'location', 'notifications', 'gallery']}
      title="Configure as permissões"
      description="Para a melhor experiência, configure todas as permissões necessárias"
    />
  )
}