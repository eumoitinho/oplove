"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  MessageCircle, 
  Share2, 
  Edit, 
  Trash2,
  Copy,
  ExternalLink,
  Star,
  Gem,
  Crown,
  CheckCircle
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { EventsService } from "@/lib/services/events-service"
import type { Event, EventParticipant } from "@/types/common"
import { cn } from "@/lib/utils"
import { PremiumTooltip } from "@/components/common/PremiumTooltip"

interface EventDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  onJoin?: (eventId: string) => void
  onLeave?: (eventId: string) => void
  onUpdate?: () => void
}

export function EventDetailsModal({ 
  isOpen, 
  onClose, 
  event, 
  onJoin, 
  onLeave,
  onUpdate 
}: EventDetailsModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (event && isOpen) {
      loadEventDetails()
    }
  }, [event, isOpen])

  const loadEventDetails = async () => {
    if (!event) return
    
    setIsLoadingParticipants(true)
    try {
      const result = await EventsService.getEvent(event.id)
      if (result.success && result.data) {
        setParticipants(result.data.participants || [])
      }
    } catch (error) {
      console.error("Error loading event details:", error)
    } finally {
      setIsLoadingParticipants(false)
    }
  }

  if (!event) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "social":
        return "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400"
      case "sports":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      case "music":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
      case "business":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
      case "education":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "social": return "Social"
      case "sports": return "Esportes"
      case "music": return "Música"
      case "business": return "Negócios"
      case "education": return "Educação"
      default: return "Outros"
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "gold":
        return <Star className="w-3 h-3 text-yellow-500" />
      case "diamond":
        return <Gem className="w-3 h-3 text-cyan-500" />
      case "couple":
        return <Crown className="w-3 h-3 text-pink-500" />
      default:
        return null
    }
  }

  const handleShare = () => {
    const eventUrl = `${window.location.origin}/events/${event.id}`
    navigator.clipboard.writeText(eventUrl)
    showToast("Link do evento copiado!", "success")
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return
    
    setIsDeleting(true)
    try {
      const result = await EventsService.deleteEvent(event.id)
      if (result.success) {
        showToast("Evento excluído com sucesso", "success")
        onClose()
        onUpdate?.()
      } else {
        showToast(result.error || "Erro ao excluir evento", "error")
      }
    } catch (error) {
      showToast("Erro ao excluir evento", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenChat = () => {
    if (event.group_chat_id) {
      // Navigate to messages with the group chat
      window.location.href = `/feed?view=messages&chat=${event.group_chat_id}`
    }
  }

  const isEventPast = new Date(event.end_date) < new Date()
  const isEventFull = event.max_participants ? event.current_participants >= event.max_participants : false
  const canJoin = !isEventPast && !isEventFull && !event.is_owner && !event.is_participating

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Banner */}
        <div className="-m-6 mb-0">
          {event.banner_url ? (
            <div className="relative h-64">
              <img
                src={event.banner_url}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Category and Type Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={cn(getCategoryColor(event.category))}>
                  {getCategoryLabel(event.category)}
                </Badge>
                <Badge className="bg-black/50 text-white border-none">
                  {event.event_type === "private" ? "Privado" : "Público"}
                </Badge>
              </div>

              {/* Event Title on Banner */}
              <div className="absolute bottom-4 left-6 right-6">
                <h2 className="text-3xl font-bold text-white mb-2">{event.name}</h2>
              </div>
            </div>
          ) : (
            <DialogHeader className="p-6">
              <div className="flex items-start justify-between">
                <DialogTitle className="text-3xl font-bold pr-4">{event.name}</DialogTitle>
                <div className="flex gap-2">
                  <Badge className={cn(getCategoryColor(event.category))}>
                    {getCategoryLabel(event.category)}
                  </Badge>
                  <Badge variant="outline">
                    {event.event_type === "private" ? "Privado" : "Público"}
                  </Badge>
                </div>
              </div>
            </DialogHeader>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="participants">
                Participantes ({event.current_participants})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Host Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={event.user?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {event.user?.full_name?.charAt(0) || event.user?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Organizado por</p>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold">@{event.user?.username}</p>
                      {event.user?.is_verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                      {getPlanIcon(event.user?.premium_type || "free")}
                    </div>
                  </div>
                </div>

                {event.is_owner && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {/* TODO: Open edit modal */}}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Sobre o evento</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date & Time */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">Data e Hora</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(event.start_date)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        até {formatDate(event.end_date)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">Local</p>
                      {event.location_type === "online" ? (
                        <>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Evento Online
                          </p>
                          {event.location_url && event.is_participating && (
                            <a
                              href={event.location_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-1"
                            >
                              Acessar evento
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.location_address || "Local a definir"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">Participantes</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.current_participants}
                        {event.max_participants && ` / ${event.max_participants}`} confirmados
                      </p>
                      {isEventFull && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Evento Lotado
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  {event.is_paid && (
                    <div className="flex items-start gap-3">
                      <Ticket className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-semibold">Ingresso</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          R$ {event.ticket_price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>

                {event.is_participating && event.group_chat_id && (
                  <Button
                    variant="outline"
                    onClick={handleOpenChat}
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat do Evento
                  </Button>
                )}

                {!isEventPast && !event.is_owner && (
                  event.is_participating ? (
                    <Button
                      onClick={() => onLeave?.(event.id)}
                      variant="secondary"
                      className="flex-1"
                    >
                      Cancelar Participação
                    </Button>
                  ) : (
                    <PremiumTooltip feature="events">
                      <Button
                        onClick={() => onJoin?.(event.id)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={!canJoin}
                      >
                        {isEventFull ? "Evento Lotado" : "Participar"}
                      </Button>
                    </PremiumTooltip>
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent value="participants" className="mt-6">
              <ScrollArea className="h-[400px]">
                {isLoadingParticipants ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                  </div>
                ) : participants.length > 0 ? (
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={participant.user?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {participant.user?.full_name?.charAt(0) || participant.user?.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">@{participant.user?.username}</p>
                            {participant.user?.is_verified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                            {getPlanIcon(participant.user?.premium_type || "free")}
                          </div>
                          <p className="text-sm text-gray-500">
                            {participant.user?.full_name}
                          </p>
                        </div>
                        {participant.user_id === event.user_id && (
                          <Badge variant="secondary">Organizador</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum participante ainda
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}