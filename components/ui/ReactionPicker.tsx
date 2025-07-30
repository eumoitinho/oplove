"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Laugh, Zap, Frown, AngryIcon, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'

interface ReactionPickerProps {
  onReactionSelect: (reaction: ReactionType) => void
  currentReaction?: ReactionType | null
  className?: string
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const REACTIONS = [
  { 
    type: 'like' as ReactionType, 
    icon: ThumbsUp, 
    emoji: '👍', 
    label: 'Curtir',
    color: 'text-blue-500',
    hoverColor: 'hover:text-blue-600'
  },
  { 
    type: 'love' as ReactionType, 
    icon: Heart, 
    emoji: '❤️', 
    label: 'Amar',
    color: 'text-red-500',
    hoverColor: 'hover:text-red-600'
  },
  { 
    type: 'laugh' as ReactionType, 
    icon: Laugh, 
    emoji: '😂', 
    label: 'Rir',
    color: 'text-yellow-500',
    hoverColor: 'hover:text-yellow-600'
  },
  { 
    type: 'wow' as ReactionType, 
    icon: Zap, 
    emoji: '😮', 
    label: 'Impressionar',
    color: 'text-purple-500',
    hoverColor: 'hover:text-purple-600'
  },
  { 
    type: 'sad' as ReactionType, 
    icon: Frown, 
    emoji: '😢', 
    label: 'Entristecer',
    color: 'text-gray-500',
    hoverColor: 'hover:text-gray-600'
  },
  { 
    type: 'angry' as ReactionType, 
    icon: AngryIcon, 
    emoji: '😠', 
    label: 'Irritar',
    color: 'text-orange-500',
    hoverColor: 'hover:text-orange-600'
  }
]

export function ReactionPicker({ 
  onReactionSelect, 
  currentReaction, 
  className,
  showLabels = false,
  size = 'md'
}: ReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null)

  const sizeStyles = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg'
  }

  const containerSize = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      className={cn(
        "flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700",
        containerSize[size],
        className
      )}
    >
      {REACTIONS.map((reaction) => {
        const isActive = currentReaction === reaction.type
        const isHovered = hoveredReaction === reaction.type
        const Icon = reaction.icon

        return (
          <motion.button
            key={reaction.type}
            onClick={() => onReactionSelect(reaction.type)}
            onMouseEnter={() => setHoveredReaction(reaction.type)}
            onMouseLeave={() => setHoveredReaction(null)}
            className={cn(
              "relative flex items-center justify-center rounded-full transition-all duration-200",
              sizeStyles[size],
              isActive 
                ? `${reaction.color} bg-gray-100 dark:bg-gray-700 scale-110` 
                : `text-gray-400 dark:text-gray-500 ${reaction.hoverColor} hover:bg-gray-100 dark:hover:bg-gray-700`,
              "hover:scale-110"
            )}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Emoji (larger and more expressive) */}
            <span className="text-lg leading-none">
              {reaction.emoji}
            </span>

            {/* Tooltip with label */}
            <AnimatePresence>
              {isHovered && showLabels && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
                >
                  {reaction.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}
    </motion.div>
  )
}

// Componente para mostrar um contador de reações específico
interface ReactionCountProps {
  type: ReactionType
  count: number
  isActive?: boolean
  onClick?: () => void
  className?: string
}

export function ReactionCount({ 
  type, 
  count, 
  isActive = false, 
  onClick,
  className 
}: ReactionCountProps) {
  if (count === 0) return null

  const reaction = REACTIONS.find(r => r.type === type)
  if (!reaction) return null

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive 
          ? `${reaction.color} bg-gray-100 dark:bg-gray-700 font-medium`
          : "text-gray-500 dark:text-gray-400",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span>{reaction.emoji}</span>
      <span>{count}</span>
    </motion.button>
  )
}

// Componente para mostrar todas as reações de um item
interface ReactionsSummaryProps {
  counts: {
    like_count?: number
    love_count?: number
    laugh_count?: number
    wow_count?: number
    sad_count?: number
    angry_count?: number
  }
  userReaction?: ReactionType | null
  onReactionClick?: (type: ReactionType) => void
  className?: string
}

export function ReactionsSummary({ 
  counts, 
  userReaction, 
  onReactionClick,
  className 
}: ReactionsSummaryProps) {
  const hasReactions = Object.values(counts).some(count => (count || 0) > 0)
  
  if (!hasReactions) return null

  const reactionCounts = REACTIONS
    .map(reaction => ({
      ...reaction,
      count: counts[`${reaction.type}_count` as keyof typeof counts] || 0
    }))
    .filter(reaction => reaction.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {reactionCounts.map(reaction => (
        <ReactionCount
          key={reaction.type}
          type={reaction.type}
          count={reaction.count}
          isActive={userReaction === reaction.type}
          onClick={() => onReactionClick?.(reaction.type)}
        />
      ))}
    </div>
  )
}

// Hook para usar reações
export function useReactions() {
  const getReactionEmoji = (type: ReactionType) => {
    const reaction = REACTIONS.find(r => r.type === type)
    return reaction?.emoji || '👍'
  }

  const getReactionLabel = (type: ReactionType) => {
    const reaction = REACTIONS.find(r => r.type === type)
    return reaction?.label || 'Curtir'
  }

  const getTotalReactions = (counts: ReactionsSummaryProps['counts']) => {
    return Object.values(counts).reduce((total, count) => total + (count || 0), 0)
  }

  const getMostPopularReaction = (counts: ReactionsSummaryProps['counts']): ReactionType | null => {
    let maxCount = 0
    let mostPopular: ReactionType | null = null

    REACTIONS.forEach(reaction => {
      const count = counts[`${reaction.type}_count` as keyof typeof counts] || 0
      if (count > maxCount) {
        maxCount = count
        mostPopular = reaction.type
      }
    })

    return mostPopular
  }

  return {
    getReactionEmoji,
    getReactionLabel,
    getTotalReactions,
    getMostPopularReaction,
    REACTIONS
  }
}