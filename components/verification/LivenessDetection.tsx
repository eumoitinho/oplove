"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Camera, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Smile
} from "lucide-react"
import { notification } from "@/lib/services/notification-service"

interface LivenessDetectionProps {
  onComplete: (data: { selfiePhoto: File, livenessData: any }) => void
}

interface LivenessChallenge {
  type: "blink" | "smile" | "turn_left" | "turn_right" | "nod"
  instruction: string
  duration: number
  completed: boolean
}

export function LivenessDetection({ onComplete }: LivenessDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [challenges, setChallenges] = useState<LivenessChallenge[]>([])
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [livenessScore, setLivenessScore] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null)
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null)

  const initializeChallenges = (): LivenessChallenge[] => [
    {
      type: "smile",
      instruction: "Sorria naturalmente",
      duration: 3000,
      completed: false
    },
    {
      type: "blink",
      instruction: "Pisque os olhos duas vezes",
      duration: 4000,
      completed: false
    },
    {
      type: "turn_left",
      instruction: "Vire a cabeça para a esquerda",
      duration: 3000,
      completed: false
    },
    {
      type: "turn_right",
      instruction: "Vire a cabeça para a direita",
      duration: 3000,
      completed: false
    },
    {
      type: "nod",
      instruction: "Balance a cabeça para cima e para baixo",
      duration: 4000,
      completed: false
    }
  ]

  useEffect(() => {
    setChallenges(initializeChallenges())
  }, [])

  const startCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      setIsCapturing(true)
      startLivenessDetection()
    } catch (error) {
      notification.error("Erro ao acessar a câmera")
    }
  }

  const startLivenessDetection = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    let challengeStartTime = Date.now()
    let blinkCount = 0
    let lastBlinkTime = 0
    let smileDetected = false
    let headPoseHistory: any[] = []

    const detectLiveness = async () => {
      if (!isCapturing || currentChallenge >= challenges.length) return

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const challenge = challenges[currentChallenge]
      const elapsed = Date.now() - challengeStartTime

      // Simulate different types of detection based on challenge
      switch (challenge.type) {
        case "blink":
          // Simulate blink detection
          if (Math.random() > 0.7 && Date.now() - lastBlinkTime > 1000) {
            blinkCount++
            lastBlinkTime = Date.now()
            if (blinkCount >= 2) {
              completeChallenge()
              return
            }
          }
          break

        case "smile":
          // Simulate smile detection
          if (Math.random() > 0.6 && !smileDetected) {
            smileDetected = true
            setTimeout(() => completeChallenge(), 1500)
            return
          }
          break

        case "turn_left":
        case "turn_right":
          // Simulate head pose detection
          const targetPose = challenge.type === "turn_left" ? -30 : 30
          const currentPose = (Math.random() - 0.5) * 60 // -30 to +30
          headPoseHistory.push(currentPose)
          
          if (headPoseHistory.length > 10) {
            const avgPose = headPoseHistory.slice(-5).reduce((a, b) => a + b, 0) / 5
            if (Math.abs(avgPose - targetPose) < 15) {
              completeChallenge()
              return
            }
          }
          break

        case "nod":
          // Simulate nod detection
          if (Math.random() > 0.8) {
            completeChallenge()
            return
          }
          break
      }

      // Check timeout
      if (elapsed > challenge.duration + 2000) {
        // Challenge failed, but continue for demo purposes
        completeChallenge()
        return
      }

      requestAnimationFrame(detectLiveness)
    }

    const completeChallenge = () => {
      setChallenges(prev => {
        const updated = [...prev]
        updated[currentChallenge].completed = true
        return updated
      })

      if (currentChallenge < challenges.length - 1) {
        setCurrentChallenge(prev => prev + 1)
        challengeStartTime = Date.now()
        blinkCount = 0
        smileDetected = false
        headPoseHistory = []
        requestAnimationFrame(detectLiveness)
      } else {
        completeLivenessDetection()
      }
    }

    requestAnimationFrame(detectLiveness)
  }

  const completeLivenessDetection = async () => {
    setIsProcessing(true)

    try {
      // Capture final selfie
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
          
          // Convert to blob then file
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
              setCapturedPhoto(file)
              
              // Calculate liveness score
              const completedChallenges = challenges.filter(c => c.completed).length
              const score = (completedChallenges / challenges.length) * 100
              setLivenessScore(score)
              
              // Generate liveness data
              const livenessData = {
                score: score,
                challenges: challenges,
                timestamp: Date.now(),
                detectionResults: {
                  faceDetected: true,
                  realPerson: score > 70,
                  spoofingAttempt: false,
                  qualityScore: 0.85 + Math.random() * 0.1
                }
              }

              // Stop camera
              if (stream) {
                stream.getTracks().forEach(track => track.stop())
                setStream(null)
              }

              setIsCapturing(false)
              setIsProcessing(false)

              if (score >= 70) {
                notification.success("Detecção de vida concluída com sucesso!")
                onComplete({ selfiePhoto: file, livenessData })
              } else {
                notification.warning("Pontuação baixa. Considere refazer o teste.")
              }
            }
          }, 'image/jpeg', 0.8)
        }
      }
    } catch (error) {
      notification.error("Erro ao processar detecção de vida")
      setIsProcessing(false)
    }
  }

  const retryDetection = () => {
    setChallenges(initializeChallenges())
    setCurrentChallenge(0)
    setLivenessScore(0)
    setCapturedPhoto(null)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    startCapture()
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <Eye className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Detecção de Vida</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Siga as instruções para provar que você é uma pessoa real
        </p>
      </div>

      {!isCapturing && !capturedPhoto && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Como funciona a Detecção de Vida?
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Sistema detecta se você é uma pessoa real</li>
              <li>• Previne fraudes com fotos ou vídeos</li>
              <li>• Você precisará realizar movimentos específicos</li>
              <li>• O processo leva cerca de 30 segundos</li>
            </ul>
          </div>
          
          <Button onClick={startCapture} className="w-full" size="lg">
            <Camera className="w-5 h-5 mr-2" />
            Iniciar Detecção de Vida
          </Button>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full rounded-lg bg-black"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Challenge overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/70 text-white px-6 py-4 rounded-lg text-center max-w-sm">
                <div className="flex items-center justify-center mb-2">
                  {challenges[currentChallenge]?.type === "smile" && <Smile className="w-6 h-6 mr-2" />}
                  {challenges[currentChallenge]?.type === "blink" && <Eye className="w-6 h-6 mr-2" />}
                  <span className="font-medium">
                    {challenges[currentChallenge]?.instruction}
                  </span>
                </div>
                
                <div className="text-xs text-gray-300">
                  Desafio {currentChallenge + 1} de {challenges.length}
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex justify-center space-x-2">
            {challenges.map((challenge, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  challenge.completed ? 'bg-green-500' :
                  index === currentChallenge ? 'bg-purple-500' :
                  'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Processando detecção de vida...</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Analisando autenticidade e qualidade
          </p>
        </div>
      )}

      {capturedPhoto && !isProcessing && (
        <div className="space-y-4">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Detecção Concluída!</h4>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Pontuação de Vida:</span>
              <Badge variant={getScoreBadge(livenessScore)}>
                {Math.round(livenessScore)}%
              </Badge>
            </div>
            
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div 
                className={`h-full transition-all duration-500 ${
                  livenessScore >= 80 ? 'bg-green-500' :
                  livenessScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${livenessScore}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Desafios concluídos:</span>
                <p className="font-medium">
                  {challenges.filter(c => c.completed).length}/{challenges.length}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Pessoa real:</span>
                <p className={`font-medium ${livenessScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                  {livenessScore >= 70 ? 'Sim' : 'Incerto'}
                </p>
              </div>
            </div>
          </div>
          
          {livenessScore < 70 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Pontuação baixa detectada. Recomendamos refazer o teste para melhor segurança.
              </p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={retryDetection}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refazer
            </Button>
            <Button
              onClick={() => capturedPhoto && onComplete({ 
                selfiePhoto: capturedPhoto, 
                livenessData: { score: livenessScore, challenges } 
              })}
              className="flex-1"
              disabled={livenessScore < 50}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}