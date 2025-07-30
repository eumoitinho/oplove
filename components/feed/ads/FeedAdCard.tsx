"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Eye, Heart, MessageCircle, Share2, MapPin, Clock, Star } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { adTrackingService } from "@/lib/services/ad-tracking.service"
import { toast } from "sonner"
import Image from "next/image"

interface FeedAdCardProps {
  campaign: {
    id: string
    name: string
    description?: string
    objective: string
    business: {
      id: string
      business_name: string
      logo_url?: string
      description?: string
    }
    ads?: Array<{
      id: string
      format: string
      content: {
        title?: string
        description?: string
        image_url?: string
        video_url?: string
        cta_text?: string
        cta_url?: string
      }
    }>
  }
  placement?: string
  onInteraction?: (type: 'impression' | 'click' | 'conversion') => void
}

export function FeedAdCard({ campaign, placement = 'feed', onInteraction }: FeedAdCardProps) {
  const { user } = useAuth()
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Get the first ad or use campaign data
  const ad = campaign.ads && campaign.ads.length > 0 ? campaign.ads[0] : null
  const content = ad?.content || {
    title: campaign.name,
    description: campaign.description || campaign.business.description,
    cta_text: 'Saiba mais',
    cta_url: `/business/${campaign.business.id}`
  }

  // Track impression when card becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedImpression) {
          setIsVisible(true)
          trackImpression()
        }
      },
      { threshold: 0.5, rootMargin: '0px 0px -50px 0px' }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [hasTrackedImpression])

  const trackImpression = async () => {
    if (hasTrackedImpression) return

    try {
      const result = await adTrackingService.trackImpression(
        campaign.id,
        ad?.id,
        user?.id,
        {
          placement,
          device_type: getDeviceType(),
        }
      )

      if (result.success) {
        setHasTrackedImpression(true)
        onInteraction?.('impression')
      }
    } catch (error) {
      console.error('Error tracking impression:', error)
    }
  }

  const trackClick = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const result = await adTrackingService.trackClick(
        campaign.id,
        ad?.id,
        user?.id,
        {
          placement,
          device_type: getDeviceType(),
        }
      )

      if (result.success) {
        onInteraction?.('click')
        
        // Open link if provided
        if (content.cta_url) {
          if (content.cta_url.startsWith('http')) {
            window.open(content.cta_url, '_blank', 'noopener,noreferrer')
          } else {
            window.location.href = content.cta_url
          }
        }
      } else {
        toast.error('Erro ao processar clique no anúncio')
      }
    } catch (error) {
      console.error('Error tracking click:', error)
      toast.error('Erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const getDeviceType = () => {
    if (typeof window === 'undefined') return 'server'
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  const getObjectiveIcon = (objective: string) => {
    switch (objective) {
      case 'awareness': return <Eye className="h-4 w-4" />
      case 'traffic': return <ExternalLink className="h-4 w-4" />
      case 'engagement': return <Heart className="h-4 w-4" />
      case 'conversions': return <Star className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getObjectiveLabel = (objective: string) => {
    switch (objective) {
      case 'awareness': return 'Divulgação'
      case 'traffic': return 'Tráfego'
      case 'engagement': return 'Engajamento'
      case 'conversions': return 'Conversões'
      default: return 'Anúncio'
    }
  }

  return (
    <Card 
      ref={cardRef}
      className="w-full border border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <CardContent className="p-0">
        {/* Ad Badge */}
        <div className="flex items-center justify-between p-4 pb-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 text-xs font-medium">
            {getObjectiveIcon(campaign.objective)}
            <span className="ml-1">Anúncio • {getObjectiveLabel(campaign.objective)}</span>
          </Badge>
        </div>

        {/* Business Info */}
        <div className="flex items-center gap-3 px-4 pb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={campaign.business.logo_url} alt={campaign.business.business_name} />
            <AvatarFallback className="bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
              {campaign.business.business_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {campaign.business.business_name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Anúncio patrocinado
            </p>
          </div>
        </div>

        {/* Ad Content */}
        <div className="px-4 pb-4">
          {content.title && (
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
              {content.title}
            </h4>
          )}
          
          {content.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
              {content.description}
            </p>
          )}

          {/* Media */}
          {content.image_url && (
            <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={content.image_url}
                alt={content.title || campaign.name}
                width={600}
                height={300}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          {content.video_url && (
            <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <video
                src={content.video_url}
                className="w-full h-48 object-cover"
                controls
                preload="metadata"
              />
            </div>
          )}

          {/* CTA Button */}
          <Button
            onClick={trackClick}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium py-2.5 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Carregando...
              </div>
            ) : (
              <>
                {content.cta_text || 'Saiba mais'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="border-t border-orange-200 dark:border-orange-800 px-4 py-3 bg-orange-50/50 dark:bg-orange-950/10">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Anúncio ativo
            </span>
            <span className="flex items-center gap-4">
              <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <Heart className="h-3 w-3" />
                <span>Curtir</span>
              </button>
              <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <MessageCircle className="h-3 w-3" />
                <span>Comentar</span>
              </button>
              <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <Share2 className="h-3 w-3" />
                <span>Compartilhar</span>
              </button>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}