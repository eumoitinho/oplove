"use client"

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Camera, 
  Video, 
  Type,
  Send,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Story } from '@/types/stories.types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Image from 'next/image'

interface StoryCreatorProps {
  onClose: () => void
  onStoryCreated: (story: Story) => void
  remainingStories: number
}

type MediaType = 'image' | 'video' | null

export default function StoryCreator({ 
  onClose, 
  onStoryCreated,
  remainingStories 
}: StoryCreatorProps) {
  const { user } = useAuth()
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>(null)
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showCaptionInput, setShowCaptionInput] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      toast.error('Por favor, selecione uma imagem ou vídeo')
      return
    }

    // Validate file size (max 100MB for videos, 10MB for images)
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${isVideo ? '100MB' : '10MB'}`)
      return
    }

    setMediaFile(file)
    setMediaType(isImage ? 'image' : 'video')
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleUpload = async () => {
    if (!mediaFile || !user) return

    setIsUploading(true)

    try {
      // Upload media file
      const formData = new FormData()
      formData.append('file', mediaFile)
      formData.append('type', 'story')
      
      const uploadResponse = await fetch('/api/v1/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Erro ao fazer upload do arquivo')
      }

      const { url } = await uploadResponse.json()

      // Get media dimensions and duration
      let width, height, duration = 5

      if (mediaType === 'image') {
        const img = new window.Image()
        img.src = mediaPreview!
        await new Promise(resolve => img.onload = resolve)
        width = img.naturalWidth
        height = img.naturalHeight
      } else if (mediaType === 'video' && videoRef.current) {
        width = videoRef.current.videoWidth
        height = videoRef.current.videoHeight
        duration = Math.min(videoRef.current.duration, 15) // Max 15 seconds
      }

      // Create story
      const response = await fetch('/api/v1/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mediaUrl: url,
          mediaType,
          caption: caption.trim(),
          duration,
          width,
          height,
          fileSize: mediaFile.size
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar story')
      }

      const story = await response.json()
      onStoryCreated(story)
      toast.success('Story publicado com sucesso!')
    } catch (error) {
      console.error('Error creating story:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar story')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCaptionToggle = () => {
    setShowCaptionInput(!showCaptionInput)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) {
          onClose()
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Criar Story</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {remainingStories} restantes hoje
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {!mediaFile ? (
            // File selection
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[9/16] bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="space-y-4 text-center">
                  <div className="flex justify-center space-x-4">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-pink-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Adicionar foto ou vídeo</p>
                    <p className="text-sm text-gray-500">
                      Toque para selecionar
                    </p>
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Fotos: máximo 10MB</p>
                <p>• Vídeos: máximo 100MB (15 segundos)</p>
                <p>• Formatos: JPG, PNG, MP4, MOV</p>
              </div>
            </div>
          ) : (
            // Media preview
            <div className="space-y-4">
              <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative">
                {mediaType === 'image' ? (
                  <Image
                    src={mediaPreview!}
                    alt="Story preview"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={mediaPreview!}
                    className="w-full h-full object-contain"
                    controls
                  />
                )}
                
                {/* Caption overlay */}
                {caption && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-center font-medium drop-shadow-lg">
                      {caption}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMediaFile(null)
                    setMediaPreview(null)
                    setMediaType(null)
                    setCaption('')
                  }}
                  disabled={isUploading}
                >
                  Alterar
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCaptionToggle}
                    disabled={isUploading}
                  >
                    <Type className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Publicar
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Caption input */}
              {showCaptionInput && (
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Adicione uma legenda..."
                  maxLength={200}
                  rows={3}
                  disabled={isUploading}
                />
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}