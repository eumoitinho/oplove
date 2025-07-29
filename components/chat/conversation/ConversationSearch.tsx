"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Search, X, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useChatStore } from "@/lib/stores/chat-store"
import { supabase } from "@/lib/supabase"
import type { User as UserType } from "@/types/common"

interface ConversationSearchProps {
  value: string
  onChange: (value: string) => void
  onClose: () => void
}

export function ConversationSearch({ value, onChange, onClose }: ConversationSearchProps) {
  const { user } = useAuthStore()
  const { createConversation } = useChatStore()
  const [searchResults, setSearchResults] = useState<UserType[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const searchUsers = async () => {
      if (!value.trim() || value.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .or(`username.ilike.%${value}%,full_name.ilike.%${value}%`)
          .neq("id", user?.id)
          .limit(10)

        if (!error && data) {
          setSearchResults(data)
        }
      } catch (error) {
        console.error("Error searching users:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [value, user?.id])

  const handleStartConversation = async (targetUser: UserType) => {
    try {
      const conversation = await createConversation({
        type: "direct",
        participants: [user!.id, targetUser.id],
      })

      if (conversation) {
        onClose()
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const canStartConversation = (targetUser: UserType) => {
    if (user?.premium_type === "free") {
      return false // Free users cannot initiate conversations
    }
    return true
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar pessoas..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Results */}
      {(searchResults.length > 0 || isSearching) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">Buscando...</div>
          ) : (
            <div className="py-2">
              {searchResults.map((searchUser) => (
                <motion.div
                  key={searchUser.id}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => canStartConversation(searchUser) && handleStartConversation(searchUser)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={searchUser.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {searchUser.full_name?.charAt(0) || searchUser.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{searchUser.full_name || searchUser.username}</p>
                        {searchUser.is_verified && (
                          <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                        {searchUser.premium_type !== "free" && (
                          <Badge variant="secondary" className="text-xs">
                            {searchUser.premium_type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">@{searchUser.username}</p>
                    </div>
                  </div>

                  {!canStartConversation(searchUser) && (
                    <Badge variant="outline" className="text-xs">
                      Premium necessário
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
