"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Heart, 
  Filter, 
  X, 
  Search,
  Verified,
  Diamond,
  Star,
  Users
} from "lucide-react"
import { UserAvatar } from "@/components/common/UserAvatar"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { PaymentModal } from "@/components/common/PaymentModal"
import { toast } from "sonner"
import { exploreService } from "@/lib/services/explore-service"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import type { UserProfile, ExploreFilters, Gender, AdultInterest } from "@/types/adult"

// Opções de filtros
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'man', label: 'Homem' },
  { value: 'woman', label: 'Mulher' },
  { value: 'trans', label: 'Trans' },
  { value: 'couple_mw', label: 'Casal H+M' },
  { value: 'couple_mm', label: 'Casal H+H' },
  { value: 'couple_ww', label: 'Casal M+M' }
]

const ADULT_INTERESTS: { value: AdultInterest; label: string; category: string }[] = [
  // Orientações
  { value: 'men', label: 'Homens', category: 'Orientação' },
  { value: 'women', label: 'Mulheres', category: 'Orientação' },
  { value: 'trans', label: 'Trans', category: 'Orientação' },
  { value: 'couples', label: 'Casais', category: 'Orientação' },
  
  // Práticas
  { value: 'swing', label: 'Swing', category: 'Prática' },
  { value: 'menage', label: 'Ménage', category: 'Prática' },
  { value: 'bdsm', label: 'BDSM', category: 'Prática' },
  { value: 'fisting', label: 'Fisting', category: 'Prática' },
  { value: 'anal', label: 'Anal', category: 'Prática' },
  { value: 'oral', label: 'Oral', category: 'Prática' },
  { value: 'voyeur', label: 'Voyeur', category: 'Prática' },
  { value: 'exhibitionist', label: 'Exibicionismo', category: 'Prática' },
  { value: 'dominance', label: 'Dominação', category: 'Prática' },
  { value: 'submission', label: 'Submissão', category: 'Prática' },
  { value: 'fetishism', label: 'Fetichismo', category: 'Prática' },
  { value: 'roleplay', label: 'Roleplay', category: 'Prática' },
  { value: 'tantric', label: 'Tântrico', category: 'Prática' },
  { value: 'rough', label: 'Rough', category: 'Prática' },
  { value: 'gentle', label: 'Suave', category: 'Prática' },
  { value: 'outdoor', label: 'Ao ar livre', category: 'Prática' },
  { value: 'public', label: 'Público', category: 'Prática' },
  { value: 'group', label: 'Grupal', category: 'Prática' },
  { value: 'threesome', label: 'Threesome', category: 'Prática' },
  { value: 'orgy', label: 'Orgia', category: 'Prática' },
  { value: 'cuckolding', label: 'Cuckold', category: 'Prática' },
  { value: 'hotwife', label: 'Hotwife', category: 'Prática' },
  { value: 'polyamory', label: 'Poliamor', category: 'Relacionamento' },
  { value: 'casual', label: 'Casual', category: 'Relacionamento' },
  { value: 'serious', label: 'Sério', category: 'Relacionamento' }
]

