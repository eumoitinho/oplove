"use client"

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Camera, 
  Mic, 
  MapPin, 
  Bell, 
  Folder, 
  Image,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Settings,
  Shield
} from 'lucide-react'
import { PermissionType } from '@/lib/services/permissions-service'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'

interface PermissionStatusProps {
  permissions?: PermissionType[]
  showActions?: boolean
  compact?: boolean
  className?: string
  onPermissionRequest?: (type: PermissionType) => void
}

const permissionIcons: Record<PermissionType, React.ElementType> = {
  camera: Camera,
  microphone: Mic,
  location: MapPin,
  notifications: Bell,
  storage: Folder,
  gallery: Image
}

const permissionNames: Record<PermissionType, string> = {
  camera: 'Câmera',
  microphone: 'Microfone',
  location: 'Localização',
  notifications: 'Notificações',
  storage: 'Armazenamento',
  gallery: 'Galeria'
}

export function PermissionStatus({
  permissions = ['camera', 'microphone', 'location', 'notifications'],
  showActions = true,
  compact = false,
  className,
  onPermissionRequest
}: PermissionStatusProps) {
  const { 
    permissions: permissionStates,
    checkMultiple,
    requestPermission,
    isAvailable,
    capabilities,
    refresh,
    isChecking
  } = usePermissions(permissions)

  useEffect(() => {
    checkMultiple(permissions)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequestPermission = async (type: PermissionType) => {
    if (onPermissionRequest) {
      onPermissionRequest(type)
    } else {
      await requestPermission(type)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'granted':
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            <Check className="w-3 h-3 mr-1" />
            Permitido
          </Badge>
        )
      case 'denied':
        return (
          <Badge variant="destructive">
            <X className="w-3 h-3 mr-1" />
            Negado
          </Badge>
        )
      case 'prompt':
        return (
          <Badge variant="secondary">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Solicitar
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Indisponível
          </Badge>
        )
    }
  }

  const getCompactStatus = (status: string) => {
    switch (status) {
      case 'granted':
        return <Check className="w-4 h-4 text-green-500" />
      case 'denied':
        return <X className="w-4 h-4 text-red-500" />
      case 'prompt':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <X className="w-4 h-4 text-gray-400" />
    }
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Shield className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">Permissões:</span>
        <div className="flex gap-3">
          {permissions.map(permission => {
            const state = permissionStates.get(permission)
            const Icon = permissionIcons[permission]
            const isAvail = isAvailable(permission)
            
            if (!isAvail) return null
            
            return (
              <button
                key={permission}
                onClick={() => state?.status === 'prompt' && handleRequestPermission(permission)}
                disabled={state?.status !== 'prompt'}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity disabled:cursor-default"
                title={`${permissionNames[permission]}: ${state?.status || 'verificando'}`}
              >
                <Icon className="w-4 h-4 text-gray-400" />
                {getCompactStatus(state?.status || 'unavailable')}
              </button>
            )
          })}
        </div>
        {showActions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isChecking}
            className="ml-2"
          >
            <RefreshCw className={cn("w-4 h-4", isChecking && "animate-spin")} />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Permissões do Sistema
        </CardTitle>
        <CardDescription>
          Gerencie as permissões necessárias para usar todos os recursos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Info */}
        {capabilities && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Dispositivo: {capabilities.isMobile ? 'Mobile' : 'Desktop'} • 
              {' '}{capabilities.browserName} {capabilities.browserVersion}
            </p>
          </div>
        )}

        {/* Permissions List */}
        <div className="space-y-3">
          {permissions.map((permission, index) => {
            const state = permissionStates.get(permission)
            const Icon = permissionIcons[permission]
            const isAvail = isAvailable(permission)
            
            if (!isAvail) return null
            
            return (
              <motion.div
                key={permission}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">{permissionNames[permission]}</p>
                    {state?.error && (
                      <p className="text-xs text-red-500 mt-0.5">{state.error}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(state?.status || 'checking')}
                  
                  {showActions && state?.status === 'prompt' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestPermission(permission)}
                    >
                      Permitir
                    </Button>
                  )}
                  
                  {showActions && state?.status === 'denied' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open('app-settings:', '_blank')}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Refresh Button */}
        {showActions && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isChecking}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isChecking && "animate-spin")} />
              Verificar novamente
            </Button>
          </div>
        )}

        {/* Instructions for denied permissions */}
        {Array.from(permissionStates.values()).some(s => s.status === 'denied') && (
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Para ativar permissões negadas, acesse as configurações do seu dispositivo.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

// Inline permission status component
export function InlinePermissionStatus({ 
  permission, 
  showLabel = true,
  className 
}: { 
  permission: PermissionType
  showLabel?: boolean
  className?: string 
}) {
  const { permissions, checkPermission, requestPermission, isAvailable } = usePermissions([permission])
  
  useEffect(() => {
    checkPermission(permission)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const state = permissions.get(permission)
  const Icon = permissionIcons[permission]
  
  if (!isAvailable(permission)) return null
  
  const getStatusIcon = () => {
    switch (state?.status) {
      case 'granted':
        return <Check className="w-4 h-4 text-green-500" />
      case 'denied':
        return <X className="w-4 h-4 text-red-500" />
      case 'prompt':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }
  
  return (
    <button
      onClick={() => state?.status === 'prompt' && requestPermission(permission)}
      disabled={state?.status !== 'prompt'}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
        "transition-colors disabled:cursor-default disabled:hover:bg-gray-100",
        className
      )}
    >
      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      {showLabel && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {permissionNames[permission]}
        </span>
      )}
      {getStatusIcon()}
    </button>
  )
}