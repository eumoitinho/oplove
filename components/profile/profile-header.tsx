"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { 
  MapPin, 
  Calendar, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Settings,
  Shield,
  Crown,
  Gem,
  Flame
} from "lucide-react"
import { formatDate } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface User {
  id: string
  name: string
  username: string
  bio?: string
  location?: string
  avatar_url?: string
  cover_url?: string
  created_at: string
  is_verified: boolean
  premium_type: 'free' | 'gold' | 'diamond' | 'couple'
  stats: {
    followers: number
    following: number
    posts: number
  }
}

interface ProfileHeaderProps {
  user: User
  isOwnProfile: boolean
  isFollowing?: boolean
  onFollow?: () => void
  onUnfollow?: () => void
}

export function ProfileHeader({ 
  user, 
  isOwnProfile, 
  isFollowing, 
  onFollow, 
  onUnfollow 
}: ProfileHeaderProps) {
  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case "gold":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "diamond":
        return <Gem className="w-4 h-4 text-purple-500" />
      case "couple":
        return <Flame className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getPlanName = (planType: string) => {
    switch (planType) {
      case "gold":
        return "Gold"
      case "diamond":
        return "Diamond"
      case "couple":
        return "Dupla Hot"
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Cover Image */}
      {user.cover_url && (
        <div 
          className="h-48 bg-cover bg-center bg-gray-200 dark:bg-gray-800"
          style={{ backgroundImage: `url(${user.cover_url})` }}
        />
      )}
      
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
              <AvatarImage src={user.avatar_url || "/default-avatar.png"} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                {/* Name and username */}
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold truncate">
                    {user.name || user.username}
                  </h1>
                  {user.is_verified && (
                    <Shield className="w-5 h-5 text-blue-500" />
                  )}
                  {getPlanIcon(user.premium_type)}
                </div>
                
                <p className="text-muted-foreground mb-3">@{user.username}</p>

                {/* Plan Badge */}
                {getPlanName(user.premium_type) && (
                  <Badge variant="secondary" className="mb-3">
                    {getPlanIcon(user.premium_type)}
                    <span className="ml-1">{getPlanName(user.premium_type)}</span>
                  </Badge>
                )}

                {/* Bio */}
                {user.bio && (
                  <p className="text-sm mb-4 whitespace-pre-wrap">{user.bio}</p>
                )}

                {/* Location and join date */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Entrou em {formatDate(new Date(user.created_at), "MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-bold">{user.stats.following}</span>{" "}
                    <span className="text-muted-foreground">seguindo</span>
                  </div>
                  <div>
                    <span className="font-bold">{user.stats.followers}</span>{" "}
                    <span className="text-muted-foreground">seguidores</span>
                  </div>
                  <div>
                    <span className="font-bold">{user.stats.posts}</span>{" "}
                    <span className="text-muted-foreground">posts</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Link href="/settings">
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Editar perfil
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      onClick={isFollowing ? onUnfollow : onFollow}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Mensagem
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}