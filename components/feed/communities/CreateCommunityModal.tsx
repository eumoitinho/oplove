"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Camera, 
  Image as ImageIcon, 
  AlertCircle,
  Sparkles,
  Diamond
} from "lucide-react"
import { CommunitiesService } from "@/lib/services/communities-service"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Community, CommunityCategory, CommunityType } from "@/types/community"

interface CreateCommunityModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (community: Community) => void
}

export function CreateCommunityModal({ open, onClose, onSuccess }: CreateCommunityModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "lifestyle" as CommunityCategory,
    type: "public" as CommunityType,
    rules: "",
    requires_approval: false,
    min_age: 18,
    is_nsfw: false,
    avatar_url: "",
    banner_url: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Nome e descrição são obrigatórios")
      return
    }

    if (formData.name.length < 3 || formData.name.length > 50) {
      toast.error("O nome deve ter entre 3 e 50 caracteres")
      return
    }

    if (formData.description.length < 10 || formData.description.length > 500) {
      toast.error("A descrição deve ter entre 10 e 500 caracteres")
      return
    }

    setLoading(true)

    try {
      const result = await CommunitiesService.createCommunity(formData)
      
      if (result.success && result.data) {
        onSuccess(result.data)
        onClose()
        // Reset form
        setFormData({
          name: "",
          description: "",
          category: "lifestyle",
          type: "public",
          rules: "",
          requires_approval: false,
          min_age: 18,
          is_nsfw: false,
          avatar_url: "",
          banner_url: ""
        })
      } else {
        toast.error(result.error || "Erro ao criar comunidade")
      }
    } catch (error) {
      toast.error("Erro ao criar comunidade")
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = [
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
    { 
      value: "public", 
      label: "Pública",
      description: "Qualquer pessoa pode ver e participar"
    },
    { 
      value: "private", 
      label: "Privada",
      description: "Qualquer pessoa pode ver, mas precisa de aprovação para participar"
    },
    { 
      value: "secret", 
      label: "Secreta",
      description: "Apenas membros podem ver e participar"
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Diamond className="w-6 h-6 text-cyan-500" />
            Criar Nova Comunidade
          </DialogTitle>
          <DialogDescription>
            Crie uma comunidade para conectar pessoas com interesses em comum
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Avatar da Comunidade</Label>
              <div className="relative group">
                <div className="w-full h-32 rounded-2xl bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Clique para adicionar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Banner da Comunidade</Label>
              <div className="relative group">
                <div className="w-full h-32 rounded-2xl bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                  {formData.banner_url ? (
                    <img 
                      src={formData.banner_url} 
                      alt="Banner" 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Clique para adicionar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Comunidade *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Amantes de Fotografia"
                className="rounded-xl"
                maxLength={50}
              />
              <p className="text-xs text-gray-500">{formData.name.length}/50</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v as CommunityCategory })}
              >
                <SelectTrigger id="category" className="rounded-xl">
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
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva sobre o que é sua comunidade..."
              className="rounded-xl min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{formData.description.length}/500</p>
          </div>

          {/* Type */}
          <div className="space-y-3">
            <Label>Tipo de Comunidade *</Label>
            <div className="space-y-2">
              {typeOptions.map(option => (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    formData.type === option.value
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-white/10 hover:border-purple-300"
                  )}
                >
                  <input
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={formData.type === option.value}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CommunityType })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                    <p className="text-sm text-gray-600 dark:text-white/60">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <Label htmlFor="rules">Regras da Comunidade</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder="Defina as regras para os membros..."
              className="rounded-xl min-h-[80px]"
            />
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="approval">Exigir aprovação</Label>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  Novos membros precisam ser aprovados
                </p>
              </div>
              <Switch
                id="approval"
                checked={formData.requires_approval}
                onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="nsfw">Conteúdo adulto (+18)</Label>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  Marque se a comunidade tem conteúdo adulto
                </p>
              </div>
              <Switch
                id="nsfw"
                checked={formData.is_nsfw}
                onCheckedChange={(checked) => setFormData({ ...formData, is_nsfw: checked })}
              />
            </div>

            {formData.is_nsfw && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium mb-1">Aviso sobre conteúdo adulto</p>
                    <p>Comunidades +18 devem seguir as diretrizes da plataforma. Conteúdo ilegal resultará em banimento imediato.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Criar Comunidade
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}