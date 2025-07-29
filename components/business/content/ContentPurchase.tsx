"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  CreditCard,
  Lock,
  Shield,
  Star,
  Download,
  Play,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Gift,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ContentPurchaseProps {
  content: {
    id: string
    title: string
    description: string
    type: "image" | "video" | "audio" | "document" | "course"
    thumbnail: string
    price: number
    originalPrice?: number
    rating: number
    reviewCount: number
    duration?: string
    size?: string
    features: string[]
    creator: {
      id: string
      name: string
      avatar: string
      isVerified: boolean
      totalSales: number
      rating: number
    }
    stats: {
      purchases: number
      views: number
      likes: number
    }
    tags: string[]
    whatYouGet: string[]
    requirements?: string[]
    createdAt: string
    lastUpdated?: string
  }
  onPurchase?: (contentId: string, paymentMethod: string) => Promise<void>
  onAddToCart?: (contentId: string) => void
}

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, American Express" },
  { id: "paypal", name: "PayPal", icon: Shield, description: "Pay with your PayPal account" },
  { id: "apple", name: "Apple Pay", icon: Shield, description: "Touch ID or Face ID" },
  { id: "google", name: "Google Pay", icon: Shield, description: "Pay with Google" },
]

export function ContentPurchase({ content, onPurchase, onAddToCart }: ContentPurchaseProps) {
  const [selectedPayment, setSelectedPayment] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)

  const handlePurchase = async () => {
    setIsProcessing(true)
    try {
      await onPurchase?.(content.id, selectedPayment)
      setPurchaseComplete(true)
      setTimeout(() => {
        setShowPurchaseDialog(false)
        setPurchaseComplete(false)
      }, 3000)
    } catch (error) {
      console.error("Purchase failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price.toFixed(2)}`
  }

  const getDiscountPercentage = () => {
    if (!content.originalPrice || content.originalPrice <= content.price) return 0
    return Math.round(((content.originalPrice - content.price) / content.originalPrice) * 100)
  }

  const discountPercentage = getDiscountPercentage()

  return (
    <div className="space-y-6">
      {/* Content Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Thumbnail */}
            <div className="lg:w-1/2">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden relative group">
                <img
                  src={content.thumbnail || "/placeholder.svg"}
                  alt={content.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                  <Button size="lg" className="rounded-full bg-white/90 hover:bg-white text-black">
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>

                {/* Content Type Badge */}
                <Badge className="absolute top-3 left-3 bg-black/70 text-white">{content.type.toUpperCase()}</Badge>

                {/* Duration/Size */}
                {(content.duration || content.size) && (
                  <Badge className="absolute bottom-3 left-3 bg-black/70 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    {content.duration || content.size}
                  </Badge>
                )}
              </div>
            </div>

            {/* Content Info */}
            <div className="lg:w-1/2 space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
                <p className="text-gray-600">{content.description}</p>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={content.creator.avatar || "/placeholder.svg"} alt={content.creator.name} />
                  <AvatarFallback>{content.creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{content.creator.name}</span>
                    {content.creator.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {content.creator.rating.toFixed(1)}
                    </span>
                    <span>{content.creator.totalSales.toLocaleString()} sales</span>
                  </div>
                </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
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
                  <span className="font-medium">{content.rating.toFixed(1)}</span>
                  <span className="text-gray-600">({content.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{content.stats.purchases.toLocaleString()} purchases</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* What You'll Get */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What You'll Get</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {content.whatYouGet.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {content.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {content.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {content.requirements && content.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {content.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-sm">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Purchase Card */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-purple-600">{formatPrice(content.price)}</span>
                  {content.originalPrice && content.originalPrice > content.price && (
                    <span className="text-lg text-gray-500 line-through">{formatPrice(content.originalPrice)}</span>
                  )}
                </div>

                {discountPercentage > 0 && (
                  <Badge className="bg-red-500 text-white">
                    <Gift className="w-3 h-3 mr-1" />
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              <Separator className="mb-6" />

              {/* Purchase Buttons */}
              <div className="space-y-3">
                <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {content.price === 0 ? (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Get Free
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{purchaseComplete ? "Purchase Complete!" : "Complete Purchase"}</DialogTitle>
                      <DialogDescription>
                        {purchaseComplete
                          ? "Your content is ready for download"
                          : `Purchase "${content.title}" for ${formatPrice(content.price)}`}
                      </DialogDescription>
                    </DialogHeader>

                    {purchaseComplete ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-6">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Success!</h3>
                        <p className="text-gray-600 mb-4">You can now access your purchased content</p>
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          <Download className="w-4 h-4 mr-2" />
                          Download Now
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {/* Payment Methods */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Payment Method</label>
                          <div className="space-y-2">
                            {paymentMethods.map((method) => (
                              <div
                                key={method.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedPayment === method.id
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => setSelectedPayment(method.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <method.icon className="w-5 h-5" />
                                  <div className="flex-1">
                                    <div className="font-medium">{method.name}</div>
                                    <div className="text-xs text-gray-500">{method.description}</div>
                                  </div>
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 ${
                                      selectedPayment === method.id
                                        ? "border-purple-500 bg-purple-500"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {selectedPayment === method.id && (
                                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Purchase Button */}
                        <Button
                          onClick={handlePurchase}
                          disabled={isProcessing}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Complete Purchase
                            </>
                          )}
                        </Button>

                        {/* Security Notice */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                          <Shield className="w-3 h-3" />
                          <span>Secure payment powered by Stripe</span>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {content.price > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full bg-transparent"
                    onClick={() => onAddToCart?.(content.id)}
                  >
                    Add to Cart
                  </Button>
                )}
              </div>

              <Separator className="my-6" />

              {/* Guarantees */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Instant download access</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Lifetime access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
