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

  // Iniciar gravação
  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        setAudioBlob(blob)
        
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
      setError('Não foi possível acessar o microfone. Verifique as permissões.')
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
      const file = new File([audioBlob], `audio-${Date.now()}.webm`, {
        type: 'audio/webm;codecs=opus'
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
          {error}
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
              Enviar
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