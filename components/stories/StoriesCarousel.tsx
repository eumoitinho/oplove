"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Story, StoryView, StoryDailyLimit } from '@/types/database.types'
import { useAuth } from '@/hooks/useAuth'
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures'
import StoryViewer from './StoryViewer'
import StoryCreator from './StoryCreator'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface StoriesCarouselProps {
  className?: string
}

export default function StoriesCarousel({ className }: StoriesCarouselProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { canPostStories, getStoryLimit } = usePremiumFeatures()
  
  const [stories, setStories] = useState<Story[]>([])
  const [userStories, setUserStories] = useState<Story[]>([])
  const [followingStories, setFollowingStories] = useState<Story[]>([])
  const [boostedStories, setBoostedStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null)
  const [showCreator, setShowCreator] = useState(false)
  const [dailyLimit, setDailyLimit] = useState<StoryDailyLimit | null>(null)
  
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadStories()
      loadDailyLimit()
    }
  }, [user?.id])

  useEffect(() => {
    checkScrollButtons()
  }, [stories])

  const loadStories = useCallback(async () => {
    try {
      // Load different story categories
      const [userStoriesRes, followingStoriesRes, boostedStoriesRes] = await Promise.all([
        fetch('/api/v1/stories/me', { credentials: 'include' }),
        fetch('/api/v1/stories/following', { credentials: 'include' }),
        fetch('/api/v1/stories?boosted=true', { credentials: 'include' })
      ])

      if (!userStoriesRes.ok || !followingStoriesRes.ok || !boostedStoriesRes.ok) {
        throw new Error('Failed to load stories')
      }

      const userData = await userStoriesRes.json()
      const followingData = await followingStoriesRes.json()
      const boostedData = await boostedStoriesRes.json()

      setUserStories(userData.stories || [])
      setFollowingStories(followingData.stories || [])
      setBoostedStories(boostedData.stories || [])

      // Combine all stories with boosted ones first
      const allStories = [
        ...boostedData.stories,
        ...userData.stories,
        ...followingData.stories.filter((s: Story) => !boostedData.stories.find((b: Story) => b.id === s.id))
      ]

      setStories(allStories)
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDailyLimit = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/stories/limits', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setDailyLimit(data)
      }
    } catch (error) {
      console.error('Error loading daily limit:', error)
    }
  }, [])

  const checkScrollButtons = useCallback(() => {
    if (!carouselRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    
    const scrollAmount = 200
    const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
    
    carouselRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }, [])

  const handleCreateStory = useCallback(() => {
    if (!user) {
      toast.error('Faça login para postar stories')
      return
    }

    if (!canPostStories) {
      toast.error('Apenas usuários verificados podem postar stories')
      return
    }

    if (dailyLimit && dailyLimit.storiesPostedToday >= dailyLimit.dailyLimit) {
      toast.error('Você atingiu o limite diário de stories')
      return
    }

    setShowCreator(true)
  }, [user, canPostStories, dailyLimit])

  const handleStoryCreated = useCallback((story: Story) => {
    setUserStories([story, ...userStories])
    setStories([story, ...stories])
    setDailyLimit(prev => prev ? {
      ...prev,
      storiesPostedToday: prev.storiesPostedToday + 1
    } : null)
    setShowCreator(false)
    toast.success('Story publicado com sucesso!')
  }, [userStories, stories])

  const handleStoryClick = useCallback((index: number) => {
    setSelectedStoryIndex(index)
  }, [])

  const renderStoryItem = useCallback((story: Story, index: number, isOwnStory: boolean = false) => {
    const hasNewStory = !story.hasViewed
    
    return (
      <motion.div
        key={story.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-shrink-0 cursor-pointer"
        onClick={() => handleStoryClick(index)}
      >
        <div className="relative">
          {/* Story ring */}
          <div className={cn(
            "absolute inset-0 rounded-full p-[2px]",
            hasNewStory ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-300 dark:bg-gray-700",
            story.isBoosted && "ring-2 ring-yellow-400 ring-offset-2"
          )}>
            <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full" />
          </div>
          
          {/* User avatar */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white dark:border-slate-950">
            <Image
              src={story.user.avatarUrl || '/placeholder-user.jpg'}
              alt={story.user.name}
              fill
              className="object-cover"
            />
            
            {/* Boost indicator */}
            {story.isBoosted && (
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 sm:p-1">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black" />
              </div>
            )}
          </div>
        </div>
        
        {/* Username */}
        <p className="text-[10px] sm:text-xs text-center mt-1 truncate w-14 sm:w-16">
          {isOwnStory ? 'Seu story' : story.user.username}
        </p>
      </motion.div>
    )
  }, [handleStoryClick])

  if (loading) {
    return (
      <div className={cn("bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl", className)}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex space-x-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="w-14 h-3 bg-gray-200 dark:bg-gray-800 rounded mt-2 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={cn("bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl", className)}>
        <div className="max-w-7xl mx-auto relative">
          {/* Scroll buttons */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => scroll('left')}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => scroll('right')}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Stories carousel */}
          <div
            ref={carouselRef}
            onScroll={checkScrollButtons}
            className="flex space-x-4 px-4 py-4 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {/* Add story button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <button
                onClick={handleCreateStory}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center group"
                disabled={!canPostStories}
              >
                {/* Story ring */}
                <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-purple-500 to-pink-500">
                  <div className="w-full h-full bg-white dark:bg-slate-950 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                
                {/* Daily limit indicator */}
                {dailyLimit && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary" className="text-[10px] sm:text-xs px-1">
                      {dailyLimit.storiesPostedToday}/{dailyLimit.dailyLimit}
                    </Badge>
                  </div>
                )}
              </button>
              <p className="text-[10px] sm:text-xs text-center mt-1">Adicionar</p>
            </motion.div>

            {/* Boosted stories section */}
            {boostedStories.length > 0 && (
              <>
                <div className="flex-shrink-0 flex items-center px-2">
                  <div className="h-16 w-px bg-gray-300 dark:bg-gray-700" />
                </div>
                {boostedStories.map((story, index) => renderStoryItem(story, index))}
              </>
            )}

            {/* User's own stories */}
            {userStories.length > 0 && (
              <>
                {boostedStories.length > 0 && (
                  <div className="flex-shrink-0 flex items-center px-2">
                    <div className="h-16 w-px bg-gray-300 dark:bg-gray-700" />
                  </div>
                )}
                {userStories.map((story, index) => renderStoryItem(
                  story, 
                  boostedStories.length + index,
                  true
                ))}
              </>
            )}

            {/* Following stories */}
            {followingStories.length > 0 && (
              <>
                {(boostedStories.length > 0 || userStories.length > 0) && (
                  <div className="flex-shrink-0 flex items-center px-2">
                    <div className="h-16 w-px bg-gray-300 dark:bg-gray-700" />
                  </div>
                )}
                {followingStories.map((story, index) => renderStoryItem(
                  story,
                  boostedStories.length + userStories.length + index
                ))}
              </>
            )}

            {/* Empty state */}
            {stories.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>Nenhum story disponível</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Story viewer modal */}
      <AnimatePresence>
        {selectedStoryIndex !== null && (
          <StoryViewer
            stories={stories}
            initialIndex={selectedStoryIndex}
            onClose={() => setSelectedStoryIndex(null)}
            onStoriesUpdate={setStories}
          />
        )}
      </AnimatePresence>

      {/* Story creator modal */}
      <AnimatePresence>
        {showCreator && (
          <StoryCreator
            onClose={() => setShowCreator(false)}
            onStoryCreated={handleStoryCreated}
            remainingStories={dailyLimit ? dailyLimit.dailyLimit - dailyLimit.storiesPostedToday : 0}
          />
        )}
      </AnimatePresence>
    </>
  )
}