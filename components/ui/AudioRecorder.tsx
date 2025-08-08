"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Play, Pause, Square, Trash2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioRecorderProps {
  onAudioReady: (file: File, duration: number) => void
  onCancel?: () => void
  maxDuration?: number // em segundos
  className?: string
}

export function AudioRecorder({
  onAudioReady,
  onCancel,
  maxDuration = 300, // 5 minutos por padrão
  className
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Verificar e solicitar permissão de microfone
  const requestMicrophonePermission = async () => {
    try {
      // Primeiro, verificar se já temos permissão
      const permission = await navigator.permissions?.query({ name: 'microphone' as PermissionName })
      
      if (permission?.state === 'denied') {
        setError('Acesso ao microfone foi negado. Clique no ícone do microfone na barra de endereços para permitir o acesso.')
        return false
      }
      
      // Tentar acessar o microfone para solicitar permissão
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })
      
      // Sucesso! Parar as tracks imediatamente (apenas teste de permissão)
      stream.getTracks().forEach(track => track.stop())
      return true
      
    } catch (err) {
      console.error('Erro ao solicitar permissão do microfone:', err)
      
      let errorMessage = 'Erro ao acessar o microfone.'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permissão do microfone foi negada. Por favor, clique no ícone do microfone na barra de endereços e permita o acesso.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Microfone não encontrado. Verifique se você tem um microfone conectado.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Microfone está sendo usado por outro aplicativo. Feche outros programas que possam estar usando o microfone.'
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Acesso ao microfone bloqueado. Certifique-se de estar em uma conexão HTTPS.'
      }
      
      setError(errorMessage)
      return false
    }
  }

  // Iniciar gravação
  const startRecording = async () => {
    try {
      setError(null)
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Seu navegador não suporta gravação de áudio. Use Chrome, Firefox ou Safari atualizado.')
        return
      }
      
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        setError('Gravação de áudio não suportada neste navegador.')
        return
      }
      
      // Solicitar permissão primeiro
      const hasPermission = await requestMicrophonePermission()
      if (!hasPermission) {
        return
      }
      
      // Agora realmente iniciar a gravação
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })
      
      // Detectar o dispositivo/navegador e escolher o formato mais compatível
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      
      let mimeType = ''
      let fileExtension = '.webm'
      
      if (isIOS || isSafari) {
        // Para iOS/Safari, usar MP4 se suportado, senão WAV
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
          fileExtension = '.mp4'
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav'
          fileExtension = '.wav'
        } else {
          mimeType = 'audio/webm'
          fileExtension = '.webm'
        }
      } else {
        // Para outros navegadores, preferir WebM
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
          fileExtension = '.mp4'
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav'
          fileExtension = '.wav'
        } else {
          mimeType = ''
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🎤 AudioRecorder - Selected MIME type:', mimeType, 'Extension:', fileExtension)
      }
      
      const mediaRecorder = new MediaRecorder(stream, 
        mimeType ? { mimeType: mimeType } : undefined
      )
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      // Store the mime type and extension for later use
      mediaRecorder.selectedMimeType = mimeType
      mediaRecorder.selectedExtension = fileExtension

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const finalMimeType = mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: finalMimeType })
        setAudioBlob(blob)
        
        // Store metadata for file creation
        blob.selectedMimeType = finalMimeType
        blob.selectedExtension = fileExtension
        
        // Criar URL para preview
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Parar todas as tracks para liberar o microfone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Timer para duração
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1
          if (newDuration >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newDuration
        })
      }, 1000)

    } catch (err) {
      console.error('Erro ao acessar microfone:', err)
      
      let errorMessage = 'Erro desconhecido ao acessar o microfone.'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permissão negada. Clique no ícone do microfone na barra de endereços e permita o acesso ao microfone.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Microfone não encontrado. Verifique se você tem um microfone conectado.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Microfone está sendo usado por outro aplicativo. Feche outros programas que possam estar usando o microfone.'
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Configurações do microfone não suportadas.'
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Acesso ao microfone bloqueado por questões de segurança. Certifique-se de estar em uma conexão HTTPS.'
      }
      
      setError(errorMessage)
    }
  }

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    setIsRecording(false)
    setIsPaused(false)
  }

  // Pausar/Retomar gravação
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        // Retomar timer
        timerRef.current = setInterval(() => {
          setDuration(prev => {
            const newDuration = prev + 1
            if (newDuration >= maxDuration) {
              stopRecording()
              return maxDuration
            }
            return newDuration
          })
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        // Pausar timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
      setIsPaused(!isPaused)
    }
  }

  // Reproduzir/Pausar áudio gravado
  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return

    if (isPlaying) {
      audioPlayerRef.current.pause()
    } else {
      audioPlayerRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Excluir gravação
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setIsPlaying(false)
  }

  // Enviar áudio
  const handleSend = () => {
    if (audioBlob) {
      // Use the stored mime type and extension from the blob
      const mimeType = audioBlob.selectedMimeType || 'audio/webm'
      const extension = audioBlob.selectedExtension || '.webm'
      
      const fileName = `audio-${Date.now()}${extension}`
      
      console.log('🎤 AudioRecorder - Creating file:', { fileName, mimeType, size: audioBlob.size })
      
      const file = new File([audioBlob], fileName, {
        type: mimeType
      })
      
      onAudioReady(file, duration)
    }
  }

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn("p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-lg", className)}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              {error}
            </div>
            {error.includes('Permissão negada') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Show help modal or instructions
                  alert(`Como permitir acesso ao microfone:

1. Chrome/Edge: Clique no ícone do cadeado/microfone na barra de endereços
2. Firefox: Clique no ícone do microfone na barra de endereços
3. Safari: Vá em Safari > Preferências > Sites > Microfone

Depois clique em "Permitir" e tente novamente.`)
                }}
                className="text-red-600 hover:text-red-700 text-xs h-auto py-1 px-2"
              >
                Ajuda
              </Button>
            )}
          </div>
        </div>
      )}

      {!audioBlob ? (
        // Estado de gravação
        <div className="flex flex-col items-center space-y-4">
          <div className="text-2xl font-mono font-bold">
            {formatTime(duration)}
          </div>
          
          {maxDuration > 0 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(duration / maxDuration) * 100}%` }}
              />
            </div>
          )}

          <div className="flex items-center space-x-3">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16"
              >
                <Mic className="w-6 h-6" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={togglePause}
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="bg-gray-600 hover:bg-gray-700 text-white rounded-full w-16 h-16"
                >
                  <Square className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {isRecording && (
            <div className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              {isPaused ? 'Gravação pausada' : 'Gravando...'}
            </div>
          )}
        </div>
      ) : (
        // Estado de preview
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Áudio gravado</span>
            <span className="text-sm text-gray-500">{formatTime(duration)}</span>
          </div>

          <audio 
            ref={audioPlayerRef}
            src={audioUrl || undefined}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="flex items-center justify-center space-x-3">
            <Button
              onClick={togglePlayback}
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
          </div>

          <div className="flex justify-between space-x-2">
            <Button
              onClick={deleteRecording}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
            
            <Button
              onClick={handleSend}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Adicionar ao post
            </Button>
          </div>
        </div>
      )}

      {onCancel && (
        <div className="mt-4 pt-4 border-t">
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}