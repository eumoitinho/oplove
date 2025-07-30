"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, CalendarClock, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format, addMinutes, isBefore, isAfter, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface ScheduledDate {
  date: Date
  time: string
}

interface PostSchedulerProps {
  isOpen: boolean
  onClose: () => void
  onSchedule: (scheduledDate: ScheduledDate | null) => void
  currentSchedule?: ScheduledDate | null
  minDate?: Date
  maxDate?: Date
}

const timeSlots = [
  "00:00", "00:30", "01:00", "01:30", "02:00", "02:30",
  "03:00", "03:30", "04:00", "04:30", "05:00", "05:30",
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30",
]

const popularTimes = [
  { time: "08:00", label: "Manhã", icon: "☀️" },
  { time: "12:00", label: "Almoço", icon: "🍽️" },
  { time: "18:00", label: "Fim do dia", icon: "🌆" },
  { time: "20:00", label: "Noite", icon: "🌙" },
]

export function PostScheduler({
  isOpen,
  onClose,
  onSchedule,
  currentSchedule,
  minDate = new Date(),
  maxDate = addMinutes(new Date(), 60 * 24 * 30), // 30 days from now
}: PostSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentSchedule?.date || undefined
  )
  const [selectedTime, setSelectedTime] = useState<string>(
    currentSchedule?.time || "12:00"
  )

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) return

    const [hours, minutes] = selectedTime.split(":").map(Number)
    const scheduledDate = new Date(selectedDate)
    scheduledDate.setHours(hours, minutes, 0, 0)

    // Validate the scheduled date
    if (isBefore(scheduledDate, minDate)) {
      toast.error("A data agendada não pode ser no passado")
      return
    }

    if (isAfter(scheduledDate, maxDate)) {
      toast.error("A data agendada não pode ser mais de 30 dias no futuro")
      return
    }

    onSchedule({
      date: scheduledDate,
      time: selectedTime,
    })
    onClose()
  }

  const handleRemoveSchedule = () => {
    onSchedule(null)
    setSelectedDate(undefined)
    setSelectedTime("12:00")
    onClose()
  }

  const getAvailableTimes = (date: Date | undefined) => {
    if (!date) return timeSlots

    const now = new Date()
    const isToday = format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")

    if (!isToday) return timeSlots

    // Filter out past times for today
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    return timeSlots.filter((time) => {
      const [hour, minute] = time.split(":").map(Number)
      return hour > currentHour || (hour === currentHour && minute > currentMinute)
    })
  }

  const availableTimes = getAvailableTimes(selectedDate)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-purple-600" />
            Agendar Publicação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Schedule */}
          {currentSchedule && (
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-900">Agendado para:</p>
              <p className="text-sm text-purple-700">
                {format(currentSchedule.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveSchedule}
                className="mt-1 h-auto p-0 text-xs text-purple-600 hover:text-purple-700"
              >
                Remover agendamento
              </Button>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-3">
            <Label>Selecione a data</Label>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) =>
                isBefore(date, startOfDay(minDate)) ||
                isAfter(date, endOfDay(maxDate))
              }
              locale={ptBR}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <Label>Selecione o horário</Label>

              {/* Popular Times */}
              <div className="grid grid-cols-2 gap-2">
                {popularTimes.map((popular) => (
                  <Button
                    key={popular.time}
                    variant={selectedTime === popular.time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(popular.time)}
                    disabled={!availableTimes.includes(popular.time)}
                    className="justify-start"
                  >
                    <span className="mr-2">{popular.icon}</span>
                    <span className="flex-1 text-left">{popular.label}</span>
                    <span className="text-xs opacity-70">{popular.time}</span>
                  </Button>
                ))}
              </div>

              {/* Custom Time Select */}
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {time}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Nenhum horário disponível para hoje
                    </div>
                  )}
                </SelectContent>
              </Select>

              {/* Preview */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Será publicado em:</p>
                <p className="text-sm text-gray-600">
                  {format(
                    new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate(),
                      parseInt(selectedTime.split(":")[0]),
                      parseInt(selectedTime.split(":")[1])
                    ),
                    "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </p>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTime}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Agendar
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center">
            <p>Posts agendados serão publicados automaticamente.</p>
            <p>Você pode editar ou cancelar até 5 minutos antes.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}