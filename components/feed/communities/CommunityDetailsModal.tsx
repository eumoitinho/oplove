"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  FileText,
  Settings,
  Shield,
  Crown,
  Star,
  MessageSquare,
  Heart,
  Share2,
  MoreVertical,
  UserPlus,
  LogOut,
  Send,
  Image as ImageIcon,
  Paperclip,
  Lock,
  Globe,
  Eye,
  AlertCircle,
  ChevronLeft
} from "lucide-react"
import { CommunitiesService } from "@/lib/services/communities-service"
import { useAuth } from "@/hooks/useAuth"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Community, CommunityPost, CommunityMember } from "@/types/community"

interface CommunityDetailsModalProps {
  community: Community
  open: boolean
  onClose: () => void
  onJoin: () => void
  onLeave: () => void
  canJoin: boolean
}

export function CommunityDetailsModal({
  community,
  open,
  onClose,
  onJoin,
  onLeave,
  canJoin
}: CommunityDetailsModalProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"posts" | "members" | "about">("posts")
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [postingContent, setPostingContent] = useState(false)

  // Fetch function for posts
  const fetchPosts = useCallback(async (page: number) => {
    try {
      const response = await CommunitiesService.getCommunityPosts(community.id, page)
      return {
        data: response.data,
        hasMore: response.hasMore,
        total: response.total
      }
    } catch (error) {
      toast.error("Erro ao carregar posts")
      return { data: [], hasMore: false }
    }
  }, [community.id])

  // Fetch function for members
  const fetchMembers = useCallback(async (page: number) => {
    try {
      const response = await CommunitiesService.getCommunityMembers(community.id, page)
      return {
        data: response.data,
        hasMore: response.pagination.page < response.pagination.totalPages,
        total: response.pagination.totalItems
      }
    } catch (error) {
      toast.error("Erro ao carregar membros")
      return { data: [], hasMore: false }
    }
  }, [community.id])

  // Infinite scroll for posts
  const {
    data: scrollPosts,
    loading: postsScrollLoading,
    hasMore: postsHasMore,
    containerRef: postsContainerRef
  } = useInfiniteScroll({
    fetchFn: fetchPosts,
    limit: 20,
    enabled: open && activeTab === "posts",
    dependencies: [community.id, open, activeTab]
  })

  // Infinite scroll for members
  const {
    data: scrollMembers,
    loading: membersScrollLoading,
    hasMore: membersHasMore,
    containerRef: membersContainerRef
  } = useInfiniteScroll({
    fetchFn: fetchMembers,
    limit: 20,
    enabled: open && activeTab === "members",
    dependencies: [community.id, open, activeTab]
  })

  // Update local state
  useEffect(() => {
    setPosts(scrollPosts)
    setLoadingPosts(postsScrollLoading)
  }, [scrollPosts, postsScrollLoading])

  useEffect(() => {
    setMembers(scrollMembers)
    setLoadingMembers(membersScrollLoading)
  }, [scrollMembers, membersScrollLoading])


  // Create post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    setPostingContent(true)
    try {
      const result = await CommunitiesService.createCommunityPost(
        community.id,
        newPostContent
      )

      if (result.success && result.data) {
        setPosts(prev => [result.data!, ...prev])
        setNewPostContent("")
        toast.success("Post criado com sucesso!")
      } else {
        toast.error(result.error || "Erro ao criar post")
      }
    } catch (error) {
      toast.error("Erro ao criar post")
    } finally {
      setPostingContent(false)
    }
  }

  const getTypeIcon = () => {
    switch (community.type) {
      case "public":
        return <Globe className="w-4 h-4" />
      case "private":
        return <Lock className="w-4 h-4" />
      case "secret":
        return <Eye className="w-4 h-4" />
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "admin":
        return <Shield className="w-4 h-4 text-purple-500" />
      case "moderator":
        return <Star className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative">
            {/* Banner */}
            <div className="h-32 relative overflow-hidden">
              {community.banner_url ? (
                <img
                  src={community.banner_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Back button */}
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            {/* Community info */}
            <div className="px-6 pb-4 -mt-10 relative">
              <div className="flex items-end justify-between mb-4">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-900 shadow-lg">
                  <AvatarImage src={community.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-3xl font-bold">
                    {community.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex items-center gap-2">
                  {community.is_member ? (
                    <Button
                      onClick={onLeave}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  ) : (
                    <Button
                      onClick={onJoin}
                      disabled={!canJoin}
                      size="sm"
                      className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {community.requires_approval ? "Solicitar entrada" : "Participar"}
                    </Button>
                  )}

                  {community.member_role === "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {community.name}
                  </h2>
                  {community.is_nsfw && (
                    <Badge className="bg-red-600 text-white border-0">+18</Badge>
                  )}
                  <Badge variant="secondary" className="gap-1">
                    {getTypeIcon()}
                    <span className="text-xs">
                      {community.type === "public" ? "Pública" : 
                       community.type === "private" ? "Privada" : "Secreta"}
                    </span>
                  </Badge>
                </div>

                <p className="text-gray-600 dark:text-white/60">
                  {community.description}
                </p>

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
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <div className="px-6 border-b border-gray-200 dark:border-white/10">
              <TabsList className="w-full justify-start bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="posts" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 px-4 pb-3"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="members" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 px-4 pb-3"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Membros
                </TabsTrigger>
                <TabsTrigger 
                  value="about" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 px-4 pb-3"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Sobre
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-0 p-6">
                {community.is_member && (
                  <div className="mb-6 bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
                    <Textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Compartilhe algo com a comunidade..."
                      className="border-0 bg-transparent resize-none placeholder:text-gray-500"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <ImageIcon className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Paperclip className="w-5 h-5" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || postingContent}
                        size="sm"
                        className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      >
                        {postingContent ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Publicar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Posts list */}
                {loadingPosts && posts.length === 0 ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-100 dark:bg-white/5 rounded-2xl h-32 animate-pulse" />
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.user?.avatar_url || undefined} />
                            <AvatarFallback>
                              {post.user?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {post.user?.full_name || post.user?.username}
                                </span>
                                <span className="text-sm text-gray-500">
                                  @{post.user?.username}
                                </span>
                              </div>
                              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <p className="mt-2 text-gray-900 dark:text-white whitespace-pre-wrap">
                              {post.content}
                            </p>

                            {post.media_urls && post.media_urls.length > 0 && (
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                {post.media_urls.map((url, index) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt=""
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-4 mt-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "rounded-full gap-2",
                                  post.is_liked && "text-red-500"
                                )}
                              >
                                <Heart className={cn("w-4 h-4", post.is_liked && "fill-current")} />
                                <span className="text-sm">{post.likes_count}</span>
                              </Button>

                              <Button variant="ghost" size="sm" className="rounded-full gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-sm">{post.comments_count}</span>
                              </Button>

                              <Button variant="ghost" size="sm" className="rounded-full">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {postsHasMore && (
                      <div ref={postsContainerRef} className="py-4 flex justify-center">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-white/60">
                      {community.is_member 
                        ? "Seja o primeiro a postar nesta comunidade!"
                        : "Entre na comunidade para ver os posts"}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="mt-0 p-6">
                {loadingMembers && members.length === 0 ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse" />
                        <div className="flex-1">
                          <div className="w-32 h-4 bg-gray-100 dark:bg-white/5 rounded animate-pulse mb-2" />
                          <div className="w-24 h-3 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={member.user?.avatar_url || undefined} />
                            <AvatarFallback>
                              {member.user?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {member.user?.full_name || member.user?.username}
                              </span>
                              {getRoleIcon(member.role)}
                            </div>
                            <span className="text-sm text-gray-500">
                              @{member.user?.username}
                            </span>
                          </div>
                        </div>

                        {member.user?.id !== user?.id && (
                          <Button variant="outline" size="sm" className="rounded-full">
                            Seguir
                          </Button>
                        )}
                      </div>
                    ))}

                    {membersHasMore && (
                      <div ref={membersContainerRef} className="py-4 flex justify-center">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="mt-0 p-6">
                <div className="space-y-6">
                  {/* Rules */}
                  {community.rules && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Regras da Comunidade
                      </h3>
                      <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                        <p className="text-gray-700 dark:text-white/80 whitespace-pre-wrap">
                          {community.rules}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Informações
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600 dark:text-white/60">Categoria</span>
                        <Badge variant="secondary">
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

                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600 dark:text-white/60">Criada em</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(community.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>

                      {community.min_age && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-600 dark:text-white/60">Idade mínima</span>
                          <span className="text-gray-900 dark:text-white">{community.min_age} anos</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600 dark:text-white/60">Aprovação</span>
                        <span className="text-gray-900 dark:text-white">
                          {community.requires_approval ? "Necessária" : "Automática"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Owner */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Criador
                    </h3>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={community.owner?.avatar_url || undefined} />
                        <AvatarFallback>
                          {community.owner?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {community.owner?.full_name || community.owner?.username}
                          </span>
                          <Crown className="w-4 h-4 text-yellow-500" />
                        </div>
                        <span className="text-sm text-gray-500">
                          @{community.owner?.username}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}