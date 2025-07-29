"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Users, MessageCircle } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useChatStore } from "@/lib/stores/chat-store"
import { ConversationItem } from "./ConversationItem"
import { ConversationSearch } from "./ConversationSearch"
import { GroupChatCreator } from "../groups/GroupChatCreator"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"

export function ConversationList() {
  const { user } = useAuthStore()
  const { conversations, activeConversation, setActiveConversation, loadConversations, isLoading } = useChatStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [showGroupCreator, setShowGroupCreator] = useState(false)
  const [filter, setFilter] = useState<"all" | "direct" | "groups">("all")

  useEffect(() => {
    if (user) {
      loadConversations()

      // Subscribe to conversation updates
      const channel = supabase
        .channel("conversations")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "conversations",
            filter: `participants.cs.{${user.id}}`,
          },
          () => {
            loadConversations()
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, loadConversations])

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      !searchQuery ||
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants.some(
        (p) =>
          p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    const matchesFilter =
      filter === "all" ||
      (filter === "direct" && conv.type === "direct") ||
      (filter === "groups" && conv.type === "group")

    return matchesSearch && matchesFilter
  })

  const canCreateGroup = user?.premium_type === "diamond" || user?.premium_type === "couple"

  if (isLoading) {
    return (
      <div className="h-full bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Conversas
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="text-gray-600 hover:text-purple-600"
            >
              <Search className="h-4 w-4" />
            </Button>
            {canCreateGroup && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGroupCreator(true)}
                className="text-gray-600 hover:text-purple-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <ConversationSearch value={searchQuery} onChange={setSearchQuery} onClose={() => setShowSearch(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="flex-1"
          >
            Todas
          </Button>
          <Button
            variant={filter === "direct" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("direct")}
            className="flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Diretas
          </Button>
          <Button
            variant={filter === "groups" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("groups")}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-1" />
            Grupos
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-center">{searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}</p>
            {!searchQuery && user?.premium_type === "free" && (
              <p className="text-sm text-center mt-2 px-4">
                Usuários gratuitos só podem responder mensagens de usuários premium
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            <AnimatePresence>
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ConversationItem
                    conversation={conversation}
                    isActive={activeConversation?.id === conversation.id}
                    onClick={() => setActiveConversation(conversation)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Premium Upgrade Banner for Free Users */}
      {user?.premium_type === "free" && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Upgrade para enviar mensagens</p>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Ver Planos
            </Button>
          </div>
        </div>
      )}

      {/* Group Creator Modal */}
      <AnimatePresence>
        {showGroupCreator && (
          <GroupChatCreator
            onClose={() => setShowGroupCreator(false)}
            onCreated={(group) => {
              setShowGroupCreator(false)
              setActiveConversation(group)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
