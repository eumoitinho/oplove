"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Info,
  Copy,
  ExternalLink
} from 'lucide-react'
import { useCameraPermissions } from '@/hooks/useCameraPermissions'
import { notification } from '@/lib/services/notification-service'

interface CameraDiagnosticsProps {
  onResolved?: () => void
}

export function CameraDiagnostics({ onResolved }: CameraDiagnosticsProps) {
  const {
    permissionStatus,
    capabilities,
    checkPermissions,
    requestPermissions,
    checkCapabilities,
    getDiagnosticInfo,
    isReady,
    needsPermission,
    isBlocked
  } = useCameraPermissions()
  
  const [isChecking, setIsChecking] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  const handleRefresh = async () => {
    setIsChecking(true)
    await checkCapabilities()
    await checkPermissions()
    setIsChecking(false)
  }

  const handleRequestPermission = async () => {
    setIsChecking(true)
    const success = await requestPermissions()
    setIsChecking(false)
    
    if (success) {
      notification.success('✅ Câmera funcionando! Você pode continuar com a verificação.')
      onResolved?.()
    }
  }

  const copyDiagnosticInfo = () => {
    const info = getDiagnosticInfo()
    const diagnosticText = `
OpenLove - Diagnóstico da Câmera
================================

Informações do Sistema:
- Navegador: ${info.userAgent}
- Protocolo: ${info.protocol}
- Hostname: ${info.hostname}
- Contexto Seguro: ${info.isSecureContext ? 'Sim' : 'Não'}

APIs Suportadas:
- MediaDevices: ${info.hasMediaDevices ? 'Sim' : 'Não'}
- getUserMedia: ${info.hasGetUserMedia ? 'Sim' : 'Não'}
- Permissions API: ${info.hasPermissionsAPI ? 'Sim' : 'Não'}

Status da Câmera:
- Permissão: ${info.permissionStatus}
- Dispositivos encontrados: ${info.deviceCount}
- Navegador suportado: ${info.capabilities.browserSupported ? 'Sim' : 'Não'}
- Câmera detectada: ${info.capabilities.hasCamera ? 'Sim' : 'Não'}
- Pode acessar: ${info.capabilities.canAccessCamera ? 'Sim' : 'Não'}
- HTTPS necessário: ${info.capabilities.httpsRequired ? 'Sim' : 'Não'}

Erro: ${info.capabilities.errorMessage || 'Nenhum'}
    `.trim()
    
    navigator.clipboard.writeText(diagnosticText)
    notification.success('Informações de diagnóstico copiadas!')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'prompt':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Permitido</Badge>
      case 'denied':
        return <Badge variant="destructive">Negado</Badge>
      case 'prompt':
        return <Badge variant="secondary">Aguardando</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <Camera className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Diagnóstico da Câmera</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Verificando se sua câmera está funcionando corretamente
        </p>
      </div>

      <div className="space-y-4">
        {/* Status Overview */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Status Geral:</span>
            {isReady ? (
              <Badge className="bg-green-100 text-green-800">✅ Pronto</Badge>
            ) : isBlocked ? (
              <Badge variant="destructive">❌ Bloqueado</Badge>
            ) : needsPermission ? (
              <Badge variant="secondary">⏳ Aguarda Permissão</Badge>
            ) : (
              <Badge variant="outline">🔄 Verificando</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Navegador:</span>
              {capabilities.browserSupported ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>HTTPS:</span>
              {window.isSecureContext ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Câmera:</span>
              {capabilities.hasCamera ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Permissão:</span>
              {getStatusIcon(permissionStatus.state)}
            </div>
          </div>
        </div>

        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(permissionStatus.state)}
            <div>
              <p className="font-medium">Permissão da Câmera</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {permissionStatus.devices.length} dispositivo(s) encontrado(s)
              </p>
            </div>
          </div>
          {getStatusBadge(permissionStatus.state)}
        </div>

        {/* Error Messages */}
        {capabilities.errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-200">
                <p className="font-semibold mb-1">Problema Detectado:</p>
                <p>{capabilities.errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Solutions */}
        {isBlocked && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-2">Como resolver:</p>
                <ul className="space-y-1 text-xs">
                  {!capabilities.browserSupported && (
                    <li>• Use um navegador moderno (Chrome, Firefox, Safari, Edge)</li>
                  )}
                  {capabilities.httpsRequired && (
                    <li>• Acesse o site via HTTPS (deve começar com https://)</li>
                  )}
                  {!capabilities.hasCamera && (
                    <li>• Conecte uma câmera ao seu dispositivo</li>
                  )}
                  {permissionStatus.state === 'denied' && (
                    <>
                      <li>• Clique no ícone de câmera na barra de endereços</li>
                      <li>• Vá em Configurações do navegador {'>'}  Privacidade {'>'} Câmera</li>
                      <li>• Permita acesso para este site</li>
                      <li>• Recarregue a página após alterar as permissões</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isChecking}
            variant="outline"
            className="flex-1"
          >
            {isChecking ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Verificar Novamente
          </Button>

          {needsPermission && (
            <Button
              onClick={handleRequestPermission}
              disabled={isChecking}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Solicitar Permissão
            </Button>
          )}

          {isReady && (
            <Button
              onClick={onResolved}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          )}
        </div>

        {/* Advanced Diagnostics */}
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full"
          >
            <Info className="w-4 h-4 mr-2" />
            {showDiagnostics ? 'Ocultar' : 'Mostrar'} Diagnóstico Detalhado
          </Button>

          {showDiagnostics && (
            <div className="mt-4 space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs font-mono">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Informações Técnicas:</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyDiagnosticInfo}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
                <div className="space-y-1 text-gray-700 dark:text-gray-300">
                  <p>Navegador: {navigator.userAgent.split(' ')[0]}</p>
                  <p>Protocolo: {window.location.protocol}</p>
                  <p>Permissão: {permissionStatus.state}</p>
                  <p>Dispositivos: {permissionStatus.devices.length}</p>
                  <p>Contexto Seguro: {window.isSecureContext ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open('https://support.google.com/chrome/answer/2693767', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Ajuda Chrome
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open('https://blog.mozilla.org/webrtc/media-constraints-camera-resolution-mobile-desktop/', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Ajuda Firefox
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}