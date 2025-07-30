"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Download, Heart, Share2, Lock, Star, Clock, Users, ShoppingCart, Eye, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PaidContentCardProps {
  content: {
    id: string
    title: string
    description: string
    type: "image" | "video" | "audio" | "document" | "course"
    thumbnail: string
    price: number
    originalPrice?: number
    isPurchased: boolean
    isLiked: boolean
    rating: number
    reviewCount: number
    duration?: string
    size?: string
    previewUrl?: string
    creator: {
      id: string
      name: string
      avatar: string
      isVerified: boolean
    }
    stats: {
      views: number
      likes: number
      purchases: number
      comments: number
    }
    tags: string[]
    createdAt: string
    lastUpdated?: string
  }
  onPurchase?: (contentId: string) => void
  onLike?: (contentId: string) => void
  onShare?: (contentId: string) => void
  onPreview?: (contentId: string) => void
}

const contentTypeIcons = {
  image: "🖼️",
  video: "🎥",
  audio: "🎵",
  document: "📄",
  course: "🎓",
}

export function PaidContentCard({ content, onPurchase, onLike, onShare, onPreview }: PaidContentCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handlePurchase = async () => {
    if (content.isPurchased) return

    setIsLoading(true)
    try {
      await onPurchase?.(content.id)
    } catch (error) {
      console.error("Purchase failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    await onLike?.(content.id)
  }

  const handleShare = async () => {
    await onShare?.(content.id)
  }

  const handlePreview = () => {
    if (content.previewUrl) {
      setShowPreview(true)
      onPreview?.(content.id)
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price.toFixed(2)}`
  }

  const formatStats = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const getDiscountPercentage = () => {
    if (!content.originalPrice || content.originalPrice <= content.price) return 0
    return Math.round(((content.originalPrice - content.price) / content.originalPrice) * 100)
  }

  const discountPercentage = getDiscountPercentage()

  return (
    <motion.div whileHover={{ y: -5 }} className="group">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white">
        {/* Thumbnail/Preview */}
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
            <Image
              src={content.thumbnail || "/placeholder.svg"}
              alt={content.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Content Type Badge */}
            <Badge className="absolute top-3 left-3 bg-black/70 text-white border-0">
              {contentTypeIcons[content.type]} {content.type.toUpperCase()}
            </Badge>

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0">-{discountPercentage}%</Badge>
            )}

            {/* Preview/Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
              {content.previewUrl ? (
                <Button
                  size="lg"
                  onClick={handlePreview}
                  className="rounded-full bg-white/90 hover:bg-white text-black border-0"
                >
                  <Play className="w-6 h-6 ml-1" />
                </Button>
              ) : !content.isPurchased ? (
                <div className="text-center text-white">
                  <Lock className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">Premium Content</div>
                </div>
              ) : (
                <Button size="lg" className="rounded-full bg-white/90 hover:bg-white text-black border-0">
                  <Play className="w-6 h-6 ml-1" />
                </Button>
              )}
            </div>

            {/* Duration/Size */}
            {(content.duration || content.size) && (
              <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                <Clock className="w-3 h-3 inline mr-1" />
                {content.duration || content.size}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Creator Info */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={content.creator.avatar || "/placeholder.svg"} alt={content.creator.name} />
              <AvatarFallback className="text-xs">{content.creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{content.creator.name}</span>
            {content.creator.isVerified && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                ✓
              </Badge>
            )}
          </div>

          {/* Title and Description */}
          <div className="space-y-2 mb-4">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
              {content.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{content.description}</p>
          </div>

          {/* Rating */}
          {content.rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(content.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {content.rating.toFixed(1)} ({content.reviewCount})
              </span>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {content.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {content.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{content.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatStats(content.stats.views)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatStats(content.stats.purchases)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {formatStats(content.stats.comments)}
              </span>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-600">{formatPrice(content.price)}</span>
                {content.originalPrice && content.originalPrice > content.price && (
                  <span className="text-sm text-gray-500 line-through">{formatPrice(content.originalPrice)}</span>
                )}
              </div>
              {content.isPurchased && <Badge className="bg-green-500 text-white text-xs">Purchased</Badge>}
            </div>

            <div className="flex items-center gap-2">
              {/* Like Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={content.isLiked ? "text-red-500" : "text-gray-500"}
              >
                <Heart className={`w-4 h-4 ${content.isLiked ? "fill-current" : ""}`} />
                <span className="ml-1 text-xs">{formatStats(content.stats.likes)}</span>
              </Button>

              {/* Share Button */}
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>

              {/* Purchase/Download Button */}
              {content.isPurchased ? (
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 mr-1" />
                  )}
                  {isLoading ? "Processando..." : content.price === 0 ? "Obter Grátis" : "Comprar"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && content.previewUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Preview: {content.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                ✕
              </Button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              {content.type === "video" ? (
                <video src={content.previewUrl} controls className="w-full h-full" autoPlay preload="metadata" playsInline />
              ) : content.type === "audio" ? (
                <audio src={content.previewUrl} controls className="w-full" autoPlay />
              ) : (
                <img
                  src={content.previewUrl || "/placeholder.svg"}
                  alt={content.title}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
