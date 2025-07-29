"use client"

import { motion } from "framer-motion"
import { Check, X, Info, Star, Crown, Users, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Feature {
  category: string
  name: string
  description?: string
  free: boolean | string
  gold: boolean | string
  diamond: boolean | string
  couple: boolean | string
  tooltip?: string
  highlight?: boolean
}

const features: Feature[] = [
  // Core Features
  {
    category: "Recursos Básicos",
    name: "Criar perfil",
    free: true,
    gold: true,
    diamond: true,
    couple: true,
  },
  {
    category: "Recursos Básicos",
    name: "Ver perfis",
    free: true,
    gold: true,
    diamond: true,
    couple: true,
  },
  {
    category: "Recursos Básicos",
    name: "Curtir posts",
    free: true,
    gold: true,
    diamond: true,
    couple: true,
  },

  // Messaging
  {
    category: "Mensagens",
    name: "Enviar mensagens",
    free: "Apenas responder",
    gold: "10/dia sem verificação",
    diamond: "Ilimitado",
    couple: "Ilimitado",
    tooltip: "Free users podem apenas responder mensagens de usuários premium",
    highlight: true,
  },
  {
    category: "Mensagens",
    name: "Mensagens de voz",
    free: false,
    gold: true,
    diamond: true,
    couple: true,
  },
  {
    category: "Mensagens",
    name: "Chamadas de vídeo",
    free: false,
    gold: false,
    diamond: true,
    couple: true,
    highlight: true,
  },

  // Content
  {
    category: "Conteúdo",
    name: "Upload de fotos",
    free: "3 por post",
    gold: "10 por post",
    diamond: "Ilimitado",
    couple: "Ilimitado",
  },
  {
    category: "Conteúdo",
    name: "Upload de vídeos",
    free: false,
    gold: "Até 5min",
    diamond: "Até 30min",
    couple: "Até 30min",
    highlight: true,
  },
  {
    category: "Conteúdo",
    name: "Stories",
    free: false,
    gold: false,
    diamond: true,
    couple: true,
    highlight: true,
  },
  {
    category: "Conteúdo",
    name: "Comentários",
    free: "Com verificação",
    gold: true,
    diamond: true,
    couple: true,
    tooltip: "Free users precisam verificar identidade para comentar",
  },

  // Social Features
  {
    category: "Social",
    name: "Criar grupos",
    free: false,
    gold: false,
    diamond: "Até 50 membros",
    couple: "Até 50 membros",
    highlight: true,
  },
  {
    category: "Social",
    name: "Participar de eventos",
    free: "Com verificação",
    gold: true,
    diamond: true,
    couple: true,
  },
  {
    category: "Social",
    name: "Criar eventos",
    free: false,
    gold: "3/mês",
    diamond: "Ilimitado",
    couple: "Ilimitado",
  },

  // Premium Features
  {
    category: "Premium",
    name: "Sem anúncios",
    free: false,
    gold: "Reduzidos",
    diamond: true,
    couple: true,
  },
  {
    category: "Premium",
    name: "Badge verificado",
    free: false,
    gold: "Com verificação",
    diamond: true,
    couple: true,
  },
  {
    category: "Premium",
    name: "Suporte prioritário",
    free: false,
    gold: false,
    diamond: true,
    couple: true,
  },
  {
    category: "Premium",
    name: "Analytics avançado",
    free: false,
    gold: false,
    diamond: true,
    couple: true,
  },
]

const planIcons = {
  free: Heart,
  gold: Star,
  diamond: Crown,
  couple: Users,
}

const planColors = {
  free: "text-gray-600",
  gold: "text-yellow-600",
  diamond: "text-purple-600",
  couple: "text-pink-600",
}

export function FeatureList() {
  const categories = [...new Set(features.map((f) => f.category))]

  const getFeatureValue = (feature: Feature, plan: keyof Feature) => {
    const value = feature[plan]

    if (typeof value === "boolean") {
      return value ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-gray-300" />
    }

    return (
      <div className="text-center">
        <span className="text-sm font-medium text-gray-700">{value}</span>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-center text-2xl font-bold">Comparação completa de recursos</CardTitle>
            <p className="text-center text-gray-600 mt-2">Veja todos os recursos disponíveis em cada plano</p>
          </CardHeader>

          <CardContent className="p-0">
            {/* Header Row */}
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 z-10">
              <div className="grid grid-cols-5 gap-4 p-4">
                <div className="font-semibold text-gray-900">Recursos</div>
                {Object.entries(planIcons).map(([plan, Icon]) => (
                  <div key={plan} className="text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Icon className={`h-6 w-6 ${planColors[plan as keyof typeof planColors]}`} />
                      <span className="font-semibold capitalize">{plan}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Rows by Category */}
            {categories.map((category, categoryIndex) => (
              <div key={category}>
                {/* Category Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <span>{category}</span>
                    <Badge variant="outline" className="text-xs">
                      {features.filter((f) => f.category === category).length} recursos
                    </Badge>
                  </h3>
                </div>

                {/* Features in Category */}
                {features
                  .filter((feature) => feature.category === category)
                  .map((feature, index) => (
                    <motion.div
                      key={`${category}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                      className={`grid grid-cols-5 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        feature.highlight ? "bg-purple-50/50" : ""
                      }`}
                    >
                      {/* Feature Name */}
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{feature.name}</span>
                        {feature.tooltip && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{feature.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {feature.highlight && <Badge className="bg-purple-100 text-purple-800 text-xs">Popular</Badge>}
                      </div>

                      {/* Plan Values */}
                      <div className="flex items-center justify-center">{getFeatureValue(feature, "free")}</div>
                      <div className="flex items-center justify-center">{getFeatureValue(feature, "gold")}</div>
                      <div className="flex items-center justify-center">{getFeatureValue(feature, "diamond")}</div>
                      <div className="flex items-center justify-center">{getFeatureValue(feature, "couple")}</div>
                    </motion.div>
                  ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Legenda:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Recurso incluído</span>
            </div>
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-gray-300" />
              <span>Recurso não disponível</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-800 text-xs">Popular</Badge>
              <span>Recurso mais utilizado</span>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-gray-400" />
              <span>Informações adicionais disponíveis</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
