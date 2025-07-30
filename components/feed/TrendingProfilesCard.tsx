"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Verified, Diamond, Star, Heart } from "lucide-react"
import { UserAvatar } from "@/components/common/UserAvatar"
import { exploreService } from "@/lib/services/explore-service"
import type { UserProfile } from "@/types/adult"

interface TrendingProfilesCardProps {
  onViewChange?: (view: string) => void
}

export function TrendingProfilesCard({ onViewChange }: TrendingProfilesCardProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrendingProfiles = async () => {
      try {
        const trendingProfiles = await exploreService.getTrendingProfiles(1, 5)
        setProfiles(trendingProfiles)
      } catch (error) {
        // Fallback para dados mock em caso de erro
        setProfiles([])
      } finally {
        setLoading(false)
      }
    }

    loadTrendingProfiles()
  }, [])

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
      className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            Em Alta Hoje
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange?.("explore")}
          className="text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
        >
          Ver mais
        </Button>
      </div>

      <div className="space-y-3">
        {profiles.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-white/60">
              Nenhum perfil em alta hoje
            </p>
          </div>
        ) : (
          profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
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
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-white/60">
                    {profile.age} anos
                  </span>
                  {profile.rating > 0 && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500 dark:text-white/60">
                          {profile.rating.toFixed(1)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-pink-50 dark:hover:bg-pink-500/10"
              >
                <Heart className="w-4 h-4 text-pink-500" />
              </Button>
            </motion.div>
          ))
        )}
      </div>

      {profiles.length > 0 && (
        <Button
          onClick={() => onViewChange?.("explore")}
          variant="outline"
          className="w-full mt-4 rounded-2xl border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
        >
          Descobrir mais perfis
        </Button>
      )}
    </motion.div>
  )
}