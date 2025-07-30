"use client"

import { useState } from "react"
import { X, ExternalLink, Star, Crown, Gem } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { PaymentModal } from "@/components/common/PaymentModal"

interface FeedAdProps {
  onClose?: () => void
  className?: string
}

const upgradeAds = [
  {
    id: "gold-upgrade",
    type: "upgrade" as const,
    title: "Desbloqueie o Gold",
    description: "Envie mensagens e faça upload de imagens",
    cta: "Upgrade para Gold",
    plan: "gold" as const,
    icon: <Crown className="w-6 h-6 text-yellow-500" />,
    gradient: "from-yellow-400 to-yellow-600",
    benefits: [
      "10 mensagens por dia",
      "Upload de até 5 imagens por post",
      "Criar eventos",
      "Entrar em comunidades"
    ]
  },
  {
    id: "diamond-upgrade",
    type: "upgrade" as const,
    title: "Vá para o Diamond",
    description: "Recursos ilimitados e sem anúncios",
    cta: "Upgrade para Diamond",
    plan: "diamond" as const,
    icon: <Gem className="w-6 h-6 text-cyan-500" />,
    gradient: "from-cyan-400 to-purple-600",
    benefits: [
      "Mensagens ilimitadas",
      "Chamadas de voz/vídeo",
      "Stories de 24h",
      "Sem anúncios",
      "Monetização"
    ]
  }
]

const sponsoredAds = [
  {
    id: "dating-app",
    type: "sponsored" as const,
    sponsor: {
      name: "LoveConnect",
      avatar: "/ads/loveconnect-logo.png",
      verified: true
    },
    title: "Encontre seu par perfeito",
    description: "Mais de 1 milhão de usuários já encontraram o amor",
    image: "/ads/dating-app-ad.jpg",
    cta: "Baixar Grátis",
    url: "https://loveconnect.com"
  },
  {
    id: "wellness",
    type: "sponsored" as const,
    sponsor: {
      name: "Wellness Plus",
      avatar: "/ads/wellness-logo.png",
      verified: false
    },
    title: "Cuide da sua saúde mental",
    description: "Terapia online com profissionais qualificados",
    image: "/ads/wellness-ad.jpg",
    cta: "Primeira consulta grátis",
    url: "https://wellnessplus.com.br"
  },
  {
    id: "fashion",
    type: "sponsored" as const,
    sponsor: {
      name: "ModaStyle",
      avatar: "/ads/modestyle-logo.png",
      verified: true
    },
    title: "Nova coleção de verão",
    description: "Roupas que combinam com seu estilo único",
    image: "/ads/fashion-ad.jpg",
    cta: "Ver coleção",
    url: "https://modastyle.com.br"
  }
]

export function FeedAd({ onClose, className }: FeedAdProps) {
  const { user } = useAuth()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"gold" | "diamond" | "couple">("diamond")
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  // Mostrar ads de upgrade para usuários gratuitos
  const shouldShowUpgradeAd = user?.premium_type === "free" || !user?.premium_type
  
  // Selecionar ad aleatório
  const availableAds = shouldShowUpgradeAd ? upgradeAds : sponsoredAds
  const randomAd = availableAds[Math.floor(Math.random() * availableAds.length)]

  const handleUpgradeClick = (plan: "gold" | "diamond" | "couple") => {
    setSelectedPlan(plan)
    setIsPaymentModalOpen(true)
  }

  const handleSponsoredClick = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onClose?.()
  }

  if (randomAd.type === "upgrade") {
    return (
      <>
        <Card className={`relative p-6 bg-gradient-to-r ${randomAd.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 p-3 bg-white/20 rounded-full">
              {randomAd.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-white/30 px-2 py-1 rounded-full font-medium">
                  PROMOÇÃO
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{randomAd.title}</h3>
              <p className="text-white/90 mb-4">{randomAd.description}</p>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {randomAd.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleUpgradeClick(randomAd.plan)}
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
              >
                {randomAd.cta}
              </Button>
            </div>
          </div>
        </Card>

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          selectedPlan={selectedPlan}
          onSuccess={() => {
            setIsPaymentModalOpen(false)
            setIsDismissed(true)
          }}
        />
      </>
    )
  }

  // Sponsored Ad
  return (
    <Card className={`relative p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      {/* Sponsored label */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            PATROCINADO
          </span>
          <div className="w-1 h-1 bg-gray-400 rounded-full" />
          <Avatar className="w-6 h-6">
            <AvatarImage src={randomAd.sponsor.avatar} />
            <AvatarFallback className="text-xs">
              {randomAd.sponsor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {randomAd.sponsor.name}
          </span>
          {randomAd.sponsor.verified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full w-8 h-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Ad content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {randomAd.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {randomAd.description}
          </p>
        </div>

        {/* Ad image */}
        {randomAd.image && (
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={randomAd.image}
              alt={randomAd.title}
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <Button
          onClick={() => handleSponsoredClick(randomAd.url)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {randomAd.cta}
        </Button>
      </div>
    </Card>
  )
}