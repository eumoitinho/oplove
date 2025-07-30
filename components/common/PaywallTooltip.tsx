"use client"

import { useState, ReactNode } from "react"
import { Crown, Gem, Flame, Lock, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PaymentModal } from "./PaymentModal"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"

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
    description: "Envie mensagens ilimitadas para outros usuários",
    icon: <Crown className="w-5 h-5" />,
    requiredPlan: "gold" as const,
    gradient: "from-yellow-400 to-yellow-600"
  },
  upload_images: {
    title: "Upload de Imagens",
    description: "Adicione até 5 imagens por post",
    icon: <Crown className="w-5 h-5" />,
    requiredPlan: "gold" as const,
    gradient: "from-yellow-400 to-yellow-600"
  },
  create_groups: {
    title: "Criar Grupos",
    description: "Crie grupos com até 50 membros",
    icon: <Gem className="w-5 h-5" />,
    requiredPlan: "diamond" as const,
    gradient: "from-cyan-400 to-purple-600"
  },
  video_calls: {
    title: "Chamadas de Vídeo",
    description: "Faça chamadas de voz e vídeo ilimitadas",
    icon: <Gem className="w-5 h-5" />,
    requiredPlan: "diamond" as const,
    gradient: "from-cyan-400 to-purple-600"
  },
  stories: {
    title: "Stories 24h",
    description: "Compartilhe momentos que desaparecem em 24h",
    icon: <Gem className="w-5 h-5" />,
    requiredPlan: "diamond" as const,
    gradient: "from-cyan-400 to-purple-600"
  },
  monetization: {
    title: "Monetização",
    description: "Ganhe dinheiro com seu conteúdo",
    icon: <Gem className="w-5 h-5" />,
    requiredPlan: "diamond" as const,
    gradient: "from-cyan-400 to-purple-600"
  },
  events: {
    title: "Criar Eventos",
    description: "Organize eventos para sua comunidade",
    icon: <Crown className="w-5 h-5" />,
    requiredPlan: "gold" as const,
    gradient: "from-yellow-400 to-yellow-600"
  },
  communities: {
    title: "Comunidades",
    description: "Participe de comunidades exclusivas",
    icon: <Crown className="w-5 h-5" />,
    requiredPlan: "gold" as const,
    gradient: "from-yellow-400 to-yellow-600"
  },
  polls: {
    title: "Enquetes",
    description: "Crie enquetes interativas nos seus posts",
    icon: <Crown className="w-5 h-5" />,
    requiredPlan: "gold" as const,
    gradient: "from-yellow-400 to-yellow-600"
  },
  scheduling: {
    title: "Agendamento",
    description: "Agende seus posts para horários específicos",
    icon: <Gem className="w-5 h-5" />,
    requiredPlan: "diamond" as const,
    gradient: "from-cyan-400 to-purple-600"
  },
  dating: {
    title: "Open Dates Premium",
    description: "50 likes por dia + Super likes ilimitados",
    icon: <Flame className="w-5 h-5" />,
    requiredPlan: "gold" as const,
    gradient: "from-red-400 to-pink-600"
  }
}

const planNames = {
  gold: "Gold",
  diamond: "Diamond", 
  couple: "Dupla Hot"
}

const planIcons = {
  gold: <Crown className="w-4 h-4" />,
  diamond: <Gem className="w-4 h-4" />,
  couple: <Flame className="w-4 h-4" />
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {/* Overlay to prevent interaction */}
            <div 
              className="absolute inset-0 rounded-lg z-10 cursor-pointer flex items-center justify-center group"
              onClick={handleUpgradeClick}
            >
              <div className="bg-white dark:bg-gray-900 rounded-full p-2 shadow-lg border-2 border-gray-200 dark:border-gray-700">
                <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            
            {/* Non-blurred children */}
            <div className="pointer-events-none opacity-50">
              {children}
            </div>
          </div>
        </TooltipTrigger>
        
        <TooltipContent 
          side="top" 
          className="max-w-xs p-0 bg-transparent border-none shadow-none"
        >
          <Card className={`p-4 bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                {config.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{title}</h4>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                    {planIcons[finalRequiredPlan]}
                    <span className="text-xs font-medium">
                      {planNames[finalRequiredPlan]}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-white/90 mb-3 leading-relaxed">
                  {description}
                </p>
                
                {showModal && (
                  <Button
                    size="sm"
                    onClick={handleUpgradeClick}
                    className="bg-white text-gray-900 hover:bg-gray-100 text-xs h-7 px-3"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Fazer Upgrade
                  </Button>
                )}
              </div>
            </div>
          </Card>
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