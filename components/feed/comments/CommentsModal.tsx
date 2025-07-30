"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Heart, MoreVertical, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    username: string
    name?: string
    avatar_url?: string
    premium_type?: string
    is_verified?: boolean
  }
  likes_count: number
  is_liked: boolean
  replies?: Comment[]
}

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
}

export function CommentsModal({ isOpen, onClose, postId }: CommentsModalProps) {
  const { user } = useAuth()
  const features = usePremiumFeatures()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Load comments
  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [isOpen, postId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/posts/${postId}/comments?limit=20&offset=0`)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.data)
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      toast.error("Erro ao carregar comentários")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return

    // Check permissions
    if (!user) {
      toast.error("Faça login para comentar")
      return
    }

    if (user.premium_type === "free" && !user.is_verified) {
      toast.error("Usuários gratuitos precisam verificar a conta para comentar")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          parent_id: replyingTo,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (replyingTo) {
          // Add reply to parent comment
          setComments(prev =>
            prev.map(comment =>
              comment.id === replyingTo
                ? { ...comment, replies: [...(comment.replies || []), data.data] }
                : comment
            )
          )
        } else {
          // Add new comment to top
          setComments(prev => [data.data, ...prev])
        }
        
        setContent("")
        setReplyingTo(null)
        toast.success("Comentário adicionado!")
      } else {
        toast.error(data.error || "Erro ao adicionar comentário")
      }
    } catch (error) {
      toast.error("Erro ao adicionar comentário")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId))
        toast.success("Comentário excluído")
      }
    } catch (error) {
      toast.error("Erro ao excluir comentário")
    }
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isReply && "ml-12 mt-3")}
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={comment.user.avatar_url} />
        <AvatarFallback>
          {comment.user.name?.charAt(0) || comment.user.username.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {comment.user.name || comment.user.username}
              </span>
              {comment.user.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  Verificado
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>

            {user?.id === comment.user.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDelete(comment.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <p className="text-sm">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs">
          <button className="flex items-center gap-1 text-gray-500 hover:text-red-500">
            <Heart className={cn("h-3 w-3", comment.is_liked && "fill-current text-red-500")} />
            {comment.likes_count > 0 && comment.likes_count}
          </button>
          
          {!isReply && (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-gray-500 hover:text-blue-500"
            >
              Responder
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comentários</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          ) : (
            <AnimatePresence>
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Comment Input */}
        {user && (user.premium_type !== "free" || user.is_verified) && (
          <div className="border-t pt-4">
            {replyingTo && (
              <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                <span>Respondendo ao comentário</span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-red-500 hover:underline"
                >
                  Cancelar
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Adicione um comentário..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
                size="icon"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {user && user.premium_type === "free" && !user.is_verified && (
          <div className="border-t pt-4 text-center text-sm text-gray-500">
            Verifique sua conta para comentar
          </div>
        )}

        {!user && (
          <div className="border-t pt-4 text-center text-sm text-gray-500">
            Faça login para comentar
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}