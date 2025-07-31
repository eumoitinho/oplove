import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Heart, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { communityService } from "@/lib/services/community.service"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { CommunityPost, CommunityPostComment } from "@/types/community.types"

interface PostDetailsModalProps {
  post: CommunityPost | null
  open: boolean
  onClose: () => void
  onLike: (postId: string) => void
}

export function PostDetailsModal({ post, open, onClose, onLike }: PostDetailsModalProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommunityPostComment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (post && open) {
      loadComments()
    }
  }, [post, open])

  const loadComments = async () => {
    if (!post) return
    
    setLoadingComments(true)
    const data = await communityService.getComments(post.id)
    setComments(data)
    setLoadingComments(false)
  }

  const handleSubmitComment = async () => {
    if (!post || !newComment.trim()) return

    setSubmitting(true)
    const comment = await communityService.createComment({
      post_id: post.id,
      content: newComment.trim()
    })

    if (comment) {
      setComments([...comments, comment])
      setNewComment("")
      toast.success("Comentário adicionado!")
    } else {
      toast.error("Erro ao adicionar comentário")
    }
    
    setSubmitting(false)
  }

  if (!post) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user?.avatar_url || ""} />
                <AvatarFallback>
                  {post.user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{post.user?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 pt-2">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>

        {post.media_urls && post.media_urls.length > 0 && (
          <div className="px-4 pb-4">
            {post.media_urls.map((url, index) => (
              <img 
                key={index}
                src={url} 
                alt={`Post media ${index + 1}`}
                className="w-full h-auto rounded-lg mb-2"
              />
            ))}
          </div>
        )}

        <div className="px-4 pb-3 flex items-center gap-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2",
              post.has_liked && "text-red-500"
            )}
            onClick={() => onLike(post.id)}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                post.has_liked && "fill-current"
              )}
            />
            {post.likes_count}
          </Button>
          <span className="text-sm text-muted-foreground">
            {post.comments_count} comentários
          </span>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="p-4 space-y-4">
            {loadingComments ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </>
            ) : comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.avatar_url || ""} />
                    <AvatarFallback>
                      {comment.user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-sm">{comment.user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {user && (
          <div className="p-4 border-t">
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmitComment()
              }}
              className="flex gap-2"
            >
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                disabled={submitting}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newComment.trim() || submitting}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}