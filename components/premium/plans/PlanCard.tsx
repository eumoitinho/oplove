"use client"

import { motion } from "framer-motion"
import { Check, Star, Crown, Users, Heart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlanCardProps {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
  current?: boolean
  onSelect: (planId: string) => void
  loading?: boolean
  annual?: boolean
}

const planIcons = {
  free: Heart,
  gold: Star,
  diamond: Crown,
  couple: Users,
}

const planColors = {
  free: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  diamond: "from-purple-400 to-pink-600",
  couple: "from-pink-400 to-red-600",
}

export function PlanCard({
  id,
  name,
  price,
  description,
  features,
  popular = false,
  current = false,
  onSelect,
  loading = false,
  annual = false,
}: PlanCardProps) {
  const Icon = planIcons[id as keyof typeof planIcons] || Zap
  const colorClass = planColors[id as keyof typeof planColors] || "from-gray-400 to-gray-600"

  const displayPrice = () => {
    if (price === 0) return "Grátis"
    const finalPrice = annual ? price * 10 : price // 2 months free on annual
    return `R$ ${finalPrice.toFixed(2).replace(".", ",")}`
  }

  const savings = annual && price > 0 ? Math.round(((price * 12 - price * 10) / (price * 12)) * 100) : 0

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative h-full">
      <Card
        className={`relative overflow-hidden border-2 transition-all duration-300 h-full flex flex-col ${
          popular
            ? "border-purple-500 shadow-lg shadow-purple-500/20 transform scale-105"
            : "border-gray-200 hover:border-purple-300"
        } ${current ? "ring-2 ring-green-500" : ""}`}
      >
        {/* Popular Badge */}
        {popular && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 text-xs font-semibold z-10">
            <div className="flex items-center justify-center space-x-1">
              <Star className="h-3 w-3" />
              <span>MAIS POPULAR</span>
              <Star className="h-3 w-3" />
            </div>
          </div>
        )}

        {/* Savings Badge */}
        {annual && savings > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">-{savings}%</Badge>
          </div>
        )}

        <CardHeader className={`text-center flex-shrink-0 ${popular ? "pt-12" : "pt-6"}`}>
          {/* Icon */}
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center shadow-lg`}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>

          {/* Plan Name */}
          <CardTitle className="text-2xl font-bold mb-2">{name}</CardTitle>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 min-h-[2.5rem] flex items-center justify-center">{description}</p>

          {/* Price */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{displayPrice()}</div>
            {price > 0 && <div className="text-sm text-gray-500">{annual ? "/ano" : "/mês"}</div>}
            {annual && price > 0 && (
              <div className="text-xs text-green-600 font-medium mt-1">2 meses grátis inclusos</div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Features List */}
          <ul className="space-y-3 mb-6 flex-1">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 text-sm"
              >
                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* Action Button */}
          <div className="space-y-3">
            <Button
              onClick={() => onSelect(id)}
              disabled={current || loading}
              className={`w-full transition-all duration-300 ${
                id === "free"
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                  : `bg-gradient-to-r ${colorClass} hover:opacity-90 text-white shadow-lg hover:shadow-xl`
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              )}
              {current ? "Plano Atual" : id === "free" ? "Continuar Grátis" : "Assinar Agora"}
            </Button>

            {/* Current Plan Indicator */}
            {current && (
              <div className="flex items-center justify-center space-x-2 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Plano Ativo</span>
              </div>
            )}

            {/* Trial Info */}
            {!current && id !== "free" && (
              <p className="text-xs text-gray-500 text-center">7 dias grátis • Cancele quando quiser</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
