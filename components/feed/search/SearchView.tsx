"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Filter, 
  Calendar,
  MapPin,
  Verified,
  Loader2,
  Users,
  FileText,
  Image as ImageIcon,
  Video,
  Star,
  Gem,
  ChevronRight
} from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { useToast } from "@/hooks/useToast"
import { PostCard } from "@/components/feed/post/PostCard"
import { PostSkeleton } from "@/components/feed/PostSkeleton"
import type { User, Post } from "@/types/common"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface SearchViewProps {
  onBack?: () => void
}

interface SearchFilters {
  dateRange?: "today" | "week" | "month" | "year"
  location?: string
  verifiedOnly?: boolean
  mediaType?: "all" | "photos" | "videos"
}

interface SearchResult {
  users: User[]
  posts: Post[]
  photos: Post[]
  videos: Post[]
  totalCount: number
}

interface RecentSearch {
  id: string
  query: string
  timestamp: string
  type: "query" | "user" | "hashtag"
}

const trendingSearches = [
  { query: "design tips", icon: TrendingUp, count: "12.5k" },
  { query: "react hooks", icon: TrendingUp, count: "8.3k" },
  { query: "ux research", icon: TrendingUp, count: "6.7k" },
  { query: "figma plugins", icon: TrendingUp, count: "5.1k" },
  { query: "web3 design", icon: TrendingUp, count: "4.2k" },
]

