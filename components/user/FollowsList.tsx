"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "@/components/common/UserAvatar"
import { FollowButton } from "./FollowButton"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Verified, Star, Gem } from "lucide-react"
import { useFollows } from "@/hooks/useFollows"
import { useDebounce } from "@/hooks/useDebounce"
import { cn } from "@/lib/utils"
import type { User } from "@/types/database.types"

interface FollowsListProps {
  userId: string
  defaultTab?: "followers" | "following"
  className?: string
}

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

export function FollowsList({ userId, defaultTab = "followers", className }: FollowsListProps) {
  const router = useRouter()
  const {
    followers,
    following,
    followersCount,
    followingCount,
    fetchFollowers,
    fetchFollowing,
    isLoading
  } = useFollows(userId)
  
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true)
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Load initial data
  useEffect(() => {
    if (activeTab === "followers") {
      fetchFollowers(20, 0)
    } else {
      fetchFollowing(20, 0)
    }
  }, [activeTab, fetchFollowers, fetchFollowing])

  // Filter users based on search
  const filteredUsers = (activeTab === "followers" ? followers : following).filter(user => {
    if (!debouncedSearchQuery) return true
    const query = debouncedSearchQuery.toLowerCase()
    return (
      user.username?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query) ||
      user.bio?.toLowerCase().includes(query)
    )
  })

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const currentList = activeTab === "followers" ? followers : following
    const offset = currentList.length

    try {
      const newUsers = activeTab === "followers"
        ? await fetchFollowers(20, offset)
        : await fetchFollowing(20, offset)

      if (newUsers.length < 20) {
        if (activeTab === "followers") {
          setHasMoreFollowers(false)
        } else {
          setHasMoreFollowing(false)
        }
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`)
  }

  const renderUserItem = (user: User) => (
    <div
      key={user.id}
      className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 border border-gray-100 dark:border-white/5 cursor-pointer group"
      onClick={() => handleUserClick(user.username)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <UserAvatar 
          user={user}
          size="md"
          showPlanBadge={false}
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white truncate">
              {user.full_name || user.username}
            </span>
            {user.is_verified && <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />}
            <PlanBadge plan={user.premium_type || "free"} />
          </div>
          <p className="text-sm text-gray-500 dark:text-white/60">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-gray-700 dark:text-white/80 line-clamp-1 mt-1">{user.bio}</p>
          )}
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <FollowButton
          userId={user.id}
          username={user.username}
          size="sm"
          className="ml-3"
        />
      </div>
    </div>
  )

  const renderEmptyState = (type: "followers" | "following") => (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
        <Users className="w-10 h-10 text-gray-400 dark:text-white/40" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {type === "followers" ? "Nenhum seguidor ainda" : "Não está seguindo ninguém"}
      </h3>
      <p className="text-sm text-gray-500 dark:text-white/60 max-w-sm mx-auto">
        {type === "followers" 
          ? "Quando alguém seguir este perfil, aparecerá aqui"
          : "Quando este perfil seguir alguém, aparecerá aqui"
        }
      </p>
    </div>
  )

  const renderLoading = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 dark:bg-white/5 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="followers" className="flex items-center gap-2">
            Seguidores
            <Badge variant="secondary" className="text-xs">
              {followersCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            Seguindo
            <Badge variant="secondary" className="text-xs">
              {followingCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10"
          />
        </div>

        <TabsContent value="followers" className="space-y-3">
          {isLoading && followers.length === 0 ? (
            renderLoading()
          ) : filteredUsers.length === 0 ? (
            searchQuery ? (
              <p className="text-center text-gray-500 dark:text-white/60 py-8">
                Nenhum seguidor encontrado para "{searchQuery}"
              </p>
            ) : (
              renderEmptyState("followers")
            )
          ) : (
            <>
              <div className="space-y-3">
                {filteredUsers.map(renderUserItem)}
              </div>
              
              {!searchQuery && hasMoreFollowers && followers.length < followersCount && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-3 text-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      Carregando...
                    </span>
                  ) : (
                    "Carregar mais"
                  )}
                </button>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="following" className="space-y-3">
          {isLoading && following.length === 0 ? (
            renderLoading()
          ) : filteredUsers.length === 0 ? (
            searchQuery ? (
              <p className="text-center text-gray-500 dark:text-white/60 py-8">
                Nenhum usuário encontrado para "{searchQuery}"
              </p>
            ) : (
              renderEmptyState("following")
            )
          ) : (
            <>
              <div className="space-y-3">
                {filteredUsers.map(renderUserItem)}
              </div>
              
              {!searchQuery && hasMoreFollowing && following.length < followingCount && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-3 text-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      Carregando...
                    </span>
                  ) : (
                    "Carregar mais"
                  )}
                </button>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}