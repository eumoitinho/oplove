"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, X, Flag, Info } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AdContent {
  title: string
  description: string
  image: string
  cta: string
  sponsor: string
  url?: string
  category?: string
}

interface AdCardProps {
  ad: AdContent
  onClose?: () => void
  onReport?: () => void
  className?: string
}

export function AdCard({ ad, onClose, onReport, className }: AdCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const handleClick = () => {
    if (ad.url) {
      window.open(ad.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleReport = () => {
    onReport?.()
    toast.success("Anúncio reportado. Obrigado pelo feedback!")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
        <CardContent className="p-0">
          {/* Ad Header */}
          <div className="flex items-center justify-between p-3 border-b border-purple-100">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                <Info className="h-3 w-3 mr-1" />
                Patrocinado
              </Badge>
              <span className="text-sm text-gray-600">por {ad.sponsor}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
              >
                <Info className="h-3 w-3" />
              </Button>

              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Ad Options */}
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 py-2 bg-white border-b border-purple-100"
            >
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReport}
                  className="h-auto p-0 text-gray-600 hover:text-red-600"
                >
                  <Flag className="h-3 w-3 mr-1" />
                  Reportar anúncio
                </Button>
                <span>•</span>
                <span>Por que estou vendo isso?</span>
              </div>
            </motion.div>
          )}

          {/* Ad Content */}
          <div className="cursor-pointer" onClick={handleClick}>
            {/* Ad Image */}
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={ad.image || "/placeholder.svg"}
                alt={ad.title}
                fill
                className={cn("object-cover transition-transform duration-300", isHovered && "scale-105")}
              />

              {/* Overlay on hover */}
              {isHovered && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-2">
                    <ExternalLink className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Ad Text */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">{ad.title}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{ad.description}</p>
              </div>

              {/* Category */}
              {ad.category && (
                <Badge variant="outline" className="text-xs">
                  {ad.category}
                </Badge>
              )}

              {/* CTA Button */}
              <Button
                className={cn(
                  "w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-200",
                  isHovered && "shadow-lg transform scale-[1.02]",
                )}
              >
                {ad.cta}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
