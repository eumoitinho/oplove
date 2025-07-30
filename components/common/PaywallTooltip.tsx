"use client"

import { useState, ReactNode } from "react"
import { Crown, Gem, Heart, Lock, Zap, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BaseCard } from "@/components/ui/base-card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PaymentModal } from "./PaymentModal"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type FeatureType = 
  | "messages" 
  | "upload_images" 
  | "create_groups" 
  | "video_calls" 
  | "stories" 
  | "monetization"
  | "events"
  | "communities"
  | "polls"
  | "scheduling"
  | "dating"

interface PaywallTooltipProps {
  children: ReactNode
  feature: FeatureType
  requiredPlan?: "gold" | "diamond" | "couple"
  customTitle?: string
  customDescription?: string
  disabled?: boolean
  showModal?: boolean
}

const featureConfig = {
  messages: {
    title: "Mensagens Premium",
    description: "Envie mensagens ilimitadas e conecte-se sem limites",
    icon: Crown,
    requiredPlan: "gold" as const,
    color: "yellow"
  },
  upload_images: {
    title: "Upload de Imagens",
    description: "Compartilhe até 5 imagens em cada post",
    icon: Crown,
    requiredPlan: "gold" as const,
    color: "yellow"
  },
  create_groups: {
    title: "Criar Grupos",
    description: "Crie grupos privados com até 50 membros",
    icon: Gem,
    requiredPlan: "diamond" as const,
    color: "cyan"
  },
  video_calls: {
    title: "Chamadas de Vídeo",
    description: "Faça chamadas HD ilimitadas com segurança",
    icon: Gem,
    requiredPlan: "diamond" as const,
    color: "cyan"
  },
  stories: {
    title: "Stories 24h",
    description: "Compartilhe momentos efêmeros com seus seguidores",
    icon: Gem,
    requiredPlan: "diamond" as const,
    color: "cyan"
  },
  monetization: {
    title: "Monetização",
    description: "Transforme seu conteúdo em renda recorrente",
    icon: Gem,
    requiredPlan: "diamond" as const,
    color: "cyan"
  },
  events: {
    title: "Criar Eventos",
    description: "Organize encontros e eventos exclusivos",
    icon: Crown,
    requiredPlan: "gold" as const,
    color: "yellow"
  },
  communities: {
    title: "Comunidades",
    description: "Participe de comunidades premium exclusivas",
    icon: Crown,
    requiredPlan: "gold" as const,
    color: "yellow"
  },
  polls: {
    title: "Enquetes",
    description: "Crie enquetes interativas e engaje sua audiência",
    icon: Crown,
    requiredPlan: "gold" as const,
    color: "yellow"
  },
  scheduling: {
    title: "Agendamento",
    description: "Programe posts para o momento perfeito",
    icon: Gem,
    requiredPlan: "diamond" as const,
    color: "cyan"
  },
  dating: {
    title: "Open Dates Premium",
    description: "50 likes diários + Super likes ilimitados",
    icon: Heart,
    requiredPlan: "gold" as const,
    color: "pink"
  }
}

const planInfo = {
  gold: {
    name: "Gold",
    icon: Crown,
    color: "yellow",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-600 dark:text-yellow-400",
    borderColor: "border-yellow-500/30"
  },
  diamond: {
    name: "Diamond",
    icon: Gem,
    color: "cyan",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-500/30"
  },
  couple: {
    name: "Dupla Hot",
    icon: Heart,
    color: "pink",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-600 dark:text-pink-400",
    borderColor: "border-pink-500/30"
  }
}

export function PaywallTooltip({ 
  children, 
  feature, 
  requiredPlan, 
  customTitle, 
  customDescription,
  disabled = false,
  showModal = true 
}: PaywallTooltipProps) {
  const features = usePremiumFeatures()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  
  const config = featureConfig[feature]
  const finalRequiredPlan = requiredPlan || config.requiredPlan
  const title = customTitle || config.title
  const description = customDescription || config.description

  // Check if user has access to this feature
  const hasAccess = (() => {
    switch (feature) {
      case "messages":
        return features.canSendMessages
      case "upload_images":
        return features.canUploadImages
      case "create_groups":
        return features.canCreateGroups
      case "video_calls":
        return features.canVideoCall
      case "stories":
        return features.canCreateStories
      case "monetization":
        return features.canMonetizeContent
      case "events":
        return features.canCreateEvents
      case "communities":
        return features.canJoinCommunities
      case "polls":
        return features.canCreatePolls
      case "scheduling":
        return features.canSchedulePosts
      case "dating":
        return features.canUseDating
      default:
        return false
    }
  })()

  // If user has access or component is disabled, render children normally
  if (hasAccess || disabled) {
    return <>{children}</>
  }

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (showModal) {
      setIsPaymentModalOpen(true)
    }
  }

  const Icon = config.icon
  const PlanIcon = planInfo[finalRequiredPlan].icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {/* Overlay to prevent interaction */}
            <motion.div 
              className="absolute inset-0 rounded-lg z-10 cursor-pointer flex items-center justify-center"
              onClick={handleUpgradeClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-full p-2 xs:p-2.5 shadow-lg border-2 border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                <Lock className="w-4 h-4 xs:w-5 xs:h-5 text-gray-600 dark:text-gray-400" />
              </div>
            </motion.div>
            
            {/* Non-blurred children */}
            <div className="pointer-events-none opacity-40 blur-[2px]">
              {children}
            </div>
          </div>
        </TooltipTrigger>
        
        <TooltipContent 
          side="top" 
          className="max-w-[280px] xs:max-w-xs p-0 bg-transparent border-none shadow-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BaseCard
              variant="glass"
              padding="sm"
              className="border-gray-200 dark:border-white/20 shadow-2xl"
              animate={false}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 xs:p-2.5 rounded-xl flex-shrink-0",
                    config.color === "yellow" && "bg-yellow-500/10",
                    config.color === "cyan" && "bg-cyan-500/10",
                    config.color === "pink" && "bg-pink-500/10"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 xs:w-6 xs:h-6",
                      config.color === "yellow" && "text-yellow-500",
                      config.color === "cyan" && "text-cyan-500",
                      config.color === "pink" && "text-pink-500"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm xs:text-base text-gray-900 dark:text-white">
                      {title}
                    </h4>
                    <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Plan requirement */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Requer:</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        planInfo[finalRequiredPlan].bgColor,
                        planInfo[finalRequiredPlan].textColor,
                        planInfo[finalRequiredPlan].borderColor
                      )}
                    >
                      <PlanIcon className="w-3 h-3 mr-1" />
                      {planInfo[finalRequiredPlan].name}
                    </Badge>
                  </div>
                  
                  {showModal && (
                    <Button
                      size="sm"
                      onClick={handleUpgradeClick}
                      className="h-7 px-3 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-sm"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Desbloquear
                    </Button>
                  )}
                </div>
              </div>
            </BaseCard>
          </motion.div>
        </TooltipContent>
      </Tooltip>

      {showModal && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          selectedPlan={finalRequiredPlan}
          onSuccess={() => setIsPaymentModalOpen(false)}
        />
      )}
    </TooltipProvider>
  )
}