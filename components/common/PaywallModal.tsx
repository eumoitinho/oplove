"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Star, Gem, Heart, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-gradient-to-br from-yellow-400 to-orange-500",
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
    icon: Gem,
    color: "text-cyan-500",
    bgColor: "bg-gradient-to-br from-cyan-400 to-blue-500",
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
    name: "Casal",
    price: "R$ 69,90",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-gradient-to-br from-pink-400 to-purple-500",
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Recurso Premium
              </DialogTitle>
            </DialogHeader>
            <p className="mt-2 text-lg opacity-90">
              Para {featureInfo.description}, você precisa de um plano {planFeatures[featureInfo.plan as keyof typeof planFeatures]?.name} ou superior.
            </p>
          </div>

          {/* Plans */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Escolha seu plano:</h3>
            <div className="grid gap-4">
              {availablePlans.map(([planKey, plan]) => {
                const PlanIcon = plan.icon
                const isSelected = selectedPlan === planKey
                const isCurrentPlan = currentPlan === planKey

                return (
                  <motion.div
                    key={planKey}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => setSelectedPlan(planKey as PremiumPlan)}
                      disabled={isCurrentPlan}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left",
                        isSelected
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300",
                        isCurrentPlan && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", plan.bgColor)}>
                              <PlanIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                {plan.name}
                                {isCurrentPlan && (
                                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                    Plano atual
                                  </span>
                                )}
                              </h4>
                              <p className="text-2xl font-bold text-purple-600">
                                {plan.price}
                                <span className="text-sm font-normal text-gray-500">/mês</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 grid gap-2">
                            {plan.features.slice(0, 4).map((feat, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{feat}</span>
                              </div>
                            ))}
                            {plan.features.length > 4 && (
                              <p className="text-sm text-purple-600 font-medium">
                                +{plan.features.length - 4} recursos adicionais
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {isSelected && !isCurrentPlan && (
                          <div className="flex-shrink-0 ml-4">
                            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  </motion.div>
                )
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Talvez depois
              </Button>
              <Button
                onClick={handleUpgrade}
                disabled={currentPlan === selectedPlan}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Fazer upgrade agora
              </Button>
            </div>

            {/* Benefits reminder */}
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700 text-center">
                <strong>💎 Dica:</strong> Usuários verificados ganham benefícios extras em todos os planos!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}