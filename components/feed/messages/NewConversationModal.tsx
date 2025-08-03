"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, X, CheckCircle, Crown, Gem, MessageCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { messagesService } from "@/lib/services/messages-service"
import { toast } from "sonner"
import { createClient } from "@/app/lib/supabase-browser"

interface NewConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onConversationCreated: (conversationId: string) => void
}

interface UserSearchResult {
  id: string
  username: string
  name: string
  avatar_url: string | null
  premium_type: string
  is_verified: boolean
  is_online?: boolean
  mutual_friends_count?: number
}

export function NewConversationModal({ isOpen, onClose, onConversationCreated }: NewConversationModalProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([])
  const supabase = createClient()

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const searchUsers = async () => {
      setIsLoading(true)
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('id, username, name, avatar_url, premium_type, is_verified')
          .or(`username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
          .neq('id', user?.id)
          .limit(10)

        if (error) throw error

        setSearchResults(users || [])
      } catch (error) {
        console.error('Error searching users:', error)
        toast.error("Erro ao buscar usuários")
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, user?.id, supabase])

  const handleCreateConversation = async (targetUser: UserSearchResult) => {
    if (!user) return

    setIsCreatingConversation(true)
    try {
      const result = await messagesService.createConversation({
        participants: [user.id, targetUser.id],
        type: 'direct'
      })

      if (result.success && result.data) {
        onConversationCreated(result.data.id)
        onClose()
        toast.success(`Conversa iniciada com ${targetUser.name}`)
      } else {
        throw new Error(result.error || 'Erro ao criar conversa')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error("Erro ao iniciar conversa")
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'diamond':
        return <Gem className="w-4 h-4 text-blue-500" />
      case 'gold':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'couple':
        return <div className="flex -space-x-1">
          <Gem className="w-3 h-3 text-pink-500" />
          <Gem className="w-3 h-3 text-purple-500" />
        </div>
      default:
        return null
    }
  }

  const resetModal = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedUsers([])
    setIsLoading(false)
    setIsCreatingConversation(false)
  }

  useEffect(() => {
    if (!isOpen) {
      resetModal()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Nova Conversa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Search Results */}
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          {user.is_verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                          {getPlanIcon(user.premium_type)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCreateConversation(user)}
                      disabled={isCreatingConversation}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isCreatingConversation ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                ))
              ) : searchQuery.trim() ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhum usuário encontrado
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Digite um nome ou usuário para buscar
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}