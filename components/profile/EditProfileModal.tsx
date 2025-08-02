"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, MapPin, Globe, User, Heart, Tag, X } from "lucide-react"
import { UserService } from "@/lib/services/user-service"
import { toast } from "sonner"
import { User as UserType } from "@/types/common"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserType
  onSuccess?: (updatedUser: UserType) => void
}

const INTERESTS_OPTIONS = [
  "Música", "Filmes", "Esportes", "Viagens", "Gastronomia", 
  "Arte", "Tecnologia", "Moda", "Fotografia", "Leitura",
  "Dança", "Games", "Natureza", "Fitness", "Yoga",
  "Meditação", "Culinária", "Pets", "Astrologia", "Anime"
]

const LOOKING_FOR_OPTIONS = [
  "Amizade", "Relacionamento sério", "Encontro casual",
  "Networking", "Conversar", "Sair para jantar",
  "Parceiro de viagem", "Parceiro de treino"
]

export function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    city: user.city || "",
    state: user.state || "",
    website: user.website || "",
    birth_date: user.birth_date || "",
    gender: user.gender || "prefer_not_say",
    profile_type: user.profile_type || "single",
    interests: user.interests || [],
    looking_for: user.looking_for || [],
  })

  useEffect(() => {
    // Update form when modal opens with fresh user data
    if (isOpen && user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        city: user.city || "",
        state: user.state || "",
        website: user.website || "",
        birth_date: user.birth_date || "",
        gender: user.gender || "prefer_not_say",
        profile_type: user.profile_type || "single",
        interests: user.interests || [],
        looking_for: user.looking_for || [],
      })
    }
  }, [isOpen, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: updatedUser, error } = await UserService.updateUserProfile(
        user.id,
        {
          ...formData,
          location: formData.city && formData.state 
            ? `${formData.city}, ${formData.state}` 
            : formData.location
        }
      )

      if (error) {
        toast.error(error)
        return
      }

      if (updatedUser) {
        toast.success("Perfil atualizado com sucesso!")
        onSuccess?.(updatedUser)
        onClose()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Erro ao atualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const toggleLookingFor = (item: string) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.includes(item)
        ? prev.looking_for.filter(i => i !== item)
        : [...prev.looking_for, item]
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e preferências
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome completo"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Conte um pouco sobre você..."
                rows={4}
                maxLength={500}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/500 caracteres
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Localização
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: São Paulo"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Ex: SP"
                  maxLength={2}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Informações Pessoais
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birth_date">Data de nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gênero</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="non_binary">Não-binário</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                    <SelectItem value="prefer_not_say">Prefiro não dizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="profile_type">Tipo de perfil</Label>
              <Select
                value={formData.profile_type}
                onValueChange={(value) => setFormData({ ...formData, profile_type: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Solteiro(a)</SelectItem>
                  <SelectItem value="couple">Casal</SelectItem>
                  <SelectItem value="trans">Trans</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://seusite.com"
                className="mt-2"
              />
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Interesses
            </h3>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.interests.includes(interest)
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Procurando por
            </h3>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleLookingFor(item)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.looking_for.includes(item)
                      ? "bg-pink-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}