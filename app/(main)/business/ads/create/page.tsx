"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { businessService } from "@/lib/services/business.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Target, DollarSign, Users, Eye, MousePointer, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

const adCampaignSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  objective: z.enum(["awareness", "traffic", "engagement", "conversions", "app_installs"]),
  total_budget: z.number().min(10, "Orçamento mínimo de R$ 10"),
  daily_budget: z.number().optional(),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  end_date: z.string().min(1, "Data de fim é obrigatória"),
  targeting: z.object({
    demographics: z.object({
      age_min: z.number().min(18).max(65),
      age_max: z.number().min(18).max(65),
      genders: z.array(z.string()).optional(),
    }),
    location: z.object({
      cities: z.array(z.string()).optional(),
      states: z.array(z.string()).optional(),
      radius_km: z.number().optional(),
    }),
    interests: z.array(z.string()).optional(),
    behaviors: z.object({
      verified_only: z.boolean().default(false),
      premium_users_only: z.boolean().default(false),
      active_last_days: z.number().default(30),
    }),
  }),
})

type AdCampaignForm = z.infer<typeof adCampaignSchema>

export default function CreateAdPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")

  const form = useForm<AdCampaignForm>({
    resolver: zodResolver(adCampaignSchema),
    defaultValues: {
      objective: "awareness",
      targeting: {
        demographics: {
          age_min: 18,
          age_max: 65,
          genders: [],
        },
        location: {
          cities: [],
          states: [],
        },
        interests: [],
        behaviors: {
          verified_only: false,
          premium_users_only: false,
          active_last_days: 30,
        },
      },
    },
  })

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      const updatedInterests = [...interests, newInterest.trim()]
      setInterests(updatedInterests)
      form.setValue("targeting.interests", updatedInterests)
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    const updatedInterests = interests.filter(i => i !== interest)
    setInterests(updatedInterests)
    form.setValue("targeting.interests", updatedInterests)
  }

  const onSubmit = async (data: AdCampaignForm) => {
    if (!user?.business_id) {
      toast.error("Você precisa ter um perfil business para criar anúncios")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await businessService.createAdCampaign(user.business_id, {
        ...data,
        targeting: {
          ...data.targeting,
          interests: interests,
        }
      })

      if (result.error) {
        toast.error("Erro ao criar campanha: " + result.error)
        return
      }

      toast.success("Campanha criada com sucesso!")
      router.push("/business/ads")
    } catch (error) {
      console.error("Error creating ad campaign:", error)
      toast.error("Erro inesperado ao criar campanha")
    } finally {
      setIsSubmitting(false)
    }
  }

  const objectiveOptions = [
    { value: "awareness", label: "Conhecimento da Marca", icon: Eye, description: "Alcançar o maior número de pessoas" },
    { value: "traffic", label: "Tráfego", icon: MousePointer, description: "Dirigir pessoas para seu perfil ou site" },
    { value: "engagement", label: "Engajamento", icon: Users, description: "Aumentar curtidas, comentários e compartilhamentos" },
    { value: "conversions", label: "Conversões", icon: Target, description: "Gerar vendas ou leads" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Criar Nova Campanha
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure sua campanha publicitária para alcançar seu público-alvo
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Defina as informações principais da sua campanha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome da Campanha *
                  </label>
                  <Input
                    {...form.register("name")}
                    placeholder="Ex: Campanha Verão 2024"
                    className="w-full"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Objetivo da Campanha *
                  </label>
                  <Select onValueChange={(value) => form.setValue("objective", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {objectiveOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            <div>
                              <p className="font-medium">{option.label}</p>
                              <p className="text-xs text-gray-500">{option.description}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição (Opcional)
                </label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Descreva o que você quer alcançar com esta campanha..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget & Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Orçamento e Cronograma
              </CardTitle>
              <CardDescription>
                Configure quanto e quando sua campanha será executada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Orçamento Total (R$) *
                  </label>
                  <Input
                    type="number"
                    min="10"
                    step="0.01"
                    {...form.register("total_budget", { valueAsNumber: true })}
                    placeholder="100.00"
                  />
                  {form.formState.errors.total_budget && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.total_budget.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Orçamento Diário (R$)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    {...form.register("daily_budget", { valueAsNumber: true })}
                    placeholder="10.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para distribuir uniformemente
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Data de Início *
                  </label>
                  <Input
                    type="datetime-local"
                    {...form.register("start_date")}
                  />
                  {form.formState.errors.start_date && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.start_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Data de Fim *
                  </label>
                  <Input
                    type="datetime-local"
                    {...form.register("end_date")}
                  />
                  {form.formState.errors.end_date && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.end_date.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Segmentação
              </CardTitle>
              <CardDescription>
                Defina quem verá seus anúncios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demographics */}
              <div>
                <h4 className="font-medium mb-4">Demografia</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Idade Mínima
                    </label>
                    <Input
                      type="number"
                      min="18"
                      max="65"
                      {...form.register("targeting.demographics.age_min", { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Idade Máxima
                    </label>
                    <Input
                      type="number"
                      min="18"
                      max="65"
                      {...form.register("targeting.demographics.age_max", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Interests */}
              <div>
                <h4 className="font-medium mb-4">Interesses</h4>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Adicionar interesse..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  />
                  <Button type="button" onClick={addInterest} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-1 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Behaviors */}
              <div>
                <h4 className="font-medium mb-4">Comportamentos</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register("targeting.behaviors.verified_only")}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Apenas usuários verificados</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register("targeting.behaviors.premium_users_only")}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Apenas usuários premium</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Campanha"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}