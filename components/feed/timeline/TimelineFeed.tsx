"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
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
import { useFeedState } from "@/hooks/useFeedState"
import { cn } from "@/lib/utils"
import { feedAlgorithmService } from "@/lib/services/feed-algorithm-service"
import { ExploreView } from "../explore/ExploreView"
import { WhoToFollowCard } from "../WhoToFollowCard"
import { TrendingTopicsCard } from "../TrendingTopicsCard"
import { UpcomingEventsCard } from "../UpcomingEventsCard"
import { UserProfile } from "../profile/UserProfile"
import { SettingsPage } from "../settings/SettingsPage"
import { MessagesTwitter } from "../messages/MessagesTwitter"
import { NotificationsView } from "../notifications/NotificationsView"
import { EventsView } from "../events/EventsView"
import { CommunitiesView } from "../communities/CommunitiesView"
import { AdultCommunitiesView } from "../communities/AdultCommunitiesView"
import { OpenDates } from "../../dating/OpenDates"
import { VerificationForm } from "../../verification/VerificationForm"
import { ViewManager } from "../ViewManager"
import { StoriesCarousel } from "../../stories"

// Memoized CreatePost wrapper to prevent re-renders
const MemoizedCreatePost = memo(({ onSuccess }: { onSuccess: (newPost: any) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6"
    data-create-post
  >
    <CreatePost onSuccess={onSuccess} />
  </motion.div>
))

MemoizedCreatePost.displayName = 'MemoizedCreatePost'

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
  const { user, isAuthenticated } = useAuth()
  const features = usePremiumFeatures()
  const router = useRouter()
  
  // Use new feed state management hook - use userId prop or user.id
  const effectiveUserId = userId || user?.id
  const feedState = useFeedState(effectiveUserId, { cacheTimeMs: 5 * 60 * 1000 }) // 5 minutes cache
  
  // Extract functions to avoid including the entire feedState object as dependency
  const { loadState, updateState, isCacheValid, clearState } = feedState
  
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newPostsCount, setNewPostsCount] = useState(0)
  const [isChangingTab, setIsChangingTab] = useState(false)
  
  // Get current state from feed state manager
  const { posts, page, hasMore, initialized, isFollowingAnyone } = feedState.currentState

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  })


  // Load or restore state when tab or content changes
  useEffect(() => {
    if (currentMainContent !== "timeline") {
      setIsLoading(false)
      return
    }

    // Don't load data for explore tab - ExploreView handles its own data
    if (activeTab === "explore") {
      setIsLoading(false)
      return
    }

    // For unauthenticated users, show empty state immediately
    if (!isAuthenticated) {
      console.log('[TimelineFeed] User not authenticated, showing empty state')
      setIsLoading(false)
      updateState(activeTab, { 
        initialized: true, 
        posts: [], 
        hasMore: false 
      })
      return
    }

    // Get effective user ID
    const userIdToUse = effectiveUserId || user?.id
    if (!userIdToUse) {
      console.error('[TimelineFeed] No user ID available')
      setIsLoading(false)
      updateState(activeTab, { 
        initialized: true, 
        posts: [], 
        hasMore: false 
      })
      return
    }

    // Load state for the current tab
    const currentState = loadState(activeTab)
    
    // Check if we have valid cached data
    const hasValidCache = currentState.posts && 
                         currentState.posts.length > 0 && 
                         isCacheValid(activeTab)
    
    if (hasValidCache) {
      console.log('[TimelineFeed] Using valid cached posts:', currentState.posts.length)
      setIsLoading(false)
      return
    }

    // If we have posts but cache is expired, keep posts visible while refreshing
    if (currentState.posts && currentState.posts.length > 0) {
      console.log('[TimelineFeed] Cache expired, refreshing in background')
      setIsLoading(false) // Don't show loading spinner
    } else {
      console.log('[TimelineFeed] No cached posts, showing loading')
      setIsLoading(true)
    }

    // Load fresh data
    let cancelled = false
    const loadStartTime = Date.now()
    
    const loadPosts = async () => {
      if (cancelled) return
      
      console.log('[TimelineFeed] Loading posts for tab:', activeTab, 'user:', userIdToUse)
      
      try {
        let result
        
        switch (activeTab) {
          case "for-you":
            result = await feedAlgorithmService.generatePersonalizedFeed(userIdToUse, 1, 10)
            break
          case "following":
            result = await feedAlgorithmService.getFollowingFeed(userIdToUse, 1, 10)
            break
          default:
            result = await feedAlgorithmService.generatePersonalizedFeed(userIdToUse, 1, 10)
        }

        const loadTime = Date.now() - loadStartTime
        console.log(`[TimelineFeed] Feed loaded in ${loadTime}ms - posts:`, result?.data?.length || 0)

        if (!cancelled && result) {
          const newPosts = Array.isArray(result.data) ? result.data : []
          const newHasMore = result.hasMore === true && newPosts.length > 0
          
          updateState(activeTab, {
            posts: newPosts,
            page: 1,
            hasMore: newHasMore,
            initialized: true,
            isFollowingAnyone: result.isFollowingAnyone
          })
        }
      } catch (error) {
        console.error('[TimelineFeed] Error loading posts:', error)
        if (!cancelled) {
          // Only clear posts if we don't have any cached posts
          const fallbackPosts = currentState.posts || []
          updateState(activeTab, {
            posts: fallbackPosts,
            hasMore: false,
            initialized: true
          })
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    // Add small delay to prevent rapid API calls during navigation
    const timeoutId = setTimeout(loadPosts, 50)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [isAuthenticated, effectiveUserId, activeTab, currentMainContent, user?.id, loadState, updateState, isCacheValid])

  // Load more when in view
  useEffect(() => {
    if (!inView || !hasMore || isLoading || !user || !initialized || currentMainContent !== "timeline") {
      return
    }

    let cancelled = false

    const loadMore = async () => {
      if (cancelled) return
      
      try {
        let result
        const nextPage = page + 1
        
        switch (activeTab) {
          case "for-you":
            result = await feedAlgorithmService.generatePersonalizedFeed(user.id, nextPage, 10)
            break
          case "following":
            result = await feedAlgorithmService.getFollowingFeed(user.id, nextPage, 10)
            break
          case "explore":
            result = await feedAlgorithmService.getExploreFeed(user.id, nextPage, 10)
            break
          default:
            result = await feedAlgorithmService.generatePersonalizedFeed(user.id, nextPage, 10)
        }

        if (!cancelled && result) {
          const newPosts = Array.isArray(result.data) ? result.data : []
          if (newPosts.length > 0) {
            const updatedPosts = [...posts, ...newPosts]
            const newHasMore = result.hasMore === true
            
            feedState.updateState(activeTab, {
              posts: updatedPosts,
              page: nextPage,
              hasMore: newHasMore,
              initialized: true,
              isFollowingAnyone: result.isFollowingAnyone
            })
          } else {
            feedState.updateState(activeTab, {
              hasMore: false
            })
          }
        }
      } catch (error) {
        console.error('Error loading more posts:', error)
      }
    }

    loadMore()

    return () => {
      cancelled = true
    }
  }, [inView, page, hasMore, isLoading, user?.id, activeTab, initialized, currentMainContent, posts, feedState])

  // Handle new post creation - add to feed immediately (optimistic update)
  const handleNewPost = useCallback((newPost: any) => {
    if (!newPost || !user) {
      console.log('[TimelineFeed] Invalid new post data or no user:', { newPost, user: !!user })
      return
    }
    
    console.log('[TimelineFeed] Adding new post to feed immediately:', {
      postId: newPost.id,
      userId: newPost.user_id,
      content: newPost.content?.substring(0, 50) + '...'
    })
    
    // Ensure the post has proper structure
    const normalizedPost = {
      ...newPost,
      // Ensure user data is properly attached
      user: newPost.user || user,
      users: newPost.users || user,
      // Ensure interaction counts are initialized
      likes_count: newPost.likes_count || 0,
      comments_count: newPost.comments_count || 0,
      shares_count: newPost.shares_count || 0,
      saves_count: newPost.saves_count || 0,
      is_liked: false,
      is_saved: false,
      created_at: newPost.created_at || new Date().toISOString()
    }
    
    // Add to all relevant tabs
    const tabsToUpdate = ['for-you']
    
    // If user follows people, also add to following tab
    const followingState = feedState.loadState('following')
    if (followingState.isFollowingAnyone) {
      tabsToUpdate.push('following')
    }
    
    tabsToUpdate.forEach(tab => {
      const currentState = feedState.loadState(tab)
      const updatedPosts = [normalizedPost, ...currentState.posts]
      
      feedState.updateState(tab, {
        posts: updatedPosts,
        initialized: true,
        lastFetched: Date.now()
      })
      
      console.log(`[TimelineFeed] Added new post to ${tab} tab, total posts:`, updatedPosts.length)
    })
  }, [user, feedState])

  // Define handleRefresh with state clearing
  const handleRefresh = useCallback(async () => {
    if (!isAuthenticated) return
    
    console.log('[TimelineFeed] Refreshing posts for tab:', activeTab)
    setIsRefreshing(true)
    setNewPostsCount(0)
    
    // Clear the cache for this tab to force fresh data
    feedState.clearState(activeTab)
    
    try {
      const userIdToUse = effectiveUserId || 'anonymous'
      let result
      
      switch (activeTab) {
        case "for-you":
          result = await feedAlgorithmService.generatePersonalizedFeed(userIdToUse, 1, 10)
          break
        case "following":
          result = await feedAlgorithmService.getFollowingFeed(userIdToUse, 1, 10)
          break
        case "explore":
          result = await feedAlgorithmService.getExploreFeed(userIdToUse, 1, 10)
          break
        default:
          result = await feedAlgorithmService.generatePersonalizedFeed(userIdToUse, 1, 10)
      }

      console.log('[TimelineFeed] Refresh result:', { 
        postsCount: result?.data?.length || 0,
        hasMore: result?.hasMore 
      })

      const newPosts = Array.isArray(result.data) ? result.data : []
      const newHasMore = result.hasMore === true && newPosts.length > 0
      
      feedState.updateState(activeTab, {
        posts: newPosts,
        page: 1,
        hasMore: newHasMore,
        initialized: true,
        isFollowingAnyone: result.isFollowingAnyone
      })
    } catch (error) {
      console.error('[TimelineFeed] Error refreshing posts:', error)
      // Still mark as initialized even on error
      feedState.updateState(activeTab, {
        posts: [],
        hasMore: false,
        initialized: true
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [isAuthenticated, effectiveUserId, activeTab, feedState])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setNewPostsCount((prev: number) => prev + 1)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

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

  // Clear all feed state on user change (logout/login)
  useEffect(() => {
    const handleAuthSignOut = () => {
      console.log('[TimelineFeed] Auth signed out event received, clearing feed state')
      feedState.clearAllStates()
      setIsLoading(false)
    }

    // Listen for auth sign-out events
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:signed-out', handleAuthSignOut)
    }

    // Clear state if user is null (but was previously set)
    if (!user) {
      feedState.clearAllStates()
      setIsLoading(false)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:signed-out', handleAuthSignOut)
      }
    }
  }, [user?.id, feedState])

  // Handle plans redirect - MUST be before any conditional returns
  useEffect(() => {
    if (currentMainContent === "plans") {
      router.push("/plans")
    }
  }, [currentMainContent, router])

  // Show loading skeleton only on initial load when we have no posts AND we're loading
  // Don't show skeleton for explore tab as it has its own loading state
  if (currentMainContent === "timeline" && activeTab !== "explore" && !initialized && posts.length === 0 && isLoading && isAuthenticated) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Create Post - Show even during loading */}
        {user && <MemoizedCreatePost onSuccess={handleNewPost} />}
        
        {/* Feed Tabs */}
        <div className="w-full mb-6">
          <div className={cn(
            "bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 p-0.5 sm:p-1 shadow-sm",
            "opacity-50 pointer-events-none"
          )}>
            <div className="grid w-full grid-cols-3 bg-transparent gap-0.5">
              <Button
                disabled
                className={cn(
                  "rounded-xl sm:rounded-2xl text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5",
                  activeTab === "for-you"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "bg-transparent text-gray-600 dark:text-gray-400"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Para você</span>
                <span className="sm:hidden">Todos</span>
              </Button>
              <Button
                disabled
                className={cn(
                  "rounded-xl sm:rounded-2xl text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5",
                  activeTab === "following"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "bg-transparent text-gray-600 dark:text-gray-400"
                )}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Seguindo
              </Button>
              <Button
                disabled
                className={cn(
                  "rounded-xl sm:rounded-2xl text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5",
                  activeTab === "explore"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "bg-transparent text-gray-600 dark:text-gray-400"
                )}
              >
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Explorar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Loading skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6 animate-pulse">
            <div className="flex items-start space-x-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-white/10" />
                <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-24 w-full bg-gray-200 dark:bg-white/10 mb-4" />
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

  // Define all available views
  const allViews = useMemo(() => ({
    timeline: (
      <div className={cn("space-y-6", className)}>
        {/* Create Post - Outside of tab content to prevent re-renders */}
        {user ? (
          <MemoizedCreatePost onSuccess={handleNewPost} />
        ) : (
          <div className="mb-6 p-4 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10">
            <p className="text-center text-gray-500 dark:text-gray-400">Faça login para criar posts</p>
          </div>
        )}

        {/* Stories Carousel - Show only for authenticated users and timeline */}
        {user && isAuthenticated && (
          <StoriesCarousel className="mb-6" />
        )}

        {/* Feed Tabs */}
        <div className="w-full mb-6">
          <div className={cn(
            "bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 p-0.5 sm:p-1 shadow-sm",
            isLoading && "opacity-90 transition-opacity"
          )}>
            <div className="grid w-full grid-cols-3 bg-transparent gap-0.5">
              <Button
                onClick={() => {
                  if (activeTab !== "for-you") {
                    setIsChangingTab(true)
                    setIsLoading(false) // Clear any stuck loading state
                    onTabChange?.("for-you")
                    setTimeout(() => setIsChangingTab(false), 300)
                  }
                }}
                disabled={isChangingTab || isLoading}
                className={cn(
                  "rounded-xl sm:rounded-2xl text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5 transition-all",
                  activeTab === "for-you"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Para você</span>
                <span className="sm:hidden">Todos</span>
              </Button>
              <Button
                onClick={() => {
                  if (activeTab !== "following") {
                    setIsChangingTab(true)
                    setIsLoading(false) // Clear any stuck loading state
                    onTabChange?.("following")
                    setTimeout(() => setIsChangingTab(false), 300)
                  }
                }}
                disabled={isChangingTab || isLoading}
                className={cn(
                  "rounded-xl sm:rounded-2xl text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5 transition-all",
                  activeTab === "following"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                )}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Seguindo
              </Button>
              <Button
                onClick={() => {
                  if (activeTab !== "explore") {
                    setIsChangingTab(true)
                    setIsLoading(false) // Clear any stuck loading state
                    onTabChange?.("explore")
                    setTimeout(() => setIsChangingTab(false), 300)
                  }
                }}
                disabled={isChangingTab || isLoading}
                className={cn(
                  "rounded-xl sm:rounded-2xl text-xs sm:text-sm px-2 sm:px-4 py-2 sm:px-2.5 transition-all",
                  activeTab === "explore"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                )}
              >
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
            {/* Background Loading Indicator */}
            <AnimatePresence>
              {isLoading && posts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
                >
                  <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Atualizando...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Posts with smooth transition */}
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
                  <span className="text-4xl">
                    {activeTab === "following" && isFollowingAnyone === false ? "👥" : "🔥"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {activeTab === "following" && isFollowingAnyone === false
                    ? "Comece seguindo pessoas interessantes!"
                    : "Ops! Parece que faltou sacanagem por aqui rs"}
                </h3>
                <p className="text-gray-500 dark:text-white/60 mb-6 max-w-md">
                  {activeTab === "for-you" && "Seja o primeiro a postar algo picante!"}
                  {activeTab === "following" && (
                    isFollowingAnyone === false 
                      ? "Você ainda não segue ninguém! Explore perfis e comece a seguir pessoas interessantes."
                      : "As pessoas que você segue ainda não postaram nada hoje. Que tal dar o exemplo?"
                  )}
                  {activeTab === "explore" && "Explore novos perfis ou seja o primeiro a criar conteúdo quente!"}
                </p>
                {activeTab === "following" && isFollowingAnyone === false ? (
                  <Button
                    onClick={() => onViewChange?.("explore")}
                    className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    Explorar Perfis
                  </Button>
                ) : (
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
                )}
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
    ),
    messages: <MessagesTwitter />,
    notifications: <NotificationsView />,
    events: <EventsView />,
    communities: <AdultCommunitiesView />,
    "open-dates": <OpenDates />,
    "saved-items": (
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
    ),
    "user-profile": <UserProfile userId={userId} />,
    "who-to-follow": (
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
    ),
    "trending-topics": (
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
    ),
    "upcoming-events": (
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
    ),
    settings: <SettingsPage />,
    verification: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Verificação de Conta
          </h2>
        </div>
        <VerificationForm />
      </motion.div>
    )
  }), [
    className,
    user,
    handleNewPost,
    activeTab,
    isLoading,
    onTabChange,
    isChangingTab,
    posts.length,
    newPostsCount,
    handleRefresh,
    isRefreshing,
    postsWithAds,
    hasMore,
    isFollowingAnyone,
    onViewChange,
    loadMoreRef,
    userId,
    isAuthenticated
  ])

  // Render views using ViewManager
  return <ViewManager views={allViews} activeView={currentMainContent} />
}
