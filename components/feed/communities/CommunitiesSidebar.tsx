"use client"

import { Users, Lock, TrendingUp, Heart, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Community {
  id: string
  name: string
  description: string
  members: number
  category: string
  image: string
  isPrivate?: boolean
  isPremium?: boolean
  isJoined?: boolean
}

const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Casais Modernos",
    description: "Comunidade para casais que buscam novas experiências",
    members: 2847,
    category: "Relacionamentos",
    image: "/community-1.jpg",
    isPremium: false,
    isJoined: true
  },
  {
    id: "2",
    name: "Poliamor Brasil",
    description: "Discussões sobre relacionamentos não-monogâmicos",
    members: 1523,
    category: "Lifestyle",
    image: "/community-2.jpg",
    isPrivate: true,
    isPremium: true
  },
  {
    id: "3",
    name: "Swing SP",
    description: "Encontros e eventos para casais em São Paulo",
    members: 3921,
    category: "Eventos",
    image: "/community-3.jpg",
    isPremium: true
  },
  {
    id: "4",
    name: "Amor Livre",
    description: "Explorando relacionamentos sem amarras",
    members: 892,
    category: "Filosofia",
    image: "/community-4.jpg",
    isJoined: false
  }
]

export function CommunitiesSidebar() {
  return (
    <Card className="border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            Comunidades
          </div>
          <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
            Explorar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockCommunities.map((community) => (
          <div
            key={community.id}
            className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12 border-2 border-gray-200 dark:border-white/10">
                <AvatarImage src={community.image} alt={community.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {community.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-sm group-hover:text-pink-600 transition-colors truncate">
                    {community.name}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    {community.isPrivate && (
                      <Lock className="w-3 h-3 text-gray-500" />
                    )}
                    {community.isPremium && (
                      <Sparkles className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {community.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{community.members.toLocaleString()}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs py-0">
                      {community.category}
                    </Badge>
                  </div>
                  
                  {community.isJoined ? (
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0 text-xs">
                      Membro
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 text-xs text-pink-600 hover:text-pink-700 p-1"
                    >
                      Entrar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            className="flex-1 border-pink-200 dark:border-pink-800 hover:bg-pink-50 dark:hover:bg-pink-900/20"
          >
            <Heart className="w-4 h-4 mr-2" />
            Criar Comunidade
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Em Alta
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}