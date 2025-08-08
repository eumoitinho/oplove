"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Users, Search, Plus, Crown } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useChatStore } from "@/lib/stores/chat-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import type { User, Conversation } from "@/types/database.types"

interface GroupChatCreatorProps {
  onClose: () => void
  onCreated: (group: Conversation) => void
}

export function GroupChatCreator({ onClose, onCreated }: GroupChatCreatorProps) {
  const { user } = useAuthStore()
  const { createGroupChat } = useChatStore()

  const [step, setStep] = useState<"details" | "members">("details")
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedMembers, setSelectedMembers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Check if user can create groups
  const canCreateGroup = user?.premium_type === "diamond" || user?.premium_type === "couple"

  useEffect(() => {
    if (!canCreateGroup) {
      onClose()
      return
    }
  }, [canCreateGroup, onClose])

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
          .neq("id", user?.id)
          .limit(20)

        if (!error && data) {
          // Filter out already selected members
          const filtered = data.filter((u) => !selectedMembers.some((selected) => selected.id === u.id))
          setSearchResults(filtered)
        }
      } catch (error) {
        console.error("Error searching users:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, user?.id, selectedMembers])

  const handleMemberToggle = (member: User) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((m) => m.id === member.id)
      if (isSelected) {
        return prev.filter((m) => m.id !== member.id)
      } else {
        return [...prev, member]
      }
    })
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return

    setIsCreating(true)
    try {
      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim() || null,
        type: "group" as const,
        participants: [user!.id, ...selectedMembers.map((m) => m.id)],
        avatar: groupAvatar,
      }

      const group = await createGroupChat(groupData)
      if (group) {
        onCreated(group)
      }
    } catch (error) {
      console.error("Error creating group:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setGroupAvatar(file)
    }
  }

  if (!canCreateGroup) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Criar Grupo</h3>
              <p className="text-sm text-gray-500">{step === "details" ? "Detalhes do grupo" : "Adicionar membros"}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === "details" ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                {/* Group Avatar */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={groupAvatar ? URL.createObjectURL(groupAvatar) : undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                        <Users className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute -bottom-2 -right-2 h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
                      <Plus className="h-4 w-4 text-white" />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 text-center">Adicione uma foto para o grupo</p>
                </div>

                {/* Group Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nome do Grupo *</label>
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Digite o nome do grupo"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500">{groupName.length}/50 caracteres</p>
                </div>

                {/* Group Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Descrição (opcional)</label>
                  <Textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Descreva o propósito do grupo"
                    maxLength={200}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">{groupDescription.length}/200 caracteres</p>
                </div>

                {/* Premium Feature Badge */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Recurso Premium</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Grupos são exclusivos para usuários Diamond e Couple. Você pode adicionar até 50 membros.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="members"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-96"
              >
                {/* Search */}
                <div className="p-6 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar pessoas..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Membros selecionados ({selectedMembers.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((member) => (
                        <Badge key={member.id} variant="secondary" className="flex items-center space-x-2 pr-1">
                          <span>{member.full_name || member.username}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMemberToggle(member)}
                            className="h-4 w-4 p-0 hover:bg-gray-300"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto p-4">
                  {isSearching ? (
                    <div className="text-center py-8 text-gray-500">Buscando...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleMemberToggle(user)}
                        >
                          <Checkbox
                            checked={selectedMembers.some((m) => m.id === user.id)}
                            onChange={() => handleMemberToggle(user)}
                          />
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {user.full_name?.charAt(0) || user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900 truncate">{user.full_name || user.username}</p>
                              {user.is_verified && (
                                <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Crown className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                              {user.premium_type !== "free" && (
                                <Badge variant="secondary" className="text-xs">
                                  {user.premium_type}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">Digite pelo menos 2 caracteres para buscar</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {step === "details" ? (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Cancelar
                </Button>
                <Button
                  onClick={() => setStep("members")}
                  disabled={!groupName.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Próximo
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  disabled={selectedMembers.length === 0 || isCreating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isCreating ? "Criando..." : "Criar Grupo"}
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