const PlanBadge = ({ plan }: { plan: "free" | "gold" | "diamond" | "couple" }) => {
  const planStyles = {
    diamond: { icon: Gem, className: "plan-badge-diamond" },
    gold: { icon: Star, className: "plan-badge-gold" },
    couple: { icon: Users, className: "plan-badge-couple" },
    free: { icon: () => null, className: "plan-badge-free" },
  }
  const { icon: Icon, className } = planStyles[plan]
  if (plan === "free") return null
  return (
    <Badge variant="outline" className={`text-xs ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </Badge>
  )
}

export function SearchView({ onBack }: SearchViewProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult>({
    users: [],
    posts: [],
    photos: [],
    videos: [],
    totalCount: 0
  })

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches")
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  // Save recent search
  const saveRecentSearch = useCallback((query: string, type: RecentSearch["type"] = "query") => {
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query,
      timestamp: new Date().toISOString(),
      type
    }
    
    const updated = [newSearch, ...recentSearches.filter(s => s.query !== query)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }, [recentSearches])

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
    showToast({
      title: "Histórico limpo",
      description: "Suas buscas recentes foram removidas.",
      type: "success"
    })
  }

  // Perform search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({
        users: [],
        posts: [],
        photos: [],
        videos: [],
        totalCount: 0
      })
      return
    }

    setIsLoading(true)
    try {
      // Save to recent searches
      saveRecentSearch(query)

      // Build query based on filters
      let usersQuery = supabase
        .from("users")
        .select("*")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(10)

      let postsQuery = supabase
        .from("posts")
        .select(`
          *,
          user:users(*)
        `)
        .textSearch("content", query)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(20)

      // Apply filters
      if (filters.verifiedOnly) {
        usersQuery = usersQuery.eq("is_verified", true)
      }

      if (filters.location) {
        usersQuery = usersQuery.ilike("location", `%${filters.location}%`)
      }

      if (filters.dateRange) {
        const now = new Date()
        let startDate = new Date()
        
        switch (filters.dateRange) {
          case "today":
            startDate.setHours(0, 0, 0, 0)
            break
          case "week":
            startDate.setDate(now.getDate() - 7)
            break
          case "month":
            startDate.setMonth(now.getMonth() - 1)
            break
          case "year":
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }
        
        postsQuery = postsQuery.gte("created_at", startDate.toISOString())
      }

      // Execute queries
      const [usersResult, postsResult] = await Promise.all([
        usersQuery,
        postsQuery
      ])

      if (usersResult.error) throw usersResult.error
      if (postsResult.error) throw postsResult.error

      // Filter posts by media type
      const allPosts = postsResult.data || []
      const photoPosts = allPosts.filter(post => 
        post.media_urls && post.media_urls.some((url: string) => 
          url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        )
      )
      const videoPosts = allPosts.filter(post => 
        post.media_urls && post.media_urls.some((url: string) => 
          url.match(/\.(mp4|webm|mov)$/i)
        )
      )

      setSearchResults({
        users: usersResult.data || [],
        posts: allPosts,
        photos: photoPosts,
        videos: videoPosts,
        totalCount: (usersResult.data?.length || 0) + (postsResult.data?.length || 0)
      })
    } catch (error) {
      console.error("Search error:", error)
      showToast({
        title: "Erro na busca",
        description: "Não foi possível realizar a busca. Tente novamente.",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters, saveRecentSearch, showToast])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, performSearch])

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`)
  }

  const handleTrendingClick = (query: string) => {
    setSearchQuery(query)
    saveRecentSearch(query)
  }

  const handleRecentSearchClick = (search: RecentSearch) => {
    setSearchQuery(search.query)
  }

  const removeRecentSearch = (id: string) => {
    const updated = recentSearches.filter(s => s.id !== id)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
        <Search className="w-10 h-10 text-gray-400 dark:text-white/40" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {searchQuery ? "Nenhum resultado encontrado" : "Comece sua busca"}
      </h3>
      <p className="text-sm text-gray-500 dark:text-white/60 max-w-sm mx-auto">
        {searchQuery 
          ? "Tente ajustar sua busca ou remover alguns filtros"
          : "Digite algo para buscar pessoas, posts, fotos ou vídeos"
        }
      </p>
    </div>
  )

  const renderUserResults = (users: User[]) => (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => handleUserClick(user.username)}
          className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 border border-gray-100 dark:border-white/5 cursor-pointer"
        >
          <Avatar className="w-12 h-12 ring-2 ring-gray-200 dark:ring-white/10 flex-shrink-0">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {user.full_name?.charAt(0) || user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 dark:text-white truncate">
                {user.full_name || user.username}
              </span>
              {user.is_verified && <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              <PlanBadge plan={user.premium_type} />
            </div>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-1">@{user.username}</p>
            {user.bio && (
              <p className="text-sm text-gray-700 dark:text-white/80 line-clamp-2">{user.bio}</p>
            )}
            {user.location && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-white/50">
                <MapPin className="w-3 h-3" />
                {user.location}
              </div>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-white/40 flex-shrink-0" />
        </div>
      ))}
    </div>
  )

  const renderPostResults = (posts: Post[]) => (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )

  const renderMediaGrid = (posts: Post[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 cursor-pointer group"
          onClick={() => router.push(`/post/${post.id}`)}
        >
          {post.media_urls && post.media_urls[0] && (
            <>
              {post.media_urls[0].match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={post.media_urls[0]}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <Image
                  src={post.media_urls[0]}
                  alt="Post media"
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={post.user?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {post.user?.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {post.user?.full_name || post.user?.username}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-2">{post.content}</p>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pessoas, posts, fotos..."
                className="pl-11 pr-4 h-11 rounded-full bg-gray-100 dark:bg-slate-800/50 border-0 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-full transition-colors ${
                showFilters ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600" : ""
              }`}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={filters.dateRange === "today" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters({...filters, dateRange: filters.dateRange === "today" ? undefined : "today"})}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Hoje
                </Badge>
                <Badge
                  variant={filters.dateRange === "week" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters({...filters, dateRange: filters.dateRange === "week" ? undefined : "week"})}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Esta semana
                </Badge>
                <Badge
                  variant={filters.dateRange === "month" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters({...filters, dateRange: filters.dateRange === "month" ? undefined : "month"})}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Este mês
                </Badge>
                <Badge
                  variant={filters.verifiedOnly ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters({...filters, verifiedOnly: !filters.verifiedOnly})}
                >
                  <Verified className="w-3 h-3 mr-1" />
                  Verificados
                </Badge>
              </div>
              
              <Input
                placeholder="Localização"
                value={filters.location || ""}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="h-9"
              />
            </div>
          )}
        </div>
      </div>

      {/* Search Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {!searchQuery && !isLoading ? (
          // Show trending and recent searches
          <div className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Buscas recentes
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-gray-500 hover:text-gray-700 dark:text-white/60 dark:hover:text-white"
                  >
                    Limpar
                  </Button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-white/40" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {search.query}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-white/50">
                            {format(new Date(search.timestamp), "dd MMM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeRecentSearch(search.id)
                        }}
                        className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                Em alta agora
              </h3>
              <div className="space-y-2">
                {trendingSearches.map((trend) => (
                  <div
                    key={trend.query}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleTrendingClick(trend.query)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {trend.query}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-white/50">
                      {trend.count} buscas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Show search results
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-6 bg-transparent border-b border-gray-200 dark:border-white/10 rounded-none h-auto p-0">
              <TabsTrigger 
                value="all" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-400 px-4 pb-3"
              >
                Todos
                {searchResults.totalCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {searchResults.totalCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="people" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-400 px-4 pb-3"
              >
                <Users className="w-4 h-4 mr-2" />
                Pessoas
                {searchResults.users.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {searchResults.users.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="posts" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-400 px-4 pb-3"
              >
                <FileText className="w-4 h-4 mr-2" />
                Posts
                {searchResults.posts.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {searchResults.posts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-400 px-4 pb-3"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Fotos
                {searchResults.photos.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {searchResults.photos.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="videos" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-400 px-4 pb-3"
              >
                <Video className="w-4 h-4 mr-2" />
                Vídeos
                {searchResults.videos.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {searchResults.videos.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="all" className="mt-6">
                  {searchResults.totalCount === 0 ? (
                    renderEmptyState()
                  ) : (
                    <div className="space-y-6">
                      {searchResults.users.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Pessoas
                          </h4>
                          {renderUserResults(searchResults.users.slice(0, 3))}
                          {searchResults.users.length > 3 && (
                            <Button
                              variant="ghost"
                              onClick={() => setActiveTab("people")}
                              className="w-full mt-3 text-purple-600 dark:text-purple-400"
                            >
                              Ver todos ({searchResults.users.length})
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {searchResults.posts.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Posts
                          </h4>
                          {renderPostResults(searchResults.posts.slice(0, 3))}
                          {searchResults.posts.length > 3 && (
                            <Button
                              variant="ghost"
                              onClick={() => setActiveTab("posts")}
                              className="w-full mt-3 text-purple-600 dark:text-purple-400"
                            >
                              Ver todos ({searchResults.posts.length})
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="people" className="mt-6">
                  {searchResults.users.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    renderUserResults(searchResults.users)
                  )}
                </TabsContent>

                <TabsContent value="posts" className="mt-6">
                  {searchResults.posts.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    renderPostResults(searchResults.posts)
                  )}
                </TabsContent>

                <TabsContent value="photos" className="mt-6">
                  {searchResults.photos.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    renderMediaGrid(searchResults.photos)
                  )}
                </TabsContent>

                <TabsContent value="videos" className="mt-6">
                  {searchResults.videos.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    renderMediaGrid(searchResults.videos)
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        )}
      </div>
    </div>
  )
}