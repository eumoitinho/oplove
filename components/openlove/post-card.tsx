"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Flame, MessageCircle, Share, Bookmark, MoreVertical, MapPin, Verified, Gem, Star, Play } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Post } from "./types"

interface PostCardProps {
  post: Post
}

export function PostCard({ post: initialPost }: PostCardProps) {
  const [post, setPost] = useState(initialPost)
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)

  const handleLike = () => {
    setIsLikeAnimating(true)
    setTimeout(() => setIsLikeAnimating(false), 600)

    setPost((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      stats: {
        ...prev.stats,
        likes: prev.isLiked ? prev.stats.likes - 1 : prev.stats.likes + 1,
      },
    }))
  }

  const handleSave = () => {
    setPost((prev) => ({ ...prev, isSaved: !prev.isSaved }))
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num
  }

  const PlanBadge = ({ plan }: { plan: "Free" | "Gold" | "Diamond" }) => {
    const planStyles = {
      Diamond: { icon: Gem, className: "plan-badge-diamond" },
      Gold: { icon: Star, className: "plan-badge-gold" },
      Free: { icon: () => null, className: "plan-badge-free" },
    }
    const { icon: Icon, className } = planStyles[plan]
    if (plan === "Free") return null
    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {plan}
      </Badge>
    )
  }

  return (
    <article className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 group rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
      {/* Alterado para layout de grid para melhor alinhamento */}
      <div className="grid grid-cols-[auto_1fr] gap-x-4">
        {/* Avatar na primeira coluna */}
        <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-gray-200 dark:ring-white/10 group-hover:ring-purple-300 dark:group-hover:ring-purple-400/30 transition-all duration-300 row-span-full">
          <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            {post.user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Conteúdo na segunda coluna */}
        <div className="min-w-0">
          {/* Post Header */}
          <div className="flex justify-between items-start">
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold truncate text-gray-900 dark:text-white">{post.user.name}</span>
                {post.user.verified && <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                <PlanBadge plan={post.user.plan} />
                <span className="text-gray-500 dark:text-white/60 truncate">@{post.user.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 mt-1">
                <span>{post.timestamp}</span>
                {post.user.location && (
                  <>
                    <span>·</span>
                    <MapPin className="w-3 h-3" />
                    <span>{post.user.location}</span>
                  </>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-gray-200 dark:border-white/10"
              >
                <DropdownMenuItem>Copiar link</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">Denunciar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post Content */}
          <div className="mt-3 space-y-4">
            <p className="whitespace-pre-wrap text-gray-800 dark:text-white/90 leading-relaxed">{post.content}</p>
            {post.media && (
              <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
                {post.media[0].type === "image" ? (
                  <img
                    src={post.media[0].url || "/placeholder.svg"}
                    alt="Post media"
                    className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="relative">
                    <img
                      src={post.media[0].url || "/placeholder.svg"}
                      alt="Video thumbnail"
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Button
                        size="icon"
                        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 hover:scale-110"
                      >
                        <Play className="w-8 h-8 text-white ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {post.poll && (
              <div className="space-y-2">
                {post.poll.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-10 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300"
                  >
                    <span className="flex-1 text-left">{option.text}</span>
                    <span className="text-sm text-gray-500 dark:text-white/50">{formatNumber(option.votes)}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-300 group/btn"
            >
              <MessageCircle className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
              {formatNumber(post.stats.comments)}
            </Button>
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-300 group/btn"
            >
              <Share className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
              {formatNumber(post.stats.shares)}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLike}
              className={`hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all duration-300 group/btn ${
                post.isLiked
                  ? "text-orange-500 dark:text-orange-400"
                  : "text-gray-500 hover:text-orange-500 dark:hover:text-orange-400"
              }`}
            >
              <Flame
                className={`w-5 h-5 mr-2 transition-all duration-300 ${
                  post.isLiked ? "fill-current" : ""
                } ${isLikeAnimating ? "animate-fire-like" : "group-hover/btn:scale-110"}`}
                style={{
                  background: post.isLiked ? "linear-gradient(45deg, #db2777, #a855f7, #06b6d4, #f97316)" : undefined,
                  WebkitBackgroundClip: post.isLiked ? "text" : undefined,
                  WebkitTextFillColor: post.isLiked ? "transparent" : undefined,
                }}
              />
              {formatNumber(post.stats.likes)}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSave}
              className={`hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-300 group/btn ${
                post.isSaved
                  ? "text-purple-500 dark:text-purple-400"
                  : "text-gray-500 hover:text-purple-500 dark:hover:text-purple-400"
              }`}
            >
              <Bookmark
                className={`w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300 ${post.isSaved ? "fill-current" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
