"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Video, Mic, BarChart2, ArrowLeft, Globe, Users, Lock, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PostCard } from "./post-card"
import { PostSkeleton } from "./post-skeleton"
import { WhoToFollowCard } from "./who-to-follow-card"
import { TrendingTopicsCard } from "./trending-topics-card"
import { UpcomingEventsCard } from "./upcoming-events-card"
import type { Post } from "./types"

type MainContentType =
  | "timeline"
  | "who-to-follow"
  | "trending-topics"
  | "upcoming-events"
  | "user-profile"
  | "notifications"
  | "messages"
  | "saved-items"
  | "settings"
  | "support"
  | "stats"

interface MainTimelineProps {
  currentMainContent: MainContentType
  onViewChange: (view: MainContentType) => void
  activeTab: "for-you" | "following" | "explore"
  onTabChange: (tab: "for-you" | "following" | "explore") => void
}

const mockPostsForYou: Post[] = [
  {
    id: "1",
    user: {
      name: "Sarah Chen",
      username: "sarahdesigns",
      avatar: "/professional-woman-designer.png",
      verified: true,
      plan: "Diamond",
      location: "São Paulo, BR",
    },
    content:
      "Explorando o novo layout do OpenLove! A estrutura de 3 colunas no desktop é super produtiva. Adorei os badges de plano, dá um toque especial. ✨ #OpenLove #UIUX",
    timestamp: "2h",
    stats: { likes: 247, comments: 34, shares: 12 },
    media: [{ type: "image", url: "/modern-portfolio-bento.png" }],
    isLiked: true,
    isSaved: true,
  },
  {
    id: "2",
    user: {
      name: "Alex Rivera",
      username: "alexcodes",
      avatar: "/young-developer-man.png",
      verified: false,
      plan: "Gold",
      location: "Rio de Janeiro, BR",
    },
    content: "Testando a funcionalidade de enquetes. Qual a sua feature preferida até agora?",
    timestamp: "4h",
    stats: { likes: 156, comments: 23, shares: 5 },
    poll: {
      question: "Feature preferida?",
      options: [
        { text: "Timeline", votes: 120 },
        { text: "Eventos", votes: 85 },
        { text: "Comunidades", votes: 60 },
      ],
    },
    isLiked: false,
    isSaved: false,
  },
  {
    id: "3",
    user: {
      name: "Maya Patel",
      username: "mayacreates",
      avatar: "/creative-woman-artist.png",
      verified: true,
      plan: "Free",
      location: "Belo Horizonte, BR",
    },
    content:
      "Acabei de participar de um evento incrível sobre design inclusivo que encontrei aqui no OpenLove. A seção 'Eventos Próximos' é uma mão na roda!",
    timestamp: "6h",
    stats: { likes: 892, comments: 78, shares: 45 },
    media: [{ type: "video", url: "/placeholder-oww0g.png" }],
    isLiked: true,
    isSaved: false,
  },
]

const mockPostsFollowing: Post[] = [
  {
    id: "4",
    user: {
      name: "Luna Rodriguez",
      username: "lunadesign",
      avatar: "/latina-designer.png",
      verified: true,
      plan: "Diamond",
      location: "São Paulo, BR",
    },
    content: "Novo tutorial de design responsivo no meu perfil! Dê uma olhada e me diga o que achou. #DesignTips",
    timestamp: "1h",
    stats: { likes: 300, comments: 50, shares: 20 },
    isLiked: true,
    isSaved: false,
  },
  {
    id: "5",
    user: {
      name: "João Silva",
      username: "joaodev",
      avatar: "/young-developer-man.png", // Reusing existing avatar
      verified: false,
      plan: "Gold",
      location: "Curitiba, BR",
    },
    content: "Acabei de lançar um novo projeto open-source no GitHub! Link na bio. #OpenSource #Coding",
    timestamp: "3h",
    stats: { likes: 180, comments: 30, shares: 10 },
    isLiked: false,
    isSaved: true,
  },
]

