"use client"

import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  attendees: number
  category: string
  isPremium?: boolean
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Encontro Social SP",
    date: "15 Fev",
    time: "20:00",
    location: "São Paulo, SP",
    attendees: 45,
    category: "Social",
    isPremium: false
  },
  {
    id: "2",
    title: "Workshop Relacionamentos",
    date: "18 Fev",
    time: "19:00",
    location: "Online",
    attendees: 120,
    category: "Educacional",
    isPremium: true
  },
  {
    id: "3",
    title: "Speed Dating RJ",
    date: "22 Fev",
    time: "21:00",
    location: "Rio de Janeiro, RJ",
    attendees: 30,
    category: "Dating",
    isPremium: false
  }
]

export function EventsSidebar() {
  return (
    <Card className="border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Próximos Eventos
          </div>
          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
            Ver todos
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockEvents.map((event) => (
          <div
            key={event.id}
            className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm group-hover:text-purple-600 transition-colors">
                {event.title}
              </h3>
              {event.isPremium && (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-xs">
                  Premium
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{event.date}</span>
                <Clock className="w-3 h-3 ml-2" />
                <span>{event.time}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{event.location}</span>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{event.attendees} confirmados</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {event.category}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full mt-4 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          Criar Evento
        </Button>
      </CardContent>
    </Card>
  )
}