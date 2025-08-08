"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Calendar, MapPin, Users, Ticket, Upload, X, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/useAuth"
import { EventsService } from "@/lib/services/events-service"
import { useToast } from "@/hooks/useToast"
// Event categories as constants

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: () => void
}

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [monthlyEventCount, setMonthlyEventCount] = useState(0)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "social" as EventCategory,
    event_type: "public" as "public" | "private",
    banner_url: "",
    start_date: "",
    end_date: "",
    location_type: "in_person" as "online" | "in_person",
    location_address: "",
    location_url: "",
    max_participants: "",
    is_paid: false,
    ticket_price: ""
  })

  // Check monthly event count for GOLD users
  useState(() => {
    if (user && user.premium_type === "gold" && !user.is_verified) {
      EventsService.getUserMonthlyEventCount(user.id).then(count => {
        setMonthlyEventCount(count)
      })
    }
  })

  const canCreatePaidEvents = user && ["diamond", "couple"].includes(user.premium_type)
  const isGoldLimited = user && user.premium_type === "gold" && !user.is_verified && monthlyEventCount >= 3

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      showToast("Você precisa estar logado para criar eventos", "error")
      return
    }

    if (user.premium_type === "free") {
      showToast("Usuários FREE não podem criar eventos. Faça upgrade!", "error")
      return
    }

    if (isGoldLimited) {
      showToast("Você atingiu o limite de 3 eventos por mês. Verifique sua conta!", "error")
      return
    }

    setIsSubmitting(true)

    try {
      const eventData = {
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        ticket_price: formData.is_paid && formData.ticket_price ? parseFloat(formData.ticket_price) : undefined,
        banner_url: bannerPreview || undefined
      }

      const result = await EventsService.createEvent(eventData)

      if (result.success) {
        showToast("Evento criado com sucesso!", "success")
        onEventCreated()
        onClose()
        resetForm()
      } else {
        showToast(result.error || "Erro ao criar evento", "error")
      }
    } catch (error) {
      showToast("Erro ao criar evento", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "social",
      event_type: "public",
      banner_url: "",
      start_date: "",
      end_date: "",
      location_type: "in_person",
      location_address: "",
      location_url: "",
      max_participants: "",
      is_paid: false,
      ticket_price: ""
    })
    setBannerPreview(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload to storage
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Minimum date is now
  const minDateTime = new Date().toISOString().slice(0, 16)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Criar Novo Evento</DialogTitle>
        </DialogHeader>

        {/* Business Rules Alerts */}
        {user?.premium_type === "gold" && !user.is_verified && (
          <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Conta não verificada:</strong> Você pode criar até 3 eventos por mês ({monthlyEventCount}/3 criados).
              Verifique sua conta para eventos ilimitados!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Upload */}
          <div>
            <Label>Banner do Evento</Label>
            <div className="mt-2">
              {bannerPreview ? (
                <div className="relative group">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={() => setBannerPreview(null)}
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Clique para fazer upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Evento *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Meetup de React"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as EventCategory })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="sports">Esportes</SelectItem>
                  <SelectItem value="music">Música</SelectItem>
                  <SelectItem value="business">Negócios</SelectItem>
                  <SelectItem value="education">Educação</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva seu evento..."
              rows={4}
              required
              className="mt-1"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data/Hora de Início *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                min={minDateTime}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="end_date">Data/Hora de Término *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date || minDateTime}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Tipo de Local</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="in_person"
                    checked={formData.location_type === "in_person"}
                    onChange={(e) => setFormData({ ...formData, location_type: e.target.value as "in_person" | "online" })}
                    className="text-purple-600"
                  />
                  <span>Presencial</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="online"
                    checked={formData.location_type === "online"}
                    onChange={(e) => setFormData({ ...formData, location_type: e.target.value as "in_person" | "online" })}
                    className="text-purple-600"
                  />
                  <span>Online</span>
                </label>
              </div>
            </div>

            {formData.location_type === "in_person" ? (
              <div>
                <Label htmlFor="location_address">Endereço</Label>
                <Input
                  id="location_address"
                  value={formData.location_address}
                  onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                  placeholder="Ex: Rua das Flores, 123 - São Paulo/SP"
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="location_url">Link do Evento Online</Label>
                <Input
                  id="location_url"
                  type="url"
                  value={formData.location_url}
                  onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Event Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-500" />
                <Label htmlFor="private-event" className="cursor-pointer">
                  Evento Privado
                </Label>
              </div>
              <Switch
                id="private-event"
                checked={formData.event_type === "private"}
                onCheckedChange={(checked) => setFormData({ ...formData, event_type: checked ? "private" : "public" })}
              />
            </div>

            <div>
              <Label htmlFor="max_participants">Limite de Participantes (opcional)</Label>
              <Input
                id="max_participants"
                type="number"
                min="2"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                placeholder="Deixe vazio para ilimitado"
                className="mt-1"
              />
            </div>

            {/* Paid Events - Diamond+ only */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-gray-500" />
                  <Label htmlFor="paid-event" className="cursor-pointer">
                    Evento Pago
                  </Label>
                </div>
                <Switch
                  id="paid-event"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                  disabled={!canCreatePaidEvents}
                />
              </div>
              
              {!canCreatePaidEvents && (
                <p className="text-xs text-gray-500">
                  Apenas usuários Diamond ou Couple podem criar eventos pagos
                </p>
              )}

              {formData.is_paid && canCreatePaidEvents && (
                <div>
                  <Label htmlFor="ticket_price">Valor do Ingresso (R$)</Label>
                  <Input
                    id="ticket_price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.ticket_price}
                    onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                    placeholder="0.00"
                    required={formData.is_paid}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isSubmitting || isGoldLimited}
            >
              {isSubmitting ? "Criando..." : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}