export function ExploreView() {
  const { user } = useAuth()
  const features = usePremiumFeatures()
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [dailyViewCount, setDailyViewCount] = useState(0)
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())
  
  // Memoize initial filters to prevent re-creation
  const initialFilters = useMemo(() => ({
    distance_km: features.userPlan === "free" ? 25 : 50,
    age_range: { min: 18, max: 65 },
    gender: [],
    interests: [],
    verification_required: false,
    online_only: false,
    has_photos: true,
    premium_only: false,
    relationship_type: 'both' as const
  }), [features.userPlan])
  
  const [filters, setFilters] = useState<ExploreFilters>(initialFilters)

  // Load daily view count for free users
  useEffect(() => {
    if (features.userPlan === "free") {
      const today = new Date().toDateString()
      const viewData = localStorage.getItem("dailyExploreData")
      if (viewData) {
        const { date, count } = JSON.parse(viewData)
        if (date === today) {
          setDailyViewCount(count)
        } else {
          localStorage.setItem("dailyExploreData", JSON.stringify({ date: today, count: 0 }))
          setDailyViewCount(0)
        }
      } else {
        localStorage.setItem("dailyExploreData", JSON.stringify({ date: today, count: 0 }))
      }
    }
  }, [features.userPlan])

  // Memoize stable values
  const userPlan = features.userPlan
  const userId = user?.id
  
  // Fetch function for infinite scroll
  const fetchProfiles = useCallback(async (page: number) => {
    if (!userId) return { data: [], hasMore: false }
    
    console.log('🔍 ExploreView - Fetching profiles:', {
      userId,
      filters,
      page,
      dailyViewCount,
      userPlan
    })
    
    // Check explore limits for free users
    if (userPlan === "free" && dailyViewCount >= 20) {
      toast.warning("Limite diário atingido", {
        description: "Usuários gratuitos podem explorar até 20 perfis por dia. Faça upgrade para explorar ilimitadamente.",
      })
      setShowPaymentModal(true)
      return { data: [], hasMore: false }
    }
    
    try {
      const result = await exploreService.searchProfiles(userId, filters, page, 20)
      
      console.log('✅ ExploreView - Search result:', {
        success: !!result,
        dataLength: result.data?.length || 0,
        hasMore: result.hasMore,
        firstProfile: result.data?.[0]
      })
      
      // Update view count for free users
      if (userPlan === "free" && result.data.length > 0) {
        const newCount = dailyViewCount + result.data.length
        setDailyViewCount(newCount)
        const today = new Date().toDateString()
        localStorage.setItem("dailyExploreData", JSON.stringify({ date: today, count: newCount }))
      }
      
      return result
    } catch (error) {
      console.error('❌ ExploreView - Error fetching profiles:', error)
      // Don't show toast on error to avoid breaking UX
      console.warn('Explore profiles fetch failed, returning empty result')
      return { data: [], hasMore: false }
    }
  }, [userId, filters, userPlan, dailyViewCount])

  // State for tracking when filters change
  const [isFiltersChanged, setIsFiltersChanged] = useState(false)
  const prevFiltersRef = useRef<string>('')
  
  // Memoize filters serialization to prevent unnecessary re-renders
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])
  
  // Track filters changes
  useEffect(() => {
    if (prevFiltersRef.current !== '' && prevFiltersRef.current !== filtersKey) {
      setIsFiltersChanged(true)
    }
    prevFiltersRef.current = filtersKey
  }, [filtersKey])
  
  // Infinite scroll
  const {
    data: scrollProfiles,
    loading,
    hasMore,
    containerRef,
    refresh
  } = useInfiniteScroll({
    fetchFn: fetchProfiles,
    limit: 20,
    enabled: !!userId,
    dependencies: [] // Remove dependencies to prevent auto-refresh
  })
  
  // Manual refresh when filters change
  useEffect(() => {
    if (isFiltersChanged && !!userId) {
      console.log('🔄 ExploreView - Filters changed, refreshing...')
      setIsFiltersChanged(false)
      refresh()
    }
  }, [isFiltersChanged, userId, refresh])

  // Update local state when scrollProfiles change
  useEffect(() => {
    console.log('🔄 ExploreView - scrollProfiles changed:', {
      scrollProfilesLength: scrollProfiles.length,
      currentProfilesLength: profiles.length,
      loading
    })
    setProfiles(scrollProfiles)
  }, [scrollProfiles, loading])

  // Load initial following state
  useEffect(() => {
    if (!user || profiles.length === 0) return

    const loadFollowingState = async () => {
      try {
        const profileIds = profiles.map(p => p.id)
        const response = await fetch(`/api/v1/users/${user.id}/following`, {
          method: 'GET',
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const followingIds = result.data
              .filter((follow: any) => profileIds.includes(follow.following_id))
              .map((follow: any) => follow.following_id)
            
            setFollowingUsers(new Set(followingIds))
          }
        }
      } catch (error) {
        console.error('Error loading following state:', error)
      }
    }

    loadFollowingState()
  }, [user, profiles])

  const handleFilterChange = useCallback((key: keyof ExploreFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleGenderToggle = useCallback((gender: Gender) => {
    setFilters(prev => ({
      ...prev,
      gender: prev.gender.includes(gender)
        ? prev.gender.filter(g => g !== gender)
        : [...prev.gender, gender]
    }))
  }, [])

  const handleInterestToggle = useCallback((interest: AdultInterest) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }, [])

  const formatDistance = useCallback((distance: number) => {
    if (distance < 1) return `${Math.round(distance * 1000)}m`
    return `${distance.toFixed(1)}km`
  }, [])

  // Handle follow/like action
  const handleLikeProfile = useCallback(async (profileId: string) => {
    if (!user) {
      toast.warning("Login necessário", {
        description: "Faça login para seguir pessoas",
      })
      return
    }

    if (followingUsers.has(profileId)) {
      toast.info("Já está seguindo", {
        description: "Você já está seguindo esta pessoa",
      })
      return
    }

    try {
      const response = await fetch(`/api/v1/users/${profileId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        setFollowingUsers(prev => new Set(prev).add(profileId))
        toast.success("Sucesso!", {
          description: "Agora você está seguindo esta pessoa",
        })
      } else {
        toast.error("Erro", {
          description: result.error || "Erro ao seguir pessoa",
        })
      }
    } catch (error) {
      console.error('Error following user:', error)
      toast.error("Erro", {
        description: "Erro de conexão",
      })
    }
  }, [user, followingUsers])

  // Handle clicking on user profile to navigate
  const handleUserClick = useCallback((userId: string) => {
    router.push(`/feed?view=user-profile&userId=${userId}`)
  }, [router])

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Faça login para explorar perfis</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Explorar Perfis
        </h1>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant={showFilters ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Limite indicator for free users */}
      {features.userPlan === "free" && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <Users className="w-4 h-4" />
            <span>Perfis visualizados hoje: {dailyViewCount}/20</span>
            <span className="text-xs opacity-75">• Raio máximo: 25km</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPaymentModal(true)}
            className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
          >
            Fazer upgrade
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6"
          >
            <div className="space-y-6">
              {/* Distance */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Distância: {filters.distance_km}km
                  {features.userPlan === "free" && (
                    <span className="text-xs text-gray-500 ml-2">(máximo 25km no plano gratuito)</span>
                  )}
                </label>
                <Slider
                  value={[filters.distance_km]}
                  onValueChange={([value]) => {
                    const maxDistance = features.userPlan === "free" ? 25 : 200
                    handleFilterChange('distance_km', Math.min(value, maxDistance))
                  }}
                  max={features.userPlan === "free" ? 25 : 200}
                  min={1}
                  step={1}
                  className="w-full"
                  disabled={features.userPlan === "free" && filters.distance_km >= 25}
                />
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Idade mínima</label>
                  <Input
                    type="number"
                    value={filters.age_range.min}
                    onChange={(e) => handleFilterChange('age_range', { 
                      ...filters.age_range, 
                      min: parseInt(e.target.value) || 18 
                    })}
                    min={18}
                    max={100}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Idade máxima</label>
                  <Input
                    type="number"
                    value={filters.age_range.max}
                    onChange={(e) => handleFilterChange('age_range', { 
                      ...filters.age_range, 
                      max: parseInt(e.target.value) || 65 
                    })}
                    min={18}
                    max={100}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium mb-3 block">Gênero</label>
                <div className="flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map(option => (
                    <Badge
                      key={option.value}
                      variant={filters.gender.includes(option.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleGenderToggle(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="text-sm font-medium mb-3 block">Interesses</label>
                <div className="space-y-3">
                  {['Orientação', 'Prática', 'Relacionamento'].map(category => (
                    <div key={category}>
                      <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {ADULT_INTERESTS
                          .filter(interest => interest.category === category)
                          .map(interest => (
                            <Badge
                              key={interest.value}
                              variant={filters.interests.includes(interest.value) ? "default" : "outline"}
                              className="cursor-pointer text-xs"
                              onClick={() => handleInterestToggle(interest.value)}
                            >
                              {interest.label}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verification"
                    checked={filters.verification_required}
                    onCheckedChange={(checked) => 
                      handleFilterChange('verification_required', checked)
                    }
                  />
                  <label htmlFor="verification" className="text-sm">
                    Apenas verificados
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="online"
                    checked={filters.online_only}
                    onCheckedChange={(checked) => 
                      handleFilterChange('online_only', checked)
                    }
                  />
                  <label htmlFor="online" className="text-sm">
                    Apenas online
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="photos"
                    checked={filters.has_photos}
                    onCheckedChange={(checked) => 
                      handleFilterChange('has_photos', checked)
                    }
                  />
                  <label htmlFor="photos" className="text-sm">
                    Com fotos
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="premium"
                    checked={filters.premium_only}
                    onCheckedChange={(checked) => 
                      handleFilterChange('premium_only', checked)
                    }
                  />
                  <label htmlFor="premium" className="text-sm">
                    Apenas premium
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="space-y-4">
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
            Debug: loading={loading.toString()}, profiles={profiles.length}, scrollProfiles={scrollProfiles.length}
          </div>
        )}
        
        {loading && profiles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 dark:bg-white/10 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum perfil encontrado com os filtros selecionados</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Profile Image */}
                  <div className="relative mb-4">
                    <div 
                      className="w-full h-48 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 cursor-pointer"
                      onClick={() => handleUserClick(profile.id)}
                    >
                      {profile.photos?.[0] ? (
                        <img
                          src={profile.photos[0]}
                          alt={profile.username}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserAvatar user={profile} size="xl" />
                        </div>
                      )}
                    </div>
                    
                    {/* Status indicators */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {profile.is_online && (
                        <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                      {profile.is_verified && (
                        <Verified className="w-5 h-5 text-blue-500 fill-blue-500" />
                      )}
                      {profile.premium_type !== 'free' && (
                        <div className="p-1 bg-white/90 rounded-full">
                          {profile.premium_type === 'diamond' ? (
                            <Diamond className="w-3 h-3 text-cyan-500" />
                          ) : (
                            <Star className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Distance */}
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                        <MapPin className="w-3 h-3" />
                        {formatDistance((profile as any).distance || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 
                        className="font-bold text-lg text-gray-900 dark:text-white cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        onClick={() => handleUserClick(profile.id)}
                      >
                        {profile.username}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-white/60">
                        {profile.age} anos • {profile.location?.city}
                      </p>
                    </div>

                    {profile.bio && (
                      <p className="text-sm text-gray-700 dark:text-white/80 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    {/* Interests */}
                    {profile.interests?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.interests.slice(0, 3).map((interest) => {
                          const interestData = ADULT_INTERESTS.find(i => i.value === interest)
                          return (
                            <Badge
                              key={interest}
                              variant="outline"
                              className="text-xs"
                            >
                              {interestData?.label || interest}
                            </Badge>
                          )
                        })}
                        {profile.interests.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.interests.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {profile.rating?.toFixed(1) || '0.0'}
                        <span>({profile.review_count || 0})</span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className={`rounded-full ${
                          followingUsers.has(profile.id) 
                            ? "bg-pink-500 text-white" 
                            : ""
                        }`}
                        onClick={() => handleLikeProfile(profile.id)}
                        disabled={followingUsers.has(profile.id)}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${
                          followingUsers.has(profile.id) ? "fill-white" : ""
                        }`} />
                        {followingUsers.has(profile.id) ? "Seguindo" : "Curtir"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div ref={containerRef} className="py-4 text-center">
                {loading && (
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan="gold"
        onSuccess={() => setShowPaymentModal(false)}
      />
    </div>
  )
}