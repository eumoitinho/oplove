"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Ticket, Star, Gem, Crown } from "lucide-react"
import type { Event } from "@/types/database.types"
import { cn } from "@/lib/utils"
import { PremiumTooltip } from "@/components/common/PremiumTooltip"
import Image from "next/image"

interface EventCardProps {
  event: Event
  onViewDetails: (event: Event) => void
  onJoin?: (eventId: string) => void
  onLeave?: (eventId: string) => void
  isJoining?: boolean
}

export function EventCard({ event, onViewDetails, onJoin, onLeave, isJoining = false }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
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

  const isEventPast = new Date(event.end_date) < new Date()
  const isEventFull = event.max_participants ? event.current_participants >= event.max_participants : false

  return (
    <div className={cn(
      "bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10",
      "rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300",
      "hover:bg-white/90 dark:hover:bg-white/10 group cursor-pointer",
      isEventPast && "opacity-75"
    )}>
      {/* Banner Image */}
      {event.banner_url && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={event.banner_url}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Category Badge */}
          <Badge className={cn("absolute top-4 left-4", getCategoryColor(event.category))}>
            {getCategoryLabel(event.category)}
          </Badge>

          {/* Event Type Badge */}
          <Badge className="absolute top-4 right-4 bg-black/50 text-white border-none">
            {event.event_type === "private" ? "Privado" : "Público"}
          </Badge>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 line-clamp-2">
              {event.name}
            </h3>
            
            {/* Host Info */}
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={event.user?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {event.user?.full_name?.charAt(0) || event.user?.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  por @{event.user?.username}
                </span>
                {event.user?.is_verified && (
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                )}
                {getPlanIcon(event.user?.premium_type || "free")}
              </div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.start_date)}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>
              {event.location_type === "online" 
                ? "Evento Online" 
                : event.location_address || "Local a definir"}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>
              {event.current_participants}
              {event.max_participants && ` / ${event.max_participants}`} participantes
            </span>
            {isEventFull && (
              <Badge variant="secondary" className="text-xs">
                Lotado
              </Badge>
            )}
          </div>

          {/* Price */}
          {event.is_paid && (
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
              <Ticket className="w-4 h-4" />
              <span>R$ {event.ticket_price?.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(event)
            }}
            variant="outline"
            className="flex-1 rounded-full"
          >
            Ver Detalhes
          </Button>
          
          {!isEventPast && !event.is_owner && (
            event.is_participating ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onLeave?.(event.id)
                }}
                variant="secondary"
                className="flex-1 rounded-full"
                disabled={isJoining}
              >
                Cancelar Participação
              </Button>
            ) : (
              <PremiumTooltip feature="events">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onJoin?.(event.id)
                  }}
                  className="flex-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isJoining || isEventFull}
                >
                  {isEventFull ? "Evento Lotado" : "Participar"}
                </Button>
              </PremiumTooltip>
            )
          )}

          {event.is_owner && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Seu Evento
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}