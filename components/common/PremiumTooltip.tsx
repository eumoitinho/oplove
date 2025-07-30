"use client"

import { useState, ReactNode } from "react"
import { Crown, Gem, Flame, Star, Zap, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PaymentModal } from "./PaymentModal"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { toast } from "sonner"

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

interface PremiumTooltipProps {
  children: ReactNode
  feature: FeatureType
  requiredPlan?: "gold" | "diamond" | "couple"
  customTitle?: string
  customDescription?: string
  showUpgradeHint?: boolean
  onFeatureUse?: () => void
}

const featureConfig = {
  messages: {
    title: "Mensagens Premium",
    description: "Com Gold, envie até 10 mensagens/dia. Com Diamond, ilimitadas!",
    icon: <Crown className="w-4 h-4" />,
    requiredPlan: "gold" as const,
    gradient: "from-yellow-400 to-yellow-600"
  },
  upload_images: {
    title: "Upload de Mídia",
    description: "Gold: até 5 imagens por post. Diamond: ilimitado!",
    icon: <Crown className="w-4 h-4" />,
    requiredPlan: "gold" as const,
    gradient: "from-yellow-400 to-yellow-600"
  },
  create_groups: {
    title: "Criar Grupos",
    description: "Crie grupos com até 50 membros no Diamond",
    icon: <Gem className="w-4 h-4" />,
    requiredPlan: "diamond" as const,
    gradient: "from-cyan-400 to-purple-600"
  },
  video_calls: {
    title: "Chamadas de Vídeo",
    description: "Faça chamadas de voz e vídeo ilimitadas",
    icon: <Gem className="w-4 h-4" />,
    requiredPlan: "diamond" as const,
    gradient: "from-cyan-400 to-purple-600"
  },
  stories: {
    title: "Stories 24h",
    description: "Compartilhe momentos que desaparecem em 24h",
    icon: <Gem className="w-4 h-4" />,
    requiredPlan: "diamond" as const,
    gradient: "from-cyan-400 to-purple-600"
  },
  monetization: {
    title: "Monetização",
    description: "Ganhe dinheiro com seu conteúdo exclusivo",
    icon: <Gem className="w-4 h-4" />,
    requiredPlan: "diamond" as const,
    gradient: "from-cyan-400 to-purple-600"
  },
  events: {
    title: "Eventos",
    description: "Gold: 3 eventos/mês. Diamond: ilimitados!",
    icon: <Crown className="w-4 h-4" />,
    requiredPlan: "gold" as const,
    gradient: "from-yellow-400 to-yellow-600"
  },
  communities: {
    title: "Comunidades",
    description: "Gold: até 5 comunidades. Diamond: ilimitadas!",
    icon: <Crown className="w-4 h-4" />,
    requiredPlan: "gold" as const,
    gradient: "from-yellow-400 to-yellow-600"
  },
  polls: {
    title: "Enquetes",
    description: "Crie enquetes interativas nos seus posts",
    icon: <Crown className="w-4 h-4" />,
    requiredPlan: "gold" as const,
    gradient: "from-yellow-400 to-yellow-600"
  },
  scheduling: {
    title: "Agendamento",
    description: "Agende seus posts para horários específicos",
    icon: <Gem className="w-4 h-4" />,
    requiredPlan: "diamond" as const,
    gradient: "from-cyan-400 to-purple-600"
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

export function PremiumTooltip({ 
  children, 
  feature, 
  requiredPlan, 
  customTitle, 
  customDescription,
  showUpgradeHint = true,
  onFeatureUse
}: PremiumTooltipProps) {
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
      default:
        return false
    }
  })()

  const handleFeatureClick = (e: React.MouseEvent) => {
    if (!hasAccess && showUpgradeHint) {
      e.preventDefault()
      e.stopPropagation()
      
      // Show a toast instead of blocking
      toast.info(
        `${title} disponível no plano ${planNames[finalRequiredPlan]}`,
        {
          description: description,
          action: {
            label: "Fazer Upgrade",
            onClick: () => setIsPaymentModalOpen(true)
          }
        }
      )
    } else {
      onFeatureUse?.()
    }
  }

  // If user has access, render children normally
  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative" onClick={handleFeatureClick}>
            {/* Subtle indicator for premium features */}
            {showUpgradeHint && (
              <div className="absolute -top-1 -right-1 z-10">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center`}>
                  {config.icon}
                </div>
              </div>
            )}
            
            {/* Normal children, not blurred */}
            <div className="cursor-pointer">
              {children}
            </div>
          </div>
        </TooltipTrigger>
        
        <TooltipContent 
          side="top" 
          className="max-w-xs p-0 bg-transparent border-none shadow-none"
        >
          <Card className="p-3 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 p-1.5 bg-gradient-to-r ${config.gradient} rounded-lg`}>
                {config.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{title}</h4>
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {planIcons[finalRequiredPlan]}
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {planNames[finalRequiredPlan]}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                  {description}
                </p>
                
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPaymentModalOpen(true)
                  }}
                  className={`bg-gradient-to-r ${config.gradient} text-white text-xs h-6 px-2 hover:opacity-90`}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Fazer Upgrade
                </Button>
              </div>
            </div>
          </Card>
        </TooltipContent>
      </Tooltip>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPlan={finalRequiredPlan}
        onSuccess={() => setIsPaymentModalOpen(false)}
      />
    </TooltipProvider>
  )
}