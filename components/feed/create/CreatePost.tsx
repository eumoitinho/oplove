"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ImageIcon, Mic, BarChart3, MapPin, Globe, Users, Lock, X, Camera, Plus, Minus, Play, Pause, Square, Zap, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures'
import { UserAvatar } from '@/components/common/UserAvatar'
import { toast } from 'sonner'

interface CreatePostProps {
  className?: string
  onSuccess?: (post: any) => void
}

interface Poll {
  question: string
  options: { id: string; text: string }[]
  expires_in_hours: number
}

export default function CreatePost({ className, onSuccess }: CreatePostProps) {
  const { user } = useAuth()
  const features = usePremiumFeatures()
  
  const [postContent, setPostContent] = useState("")
  const [postVisibility, setPostVisibility] = useState<"public" | "friends" | "private">("public")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [showMediaUploader, setShowMediaUploader] = useState(false)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [location, setLocation] = useState("")
  const [showLocationInput, setShowLocationInput] = useState(false)
  
  // Poll state
  const [poll, setPoll] = useState<Poll | null>(null)
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState([
    { id: "1", text: "" },
    { id: "2", text: "" }
  ])
  const [pollDuration, setPollDuration] = useState(24) // hours
  
  // Premium modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"gold" | "diamond" | "couple">("gold")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const handlePremiumFeatureClick = (requiredPlan: "gold" | "diamond" | "couple" = "gold") => {
    toast.info(`Recurso disponível apenas no plano ${requiredPlan}. Faça upgrade!`)
  }

  const handleAudioReady = (file: File, duration: number) => {
    setAudioFile(file)
    setAudioDuration(duration)
    setShowAudioRecorder(false) // Close after adding to post
  }

  const handleMediaChange = (files: File[]) => {
    setMediaFiles(files)
  }

  const handleShowAudioRecorder = () => {
    if (!features.canUploadImages) {
      handlePremiumFeatureClick("gold")
      return
    }
    setShowAudioRecorder(true)
  }

  const handleShowMediaUploader = () => {
    if (!features.canUploadImages) {
      handlePremiumFeatureClick("gold")
      return
    }
    setShowMediaUploader(true)
  }

  const handlePublish = async () => {
    console.log("[CREATE POST] Attempting to publish:", { 
      contentLength: postContent.trim().length,
      mediaFiles: mediaFiles.length,
      audioFile: !!audioFile,
      fileNames: mediaFiles.map(f => f.name)
    })
    
    if (!postContent.trim() && mediaFiles.length === 0 && !audioFile && !poll) {
      console.log("[CREATE POST] Nothing to publish - no content, media, audio, or poll")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('content', postContent.trim())
      formData.append('visibility', postVisibility)
      
      // Get location from user profile or input
      let locationToUse = location.trim()
      if (!locationToUse && user?.city && user?.uf) {
        locationToUse = `${user.city}, ${user.uf}`
      }
      
      // Add location if available
      if (locationToUse) {
        formData.append('location', locationToUse)
      }
      
      // Add coordinates if available from user profile
      if (user?.latitude && user?.longitude) {
        formData.append('latitude', user.latitude.toString())
        formData.append('longitude', user.longitude.toString())
      }
      
      // Adicionar enquete se existir
      if (poll) {
        formData.append('poll', JSON.stringify({
          question: poll.question,
          options: poll.options.map(opt => opt.text),
          expires_in_hours: poll.expires_in_hours
        }))
      }

      // Adicionar arquivos de mídia
      mediaFiles.forEach((file, index) => {
        formData.append(`media_${index}`, file)
      })

      // Adicionar arquivo de áudio
      if (audioFile) {
        formData.append('audio', audioFile)
        formData.append('audio_duration', audioDuration.toString())
      }

      // Debug: Log FormData contents
      console.log("[CREATE POST] FormData being sent:")
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }

      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      console.log("[CREATE POST] Response status:", response.status)
      const result = await response.json()
      console.log("[CREATE POST] Response body:", result)

      if (!response.ok || !result.success) {
        console.error("[CREATE POST] Server returned error:", result)
        
        // Enhanced error message based on error type
        const errorMsg = result.error === "INSUFFICIENT_STORAGE" 
          ? "Armazenamento insuficiente. Considere fazer upgrade do seu plano."
          : result.error === "INVALID_MEDIA" 
          ? `Mídia inválida: ${result.metadata?.invalid_files?.join(', ') || 'formato não suportado'}`
          : result.error === "LIMIT_EXCEEDED"
          ? `Limite excedido: ${result.metadata?.limit_type === "media_per_post" ? `Máximo ${result.metadata.limit} arquivo(s) por post` : result.error}`
          : result.error || 'Erro ao criar post'
        
        throw new Error(errorMsg)
      }

      // Call success callback FIRST to ensure immediate feed update
      if (onSuccess && result.data) {
        console.log("[CREATE POST] Calling onSuccess with new post data:", result.data.id)
        onSuccess(result.data)
      }

      // Reset form after callback to prevent UI glitches
      setPostContent("")
      setPostVisibility("public")
      setMediaFiles([])
      setAudioFile(null)
      setAudioDuration(0)
      setShowAudioRecorder(false)
      setShowMediaUploader(false)
      setShowPollCreator(false)
      setPoll(null)
      setPollQuestion("")
      setPollOptions([{ id: "1", text: "" }, { id: "2", text: "" }])
      setPollDuration(24)
      setLocation("")
      setShowLocationInput(false)

      console.log("[CREATE POST] Form reset completed - all media cleared")
    } catch (error) {
      console.error("Error creating post:", error)
      alert(error instanceof Error ? error.message : 'Erro ao criar post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getVisibilityIcon = () => {
    switch (postVisibility) {
      case "public":
        return <Globe className="w-3 h-3" />
      case "friends":
        return <Users className="w-3 h-3" />
      case "private":
        return <Lock className="w-3 h-3" />
    }
  }

  const getVisibilityLabel = () => {
    switch (postVisibility) {
      case "public":
        return "Público"
      case "friends":
        return "Amigos"
      case "private":
        return "Privado"
    }
  }

  const addPollOption = () => {
    if (pollOptions.length >= 4) return
    
    const newOption = {
      id: (pollOptions.length + 1).toString(),
      text: ""
    }
    setPollOptions([...pollOptions, newOption])
  }

  const removePollOption = (id: string) => {
    if (pollOptions.length <= 2) return
    setPollOptions(pollOptions.filter(option => option.id !== id))
  }

  const updatePollOption = (id: string, text: string) => {
    setPollOptions(pollOptions.map(option => 
      option.id === id ? { ...option, text } : option
    ))
  }

  const createPoll = () => {
    if (!pollQuestion.trim() || pollOptions.some(opt => !opt.text.trim())) {
      toast.error("Preencha a pergunta e todas as opções da enquete")
      return
    }

    const newPoll: Poll = {
      question: pollQuestion.trim(),
      options: pollOptions.filter(opt => opt.text.trim()),
      expires_in_hours: pollDuration
    }
    
    setPoll(newPoll)
    setShowPollCreator(false)
    toast.success("Enquete adicionada ao post!")
  }

  const removePoll = () => {
    setPoll(null)
    setPollQuestion("")
    setPollOptions([{ id: "1", text: "" }, { id: "2", text: "" }])
    setPollDuration(24)
  }

  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index))
  }

  const removeAudio = () => {
    setAudioFile(null)
    setAudioDuration(0)
  }

  // Audio Recording Component (Simplified)
  const AudioRecorderModal = () => {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])
    const intervalRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
      if (isRecording) {
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }, [isRecording])

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks(prev => [...prev, event.data])
          }
        }

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
          const audioFile = new File([audioBlob], `audio-${Date.now()}.wav`, { 
            type: 'audio/wav' 
          })
          
          handleAudioReady(audioFile, recordingTime)
          
          // Cleanup
          stream.getTracks().forEach(track => track.stop())
          setAudioChunks([])
          setRecordingTime(0)
        }

        setMediaRecorder(recorder)
        recorder.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Error starting recording:', error)
        toast.error('Erro ao iniciar gravação')
      }
    }

    const stopRecording = () => {
      if (mediaRecorder) {
        mediaRecorder.stop()
        setIsRecording(false)
      }
    }

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
      <Dialog open={showAudioRecorder} onOpenChange={setShowAudioRecorder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gravar Áudio</DialogTitle>
            <DialogDescription>
              Grave uma mensagem de áudio para adicionar ao seu post
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 p-6">
            <div className="text-2xl font-mono">
              {formatTime(recordingTime)}
            </div>
            
            <div className="flex space-x-4">
              {!isRecording ? (
                <Button onClick={startRecording} variant="default" size="lg">
                  <Mic className="w-4 h-4 mr-2" />
                  Iniciar Gravação
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" size="lg">
                  <Square className="w-4 h-4 mr-2" />
                  Parar Gravação
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Media Uploader Modal
  const MediaUploaderModal = () => {
    return (
      <Dialog open={showMediaUploader} onOpenChange={setShowMediaUploader}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Mídia</DialogTitle>
            <DialogDescription>
              Selecione imagens ou vídeos para adicionar ao seu post
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                handleMediaChange(files)
                setShowMediaUploader(false)
              }}
              className="hidden"
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              variant="outline"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Selecionar Arquivos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Poll Creator Modal
  const PollCreatorModal = () => {
    return (
      <Dialog open={showPollCreator} onOpenChange={setShowPollCreator}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Enquete</DialogTitle>
            <DialogDescription>
              Crie uma enquete para engajar com sua audiência
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pergunta</label>
              <Input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Digite sua pergunta..."
                maxLength={280}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Opções</label>
              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Input
                      value={option.text}
                      onChange={(e) => updatePollOption(option.id, e.target.value)}
                      placeholder={`Opção ${index + 1}`}
                      maxLength={100}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePollOption(option.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {pollOptions.length < 4 && (
                <Button
                  variant="ghost"
                  onClick={addPollOption}
                  className="w-full mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Opção
                </Button>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium">Duração</label>
              <Select 
                value={pollDuration.toString()} 
                onValueChange={(value) => setPollDuration(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="6">6 horas</SelectItem>
                  <SelectItem value="12">12 horas</SelectItem>
                  <SelectItem value="24">1 dia</SelectItem>
                  <SelectItem value="72">3 dias</SelectItem>
                  <SelectItem value="168">1 semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={createPoll} className="flex-1">
                Criar Enquete
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPollCreator(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div
      data-create-post
      className="w-full max-w-2xl mx-auto mb-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex gap-3 items-start">
        <UserAvatar 
          user={user}
          size="lg" 
          showPlanBadge={false}
          className="flex-shrink-0 w-12 h-12 mt-1"
        />
        <div className="flex-1 min-w-0 flex flex-col">
          <Textarea
            placeholder="O que está acontecendo?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="w-full bg-transparent border-none text-lg p-0 focus-visible:ring-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none min-h-[60px] leading-6"
            rows={3}
          />
          
          {/* Action bar - Alinhado com o texto */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-1">
              {/* Image Upload */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      onClick={handleShowMediaUploader}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{features.canUploadImages ? "Adicionar mídia" : "Premium: Adicionar mídia"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Audio Record */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      onClick={handleShowAudioRecorder}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{features.canUploadImages ? "Gravar áudio" : "Premium: Gravar áudio"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Poll */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      onClick={() => !features.canCreatePolls ? handlePremiumFeatureClick("gold") : setShowPollCreator(true)}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{features.canCreatePolls ? "Criar enquete" : "Premium: Criar enquete"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Location */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      onClick={() => setShowLocationInput(!showLocationInput)}
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Adicionar localização</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Visibility Selector */}
              <Select value={postVisibility} onValueChange={(value: any) => setPostVisibility(value)}>
                <SelectTrigger className="w-auto h-9 text-sm border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="flex items-center gap-2">
                    {getVisibilityIcon()}
                    <span className="hidden sm:inline">{getVisibilityLabel()}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Público</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Amigos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Privado</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Publish Button */}
              <Button 
                onClick={handlePublish}
                disabled={isSubmitting || (!postContent.trim() && mediaFiles.length === 0 && !audioFile && !poll)}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white px-6 h-9 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? "Publicando..." : "Postar"}
              </Button>
            </div>
          </div>

          {/* Location Input */}
          <AnimatePresence>
            {showLocationInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder={user?.city && user?.uf ? `${user.city}, ${user.uf}` : "Adicionar localização..."}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setLocation("")
                      setShowLocationInput(false)
                    }}
                    className="w-9 h-9"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Media Preview */}
          <AnimatePresence>
            {mediaFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            muted
                          />
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio Preview */}
          <AnimatePresence>
            {audioFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Áudio gravado</p>
                    <p className="text-xs text-gray-500">
                      {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeAudio}
                    className="w-8 h-8 text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Poll Preview */}
          <AnimatePresence>
            {poll && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Enquete</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removePoll}
                      className="w-6 h-6 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium mb-2">{poll.question}</p>
                  <div className="space-y-1">
                    {poll.options.map((option, index) => (
                      <div key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                        {option.text}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Expira em {poll.expires_in_hours}h
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AudioRecorderModal />
      <MediaUploaderModal />
      <PollCreatorModal />
      
    </div>
  )
}