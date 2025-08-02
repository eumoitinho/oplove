"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Send,
  MoreVertical,
  Eye,
  Zap,
  Gift
} from 'lucide-react'
import { Story, StoryReaction, StoryView } from '@/types/stories.types'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import StoryBoostModal from './StoryBoostModal'
import ProfileSealsModal from './ProfileSealsModal'

interface StoryViewerProps {
  stories: Story[]
  initialIndex: number
  onClose: () => void
  onStoriesUpdate?: (stories: Story[]) => void
}

const REACTIONS: { type: StoryReaction; icon: string; color: string }[] = [
  { type: 'like', icon: '❤️', color: 'text-red-500' },
  { type: 'love', icon: '😍', color: 'text-pink-500' },
  { type: 'fire', icon: '🔥', color: 'text-orange-500' },
  { type: 'wow', icon: '😮', color: 'text-yellow-500' },
  { type: 'sad', icon: '😢', color: 'text-blue-500' },
  { type: 'angry', icon: '😠', color: 'text-red-600' }
]

export default function StoryViewer({ 
  stories, 
  initialIndex, 
  onClose,
  onStoriesUpdate 
}: StoryViewerProps) {
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [showReactions, setShowReactions] = useState(false)
  const [viewers, setViewers] = useState<StoryView[]>([])
  const [showViewers, setShowViewers] = useState(false)
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [showGiftModal, setShowGiftModal] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const currentStory = stories[currentIndex]
  const isOwnStory = currentStory?.userId === user?.id

  useEffect(() => {
    if (currentStory) {
      markAsViewed()
      if (isOwnStory) {
        loadViewers()
      }
    }
  }, [currentIndex])

  useEffect(() => {
    if (!isPaused && currentStory) {
      const duration = currentStory.duration * 1000 // Convert to milliseconds
      const interval = 50 // Update every 50ms
      
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (interval / duration) * 100
          if (newProgress >= 100) {
            handleNext()
            return 0
          }
          return newProgress
        })
      }, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentIndex, isPaused, currentStory])

  const markAsViewed = async () => {
    if (!currentStory || currentStory.hasViewed) return

    try {
      const response = await fetch(`/api/v1/stories/${currentStory.id}/view`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        // Update local state
        const updatedStories = [...stories]
        updatedStories[currentIndex] = {
          ...currentStory,
          hasViewed: true,
          viewCount: currentStory.viewCount + 1
        }
        onStoriesUpdate?.(updatedStories)
      }
    } catch (error) {
      console.error('Error marking story as viewed:', error)
    }
  }

  const loadViewers = async () => {
    try {
      const response = await fetch(`/api/v1/stories/${currentStory.id}/viewers`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setViewers(data.viewers)
      }
    } catch (error) {
      console.error('Error loading viewers:', error)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setProgress(0)
      setShowReplyInput(false)
      setShowReactions(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setProgress(0)
      setShowReplyInput(false)
      setShowReactions(false)
    } else {
      onClose()
    }
  }

  const handleReaction = async (reaction: StoryReaction) => {
    try {
      const response = await fetch(`/api/v1/stories/${currentStory.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reaction })
      })

      if (response.ok) {
        toast.success('Reação enviada!')
        setShowReactions(false)
        
        // Update local state
        const updatedStories = [...stories]
        updatedStories[currentIndex] = {
          ...currentStory,
          reaction,
          reactionCount: currentStory.reactionCount + 1
        }
        onStoriesUpdate?.(updatedStories)
      }
    } catch (error) {
      console.error('Error sending reaction:', error)
      toast.error('Erro ao enviar reação')
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim()) return

    try {
      const response = await fetch(`/api/v1/stories/${currentStory.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: replyMessage })
      })

      if (response.ok) {
        toast.success('Mensagem enviada!')
        setReplyMessage('')
        setShowReplyInput(false)
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Erro ao enviar mensagem')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este story?')) return

    try {
      const response = await fetch(`/api/v1/stories/${currentStory.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Story excluído')
        handleNext()
      }
    } catch (error) {
      console.error('Error deleting story:', error)
      toast.error('Erro ao excluir story')
    }
  }

  const handleBoost = async (credits: number, duration: number) => {
    try {
      const response = await fetch(`/api/v1/stories/${currentStory.id}/boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credits, duration })
      })

      if (response.ok) {
        toast.success('Story impulsionado com sucesso!')
        setShowBoostModal(false)
        
        // Update local state
        const updatedStories = [...stories]
        updatedStories[currentIndex] = {
          ...currentStory,
          isBoosted: true,
          boostExpiresAt: new Date(Date.now() + duration * 3600000).toISOString()
        }
        onStoriesUpdate?.(updatedStories)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao impulsionar story')
      }
    } catch (error) {
      console.error('Error boosting story:', error)
      toast.error('Erro ao impulsionar story')
    }
  }

  if (!currentStory) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex items-center justify-center story-viewer-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-md h-full max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 p-2 flex space-x-1">
          {stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: index < currentIndex ? '100%' : 
                         index === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-20 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar 
                className="w-10 h-10 border-2 border-white cursor-pointer"
                onClick={() => window.location.href = `/profile/${currentStory.user.username}`}
              >
                <AvatarImage src={currentStory.user.avatarUrl} />
                <AvatarFallback>{currentStory.user.name[0]}</AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-semibold">
                    {currentStory.user.name}
                  </p>
                  {currentStory.user.isVerified && (
                    <Badge variant="secondary" className="h-5">
                      <span className="text-xs">✓</span>
                    </Badge>
                  )}
                  {currentStory.isBoosted && (
                    <Badge className="bg-yellow-500 text-black h-5">
                      <Zap className="w-3 h-3 mr-1" />
                      Impulsionado
                    </Badge>
                  )}
                </div>
                <p className="text-white/70 text-sm">
                  {new Date(currentStory.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isOwnStory && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white"
                  onClick={() => setShowViewers(!showViewers)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {currentStory.viewCount}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-white">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwnStory ? (
                    <>
                      <DropdownMenuItem onClick={() => setShowBoostModal(true)}>
                        <Zap className="w-4 h-4 mr-2" />
                        Impulsionar Story
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-red-600"
                      >
                        Excluir Story
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => setShowGiftModal(true)}>
                        <Gift className="w-4 h-4 mr-2" />
                        Enviar Selo
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Denunciar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                size="icon"
                variant="ghost"
                className="text-white"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Story content */}
        <div 
          className="relative w-full h-full flex items-center justify-center bg-black"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Navigation areas */}
          <button
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
            onClick={handlePrevious}
          />
          <button
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
            onClick={handleNext}
          />

          {/* Media content */}
          {currentStory.mediaType === 'image' ? (
            <Image
              src={currentStory.mediaUrl}
              alt="Story"
              fill
              className="object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              muted
              loop={false}
            />
          )}

          {/* Caption */}
          {currentStory.caption && (
            <div className="absolute bottom-20 left-4 right-4 z-10">
              <p className="text-white text-center text-lg font-medium drop-shadow-lg">
                {currentStory.caption}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="text-white"
                onClick={() => setShowReactions(!showReactions)}
              >
                {currentStory.reaction ? (
                  <span className="text-2xl">
                    {REACTIONS.find(r => r.type === currentStory.reaction)?.icon}
                  </span>
                ) : (
                  <Heart className="w-7 h-7" />
                )}
              </button>
              
              {!isOwnStory && (
                <button
                  className="text-white"
                  onClick={() => setShowReplyInput(!showReplyInput)}
                >
                  <MessageCircle className="w-7 h-7" />
                </button>
              )}
            </div>
          </div>

          {/* Reactions picker */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-full shadow-lg p-2 flex space-x-2"
              >
                {REACTIONS.map((reaction) => (
                  <button
                    key={reaction.type}
                    onClick={() => handleReaction(reaction.type)}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {reaction.icon}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply input */}
          <AnimatePresence>
            {showReplyInput && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onSubmit={handleReply}
                className="mt-4 flex space-x-2"
              >
                <Input
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Enviar mensagem..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button type="submit" size="icon" variant="ghost" className="text-white">
                  <Send className="w-5 h-5" />
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Viewers list (for own stories) */}
        <AnimatePresence>
          {showViewers && isOwnStory && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-xl max-h-[70vh] overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Visualizações ({viewers.length})</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowViewers(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {viewers.map((view) => (
                    <div key={view.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={view.viewer?.avatarUrl} />
                          <AvatarFallback>{view.viewer?.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{view.viewer?.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(view.viewedAt).toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      {view.reaction && (
                        <span className="text-2xl">
                          {REACTIONS.find(r => r.type === view.reaction)?.icon}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Boost modal */}
      <StoryBoostModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        onBoost={handleBoost}
        storyId={currentStory.id}
      />

      {/* Gift seals modal */}
      <ProfileSealsModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        recipientId={currentStory.userId}
        recipientName={currentStory.user.name}
      />
    </motion.div>
  )
}