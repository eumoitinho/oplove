"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, TrendingUp, Sparkles, Users, Compass } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { PostWithComments } from "../post/PostWithComments"
import { AdCard } from "../ads/AdCard"
import { FeedAd } from "../ads/FeedAd"
import { CreatePost } from "../create/CreatePost"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { cn } from "@/lib/utils"
import { feedAlgorithmService } from "@/lib/services/feed-algorithm-service"
import { ExploreView } from "../explore/ExploreView"
import { WhoToFollowCard } from "../WhoToFollowCard"
import { TrendingTopicsCard } from "../TrendingTopicsCard"
import { UpcomingEventsCard } from "../UpcomingEventsCard"
import { UserProfile } from "../profile/UserProfile"
import { SettingsPage } from "../settings/SettingsPage"
import { MessagesView } from "../messages/MessagesView"
import { NotificationsView } from "../notifications/NotificationsView"
import { EventsView } from "../events/EventsView"
import { CommunitiesView } from "../communities/CommunitiesView"
import { OpenDates } from "../../dating/OpenDates"

interface TimelineFeedProps {
  currentMainContent?: string
  onViewChange?: (view: string) => void
  activeTab?: "for-you" | "following" | "explore"
  onTabChange?: (tab: "for-you" | "following" | "explore") => void
  userId?: string
  filters?: {
    type?: "all" | "following" | "trending"
    media?: "all" | "images" | "videos"
    timeframe?: "today" | "week" | "month" | "all"
  }
  showAds?: boolean
  className?: string
}


