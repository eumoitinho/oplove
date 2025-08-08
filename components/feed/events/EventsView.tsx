"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  AlertCircle,
  Users,
  Crown,
  Lock
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { EventsService } from "@/lib/services/events-service"
import { EventCard } from "./EventCard"
import { CreateEventModal } from "./CreateEventModal"
import { EventDetailsModal } from "./EventDetailsModal"
import type { Event } from "@/types/database.types"
import { cn } from "@/lib/utils"
import { PremiumTooltip } from "@/components/common/PremiumTooltip"

export function EventsView() {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  // State
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"upcoming" | "my-events" | "past">("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | "all">("all")
  const [locationTypeFilter, setLocationTypeFilter] = useState<"all" | "online" | "in_person">("all")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  
  // Loading states
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null)

  // Check if user can create events
  const canCreateEvents = user && user.premium_type !== "free"
  const isGoldUnverified = user && user.premium_type === "gold" && !user.is_verified

  useEffect(() => {
    loadEvents()
  }, [activeTab, categoryFilter, locationTypeFilter, currentPage])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 12,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        location_type: locationTypeFilter === "all" ? undefined : locationTypeFilter,
        search: searchQuery || undefined,
        upcoming_only: activeTab === "upcoming",
        user_events: activeTab === "my-events",
        user_id: activeTab === "my-events" ? user?.id : undefined
      }

      const result = await EventsService.getEvents(params)
      
      if (currentPage === 1) {
        setEvents(result.data)
      } else {
        setEvents(prev => [...prev, ...result.data])
      }
      
      setTotalPages(result.pagination.totalPages)
      setHasMore(currentPage < result.pagination.totalPages)
    } catch (error) {
      console.error("Error loading events:", error)
      showToast("Erro ao carregar eventos", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadEvents()
  }

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      showToast("Você precisa estar logado para participar", "error")
      return
    }

    if (user.premium_type === "free") {
      showToast("Usuários FREE não podem participar de eventos. Faça upgrade!", "error")
      return
    }

    setJoiningEventId(eventId)
    try {
      const result = await EventsService.joinEvent(eventId)
      if (result.success) {
        showToast("Você está participando do evento!", "success")
        loadEvents() // Reload to update participation status
      } else {
        showToast(result.error || "Erro ao participar do evento", "error")
      }
    } catch (error) {
      showToast("Erro ao participar do evento", "error")
    } finally {
      setJoiningEventId(null)
    }
  }

  const handleLeaveEvent = async (eventId: string) => {
    if (!confirm("Tem certeza que deseja cancelar sua participação?")) return

    setJoiningEventId(eventId)
    try {
      const result = await EventsService.leaveEvent(eventId)
      if (result.success) {
        showToast("Participação cancelada", "success")
        loadEvents()
      } else {
        showToast(result.error || "Erro ao cancelar participação", "error")
      }
    } catch (error) {
      showToast("Erro ao cancelar participação", "error")
    } finally {
      setJoiningEventId(null)
    }
  }

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event)
    setIsDetailsModalOpen(true)
  }

  const getCategoryOptions = () => [
    { value: "all", label: "Todas as categorias" },
    { value: "social", label: "Social" },
    { value: "sports", label: "Esportes" },
    { value: "music", label: "Música" },
    { value: "business", label: "Negócios" },
    { value: "education", label: "Educação" },
    { value: "other", label: "Outros" }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Eventos</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">Participe e conecte-se com a comunidade</p>
            </div>
          </div>

          <PremiumTooltip feature="events">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Evento
            </Button>
          </PremiumTooltip>
        </div>

        {/* Premium Alerts */}
        {user && user.premium_type === "free" && (
          <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Usuários FREE não podem criar ou participar de eventos.</strong> Faça upgrade para um plano premium e participe de eventos incríveis!
            </AlertDescription>
          </Alert>
        )}

        {isGoldUnverified && (
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Conta não verificada:</strong> Você pode criar até 3 eventos por mês. Verifique sua conta para eventos ilimitados!
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-full"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as EventCategory | "all")}>
            <SelectTrigger className="w-full md:w-[200px] bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-full">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {getCategoryOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={locationTypeFilter} onValueChange={(value) => setLocationTypeFilter(value as "all" | "online" | "in_person")}>
            <SelectTrigger className="w-full md:w-[150px] bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-full">
              <SelectValue placeholder="Local" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os locais</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in_person">Presencial</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" className="rounded-full">
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
        </form>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value as typeof activeTab)
        setCurrentPage(1)
      }}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="my-events">
            Meus Eventos
            {user && (
              <Badge variant="secondary" className="ml-2">
                <Users className="w-3 h-3" />
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Passados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading && currentPage === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl h-96 animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-3xl" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewDetails={handleViewDetails}
                    onJoin={handleJoinEvent}
                    onLeave={handleLeaveEvent}
                    isJoining={joiningEventId === event.id}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    variant="outline"
                    className="rounded-full"
                    disabled={loading}
                  >
                    {loading ? "Carregando..." : "Carregar Mais"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {activeTab === "my-events" 
                  ? "Você ainda não está participando de nenhum evento"
                  : "Nenhum evento encontrado"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {activeTab === "my-events"
                  ? "Explore os eventos disponíveis e participe!"
                  : "Tente ajustar os filtros ou criar um novo evento"}
              </p>
              {activeTab === "my-events" && (
                <Button
                  onClick={() => setActiveTab("upcoming")}
                  variant="outline"
                  className="rounded-full"
                >
                  Explorar Eventos
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={() => {
          setCurrentPage(1)
          loadEvents()
        }}
      />

      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
        onJoin={handleJoinEvent}
        onLeave={handleLeaveEvent}
        onUpdate={() => {
          setCurrentPage(1)
          loadEvents()
        }}
      />
    </div>
  )
}