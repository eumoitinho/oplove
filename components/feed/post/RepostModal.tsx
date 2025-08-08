'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Share2, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import type { Post } from '@/types/post.types'

interface RepostModalProps {
  post: Post
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function RepostModal({ post, isOpen, onClose, onSuccess }: RepostModalProps) {
  const { user } = useAuth()
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleRepost = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para repostar')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/v1/posts/${post.id}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          comment: comment.trim() || null 
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao repostar')
      }
      
      const result = await response.json()
      
      toast.success('Post repostado com sucesso! 🔄')
      onSuccess?.()
      onClose()
      
      // Clear comment
      setComment('')
      
    } catch (error: any) {
      console.error('Error reposting:', error)
      toast.error(error.message || 'Erro ao repostar')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleQuickRepost = async () => {
    // Repost without comment
    await handleRepost()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Repostar
          </DialogTitle>
          <DialogDescription>
            Compartilhe este post com seus seguidores
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Original post preview */}
          <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div>
                <p className="text-sm font-medium">
                  {post.user?.username || post.users?.username || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  @{post.user?.username || post.users?.username || 'usuario'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
              {post.content}
            </p>
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mt-2 flex gap-1">
                {post.media_urls.slice(0, 3).map((url, index) => (
                  <div 
                    key={index}
                    className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded"
                  />
                ))}
                {post.media_urls.length > 3 && (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-xs">+{post.media_urls.length - 3}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Comment input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Adicionar comentário (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Adicione seu comentário ao repost..."
              className="min-h-[80px] resize-none"
              maxLength={280}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/280
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            
            {!comment.trim() ? (
              <Button
                onClick={handleQuickRepost}
                disabled={isLoading}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isLoading ? 'Repostando...' : 'Repostar'}
              </Button>
            ) : (
              <Button
                onClick={handleRepost}
                disabled={isLoading}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Repostando...' : 'Repostar com comentário'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}