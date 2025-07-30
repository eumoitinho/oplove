"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  FileText, 
  Lock, 
  Globe, 
  Eye,
  Shield,
  Crown,
  UserPlus,
  LogOut,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PremiumTooltip } from "@/components/common/PremiumTooltip"
import Image from "next/image"
import type { Community } from "@/types/community"

interface CommunityCardProps {
  community: Community
  onJoin: () => void
  onLeave: () => void
  onClick: () => void
  canJoin: boolean
}

export function CommunityCard({ 
  community, 
  onJoin, 
  onLeave, 
  onClick,
  canJoin 
}: CommunityCardProps) {
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (community.is_member) {
      onLeave()
    } else {
      onJoin()
    }
  }

  const getTypeIcon = () => {
    switch (community.type) {
      case "public":
        return <Globe className="w-3 h-3" />
      case "private":
        return <Lock className="w-3 h-3" />
      case "secret":
        return <Eye className="w-3 h-3" />
    }
  }

  const getRoleIcon = () => {
    switch (community.member_role) {
      case "owner":
        return <Crown className="w-3 h-3 text-yellow-500" />
      case "admin":
        return <Shield className="w-3 h-3 text-purple-500" />
      case "moderator":
        return <Star className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const getCategoryColor = () => {
    switch (community.category) {
      case "adult":
      case "fetish":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      case "lgbtq":
        return "bg-rainbow-gradient text-white"
      case "relationships":
        return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
      case "lifestyle":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
      case "health":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      case "entertainment":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      case "education":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
      case "technology":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-purple-300 dark:hover:border-purple-600/50"
    >
      {/* Banner */}
      <div className="h-32 relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600">
        {community.banner_url ? (
          <Image
            src={community.banner_url}
            alt="Banner da comunidade"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white border-0">
            {getTypeIcon()}
            <span className="ml-1 text-xs">
              {community.type === "public" ? "Pública" : 
               community.type === "private" ? "Privada" : "Secreta"}
            </span>
          </Badge>
        </div>

        {/* NSFW badge */}
        {community.is_nsfw && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-600 text-white border-0">
              +18
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 -mt-10 relative">
        {/* Avatar */}
        <div className="flex items-start justify-between mb-4">
          <Avatar className="w-20 h-20 border-4 border-white dark:border-gray-900 shadow-lg">
            <AvatarImage src={community.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl font-bold">
              {community.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Member badge */}
          {community.is_member && getRoleIcon() && (
            <div className="mt-12">
              {getRoleIcon()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
              {community.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-white/60 line-clamp-2 mt-1">
              {community.description}
            </p>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", getCategoryColor())}>
              {community.category === "adult" ? "Adulto" :
               community.category === "relationships" ? "Relacionamentos" :
               community.category === "lgbtq" ? "LGBTQ+" :
               community.category === "fetish" ? "Fetiches" :
               community.category === "lifestyle" ? "Estilo de Vida" :
               community.category === "health" ? "Saúde" :
               community.category === "entertainment" ? "Entretenimento" :
               community.category === "education" ? "Educação" :
               community.category === "technology" ? "Tecnologia" : "Outros"}
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-white/60">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{community.member_count} membros</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{community.post_count} posts</span>
            </div>
          </div>

          {/* Action button */}
          {community.is_member ? (
            <Button
              onClick={handleAction}
              variant="outline"
              size="sm"
              className="w-full rounded-full transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          ) : (
            <PremiumTooltip feature="communities">
              <Button
                onClick={handleAction}
                size="sm"
                className="w-full rounded-full transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {community.requires_approval ? "Solicitar entrada" : "Participar"}
              </Button>
            </PremiumTooltip>
          )}
        </div>
      </div>
    </div>
  )
}