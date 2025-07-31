"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, Flame } from "lucide-react"
import type { AdultEvent } from "@/types/adult"

interface AdultEventsCardProps {
  onViewChange?: (view: string) => void
}

// Mock data para eventos adultos
const MOCK_ADULT_EVENTS: AdultEvent[] = [
  {
    id: "1",
    title: "Festa Swing Premium",
    description: "Evento exclusivo para casais experientes",
    type: "swing_party",
    location: {
      latitude: -23.5505,
      longitude: -46.6333,
      city: "São Paulo",
      state: "SP",
      country: "BR",
      visibility: 'public' as const
    },
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 6,
    max_participants: 40,
    current_participants: 28,
    age_restriction: { min: 25, max: 55 },
    gender_restrictions: ["couple_mw"],
    requirements: ["swing", "couples"],
    price: 150,
    is_private: false,
    requires_verification: true,
    host: {
      id: "host1",
      username: "clubeswing_sp",
      avatar_url: "/placeholder.svg?height=40&width=40&text=CS",
      is_verified: true,
      rating: 4.8
    },
    images: ["/placeholder.svg?height=200&width=300&text=Swing+Party"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "Noite BDSM",
    description: "Workshop e prática para iniciantes e experientes",
    type: "bdsm_session",
    location: {
      latitude: -22.9068,
      longitude: -43.1729,
      city: "Rio de Janeiro",
      state: "RJ",
      country: "BR",
      visibility: 'public' as const
    },
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 4,
    max_participants: 20,
    current_participants: 15,
    age_restriction: { min: 21 },
    gender_restrictions: ["man", "woman", "couple_mw"],
    requirements: ["bdsm"],
    price: 80,
    is_private: false,
    requires_verification: true,
    host: {
      id: "host2",
      username: "dungeon_rj",
      avatar_url: "/placeholder.svg?height=40&width=40&text=DR",
      is_verified: true,
      rating: 4.9
    },
    images: ["/placeholder.svg?height=200&width=300&text=BDSM+Night"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Gang Bang Feminino",
    description: "Evento exclusivo focado no prazer feminino",
    type: "gang_bang",
    location: {
      latitude: -25.4284,
      longitude: -49.2733,
      city: "Curitiba",
      state: "PR",
      country: "BR",
      visibility: 'private' as const
    },
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 3,
    max_participants: 8,
    current_participants: 6,
    age_restriction: { min: 23, max: 45 },
    gender_restrictions: ["woman", "man"],
    requirements: ["group"],
    is_private: true,
    requires_verification: true,
    host: {
      id: "host3",
      username: "party_cwb",
      avatar_url: "/placeholder.svg?height=40&width=40&text=PC",
      is_verified: true,
      rating: 4.7
    },
    images: ["/placeholder.svg?height=200&width=300&text=GB+Event"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const EVENT_TYPE_LABELS = {
  'party': 'Festa',
  'orgy': 'Orgia',
  'gang_bang': 'Gang Bang',
  'swing_party': 'Festa Swing',
  'bdsm_session': 'Sessão BDSM',
  'menage': 'Ménage',
  'group_sex': 'Sexo em Grupo',
  'exhibition': 'Exibição',
  'roleplay_session': 'Roleplay',
  'tantric_workshop': 'Workshop Tântrico',
  'fetish_party': 'Festa Fetiche',
  'couples_night': 'Noite de Casais',
  'singles_mixer': 'Encontro Singles',
  'polyamory_meetup': 'Encontro Poliamoroso',
  'kink_workshop': 'Workshop Kink',
  'adult_education': 'Educação Sexual'
}

export function AdultEventsCard({ onViewChange }: AdultEventsCardProps) {
  const [events, setEvents] = useState<AdultEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de eventos
    const loadEvents = async () => {
      try {
        // Aqui viria a chamada real da API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setEvents(MOCK_ADULT_EVENTS)
      } catch (error) {
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-6 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            Eventos
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange?.("events")}
          className="text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
        >
          Ver todos
        </Button>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-white/60">
              Nenhum evento próximo
            </p>
          </div>
        ) : (
          events.slice(0, 3).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group border border-gray-100 dark:border-white/5"
            >
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                    {event.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-white/70 line-clamp-2 mt-1">
                    {event.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge 
                    variant="outline" 
                    className="text-xs px-2 py-0 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300"
                  >
                    {EVENT_TYPE_LABELS[event.type] || event.type}
                  </Badge>
                  {event.requires_verification && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      Verificação
                    </Badge>
                  )}
                  {event.is_private && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      Privado
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60">
                    <Calendar className="w-3 h-3" />
                    {formatDate(event.date)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60">
                    <MapPin className="w-3 h-3" />
                    {event.location.city}, {event.location.state}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60">
                    <Users className="w-3 h-3" />
                    {event.current_participants}/{event.max_participants} participantes
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60">
                    <Clock className="w-3 h-3" />
                    {event.duration_hours}h de duração
                  </div>
                </div>

                {event.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      R$ {event.price}
                    </span>
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7 px-3 rounded-full"
                    >
                      Participar
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {events.length > 0 && (
        <Button
          onClick={() => onViewChange?.("events")}
          variant="outline"
          className="w-full mt-4 rounded-2xl border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
        >
          Ver mais eventos
        </Button>
      )}
    </motion.div>
  )
}