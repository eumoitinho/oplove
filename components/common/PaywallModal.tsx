"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Star, Gem, Heart, Lock, Crown, Zap } from "lucide-react"
import { BaseModal, BaseModalFooter } from "@/components/ui/base-modal"
import { BaseCard } from "@/components/ui/base-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { PremiumPlan } from "@/types/common"

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  requiredPlan: PremiumPlan
  currentPlan?: PremiumPlan
}

const planFeatures = {
  gold: {
    name: "Gold",
    price: "R$ 25",
    priceDetail: "/mês",
    icon: Crown,
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
    cardGradient: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
    features: [
      "10 mensagens por dia (ilimitado se verificado)",
      "Até 5 imagens por post",
      "Criar até 3 eventos por mês",
      "Participar de até 5 comunidades",
      "Menos anúncios (1 a cada 10 posts)",
      "Upload de 50 fotos/mês",
    ],
  },
  diamond: {
    name: "Diamond",
    price: "R$ 45",
    priceDetail: "/mês",
    icon: Gem,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
    cardGradient: "from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20",
    features: [
      "Tudo do plano Gold",
      "Mensagens ilimitadas",
      "Criar grupos de chat (até 50 membros)",
      "Chamadas de voz e vídeo",
      "Stories de 24h",
      "Análise de perfil",
      "Monetizar conteúdo",
      "Sem anúncios",
      "Upload ilimitado de mídia",
      "Agendar posts",
    ],
  },
  couple: {
    name: "Dupla Hot",
    price: "R$ 69,90",
    priceDetail: "/mês",
    icon: Heart,
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
    cardGradient: "from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20",
    features: [
      "Todos os recursos Diamond para 2 contas",
      "Perfil compartilhado opcional",
      "Álbum privado do casal",
      "Diário compartilhado",
      "Jogos para casais",
      "Badge especial de casal",
    ],
  },
}

const featureRequirements: Record<string, { plan: PremiumPlan; description: string }> = {
  "upload_images": { plan: "gold", description: "fazer upload de imagens em posts" },
  "upload_videos": { plan: "diamond", description: "fazer upload de vídeos" },
  "create_polls": { plan: "gold", description: "criar enquetes" },
  "add_location": { plan: "gold", description: "adicionar localização aos posts" },
  "schedule_posts": { plan: "diamond", description: "agendar publicações" },
  "create_groups": { plan: "diamond", description: "criar grupos de chat" },
  "video_calls": { plan: "diamond", description: "fazer chamadas de vídeo" },
  "stories": { plan: "diamond", description: "publicar stories" },
  "monetize": { plan: "diamond", description: "monetizar conteúdo" },
}

export function PaywallModal({
  isOpen,
  onClose,
  feature,
  requiredPlan,
  currentPlan = "free",
}: PaywallModalProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>(requiredPlan)

  const featureInfo = featureRequirements[feature] || { 
    plan: requiredPlan, 
    description: feature 
  }

  const availablePlans = Object.entries(planFeatures).filter(([plan]) => {
    const planOrder = { free: 0, gold: 1, diamond: 2, couple: 3 }
    return planOrder[plan as PremiumPlan] >= planOrder[featureInfo.plan]
  })

  const handleUpgrade = () => {
    router.push(`/settings/subscription?plan=${selectedPlan}`)
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      variant="gradient"
      className="max-w-2xl"
    >
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-2">
          <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Desbloqueie recursos incríveis
        </h2>
        <p className="text-sm xs:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Para {featureInfo.description}, você precisa fazer upgrade para o plano 
          <span className="font-semibold text-gray-900 dark:text-white">
            {' '}{planFeatures[featureInfo.plan as keyof typeof planFeatures]?.name}
          </span> ou superior.
        </p>
      </div>

      {/* Plans Section */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Escolha o plano ideal para você:</h3>
        <div className="grid gap-4">
          {availablePlans.map(([planKey, plan]) => {
            const PlanIcon = plan.icon
            const isSelected = selectedPlan === planKey
            const isCurrentPlan = currentPlan === planKey
            const isBestValue = planKey === "diamond"

            return (
              <motion.div
                key={planKey}
                whileHover={{ scale: isCurrentPlan ? 1 : 1.02 }}
                whileTap={{ scale: isCurrentPlan ? 1 : 0.98 }}
              >
                <BaseCard
                  variant="bordered"
                  hover={!isCurrentPlan}
                  animate={false}
                  className={cn(
                    "relative cursor-pointer transition-all duration-300",
                    "bg-gradient-to-br",
                    plan.cardGradient,
                    isSelected && !isCurrentPlan && "ring-2 ring-purple-500 dark:ring-purple-400",
                    isCurrentPlan && "opacity-60 cursor-not-allowed"
                  )}
                  onClick={() => !isCurrentPlan && setSelectedPlan(planKey as PremiumPlan)}
                >
                  {/* Best Value Badge */}
                  {isBestValue && !isCurrentPlan && (
                    <div className="absolute -top-3 right-4 xs:right-6">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1">
                        <Zap className="w-3 h-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-col xs:flex-row xs:items-start gap-4">
                    {/* Plan Icon and Info */}
                    <div className="flex items-start gap-3 xs:gap-4 flex-1">
                      <div className={cn(
                        "p-3 rounded-xl flex-shrink-0",
                        plan.iconBg
                      )}>
                        <PlanIcon className={cn("w-6 h-6", plan.iconColor)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                            {plan.name}
                          </h4>
                          {isCurrentPlan && (
                            <Badge variant="secondary" className="text-xs">
                              Seu plano atual
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mt-1">
                          <span className="text-2xl xs:text-3xl font-bold text-gray-900 dark:text-white">
                            {plan.price}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {plan.priceDetail}
                          </span>
                        </div>

                        {/* Features list */}
                        <div className="mt-4 space-y-2">
                          {plan.features.slice(0, 3).map((feat, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{feat}</span>
                            </div>
                          ))}
                          {plan.features.length > 3 && (
                            <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline mt-2">
                              Ver todos os {plan.features.length} benefícios
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && !isCurrentPlan && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </BaseCard>
              </motion.div>
            )
          })}
        </div>

        {/* Action buttons */}
        <BaseModalFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 xs:flex-initial"
          >
            Talvez depois
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={currentPlan === selectedPlan}
            className="flex-1 xs:flex-initial bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            Fazer upgrade agora
          </Button>
        </BaseModalFooter>

        {/* Benefits reminder */}
        <BaseCard 
          variant="gradient" 
          padding="sm"
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800"
        >
          <p className="text-xs xs:text-sm text-center text-purple-700 dark:text-purple-300">
            <span className="font-semibold">💎 Dica Pro:</span> Usuários verificados desbloqueiam benefícios exclusivos em todos os planos!
          </p>
        </BaseCard>
      </div>
    </BaseModal>
  )
}