const mockPostsExplore: Post[] = [
  {
    id: "6",
    user: {
      name: "Tech Insights",
      username: "techinsights",
      avatar: "/placeholder.svg",
      verified: true,
      plan: "Free",
      location: "Global",
    },
    content: "As 5 tendências de IA que você precisa conhecer em 2025. Artigo completo no nosso blog! #AI #FutureTech",
    timestamp: "5h",
    stats: { likes: 500, comments: 100, shares: 60 },
    media: [{ type: "image", url: "/modern-portfolio-bento.png" }],
    isLiked: false,
    isSaved: false,
  },
  {
    id: "7",
    user: {
      name: "Artistic Visions",
      username: "artvisions",
      avatar: "/creative-woman-artist.png", // Reusing existing avatar
      verified: false,
      plan: "Free",
      location: "New York, US",
    },
    content: "Galeria de arte digital inspiradora. Qual a sua peça favorita? #DigitalArt #Inspiration",
    timestamp: "7h",
    stats: { likes: 700, comments: 120, shares: 80 },
    media: [{ type: "image", url: "/placeholder-oww0g.png" }],
    isLiked: true,
    isSaved: true,
  },
]

export function MainTimeline({ currentMainContent, onViewChange, activeTab, onTabChange }: MainTimelineProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [postContent, setPostContent] = useState("")
  const [postVisibility, setPostVisibility] = useState<"public" | "friends" | "private">("public")

  // Simulate loading posts based on active tab
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      let loadedPosts: Post[] = []
      if (activeTab === "for-you") {
        loadedPosts = mockPostsForYou
      } else if (activeTab === "following") {
        loadedPosts = mockPostsFollowing
      } else if (activeTab === "explore") {
        loadedPosts = mockPostsExplore
      }
      setPosts(loadedPosts)
      setIsLoading(false)
    }, 500) // Shorter loading for tab switching

    return () => clearTimeout(timer)
  }, [activeTab])

  const handlePublish = () => {
    if (postContent.trim()) {
      console.log("Publishing post:", postContent)
      setPostContent("")
    }
  }

  const getVisibilityIcon = () => {
    switch (postVisibility) {
      case "public":
        return <Globe className="w-4 h-4" />
      case "friends":
        return <Users className="w-4 h-4" />
      case "private":
        return <Lock className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getVisibilityLabel = () => {
    switch (postVisibility) {
      case "public":
        return "Público"
      case "friends":
        return "Amigos"
      case "private":
        return "Privado"
      default:
        return "Público"
    }
  }

  const renderContent = () => {
    switch (currentMainContent) {
      case "timeline":
        return (
          <>
            {/* Post Creation Area */}
            <div
              id="post-creation-area"
              className="mb-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 animate-slide-in-from-top"
            >
              <div className="flex gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-gray-200 dark:ring-white/10 flex-shrink-0">
                  <AvatarImage src="/professional-woman-designer.png" />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    SC
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <Textarea
                    placeholder="O que está acontecendo? ✨"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="bg-transparent border-none text-lg p-0 focus-visible:ring-0 placeholder:text-gray-500 dark:placeholder:text-white/50 resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-300 rounded-full"
                      >
                        <Camera className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-300 rounded-full"
                      >
                        <Video className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-300 rounded-full"
                      >
                        <Mic className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all duration-300 rounded-full"
                      >
                        <BarChart2 className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Seletor de Visibilidade */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-full px-3 py-2 text-sm text-gray-700 dark:text-white/80 hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                          >
                            {getVisibilityIcon()}
                            <span className="hidden sm:inline">{getVisibilityLabel()}</span>
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-2"
                        >
                          <DropdownMenuItem
                            onClick={() => setPostVisibility("public")}
                            className="flex items-center gap-2 rounded-xl"
                          >
                            <Globe className="w-4 h-4" />
                            Público
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setPostVisibility("friends")}
                            className="flex items-center gap-2 rounded-xl"
                          >
                            <Users className="w-4 h-4" />
                            Amigos
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setPostVisibility("private")}
                            className="flex items-center gap-2 rounded-xl"
                          >
                            <Lock className="w-4 h-4" />
                            Privado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        onClick={handlePublish}
                        disabled={!postContent.trim()}
                        className="rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 hover:shadow-lg"
                      >
                        Publicar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation - Rola junto com o conteúdo */}
            <div className="mb-6">
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-full p-1 shadow-sm">
                <div className="flex gap-1 justify-center">
                  {[
                    { key: "for-you", label: "Para Você" },
                    { key: "following", label: "Seguindo" },
                    { key: "explore", label: "Explorar" },
                  ].map((tab) => (
                    <Button
                      key={tab.key}
                      variant="ghost"
                      onClick={() => onTabChange(tab.key as "for-you" | "following" | "explore")}
                      className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-bold rounded-full transition-all duration-300 whitespace-nowrap ${
                        activeTab === tab.key
                          ? "bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-500 dark:text-white/60 hover:bg-white/60 dark:hover:bg-white/15"
                      }`}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => <PostSkeleton key={index} />)
                : posts.map((post, index) => (
                    <div
                      key={post.id}
                      className="animate-slide-in-from-top"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <PostCard post={post} />
                    </div>
                  ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center mt-12">
              <Button
                variant="outline"
                className="rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-purple-300 dark:hover:border-purple-400/30 transition-all duration-300 px-8 py-3"
              >
                Carregar Mais Histórias
              </Button>
            </div>
          </>
        )
      case "who-to-follow":
        return (
          <div className="animate-slide-in-from-top">
            <Button
              variant="ghost"
              onClick={() => onViewChange("timeline")}
              className="mb-4 text-gray-500 dark:text-white/60 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Feed
            </Button>
            <WhoToFollowCard />
          </div>
        )
      case "trending-topics":
        return (
          <div className="animate-slide-in-from-top">
            <Button
              variant="ghost"
              onClick={() => onViewChange("timeline")}
              className="mb-4 text-gray-500 dark:text-white/60 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Feed
            </Button>
            <TrendingTopicsCard />
          </div>
        )
      case "upcoming-events":
        return (
          <div className="animate-slide-in-from-top">
            <Button
              variant="ghost"
              onClick={() => onViewChange("timeline")}
              className="mb-4 text-gray-500 dark:text-white/60 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Feed
            </Button>
            <UpcomingEventsCard />
          </div>
        )
      case "user-profile":
        return (
          <div className="animate-slide-in-from-top p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm">
            <Button
              variant="ghost"
              onClick={() => onViewChange("timeline")}
              className="mb-4 text-gray-500 dark:text-white/60 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Feed
            </Button>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Página de Perfil</h2>
            <p className="text-gray-700 dark:text-white/80">Conteúdo da página de perfil virá aqui.</p>
          </div>
        )
      case "notifications":
      case "messages":
      case "saved-items":
      case "settings":
      case "support":
      case "stats":
        return (
          <div className="animate-slide-in-from-top p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm">
            <Button
              variant="ghost"
              onClick={() => onViewChange("timeline")}
              className="mb-4 text-gray-500 dark:text-white/60 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Feed
            </Button>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {currentMainContent === "notifications"
                ? "Notificações"
                : currentMainContent === "messages"
                  ? "Mensagens"
                  : currentMainContent === "saved-items"
                    ? "Itens Salvos"
                    : currentMainContent === "settings"
                      ? "Configurações"
                      : currentMainContent === "support"
                        ? "Suporte"
                        : currentMainContent === "stats"
                          ? "Estatísticas"
                          : "Página"}
            </h2>
            <p className="text-gray-700 dark:text-white/80">Conteúdo para {currentMainContent} virá aqui.</p>
          </div>
        )
      default:
        return null
    }
  }

  return <div className="w-full min-w-0">{renderContent()}</div>
}
