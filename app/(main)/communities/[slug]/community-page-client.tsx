"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, FileText, Shield, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { communityService } from "@/lib/services/community.service"
import { useAuth } from "@/hooks/useAuth"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { Community, CommunityPost, CommunityMember } from "@/types/community.types"
import { COMMUNITY_THEMES } from "@/types/community.types"
import { CommunityAvatar } from "@/components/communities/CommunityAvatar"
import { CommunityPostCard } from "@/components/communities/CommunityPostCard"
import { PostDetailsModal } from "@/components/communities/PostDetailsModal"

interface CommunityPageClientProps {
  community: Community
}

export function CommunityPageClient({ community }: CommunityPageClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)

  const themeData = COMMUNITY_THEMES[community.theme]

  useEffect(() => {
    if (user) {
      checkMembership()
    } else {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isMember) {
      if (activeTab === "posts") {
        loadPosts()
      } else if (activeTab === "members") {
        loadMembers()
      }
    }
  }, [isMember, activeTab])

  const checkMembership = async () => {
    if (!user) return
    const memberStatus = await communityService.isMember(community.id, user.id)
    setIsMember(memberStatus)
    setLoading(false)
  }

  const loadPosts = async () => {
    const data = await communityService.getPosts(community.id)
    setPosts(data)
  }

  const loadMembers = async () => {
    const data = await communityService.getMembers(community.id)
    setMembers(data)
  }

  const handleJoin = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (community.requires_verification && !user.is_verified) {
      router.push("/settings?tab=verification")
      return
    }

    setJoining(true)
    const result = await communityService.joinCommunity(community.id, user.id)
    
    if (result.success) {
      toast.success(result.message)
      setIsMember(true)
      // Update member count
      community.members_count += 1
    } else {
      toast.error(result.message)
    }
    
    setJoining(false)
  }

  const handleLeave = async () => {
    if (!user) return

    const success = await communityService.leaveCommunity(community.id, user.id)
    if (success) {
      toast.success("Você saiu da comunidade")
      setIsMember(false)
      // Update member count
      community.members_count -= 1
    } else {
      toast.error("Erro ao sair da comunidade")
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    setPosting(true)
    const post = await communityService.createPost({
      community_id: community.id,
      content: newPostContent.trim()
    })

    if (post) {
      toast.success("Post criado com sucesso!")
      setNewPostContent("")
      setPosts([post, ...posts])
    } else {
      toast.error("Erro ao criar post")
    }
    
    setPosting(false)
  }

  const handleLikePost = async (postId: string) => {
    const success = await communityService.toggleLike(postId)
    if (success) {
      // Update post in state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const newLikeStatus = !post.has_liked
          return {
            ...post,
            has_liked: newLikeStatus,
            likes_count: newLikeStatus ? post.likes_count + 1 : post.likes_count - 1
          }
        }
        return post
      }))
    }
  }

  const getThemeStyles = () => {
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
      <div className="max-w-4xl mx-auto p-4">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!isMember && user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/communities")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card className={cn("overflow-hidden", getThemeStyles())}>
          <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600" />
          <CardHeader className="text-center -mt-16">
            <div className="mx-auto">
              <div className="p-1 rounded-full bg-background">
                <CommunityAvatar theme={community.theme} size="xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mt-4">{community.name}</h1>
            <p className="text-muted-foreground mt-2">{community.description}</p>
            
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {community.members_count} membros
              </Badge>
              {community.requires_verification && (
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Verificação obrigatória
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {community.requires_verification && !user?.is_verified && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Esta comunidade requer verificação de identidade para garantir a segurança de todos os membros.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Regras da Comunidade
              </h3>
              <ul className="space-y-1">
                {community.rules.map((rule, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleJoin}
              disabled={joining || (community.requires_verification && !user?.is_verified)}
            >
              {joining ? "Entrando..." : "Entrar na Comunidade"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/communities")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLeave}
        >
          Sair da Comunidade
        </Button>
      </div>

      <Card className={cn("overflow-hidden", getThemeStyles())}>
        <div className="h-24 bg-gradient-to-r from-purple-600 to-pink-600" />
        <CardHeader className="-mt-12">
          <div className="flex items-end gap-4">
            <div className="p-1 rounded-full bg-background">
              <CommunityAvatar theme={community.theme} size="lg" />
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold">{community.name}</h1>
              <div className="flex items-center gap-4 mt-1">
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  {community.members_count} membros
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {community.posts_count} posts
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="about">Sobre</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {/* Create post */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Compartilhe algo com a comunidade..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() || posting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {posting ? "Publicando..." : "Publicar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts list */}
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Ainda não há posts nesta comunidade. Seja o primeiro a compartilhar!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  onComment={() => setSelectedPost(post)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user?.avatar_url || ""} />
                      <AvatarFallback>
                        {member.user?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.posts_count} posts • Membro desde{" "}
                        {formatDistanceToNow(new Date(member.joined_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                  {member.role !== "member" && (
                    <Badge variant="secondary">
                      {member.role === "admin" ? "Admin" : "Moderador"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Sobre a Comunidade</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{community.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-medium">Regras</h4>
                <ul className="space-y-1">
                  {community.rules.map((rule, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {community.welcome_message && (
                <div className="space-y-2">
                  <h4 className="font-medium">Mensagem de Boas-vindas</h4>
                  <p className="text-sm text-muted-foreground">
                    {community.welcome_message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Post Details Modal */}
      <PostDetailsModal
        post={selectedPost}
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onLike={handleLikePost}
      />
    </div>
  )
}