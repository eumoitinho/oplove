"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface UpcomingEventsCardProps {
  className?: string
  onViewChange?: (view: string) => void
}

const upcomingEvents = [
  { name: "Meetup de Design", location: "São Paulo, BR", date: "25 de Jul" },
  { name: "Hackathon OpenSource", location: "Online", date: "01 de Ago" },
]

export function UpcomingEventsCard({ className, onViewChange }: UpcomingEventsCardProps) {
  return (
    <div
      className={`bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Eventos Próximos</h3>
          <p className="text-sm text-gray-500 dark:text-white/60">Participe e conecte-se</p>
        </div>
      </div>
      <div className="space-y-4">
        {upcomingEvents.map((event) => (
          <div
            key={event.name}
            className="flex items-center gap-4 p-3 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 border border-gray-100 dark:border-white/5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 flex flex-col items-center justify-center text-cyan-700 dark:text-cyan-300 font-bold">
              <span className="text-xs">{event.date.split(" ")[1]}</span>
              <span className="text-lg -mt-1">{event.date.split(" ")[0]}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{event.name}</p>
              <p className="text-sm text-gray-500 dark:text-white/60">{event.location}</p>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        onClick={() => onViewChange?.("upcoming-events")}
        className="w-full mt-4 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-2xl transition-all duration-300"
      >
        Ver todos eventos
      </Button>
    </div>
  )
}
