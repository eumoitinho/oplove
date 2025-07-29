"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, TrendingUp } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from "react-intersection-observer"
import { PostCard } from "../post/PostCard"
import { AdCard } from "../ads/AdCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface TimelineFeedProps {
  userId?: string
  filters?: {
    type?: "all" | "following" | "trending"
    media?: "all" | "images" | "videos"
    timeframe?: "today" | "week" | "month" | "all"
  }
  showAds?: boolean
  className?: string
}

// Mock post data
const generateMockPost = (id: number) => ({
  id: id.toString(),
  content: `Este é um post de exemplo #${id}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
  created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  media:
    Math.random() > 0.7
      ? [
          {
            id: `media-${id}`,
            type: Math.random() > 0.5 ? "image" : ("video" as "image" | "video"),
            url: `/placeholder.svg?height=400&width=600&text=Post+${id}`,
            thumbnail: `/placeholder.svg?height=200&width=300&text=Thumb+${id}`,
          },
        ]
      : undefined,
  poll:
    Math.random() > 0.8
      ? {
          id: `poll-${id}`,
          question: `Qual sua opinião sobre o post ${id}?`,
          options: [
            { id: "opt1", text: "Muito bom", votes: Math.floor(Math.random() * 100) },
            { id: "opt2", text: "Regular", votes: Math.floor(Math.random() * 50) },
            { id: "opt3", text: "Não gostei", votes: Math.floor(Math.random() * 20) },
          ],
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          user_vote: Math.random() > 0.5 ? "opt1" : undefined,
        }
      : undefined,
  location:
    Math.random() > 0.8
      ? {
          name: "São Paulo, SP",
          coordinates: [-23.5505, -46.6333] as [number, number],
        }
      : undefined,
  user: {
    id: `user-${Math.floor(Math.random() * 10)}`,
    username: `user${Math.floor(Math.random() * 1000)}`,
    display_name: `Usuário ${Math.floor(Math.random() * 1000)}`,
    avatar_url: `/placeholder.svg?height=40&width=40&text=U${id}`,
    is_verified: Math.random() > 0.8,
    premium_type: ["free", "gold", "diamond", "couple"][Math.floor(Math.random() * 4)] as any,
  },
  _count: {
    likes: Math.floor(Math.random() * 500),
    comments: Math.floor(Math.random() * 100),
    shares: Math.floor(Math.random() * 50),
  },
  user_liked: Math.random() > 0.5,
  visibility: "public" as const,
})

export function TimelineFeed({ userId, filters = {}, showAds = true, className }: TimelineFeedProps) {
  const { user } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newPostsCount, setNewPostsCount] = useState(0)

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  })

  // Simulate API call
  const fetchPosts = async ({ pageParam = 0 }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

    const posts = Array.from({ length: 10 }, (_, i) => generateMockPost(pageParam * 10 + i + 1))

    return {
      posts,
      nextCursor: pageParam + 1,
      hasMore: pageParam < 5, // Limit to 6 pages for demo
    }
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ["timeline", userId, filters],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: 0,
  })

  // Load more when in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setNewPostsCount((prev) => prev + 1)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setNewPostsCount(0)
    await refetch()
    setIsRefreshing(false)
  }

  const handleLike = useCallback(async (postId: string) => {
    // Optimistic update would happen here
    console.log("Liking post:", postId)
  }, [])

  const handleComment = useCallback(async (postId: string) => {
    console.log("Opening comments for post:", postId)
  }, [])

  const handleShare = useCallback(async (postId: string) => {
    console.log("Sharing post:", postId)
  }, [])

  const allPosts = data?.pages.flatMap((page) => page.posts) || []

  // Insert ads every 5 posts for free users
  const postsWithAds =
    showAds && user?.premium_type === "free"
      ? allPosts.reduce((acc, post, index) => {
          acc.push(post)
          if ((index + 1) % 5 === 0) {
            acc.push({
              id: `ad-${index}`,
              type: "ad",
              content: {
                title: "Upgrade para Gold",
                description: "Desbloqueie recursos premium e remova anúncios",
                image: "/placeholder.svg?height=200&width=400&text=Premium+Ad",
                cta: "Fazer Upgrade",
                sponsor: "OpenLove Premium",
              },
            })
          }
          return acc
        }, [] as any[])
      : allPosts

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* New Posts Notification */}
      <AnimatePresence>
        {newPostsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-4 z-10"
          >
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {newPostsCount} {newPostsCount === 1 ? "novo post" : "novos posts"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      {/* Posts */}
      <AnimatePresence>
        {postsWithAds.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            {item.type === "ad" ? (
              <AdCard ad={item.content} />
            ) : (
              <PostCard post={item} onLike={handleLike} onComment={handleComment} onShare={handleShare} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="space-y-4 w-full">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        )}

        {!hasNextPage && allPosts.length > 0 && (
          <p className="text-gray-500 text-center">Você chegou ao fim da timeline! 🎉</p>
        )}
      </div>
    </div>
  )
}
