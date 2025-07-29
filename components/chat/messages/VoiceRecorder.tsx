"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, Square, Play, Pause, Trash2, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface VoiceRecorderProps {
  onClose: () => void
  onRecordingComplete: (audioBlob: Blob) => void
  maxDuration?: number // in seconds
}

export function VoiceRecorder({ onClose, onRecordingComplete, maxDuration = 300 }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [waveformData, setWaveformData] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setDuration(0)

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 0.1
          if (newDuration >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newDuration
        })
      }, 100)

      // Start waveform animation
      animateWaveform()
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        // Resume timer
        intervalRef.current = setInterval(() => {
          setDuration((prev) => {
            const newDuration = prev + 0.1
            if (newDuration >= maxDuration) {
              stopRecording()
              return maxDuration
            }
            return newDuration
          })
        }, 100)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        // Pause timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }
  }

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setDuration(0)
    setWaveformData([])
  }

  const sendRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob)
    }
  }

  const animateWaveform = () => {
    if (isRecording && !isPaused) {
      setWaveformData((prev) => {
        const newData = [...prev, Math.random() * 100]
        return newData.slice(-50) // Keep last 50 data points
      })
      animationRef.current = requestAnimationFrame(animateWaveform)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Gravar Áudio</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Waveform visualization */}
        <div className="mb-6">
          <div className="h-20 bg-gray-100 rounded-lg flex items-end justify-center space-x-1 p-2 overflow-hidden">
            {waveformData.length > 0 ? (
              waveformData.map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full min-h-[4px]"
                />
              ))
            ) : (
              <div className="text-gray-400 text-sm">{audioBlob ? "Gravação concluída" : "Pressione para gravar"}</div>
            )}
          </div>
        </div>

        {/* Duration and status */}
        <div className="text-center mb-6">
          <div className="text-2xl font-mono font-bold text-gray-900 mb-2">{formatDuration(duration)}</div>
          <div className="flex items-center justify-center space-x-2">
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                {isPaused ? "Pausado" : "Gravando"}
              </Badge>
            )}
            {audioBlob && !isRecording && <Badge variant="secondary">Pronto para enviar</Badge>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              size="lg"
              className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Mic className="h-6 w-6" />
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                onClick={pauseRecording}
                size="lg"
                variant="outline"
                className="h-12 w-12 rounded-full bg-transparent"
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
              <Button onClick={stopRecording} size="lg" variant="destructive" className="h-16 w-16 rounded-full">
                <Square className="h-6 w-6" />
              </Button>
            </>
          )}

          {audioBlob && !isRecording && (
            <>
              <Button
                onClick={playRecording}
                size="lg"
                variant="outline"
                className="h-12 w-12 rounded-full bg-transparent"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                onClick={deleteRecording}
                size="lg"
                variant="outline"
                className="h-12 w-12 rounded-full text-red-600 hover:text-red-700 bg-transparent"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              <Button
                onClick={sendRecording}
                size="lg"
                className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Audio element for playback */}
        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {!isRecording && !audioBlob && <p>Pressione o botão para começar a gravar</p>}
          {isRecording && <p>Máximo {maxDuration}s • Pressione quadrado para parar</p>}
          {audioBlob && !isRecording && <p>Reproduza para ouvir ou envie a mensagem</p>}
        </div>
      </motion.div>
    </motion.div>
  )
}
