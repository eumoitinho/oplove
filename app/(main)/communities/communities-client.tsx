"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { communityService } from "@/lib/services/community.service"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import type { Community } from "@/types/community.types"
import { COMMUNITY_THEMES } from "@/types/community.types"
import { CommunityAvatar } from "@/components/communities/CommunityAvatar"

export function CommunitiesClient() {
  const router = useRouter()
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([])

  useEffect(() => {
    loadCommunities()
    if (user) {
      loadUserCommunities()
    }
  }, [user])

  const loadCommunities = async () => {
    setLoading(true)
    const data = await communityService.getCommunities({ is_official: true })
    setCommunities(data)
    setLoading(false)
  }

  const loadUserCommunities = async () => {
    if (!user) return
    const userCommunities = await communityService.getUserCommunities(user.id)
    setJoinedCommunities(userCommunities.map(c => c.id))
  }

  const handleCommunityClick = (community: Community) => {
    if (!user) {
      router.push("/login")
      return
    }

    if (community.requires_verification && !user.is_verified) {
      // Redirect to verification page
      router.push("/settings?tab=verification")
      return
    }

    // Navigate to community page
    router.push(`/communities/${community.slug}`)
  }

  const getThemeStyles = (theme: Community['theme']) => {
    const themeData = COMMUNITY_THEMES[theme]
    const colorMap = {
      purple: "border-purple-500 bg-purple-500/10",
      red: "border-red-500 bg-red-500/10",
      pink: "border-pink-500 bg-pink-500/10",
      orange: "border-orange-500 bg-orange-500/10"
    }
    return colorMap[themeData.color as keyof typeof colorMap]
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Comunidades Adultas</h1>
        <p className="text-muted-foreground">
          Explore comunidades exclusivas para usuários verificados. Um espaço seguro para conectar-se com pessoas de interesses similares.
        </p>
      </div>

      {!user?.is_verified && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para acessar as comunidades adultas, você precisa verificar sua conta. 
            <Button variant="link" className="px-2" onClick={() => router.push("/settings?tab=verification")}>
              Verificar agora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communities.map((community) => {
          const themeData = COMMUNITY_THEMES[community.theme]
          const isJoined = joinedCommunities.includes(community.id)
          
          return (
            <Card 
              key={community.id} 
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                getThemeStyles(community.theme),
                !user?.is_verified && "opacity-75"
              )}
              onClick={() => handleCommunityClick(community)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <CommunityAvatar theme={community.theme} size="lg" />
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-xl">
                      {community.name}
                    </CardTitle>
                    <CardDescription>{themeData.description}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      {community.is_official && (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Oficial
                        </Badge>
                      )}
                      {community.requires_verification && (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {community.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.members_count.toLocaleString()} membros
                    </span>
                    <span>{community.posts_count.toLocaleString()} posts</span>
                  </div>
                  {isJoined && (
                    <Badge variant="default">Membro</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Sobre as Comunidades</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Todas as comunidades são exclusivas para maiores de 18 anos</li>
          <li>• É necessário ter conta verificada para participar</li>
          <li>• Respeite as regras de cada comunidade</li>
          <li>• Conteúdo deve ser consensual e legal</li>
          <li>• A privacidade e discrição são garantidas</li>
        </ul>
      </div>
    </div>
  )
}