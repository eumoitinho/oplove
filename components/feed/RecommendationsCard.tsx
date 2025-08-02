"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Verified, Diamond, Star, UserPlus } from "lucide-react"
import { UserAvatar } from "@/components/common/UserAvatar"
import { useAuth } from "@/hooks/useAuth"
import { exploreService } from "@/lib/services/explore-service"
import type { UserProfile } from "@/types/adult"

interface RecommendationsCardProps {
  onViewChange?: (view: string) => void
}

const ADULT_INTERESTS_LABELS = {
  'swing': 'Swing',
  'menage': 'Ménage',
  'bdsm': 'BDSM',
  'fisting': 'Fisting',
  'anal': 'Anal',
  'oral': 'Oral',
  'voyeur': 'Voyeur',
  'exhibitionist': 'Exibicionismo',
  'dominance': 'Dominação',
  'submission': 'Submissão',
  'fetishism': 'Fetichismo',
  'roleplay': 'Roleplay',
  'tantric': 'Tântrico',
  'rough': 'Rough',
  'gentle': 'Suave',
  'outdoor': 'Ao ar livre',
  'public': 'Público',
  'group': 'Grupal',
  'threesome': 'Threesome',
  'orgy': 'Orgia',
  'cuckolding': 'Cuckold',
  'hotwife': 'Hotwife',
  'polyamory': 'Poliamor',
  'casual': 'Casual',
  'serious': 'Sério'
}

export function RecommendationsCard({ onViewChange }: RecommendationsCardProps) {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user?.id) {
        setLoading(false)
        setRecommendations([])
        return
      }

      setLoading(true)
      try {
        const recs = await exploreService.getRecommendations(user.id, 4)
        setRecommendations(recs)
      } catch (error) {
        console.error('[RecommendationsCard] Error loading recommendations:', error)
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [user?.id])

  if (!user) {
    return (
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6">
        <div className="text-center py-6">
          <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-white/60">
            Faça login para ver recomendações
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded mb-1 animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            Descobrir Pessoas
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-white/60 mb-3">
              Complete seu perfil para receber recomendações personalizadas
            </p>
            <Button
              size="sm"
              onClick={() => onViewChange?.("user-profile")}
              className="rounded-full"
            >
              Completar perfil
            </Button>
          </div>
        ) : (
          recommendations.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
            >
              <div className="relative">
                <UserAvatar user={profile} size="md" />
                {profile.is_online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {profile.display_name || profile.username}
                  </span>
                  {profile.is_verified && (
                    <Verified className="w-3 h-3 text-blue-500 fill-blue-500 flex-shrink-0" />
                  )}
                  {profile.premium_type === 'diamond' && (
                    <Diamond className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                  )}
                  {profile.premium_type === 'gold' && (
                    <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="text-xs text-gray-500 dark:text-white/60 mb-2">
                  {profile.age} anos • {profile.location?.city}
                </div>

                {/* Common interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {profile.interests.slice(0, 2).map((interest) => (
                      <Badge
                        key={interest}
                        variant="outline"
                        className="text-xs px-2 py-0 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300"
                      >
                        {ADULT_INTERESTS_LABELS[interest as keyof typeof ADULT_INTERESTS_LABELS] || interest}
                      </Badge>
                    ))}
                    {profile.interests.length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{profile.interests.length - 2}
                      </span>
                    )}
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-xs py-1 h-7 border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Seguir
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {recommendations.length > 0 && (
        <Button
          onClick={() => onViewChange?.("explore")}
          variant="outline"
          className="w-full mt-4 rounded-2xl border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
        >
          Ver mais recomendações
        </Button>
      )}
    </motion.div>
  )
}