export function TimelineFeed({ 
  currentMainContent = "timeline",
  onViewChange,
  activeTab = "for-you",
  onTabChange,
  userId, 
  filters = {}, 
  showAds = true, 
  className 
}: TimelineFeedProps) {
  const { user } = useAuth()
  const features = usePremiumFeatures()
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newPostsCount, setNewPostsCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  })

  // Fetch posts based on active tab
  const fetchPosts = async (pageNum: number) => {
    if (!user) return

    try {
      let result
      
      switch (activeTab) {
        case "for-you":
          result = await feedAlgorithmService.generatePersonalizedFeed(user.id, pageNum, 10)
          break
        case "following":
          result = await feedAlgorithmService.getFollowingFeed(user.id, pageNum, 10)
          break
        case "explore":
          result = await feedAlgorithmService.getExploreFeed(user.id, pageNum, 10)
          break
        default:
          result = await feedAlgorithmService.generatePersonalizedFeed(user.id, pageNum, 10)
      }

      if (pageNum === 1) {
        setPosts(result.data)
      } else {
        setPosts((prev: any[]) => [...prev, ...result.data])
      }

      setHasMore(result.hasMore)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching posts:', error)
      // Fallback para posts vazios em caso de erro
      setPosts([])
      setHasMore(false)
    } finally {
      // Garantir que o loading sempre seja resetado
      if (pageNum === 1) {
        setIsLoading(false)
      }
    }
  }

  // Load initial posts
  useEffect(() => {
    const loadPosts = async () => {
      if (!user) {
        setIsLoading(false)
        setInitialized(true)
        return
      }
      
      // Only load posts if we're showing timeline
      if (currentMainContent === "timeline") {
        setIsLoading(true)
        setPosts([])
        setPage(1)
        setHasMore(true)
        
        await fetchPosts(1)
      } else {
        setIsLoading(false)
      }
      setInitialized(true)
    }
    
    loadPosts()
  }, [user, activeTab, currentMainContent])

  // Load more when in view
  useEffect(() => {
    if (inView && hasMore && !isLoading && user && initialized) {
      fetchPosts(page + 1)
    }
  }, [inView, hasMore, page, isLoading, user, initialized])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setNewPostsCount((prev: number) => prev + 1)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setNewPostsCount(0)
    setPage(1)
    setHasMore(true)
    await fetchPosts(1)
    setIsRefreshing(false)
  }

  // Insert ads based on user's plan and frequency
  const postsWithAds = useMemo(() => {
    if (!showAds || !features.adsFrequency || features.adsFrequency === 0) return posts
    
    const adsFrequency = features.adsFrequency // Every N posts
    return posts.reduce((acc: any[], post: any, index: number) => {
      acc.push(post)
      if ((index + 1) % adsFrequency === 0) {
        acc.push({
          id: `ad-${index}`,
          type: "feedAd",
          index: index
        })
      }
      return acc
    }, [] as any[])
  }, [posts, showAds, features.adsFrequency])

  // Don't render anything until initialized
  if (!initialized) {
    return (
      <div className={cn("space-y-6", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-white/10" />
                <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-24 w-full bg-gray-200 dark:bg-white/10" />
            <div className="flex space-x-6">
              <Skeleton className="h-8 w-20 bg-gray-200 dark:bg-white/10" />
              <Skeleton className="h-8 w-20 bg-gray-200 dark:bg-white/10" />
              <Skeleton className="h-8 w-20 bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isLoading && initialized) {
    return (
      <div className={cn("space-y-6", className)}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-white/10" />
                <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-24 w-full bg-gray-200 dark:bg-white/10" />
            <div className="flex space-x-6">
              <Skeleton className="h-8 w-20 bg-gray-200 dark:bg-white/10" />
              <Skeleton className="h-8 w-20 bg-gray-200 dark:bg-white/10" />
              <Skeleton className="h-8 w-20 bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render different views based on currentMainContent
  if (currentMainContent !== "timeline") {
    switch (currentMainContent) {
      case "messages":
        return <MessagesView />
      case "notifications":
        return <NotificationsView />
      case "events":
        return <EventsView />
      case "communities":
        return <CommunitiesView />
      case "open-dates":
        return <OpenDates />
      case "saved-items":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Itens Salvos
              </h2>
            </div>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Seus posts salvos aparecerão aqui</p>
            </div>
          </motion.div>
        )
      case "user-profile":
        return <UserProfile />
      case "who-to-follow":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Quem Seguir
              </h2>
            </div>
            <WhoToFollowCard />
          </motion.div>
        )
      case "trending-topics":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Tópicos em Alta
              </h2>
            </div>
            <TrendingTopicsCard />
          </motion.div>
        )
      case "upcoming-events":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Próximos Eventos
              </h2>
            </div>
            <UpcomingEventsCard />
          </motion.div>
        )
      case "settings":
        return <SettingsPage />
      case "plans":
        // Redirect to plans page
        router.push("/plans")
        return null
      default:
        return null
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Create Post */}
      {user ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <CreatePost onSuccess={() => handleRefresh()} />
        </motion.div>
      ) : (
        <div className="mb-6 p-4 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10">
          <p className="text-center text-gray-500 dark:text-gray-400">Faça login para criar posts</p>
        </div>
      )}

      {/* Feed Tabs */}
      <div className="w-full mb-6">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-1 shadow-sm">
          <div className="grid w-full grid-cols-3 bg-transparent">
            <Button
              onClick={() => onTabChange?.("for-you")}
              className={`rounded-2xl ${
                activeTab === "for-you"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-transparent text-gray-600 dark:text-gray-400"
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Para você
            </Button>
            <Button
              onClick={() => onTabChange?.("following")}
              className={`rounded-2xl ${
                activeTab === "following"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-transparent text-gray-600 dark:text-gray-400"
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Seguindo
            </Button>
            <Button
              onClick={() => onTabChange?.("explore")}
              className={`rounded-2xl ${
                activeTab === "explore"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-transparent text-gray-600 dark:text-gray-400"
              }`}
            >
              <Compass className="w-4 h-4 mr-2" />
              Explorar
            </Button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "explore" ? (
        <ExploreView />
      ) : (
        <div className="space-y-6">
          {/* New Posts Toast - Twitter Style */}
          <AnimatePresence>
            {newPostsCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
              >
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black shadow-xl rounded-full px-6 py-3 flex items-center space-x-3"
                >
                  <div className="flex -space-x-2">
                    {/* Mock avatars */}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white dark:border-black"></div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 border-2 border-white dark:border-black"></div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-yellow-400 border-2 border-white dark:border-black"></div>
                  </div>
                  <span className="font-medium">
                    {newPostsCount} {newPostsCount === 1 ? "novo post" : "novos posts"}
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts */}
          {postsWithAds.length > 0 ? (
            <AnimatePresence>
              {postsWithAds.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.type === "feedAd" ? (
                    <FeedAd className="animate-slide-in-from-top" />
                  ) : item.type === "ad" ? (
                    <AdCard ad={item.content} />
                  ) : (
                    <PostWithComments post={item} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🔥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Ops! Parece que faltou sacanagem por aqui rs
              </h3>
              <p className="text-gray-500 dark:text-white/60 mb-6 max-w-md">
                {activeTab === "for-you" && "Seja o primeiro a postar algo picante!"}
                {activeTab === "following" && "As pessoas que você segue ainda não postaram nada hoje. Que tal dar o exemplo?"}
                {activeTab === "explore" && "Explore novos perfis ou seja o primeiro a criar conteúdo quente!"}
              </p>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </>
                )}
              </Button>
            </motion.div>
          )}
          
          {/* Load More Trigger */}
          {activeTab !== "explore" && postsWithAds.length > 0 && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {!hasMore && posts.length > 0 && (
                <p className="text-gray-500 text-center">Você chegou ao fim da timeline! 🎉</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
