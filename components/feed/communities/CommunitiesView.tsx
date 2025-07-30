"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  TrendingUp,
  Compass,
  Search,
  Plus,
  Lock,
  Filter,
  Sparkles,
  Crown,
  Diamond,
  AlertCircle
} from "lucide-react"
import { CommunityCard } from "./CommunityCard"
import { CreateCommunityModal } from "./CreateCommunityModal"
import { CommunityDetailsModal } from "./CommunityDetailsModal"
import { CommunitiesService } from "@/lib/services/communities-service"
import { useAuth } from "@/hooks/useAuth"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PaywallTooltip } from "@/components/common/PaywallTooltip"
import type { Community, CommunityCategory, CommunityType } from "@/types/community"

export function CommunitiesView() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"discover" | "my-communities" | "trending">("discover")
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | "all">("all")
  const [selectedType, setSelectedType] = useState<CommunityType | "all">("all")
  const [sortBy, setSortBy] = useState<"trending" | "recent" | "members" | "posts">("trending")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)

  // Check if user can create communities
  const canCreateCommunities = user?.premium_type === "diamond" || user?.premium_type === "couple"
  const canJoinCommunities = user?.premium_type !== "free"

  // Fetch function for infinite scroll
  const fetchCommunities = useCallback(async (pageNum: number) => {
    try {
      const response = await CommunitiesService.fetchCommunities({
        page: pageNum,
        limit: 20,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        type: selectedType === "all" ? undefined : selectedType,
        search: search || undefined,
        myCommunitiesOnly: activeTab === "my-communities",
        sortBy: activeTab === "trending" ? "trending" : sortBy
      })

      return {
        data: response.data,
        hasMore: response.hasMore,
        total: response.total
      }
    } catch (error) {
      toast.error("Erro ao carregar comunidades")
      return { data: [], hasMore: false }
    }
  }, [activeTab, selectedCategory, selectedType, search, sortBy])

  // Infinite scroll
  const {
    data: scrollCommunities,
    loading: scrollLoading,
    hasMore,
    containerRef,
    refresh
  } = useInfiniteScroll({
    fetchFn: fetchCommunities,
    limit: 20,
    enabled: true,
    dependencies: [activeTab, selectedCategory, selectedType, search, sortBy]
  })

  // Update local state
  useEffect(() => {
    setCommunities(scrollCommunities)
    setLoading(scrollLoading)
  }, [scrollCommunities, scrollLoading])


  // Handle community created
  const handleCommunityCreated = (community: Community) => {
    setCommunities(prev => [community, ...prev])
    setShowCreateModal(false)
    toast.success("Comunidade criada com sucesso!")
  }

  // Handle join/leave community
  const handleCommunityAction = async (communityId: string, action: "join" | "leave") => {
    // PremiumTooltip will handle the premium check now
    if (action === "leave" || canJoinCommunities) {
      // Proceed with action
    } else {
      // This will be handled by PremiumTooltip
      return
    }

    try {
      const result = action === "join" 
        ? await CommunitiesService.joinCommunity(communityId)
        : await CommunitiesService.leaveCommunity(communityId)

      if (result.success) {
        // Update local state
        setCommunities(prev => prev.map(c => 
          c.id === communityId 
            ? { 
                ...c, 
                is_member: action === "join",
                member_count: c.member_count + (action === "join" ? 1 : -1)
              }
            : c
        ))
        toast.success(action === "join" ? "Você entrou na comunidade!" : "Você saiu da comunidade")
      } else {
        toast.error(result.error || `Erro ao ${action === "join" ? "entrar na" : "sair da"} comunidade`)
      }
    } catch (error) {
      toast.error("Erro ao processar ação")
    }
  }

  const categoryOptions = [
    { value: "all", label: "Todas as categorias" },
    { value: "lifestyle", label: "Estilo de Vida" },
    { value: "relationships", label: "Relacionamentos" },
    { value: "adult", label: "Adulto +18" },
    { value: "lgbtq", label: "LGBTQ+" },
    { value: "fetish", label: "Fetiches" },
    { value: "health", label: "Saúde & Bem-estar" },
    { value: "entertainment", label: "Entretenimento" },
    { value: "education", label: "Educação" },
    { value: "technology", label: "Tecnologia" },
    { value: "other", label: "Outros" }
  ]

  const typeOptions = [
    { value: "all", label: "Todos os tipos" },
    { value: "public", label: "Públicas" },
    { value: "private", label: "Privadas" },
    { value: "secret", label: "Secretas" }
  ]

  const sortOptions = [
    { value: "trending", label: "Em alta" },
    { value: "recent", label: "Mais recentes" },
    { value: "members", label: "Mais membros" },
    { value: "posts", label: "Mais ativas" }
  ]

  // Paywall for free users
  if (user?.premium_type === "free") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex items-center justify-center p-6"
      >
        <div className="max-w-md w-full bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
            <Lock className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Comunidades Premium
            </h2>
            <p className="text-gray-600 dark:text-white/60">
              Participe de comunidades exclusivas e conecte-se com pessoas que compartilham seus interesses
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-left p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
              <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">Plano Gold</p>
                <p className="text-gray-600 dark:text-white/60">Participe de até 5 comunidades</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
              <Diamond className="w-5 h-5 text-cyan-500 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">Plano Diamond+</p>
                <p className="text-gray-600 dark:text-white/60">Comunidades ilimitadas + criar suas próprias</p>
              </div>
            </div>
          </div>

          <Button 
            size="lg"
            className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Fazer Upgrade
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Comunidades
        </h1>
        
        <PaywallTooltip feature="create_groups" customTitle="Criar Comunidade" customDescription="Crie sua própria comunidade no Diamond" requiredPlan="diamond">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar Comunidade
          </Button>
        </PaywallTooltip>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar comunidades..."
            className="pl-10 rounded-full bg-white/80 dark:bg-white/5 border-gray-200 dark:border-white/10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
            <SelectTrigger className="w-[200px] rounded-full bg-white/80 dark:bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
            <SelectTrigger className="w-[150px] rounded-full bg-white/80 dark:bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeTab !== "trending" && (
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[150px] rounded-full bg-white/80 dark:bg-white/5">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-1 shadow-sm"
        >
          <TabsList className="grid w-full grid-cols-3 bg-transparent">
            <TabsTrigger 
              value="discover"
              className="rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <Compass className="w-4 h-4 mr-2" />
              Descobrir
            </TabsTrigger>
            <TabsTrigger 
              value="my-communities"
              className="rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Minhas
            </TabsTrigger>
            <TabsTrigger 
              value="trending"
              className="rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Em Alta
            </TabsTrigger>
          </TabsList>
        </motion.div>

        {/* Communities Grid */}
        <TabsContent value={activeTab} className="mt-6">
          <AnimatePresence mode="wait">
            {loading && communities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-3xl bg-gray-100 dark:bg-white/5 animate-pulse"
                  />
                ))}
              </motion.div>
            ) : communities.length > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {communities.map((community, index) => (
                    <motion.div
                      key={community.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CommunityCard
                        community={community}
                        onJoin={() => handleCommunityAction(community.id, "join")}
                        onLeave={() => handleCommunityAction(community.id, "leave")}
                        onClick={() => setSelectedCommunity(community)}
                        canJoin={canJoinCommunities}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Load more */}
                {hasMore && (
                  <div ref={containerRef} className="py-4 flex justify-center">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10"
              >
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {activeTab === "my-communities" 
                      ? "Você ainda não participa de nenhuma comunidade"
                      : "Nenhuma comunidade encontrada"}
                  </h3>
                  <p className="text-gray-500 dark:text-white/60">
                    {activeTab === "my-communities"
                      ? "Explore e participe de comunidades do seu interesse!"
                      : "Tente ajustar os filtros ou criar uma nova comunidade"}
                  </p>
                  {activeTab === "my-communities" && (
                    <Button
                      onClick={() => setActiveTab("discover")}
                      variant="outline"
                      className="rounded-full"
                    >
                      <Compass className="w-4 h-4 mr-2" />
                      Descobrir Comunidades
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateCommunityModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCommunityCreated}
      />

      {selectedCommunity && (
        <CommunityDetailsModal
          community={selectedCommunity}
          open={!!selectedCommunity}
          onClose={() => setSelectedCommunity(null)}
          onJoin={() => handleCommunityAction(selectedCommunity.id, "join")}
          onLeave={() => handleCommunityAction(selectedCommunity.id, "leave")}
          canJoin={canJoinCommunities}
        />
      )}
    </div>
  )
}