"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/common/UserAvatar"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { Flame, MessageCircle, Share, Bookmark, MoreVertical, MapPin, Verified, Gem, Star, Play } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Post } from "@/types/common"
import { SecureMedia } from "@/components/common/SecureMedia"
import { usePostInteractions } from "@/hooks/usePostInteractions"
import { CommentsModal } from "@/components/feed/comments/CommentsModal"
import { AudioPlayer } from "@/components/common/ui/AudioPlayer"
import { PostPoll } from "./PostPoll"
import { useRestrictionModal } from "@/components/common/RestrictionModal"

interface PostCardProps {
  post: Post
  onCommentClick?: (postId: string) => void
}

export function PostCard({ post: initialPost, onCommentClick }: PostCardProps) {
  const { user } = useAuth()
  const [post] = useState(initialPost)
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const { showRestriction } = useRestrictionModal()
  
  const {
    isLiked,
    isSaved,
    likesCount,
    commentsCount,
    sharesCount,
    savesCount,
    isLoading,
    handleLike: onLike,
    handleSave: onSave,
    handleShare: onShare,
    handleComment,
  } = usePostInteractions({
    postId: post.id,
    initialLiked: post.is_liked || false,
    initialSaved: post.is_saved || false,
    initialLikesCount: post.likes_count || 0,
    initialCommentsCount: post.comments_count || 0,
    initialSharesCount: post.shares_count || 0,
    initialSavesCount: post.saves_count || 0,
  })

  const handleLike = () => {
    if (isLoading) return
    
    // Check if user is logged in
    if (!user) {
      showRestriction('premium_required', {
        feature: 'curtir posts',
        requiredPlan: 'free'
      })
      return
    }
    
    setIsLikeAnimating(true)
    setTimeout(() => setIsLikeAnimating(false), 600)
    onLike()
  }

  const handleSave = () => {
    if (isLoading) return
    onSave()
  }
  
  const handleShare = () => {
    if (isLoading) return
    onShare()
  }
  
  const handleCommentClick = () => {
    // Check if user is logged in
    if (!user) {
      showRestriction('premium_required', {
        feature: 'comentar',
        requiredPlan: 'free'
      })
      return
    }
    
    if (onCommentClick) {
      onCommentClick(post.id)
    } else {
      setShowComments(true)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num
  }

  const PlanBadge = ({ plan }: { plan: "free" | "gold" | "diamond" | "couple" }) => {
    const planStyles = {
      diamond: { icon: Gem, className: "plan-badge-diamond" },
      gold: { icon: Star, className: "plan-badge-gold" },
      couple: { icon: Star, className: "plan-badge-couple" },
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

  const timeAgo = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  })

  return (
    <article className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 group rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
      {/* Layout de grid para melhor alinhamento */}
      <div className="grid grid-cols-[auto_1fr] gap-x-4">
        {/* Avatar na primeira coluna */}
        <UserAvatar 
          user={post.user}
          size="lg"
          showPlanBadge={true}
          className="flex-shrink-0 group-hover:ring-purple-300 dark:group-hover:ring-purple-400/30 transition-all duration-300 row-span-full"
        />

        {/* Conteúdo na segunda coluna */}
        <div className="min-w-0">
          {/* Post Header */}
          <div className="flex justify-between items-start">
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold truncate text-gray-900 dark:text-white">
                  {post.user?.name || post.user?.username || "Usuário"}
                </span>
                {post.user?.is_verified && <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                <PlanBadge plan={post.user?.premium_type || "free"} />
                <span className="text-gray-500 dark:text-white/60 truncate">@{post.user?.username || "usuario"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 mt-1">
                <span>{timeAgo}</span>
                {post.user?.location && (
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
            {post.content && (
              <p className="whitespace-pre-wrap text-gray-800 dark:text-white/90 leading-relaxed">{post.content}</p>
            )}
            
            {/* Audio Player */}
            {post.audio_url && (
              <AudioPlayer
                src={post.audio_url}
                title={post.audio_title}
                artist={post.user?.name || post.user?.username}
                className="my-3"
              />
            )}
            
            {/* Poll */}
            {post.poll && (
              <PostPoll
                poll={post.poll}
                canVote={!!user && user.id !== post.user_id}
                onVote={async (pollId, optionId) => {
                  // TODO: Implementar votação
                  console.log("Vote:", pollId, optionId)
                }}
                className="my-3"
              />
            )}
            
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
                {post.media_urls.length === 1 ? (
                  // Single media item
                  <SecureMedia
                    src={post.media_urls[0]}
                    type={post.media_urls[0].includes('.mp4') || post.media_urls[0].includes('.webm') || post.media_urls[0].includes('.mov') ? 'video' : 'image'}
                    alt={`Post de ${post.user?.username || 'usuário'}`}
                    aspectRatio="auto"
                    className="w-full"
                    autoPlay={false}
                    controls={true}
                  />
                ) : (
                  // Multiple media items - gallery layout
                  <div className={`grid gap-1 ${
                    post.media_urls.length === 2 
                      ? 'grid-cols-2' 
                      : post.media_urls.length === 3
                      ? 'grid-cols-2 grid-rows-2'
                      : 'grid-cols-2 grid-rows-2'
                  }`}>
                    {post.media_urls.slice(0, 4).map((url, index) => (
                      <div key={index} className={`${
                        post.media_urls.length === 3 && index === 0 ? 'row-span-2' : ''
                      }`}>
                        <SecureMedia
                          src={url}
                          type={url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? 'video' : 'image'}
                          alt={`Post de ${post.user?.username || 'usuário'} - imagem ${index + 1}`}
                          aspectRatio="square"
                          className="w-full h-full"
                          autoPlay={false}
                          controls={url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')}
                        />
                        {/* Show count indicator for 4+ images */}
                        {index === 3 && post.media_urls.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">
                              +{post.media_urls.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
            <Button
              variant="ghost"
              onClick={handleCommentClick}
              disabled={isLoading}
              className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-300 group/btn"
            >
              <MessageCircle className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
              {formatNumber(commentsCount)}
            </Button>
            <Button
              variant="ghost"
              onClick={handleShare}
              disabled={isLoading}
              className="text-gray-500 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-300 group/btn"
            >
              <Share className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
              {formatNumber(sharesCount)}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLike}
              disabled={isLoading}
              className={`hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all duration-300 group/btn ${
                isLiked
                  ? "text-orange-500 dark:text-orange-400"
                  : "text-gray-500 hover:text-orange-500 dark:hover:text-orange-400"
              }`}
            >
              <Flame
                className={`w-5 h-5 mr-2 transition-all duration-300 ${
                  isLiked ? "fill-current" : ""
                } ${isLikeAnimating ? "animate-fire-like" : "group-hover/btn:scale-110"}`}
                style={{
                  background: isLiked ? "linear-gradient(45deg, #db2777, #a855f7, #06b6d4, #f97316)" : undefined,
                  WebkitBackgroundClip: isLiked ? "text" : undefined,
                  WebkitTextFillColor: isLiked ? "transparent" : undefined,
                }}
              />
              {formatNumber(likesCount)}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSave}
              disabled={isLoading}
              className={`hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-300 group/btn ${
                isSaved
                  ? "text-purple-500 dark:text-purple-400"
                  : "text-gray-500 hover:text-purple-500 dark:hover:text-purple-400"
              }`}
            >
              <Bookmark
                className={`w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300 ${isSaved ? "fill-current" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Comments Modal */}
      {showComments && (
        <CommentsModal
          postId={post.id}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      )}
    </article>
  )
}