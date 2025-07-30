"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Heart, 
  X, 
  Star, 
  RotateCcw,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Music,
  Camera,
  Plane,
  Coffee,
  Crown,
  Gem,
  Zap,
  Lock,
  Settings,
  Filter,
  ChevronUp,
  ChevronDown,
  Sparkles,
  MessageCircle,
  CheckCircle
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { toast } from "sonner"

interface DatingProfile {
  id: string
  userId: string
  user: {
    username: string
    full_name: string
    avatar_url: string
    age: number
    location: string
    is_verified: boolean
    premium_type: string
  }
  bio: string
  photos: {
    url: string
    caption?: string
    is_verified: boolean
  }[]
  prompts: {
    question: string
    answer: string
  }[]
  interests: string[]
  distance: number
  lastActive: string
  isOnline: boolean
}

interface SwipeLimits {
  daily_likes_limit: number
  daily_likes_used: number
  daily_super_likes_limit: number
  daily_super_likes_used: number
  daily_rewinds_limit: number
  daily_rewinds_used: number
}

export function OpenDates() {
  const { user } = useAuth()
  const { features } = usePremiumFeatures()
  const [profiles, setProfiles] = useState<DatingProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [limits, setLimits] = useState<SwipeLimits>({
    daily_likes_limit: 0,
    daily_likes_used: 0,
    daily_super_likes_limit: 0,
    daily_super_likes_used: 0,
    daily_rewinds_limit: 0,
    daily_rewinds_used: 0
  })
  const [loading, setLoading] = useState(true)
  const [showMatch, setShowMatch] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<DatingProfile | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  // Motion values for swipe animations
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0, 1, 1, 1, 0])

  // Check if user has access to Open Dates
  const hasAccess = user?.premium_type && ['gold', 'diamond'].includes(user.premium_type)
  const isCouple = user?.premium_type === 'couple'

  useEffect(() => {
    if (hasAccess && !isCouple) {
      loadProfiles()
      loadLimits()
    }
  }, [hasAccess, user])

  const loadProfiles = async () => {
    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock profiles
      const mockProfiles: DatingProfile[] = [
        {
          id: '1',
          userId: 'user1',
          user: {
            username: 'maria_silva',
            full_name: 'Maria Silva',
            avatar_url: '/profile1.jpg',
            age: 28,
            location: 'São Paulo, SP',
            is_verified: true,
            premium_type: 'diamond'
          },
          bio: 'Apaixonada por viagens e fotografia. Procurando alguém para explorar o mundo junto! 📸✈️',
          photos: [
            { url: '/profile1.jpg', is_verified: true },
            { url: '/profile1-2.jpg', is_verified: false, caption: 'Em Paris 🇫🇷' },
            { url: '/profile1-3.jpg', is_verified: false, caption: 'Sunset vibes' }
          ],
          prompts: [
            { question: 'Meu lugar favorito no mundo é...', answer: 'Qualquer lugar com boa companhia e uma vista incrível' },
            { question: 'No primeiro encontro eu...', answer: 'Sugiro um café e uma caminhada pelo parque' }
          ],
          interests: ['Fotografia', 'Viagens', 'Culinária', 'Música'],
          distance: 2.5,
          lastActive: '5 min atrás',
          isOnline: true
        },
        {
          id: '2',
          userId: 'user2',
          user: {
            username: 'carlos_dev',
            full_name: 'Carlos Santos',
            avatar_url: '/profile2.jpg',
            age: 32,
            location: 'Rio de Janeiro, RJ',
            is_verified: false,
            premium_type: 'gold'
          },
          bio: 'Desenvolvedor por dia, chef por hobby. Sempre procurando a próxima aventura! 👨‍💻🍳',
          photos: [
            { url: '/profile2.jpg', is_verified: false },
            { url: '/profile2-2.jpg', is_verified: false, caption: 'Coding life' }
          ],
          prompts: [
            { question: 'Eu nunca saio de casa sem...', answer: 'Meu laptop e uma dose de curiosidade' },
            { question: 'Minha paixão é...', answer: 'Criar coisas que façam diferença na vida das pessoas' }
          ],
          interests: ['Tecnologia', 'Culinária', 'Games', 'Startups'],
          distance: 15.2,
          lastActive: '1 hora atrás',
          isOnline: false
        }
      ]
      
      setProfiles(mockProfiles)
    } catch (error) {
      console.error('Error loading profiles:', error)
      toast.error('Erro ao carregar perfis')
    } finally {
      setLoading(false)
    }
  }

  const loadLimits = async () => {
    try {
      // TODO: Implement real API call
      const planLimits = {
        gold: {
          daily_likes_limit: 50,
          daily_super_likes_limit: 5,
          daily_rewinds_limit: 3
        },
        diamond: {
          daily_likes_limit: 200,
          daily_super_likes_limit: 20,
          daily_rewinds_limit: 10
        }
      }
      
      const userLimits = planLimits[user?.premium_type as keyof typeof planLimits] || planLimits.gold
      
      setLimits({
        ...userLimits,
        daily_likes_used: 5,
        daily_super_likes_used: 1,
        daily_rewinds_used: 0
      })
    } catch (error) {
      console.error('Error loading limits:', error)
    }
  }

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (currentIndex >= profiles.length) return
    
    const currentProfile = profiles[currentIndex]
    
    if (direction === 'right' || direction === 'super') {
      // Check limits
      if (direction === 'right' && limits.daily_likes_used >= limits.daily_likes_limit) {
        setShowUpgradePrompt(true)
        return
      }
      
      if (direction === 'super' && limits.daily_super_likes_used >= limits.daily_super_likes_limit) {
        toast.error('Super likes esgotados por hoje!')
        return
      }
      
      // Create like
      await createLike(currentProfile.userId, direction === 'super')
      
      // Check for match
      const isMatch = Math.random() > 0.7 // 30% chance for demo
      if (isMatch) {
        setMatchedProfile(currentProfile)
        setShowMatch(true)
        await createMatch(currentProfile.userId)
        toast.success('É um match! 💕')
      }
      
      // Update limits
      setLimits(prev => ({
        ...prev,
        daily_likes_used: direction === 'right' ? prev.daily_likes_used + 1 : prev.daily_likes_used,
        daily_super_likes_used: direction === 'super' ? prev.daily_super_likes_used + 1 : prev.daily_super_likes_used
      }))
    }
    
    // Move to next profile
    setCurrentIndex(prev => prev + 1)
    setCurrentPhotoIndex(0)
    x.set(0)
  }

  const createLike = async (targetUserId: string, isSuperLike: boolean) => {
    try {
      // TODO: Implement real API call
      console.log(`${isSuperLike ? 'Super like' : 'Like'} sent to ${targetUserId}`)
    } catch (error) {
      console.error('Error creating like:', error)
    }
  }

  const createMatch = async (targetUserId: string) => {
    try {
      // TODO: Implement real API call
      console.log(`Match created with ${targetUserId}`)
    } catch (error) {
      console.error('Error creating match:', error)
    }
  }

  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    const { offset, velocity } = info
    
    if (offset.x > threshold || velocity.x > 500) {
      handleSwipe('right')
    } else if (offset.x < -threshold || velocity.x < -500) {
      handleSwipe('left')
    } else {
      x.set(0)
    }
  }

  const handleRewind = async () => {
    if (limits.daily_rewinds_used >= limits.daily_rewinds_limit) {
      toast.error('Rewinds esgotados por hoje!')
      return
    }
    
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setLimits(prev => ({
        ...prev,
        daily_rewinds_used: prev.daily_rewinds_used + 1
      }))
      toast.success('Último swipe desfeito!')
    }
  }

  const handlePhotoNavigation = (direction: 'next' | 'prev') => {
    const currentProfile = profiles[currentIndex]
    if (!currentProfile) return
    
    if (direction === 'next' && currentPhotoIndex < currentProfile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1)
    } else if (direction === 'prev' && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1)
    }
  }

  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case 'diamond':
        return <Badge className="bg-purple-500 text-white"><Gem className="w-3 h-3 mr-1" />Diamond</Badge>
      case 'gold':
        return <Badge className="bg-yellow-500 text-white"><Crown className="w-3 h-3 mr-1" />Gold</Badge>
      default:
        return null
    }
  }

  // If user doesn't have access
  if (!hasAccess || isCouple) {
    return (
      <div className="p-6 text-center">
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200 dark:border-pink-800 rounded-2xl p-6">
          <Heart className="w-12 h-12 mx-auto text-pink-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Open Dates</h3>
          {isCouple ? (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              O Open Dates não está disponível para casais
            </p>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Conheça pessoas incríveis perto de você
              </p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span><strong>Gold:</strong> 50 likes por dia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-purple-500" />
                  <span><strong>Diamond:</strong> 200 likes + Super likes</span>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="flex justify-center gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="p-6 text-center">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-8">
          <Sparkles className="w-12 h-12 mx-auto text-purple-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acabaram os perfis!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Volte mais tarde para ver novos perfis
          </p>
          <Button 
            onClick={() => {
              setCurrentIndex(0)
              loadProfiles()
            }}
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recarregar
          </Button>
        </div>
      </div>
    )
  }

  const currentProfile = profiles[currentIndex]
  const currentPhoto = currentProfile.photos[currentPhotoIndex]

  return (
    <div className="p-4 max-w-sm mx-auto">
      {/* Header with limits */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <span className="font-semibold">Open Dates</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="text-xs">
            {limits.daily_likes_limit - limits.daily_likes_used} ❤️
          </Badge>
          {user?.premium_type === 'diamond' && (
            <Badge variant="outline" className="text-xs">
              {limits.daily_super_likes_limit - limits.daily_super_likes_used} ⭐
            </Badge>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        className="relative w-full h-[500px] cursor-grab active:cursor-grabbing"
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onPanEnd={handlePanEnd}
        whileTap={{ scale: 0.95 }}
      >
        <Card className="w-full h-full overflow-hidden shadow-xl">
          <div className="relative h-full">
            {/* Photo */}
            <div 
              className="w-full h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url(${currentPhoto.url})` }}
            >
              {/* Photo navigation dots */}
              {currentProfile.photos.length > 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {currentProfile.photos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-1 rounded-full ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Photo navigation areas */}
              <div 
                className="absolute left-0 top-0 w-1/2 h-full z-10"
                onClick={() => handlePhotoNavigation('prev')}
              />
              <div 
                className="absolute right-0 top-0 w-1/2 h-full z-10"
                onClick={() => handlePhotoNavigation('next')}
              />

              {/* Online indicator */}
              {currentProfile.isOnline && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Profile info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">
                    {currentProfile.user.full_name}, {currentProfile.user.age}
                  </h3>
                  {currentProfile.user.is_verified && (
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  )}
                  {getPlanBadge(currentProfile.user.premium_type)}
                </div>

                <div className="flex items-center gap-1 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{currentProfile.distance}km • {currentProfile.user.location}</span>
                </div>

                <p className="text-sm opacity-90 mb-3 line-clamp-2">
                  {currentProfile.bio}
                </p>

                {/* Interests */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {currentProfile.interests.slice(0, 3).map((interest, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-white/20 text-white border-white/30"
                    >
                      {interest}
                    </Badge>
                  ))}
                  {currentProfile.interests.length > 3 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-white/20 text-white border-white/30"
                    >
                      +{currentProfile.interests.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="text-xs opacity-75">
                  Ativo(a) {currentProfile.lastActive}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-4 mt-6">
        {/* Pass */}
        <Button
          onClick={() => handleSwipe('left')}
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <X className="w-6 h-6 text-gray-600 hover:text-red-500" />
        </Button>

        {/* Rewind */}
        {user?.premium_type === 'diamond' && (
          <Button
            onClick={handleRewind}
            size="sm"
            variant="outline"
            className="w-10 h-10 rounded-full border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            disabled={currentIndex === 0 || limits.daily_rewinds_used >= limits.daily_rewinds_limit}
          >
            <RotateCcw className="w-4 h-4 text-yellow-600" />
          </Button>
        )}

        {/* Super Like */}
        {user?.premium_type === 'diamond' && (
          <Button
            onClick={() => handleSwipe('super')}
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            disabled={limits.daily_super_likes_used >= limits.daily_super_likes_limit}
          >
            <Star className="w-6 h-6" />
          </Button>
        )}

        {/* Like */}
        <Button
          onClick={() => handleSwipe('right')}
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
          disabled={limits.daily_likes_used >= limits.daily_likes_limit}
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>

      {/* Match Modal */}
      {showMatch && matchedProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full text-center"
          >
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-2xl font-bold mb-2">É um Match!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Você e {matchedProfile.user.full_name} curtiram um ao outro
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Heart className="w-8 h-8 text-pink-500" />
              <Avatar className="w-16 h-16">
                <AvatarImage src={matchedProfile.user.avatar_url} />
                <AvatarFallback>{matchedProfile.user.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowMatch(false)}
                className="flex-1"
              >
                Continuar
              </Button>
              <Button 
                onClick={() => {
                  setShowMatch(false)
                  // TODO: Navigate to chat
                }}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <Crown className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
              <h3 className="text-lg font-semibold">Likes Esgotados</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Você atingiu o limite diário. Faça upgrade para mais likes!
              </p>
            </div>
            
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span>Plano Atual (Gold)</span>
                <span>50 likes/dia</span>
              </div>
              <div className="flex justify-between text-purple-600">
                <span>Plano Diamond</span>
                <span>200 likes/dia + Super likes</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradePrompt(false)}
                className="flex-1"
              >
                Mais Tarde
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                <Gem className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}