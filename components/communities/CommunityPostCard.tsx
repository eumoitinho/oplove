import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Heart, MessageCircle, MoreVertical, Trash2, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import type { CommunityPost } from "@/types/community.types"

interface CommunityPostCardProps {
  post: CommunityPost
  onLike: (postId: string) => void
  onComment: (postId: string) => void
  onDelete?: (postId: string) => void
  onReport?: (postId: string) => void
}

export function CommunityPostCard({ 
  post, 
  onLike, 
  onComment,
  onDelete,
  onReport 
}: CommunityPostCardProps) {
  const { user } = useAuth()
  const [isLiking, setIsLiking] = useState(false)
  const isOwner = user?.id === post.user_id

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    await onLike(post.id)
    setIsLiking(false)
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user?.avatar_url || ""} />
                <AvatarFallback>
                  {post.user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{post.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(post.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                )}
                {!isOwner && onReport && (
                  <DropdownMenuItem onClick={() => onReport(post.id)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Denunciar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Post Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="relative">
            {post.media_urls.length === 1 ? (
              <img 
                src={post.media_urls[0]} 
                alt="Post media"
                className="w-full h-auto max-h-[500px] object-cover"
              />
            ) : (
              <div className="grid grid-cols-2 gap-0.5">
                {post.media_urls.slice(0, 4).map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img 
                      src={url} 
                      alt={`Post media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 3 && post.media_urls.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
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

        {/* Post Actions */}
        <div className="px-4 py-3 border-t flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 hover:text-red-500",
              post.has_liked && "text-red-500"
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-all",
                post.has_liked && "fill-current",
                isLiking && "animate-pulse"
              )}
            />
            <span className="text-sm">{post.likes_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => onComment(post.id)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{post.comments_count}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}