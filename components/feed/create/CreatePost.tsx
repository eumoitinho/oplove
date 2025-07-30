"use client"

import { useState } from "react"
import { Camera, Video, Mic, BarChart2, Globe, Users, Lock, ChevronDown, Crown, Gem } from "lucide-react"
import { UserAvatar } from "@/components/common/UserAvatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { PaymentModal } from "@/components/common/PaymentModal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AudioRecorder } from "@/components/ui/AudioRecorder"
import { MediaUploader } from "./MediaUploader"
import { cn } from "@/lib/utils"

interface CreatePostProps {
  onSuccess?: (post: any) => void
}

type Visibility = "public" | "friends" | "private"

export function CreatePost({ onSuccess }: CreatePostProps) {
  const { user } = useAuth()
  const features = usePremiumFeatures()
  const [postContent, setPostContent] = useState("")
  const [postVisibility, setPostVisibility] = useState<Visibility>("public")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"gold" | "diamond" | "couple">("gold")
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [showMediaUploader, setShowMediaUploader] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)

  if (!user) return null

  const handlePremiumFeatureClick = (requiredPlan: "gold" | "diamond" | "couple" = "gold") => {
    setSelectedPlan(requiredPlan)
    setShowPaymentModal(true)
  }

  const handleAudioReady = (file: File, duration: number) => {
    setAudioFile(file)
    setAudioDuration(duration)
    setShowAudioRecorder(false)
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
    if (!postContent.trim() && mediaFiles.length === 0 && !audioFile) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('content', postContent.trim())
      formData.append('visibility', postVisibility)

      // Adicionar arquivos de mídia
      mediaFiles.forEach((file, index) => {
        formData.append(`media_${index}`, file)
      })

      // Adicionar arquivo de áudio
      if (audioFile) {
        formData.append('audio', audioFile)
        formData.append('audio_duration', audioDuration.toString())
      }

      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar post')
      }

      // Reset form
      setPostContent("")
      setPostVisibility("public")
      setMediaFiles([])
      setAudioFile(null)
      setAudioDuration(0)
      setShowAudioRecorder(false)
      setShowMediaUploader(false)

      onSuccess?.(result.data)
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

  return (
    <div
      data-create-post
      className="mb-4 xs:mb-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl xs:rounded-3xl p-4 xs:p-6 shadow-sm hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 animate-slide-in-from-top"
    >
      <div className="flex gap-4">
        <UserAvatar 
          user={user}
          size="lg" 
          showPlanBadge={false}
          className="flex-shrink-0"
        />
        <div className="flex-grow">
          <Textarea
            placeholder="O que está acontecendo? ✨"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="bg-transparent border-none text-lg p-0 focus-visible:ring-0 placeholder:text-gray-500 dark:placeholder:text-white/50 resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between mt-4 flex-wrap xs:flex-nowrap gap-2">
            <div className="flex gap-1 order-2 xs:order-1">
              {/* Image Upload */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShowMediaUploader}
                      disabled={!features.canUploadImages || !features.canUploadMoreMedia}
                      className={cn(
                        "relative rounded-full transition-all duration-300",
                        features.canUploadImages && features.canUploadMoreMedia
                          ? "text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                          : "text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <Camera className="w-5 h-5" />
                      {features.userPlan === "free" && features.maxImagesPerPost === 1 && (
                        <span className="absolute -top-1 -right-1 text-xs font-bold text-orange-500">1</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="z-50">
                    {!features.canUploadImages ? (
                      <p className="text-sm">Upload de Imagens • Requer verificação</p>
                    ) : !features.canUploadMoreMedia ? (
                      <p className="text-sm">Limite de armazenamento atingido ({features.formatStorageLimit(features.storageUsed)}/{features.formatStorageLimit(features.storageLimit)})</p>
                    ) : features.userPlan === "free" ? (
                      <p className="text-sm">Máximo: {features.maxImagesPerPost} foto por post</p>
                    ) : (
                      <p className="text-sm">Máximo: {features.maxImagesPerPost} fotos por post • {features.formatStorageLimit(features.storageLimit)} de armazenamento</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Video Upload */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => !features.canUploadVideos ? handlePremiumFeatureClick("gold") : handleShowMediaUploader()}
                      disabled={!features.canUploadVideos || !features.canUploadMoreMedia}
                      className={cn(
                        "relative rounded-full transition-all duration-300",
                        features.canUploadVideos && features.canUploadMoreMedia
                          ? "text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          : "text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <Video className="w-5 h-5" />
                      {!features.canUploadVideos && (
                        <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="z-50">
                    {!features.canUploadVideos ? (
                      <p className="text-sm">Upload de Vídeo • Plano Gold</p>
                    ) : !features.canUploadMoreMedia ? (
                      <p className="text-sm">Limite de armazenamento atingido</p>
                    ) : (
                      <p className="text-sm">Vídeos até {features.formatVideoLength(features.maxVideoLength)}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Audio Upload */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShowAudioRecorder}
                      className={cn(
                        "relative rounded-full transition-all duration-300",
                        features.canUploadImages
                          ? "text-gray-500 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10"
                          : "text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <Mic className="w-5 h-5" />
                      {!features.canUploadImages && (
                        <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  {!features.canUploadImages && (
                    <TooltipContent side="top" className="z-50">
                      <p className="text-sm">Áudio • Plano Gold</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {/* Polls */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => !features.canCreatePolls && handlePremiumFeatureClick("gold")}
                      className={cn(
                        "relative rounded-full transition-all duration-300",
                        features.canCreatePolls
                          ? "text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                          : "text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <BarChart2 className="w-5 h-5" />
                      {!features.canCreatePolls && (
                        <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  {!features.canCreatePolls && (
                    <TooltipContent side="top" className="z-50">
                      <p className="text-sm">Enquetes • Plano Gold</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2 xs:gap-3 order-1 xs:order-2 w-full xs:w-auto">
              {/* Seletor de Visibilidade */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-full px-2 xs:px-3 py-2 text-sm text-gray-700 dark:text-white/80 hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300 flex items-center gap-1 xs:gap-2"
                  >
                    {getVisibilityIcon()}
                    <span className="hidden xs:inline">{getVisibilityLabel()}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-2"
                >
                  <DropdownMenuItem
                    onClick={() => setPostVisibility("public")}
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <Globe className="w-4 h-4" />
                    Público
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPostVisibility("friends")}
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <Users className="w-4 h-4" />
                    Amigos
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPostVisibility("private")}
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <Lock className="w-4 h-4" />
                    Privado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={handlePublish}
                disabled={(!postContent.trim() && mediaFiles.length === 0 && !audioFile) || isSubmitting}
                className="rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90 px-4 xs:px-6 py-2 text-sm xs:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 hover:shadow-lg flex-1 xs:flex-none"
              >
                {isSubmitting ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Uploader */}
      {showMediaUploader && (
        <div className="mt-4 p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <MediaUploader
            files={mediaFiles}
            onChange={handleMediaChange}
            maxFiles={features.maxImagesPerPost === -1 ? 20 : features.maxImagesPerPost}
            maxSize={50} // 50MB max per file
            allowVideo={features.canUploadVideos}
            allowAudio={features.canUploadImages}
          />
          {features.storageLimit > 0 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Armazenamento usado: {features.formatStorageLimit(features.storageUsed)} de {features.formatStorageLimit(features.storageLimit)}
            </div>
          )}
          <div className="flex justify-end mt-4 space-x-2">
            <Button
              onClick={() => {
                setShowMediaUploader(false)
                setMediaFiles([])
              }}
              variant="ghost"
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setShowMediaUploader(false)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={mediaFiles.length === 0}
            >
              Concluir
            </Button>
          </div>
        </div>
      )}

      {/* Audio Recorder */}
      {showAudioRecorder && (
        <div className="mt-4 p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <AudioRecorder
            onAudioReady={handleAudioReady}
            onCancel={() => setShowAudioRecorder(false)}
            maxDuration={300} // 5 minutos
          />
        </div>
      )}

      {/* Audio File Preview */}
      {audioFile && (
        <div className="mt-4 p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Áudio gravado</p>
                <p className="text-xs text-gray-500">{Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setAudioFile(null)
                setAudioDuration(0)
              }}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Remover
            </Button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={selectedPlan}
        onSuccess={() => setShowPaymentModal(false)}
      />
    </div>
  )
}
