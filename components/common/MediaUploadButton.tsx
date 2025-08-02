"use client"

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Camera, 
  Image as ImageIcon, 
  Video, 
  Upload, 
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/usePermissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MediaPermissionRequest } from './PermissionRequest'

interface MediaUploadButtonProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // in bytes
  disabled?: boolean
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showCameraOption?: boolean
}

export function MediaUploadButton({
  onFileSelect,
  accept = 'image/*,video/*',
  maxSize = 50 * 1024 * 1024, // 50MB default
  disabled = false,
  children,
  className,
  variant = 'default',
  size = 'default',
  showCameraOption = false
}: MediaUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [isCameraMode, setIsCameraMode] = useState(false)
  
  const { hasPermission, requestPermission, permissions, capabilities } = usePermissions(
    showCameraOption ? ['camera', 'storage'] : ['storage']
  )
  
  const storagePermission = permissions.get('storage')
  const cameraPermission = permissions.get('camera')

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const fileType = file.type
      const fileExtension = `.${file.name.split('.').pop()}`
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0]
          return fileType.startsWith(`${category}/`)
        }
        return fileType === type || type === fileExtension
      })

      if (!isAccepted) {
        toast.error('Tipo de arquivo não suportado')
        return
      }
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      const sizeMB = (maxSize / 1024 / 1024).toFixed(0)
      toast.error(`Arquivo muito grande. Máximo: ${sizeMB}MB`)
      return
    }

    setIsProcessing(true)
    try {
      onFileSelect(file)
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('Erro ao processar arquivo')
    } finally {
      setIsProcessing(false)
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = async () => {
    if (disabled || isProcessing) return

    // Check storage permission (usually always granted on web)
    if (!hasPermission('storage')) {
      const granted = await requestPermission('storage')
      if (!granted) {
        toast.error('Permissão para acessar arquivos é necessária')
        return
      }
    }

    // For camera option, check camera permission
    if (showCameraOption && isCameraMode) {
      if (!hasPermission('camera')) {
        setShowPermissionModal(true)
        return
      }
      handleCameraCapture()
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleCameraCapture = async () => {
    // This would open a camera capture interface
    // For now, we'll just show a message
    toast.info('Interface de câmera em desenvolvimento')
  }

  const getIcon = () => {
    if (accept.includes('image') && !accept.includes('video')) {
      return <ImageIcon className="w-4 h-4" />
    }
    if (accept.includes('video') && !accept.includes('image')) {
      return <Video className="w-4 h-4" />
    }
    if (showCameraOption && isCameraMode) {
      return <Camera className="w-4 h-4" />
    }
    return <Upload className="w-4 h-4" />
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      {/* Permission alerts */}
      {storagePermission?.status === 'denied' && (
        <Alert className="mb-2 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Acesso a arquivos bloqueado. Verifique as configurações do navegador.
          </AlertDescription>
        </Alert>
      )}

      {showCameraOption ? (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setIsCameraMode(false)
              handleClick()
            }}
            disabled={disabled || isProcessing}
            variant={variant}
            size={size}
            className={cn(!isCameraMode && "ring-2 ring-offset-2 ring-purple-600", className)}
          >
            {isProcessing && !isCameraMode ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4 mr-2" />
            )}
            Galeria
          </Button>
          
          <Button
            onClick={() => {
              setIsCameraMode(true)
              handleClick()
            }}
            disabled={disabled || isProcessing || !capabilities?.hasCamera}
            variant={variant}
            size={size}
            className={cn(isCameraMode && "ring-2 ring-offset-2 ring-purple-600", className)}
          >
            {isProcessing && isCameraMode ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 mr-2" />
            )}
            Câmera
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleClick}
          disabled={disabled || isProcessing}
          variant={variant}
          size={size}
          className={className}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            children || (
              <>
                {getIcon()}
                <span className="ml-2">Selecionar arquivo</span>
              </>
            )
          )}
        </Button>
      )}

      {/* Permission Request Modal */}
      {showPermissionModal && (
        <MediaPermissionRequest
          title="Acesso à câmera"
          description="Precisamos da sua permissão para usar a câmera"
          onSuccess={() => {
            setShowPermissionModal(false)
            handleCameraCapture()
          }}
          onCancel={() => setShowPermissionModal(false)}
        />
      )}
    </>
  )
}

// Convenience components
export function ImageUploadButton(props: Omit<MediaUploadButtonProps, 'accept'>) {
  return <MediaUploadButton {...props} accept="image/*" />
}

export function VideoUploadButton(props: Omit<MediaUploadButtonProps, 'accept'>) {
  return <MediaUploadButton {...props} accept="video/*" />
}

export function AvatarUploadButton(props: Omit<MediaUploadButtonProps, 'accept' | 'maxSize'>) {
  return (
    <MediaUploadButton 
      {...props} 
      accept="image/*" 
      maxSize={5 * 1024 * 1024} // 5MB for avatars
    />
  )
}