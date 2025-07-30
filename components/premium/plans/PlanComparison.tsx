"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, Star, Heart, Users, Crown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuthStore } from "@/lib/stores/auth-store"
import { usePremiumStore } from "@/lib/stores/premium-store"

interface PlanFeature {
  name: string
  free: boolean | string
  gold: boolean | string
  diamond: boolean | string
  couple: boolean | string
  tooltip?: string
}

const features: PlanFeature[] = [
  {
    name: "Fotos por post",
    free: "1 foto",
    gold: "10 fotos",
    diamond: "20 fotos",
    couple: "30 fotos",
  },
  {
    name: "Vídeos",
    free: false,
    gold: "Até 5 min",
    diamond: "Até 30 min",
    couple: "Até 1 hora",
  },
  {
    name: "Armazenamento",
    free: "100MB",
    gold: "1GB",
    diamond: "10GB",
    couple: "20GB",
  },
  {
    name: "Enviar mensagens",
    free: "Apenas responder",
    gold: "200/dia",
    diamond: "Ilimitado",
    couple: "Ilimitado",
    tooltip: "Free users podem apenas responder mensagens de usuários premium",
  },
  {
    name: "Criar grupos",
    free: false,
    gold: false,
    diamond: "Até 50 membros",
    couple: "Até 100 membros",
  },
  {
    name: "Stories exclusivos",
    free: false,
    gold: false,
    diamond: true,
    couple: true,
  },
  {
    name: "Chamadas de voz/vídeo",
    free: false,
    gold: false,
    diamond: true,
    couple: true,
  },
  {
    name: "Criar eventos",
    free: false,
    gold: true,
    diamond: true,
    couple: true,
  },
  {
    name: "Anúncios",
    free: "A cada 5 posts",
    gold: "Menos anúncios",
    diamond: "Sem anúncios",
    couple: "Sem anúncios",
  },
  {
    name: "Suporte prioritário",
    free: false,
    gold: false,
    diamond: true,
    couple: true,
  },
]

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Para começar a conhecer pessoas",
    icon: Heart,
    color: "from-gray-400 to-gray-600",
    popular: false,
    features: ["Perfil básico", "1 foto por post", "100MB storage", "Curtir e comentar"],
  },
  {
    id: "gold",
    name: "Gold",
    price: 25,
    description: "Para conexões mais profundas",
    icon: Star,
    color: "from-yellow-400 to-yellow-600",
    popular: true,
    features: ["200 mensagens/dia", "10 fotos por post", "Vídeos até 5 min", "1GB storage"],
  },
  {
    id: "diamond",
    name: "Diamond",
    price: 45,
    description: "A experiência completa",
    icon: Crown,
    color: "from-purple-400 to-pink-600",
    popular: false,
    features: ["Mensagens ilimitadas", "20 fotos por post", "Vídeos até 30 min", "10GB storage"],
  },
  {
    id: "couple",
    name: "Dupla Hot",
    price: 69.9,
    description: "Para duplas safadas",
    icon: Users,
    color: "from-pink-400 to-red-600",
    popular: false,
    features: ["2 contas Diamond", "30 fotos por post", "Vídeos até 1 hora", "20GB storage"],
  },
]

export function PlanComparison() {
  const { user } = useAuthStore()
  const { subscribeToPlan, isLoading } = usePremiumStore()
  const [isAnnual, setIsAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free") return

    setSelectedPlan(planId)
    try {
      await subscribeToPlan(planId, isAnnual)
    } catch (error) {
      console.error("Error subscribing to plan:", error)
    } finally {
      setSelectedPlan(null)
    }
  }

  const getFeatureValue = (feature: PlanFeature, plan: string) => {
    const value = feature[plan as keyof PlanFeature]

    if (typeof value === "boolean") {
      return value ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-400" />
    }

    return <span className="text-xs text-gray-600">{value}</span>
  }

  const getPlanPrice = (price: number) => {
    if (price === 0) return "Grátis"
    const finalPrice = isAnnual ? price * 10 : price // 2 months free on annual
    return `R$ ${finalPrice.toFixed(2).replace(".", ",")}`
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Escolha seu plano
        </h1>
        <p className="text-gray-600 text-lg mb-6">Desbloqueie todo o potencial do OpenLove</p>

        {/* Annual/Monthly Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm ${!isAnnual ? "font-semibold" : "text-gray-500"}`}>Mensal</span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-pink-600"
          />
          <span className={`text-sm ${isAnnual ? "font-semibold" : "text-gray-500"}`}>Anual</span>
          {isAnnual && <Badge className="bg-green-100 text-green-800 border-green-200">2 meses grátis</Badge>}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = user?.premium_type === plan.id
          const isSelected = selectedPlan === plan.id

          return (
            <motion.div key={plan.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
              <Card
                className={`relative overflow-hidden border-2 transition-all duration-300 ${
                  plan.popular
                    ? "border-purple-500 shadow-lg shadow-purple-500/20"
                    : "border-gray-200 hover:border-purple-300"
                } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-1 text-xs font-semibold">
                    MAIS POPULAR
                  </div>
                )}

                <CardHeader className={`text-center ${plan.popular ? "pt-8" : "pt-6"}`}>
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{getPlanPrice(plan.price)}</div>
                    {plan.price > 0 && <div className="text-sm text-gray-500">{isAnnual ? "/ano" : "/mês"}</div>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan || isLoading || isSelected}
                    className={`w-full ${
                      plan.id === "free"
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    )}
                    {isCurrentPlan ? "Plano Atual" : plan.id === "free" ? "Grátis" : "Assinar Agora"}
                  </Button>

                  {isCurrentPlan && (
                    <div className="flex items-center justify-center space-x-1 text-green-600 text-sm">
                      <Shield className="h-4 w-4" />
                      <span>Ativo</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Feature Comparison Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Comparação detalhada de recursos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Recursos</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold">Gold</th>
                  <th className="text-center p-4 font-semibold">Diamond</th>
                  <th className="text-center p-4 font-semibold">Couple</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4 font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{feature.name}</span>
                        {feature.tooltip && (
                          <div className="group relative">
                            <div className="w-4 h-4 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center cursor-help">
                              ?
                            </div>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              {feature.tooltip}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">{getFeatureValue(feature, "free")}</td>
                    <td className="p-4 text-center">{getFeatureValue(feature, "gold")}</td>
                    <td className="p-4 text-center">{getFeatureValue(feature, "diamond")}</td>
                    <td className="p-4 text-center">{getFeatureValue(feature, "couple")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-bold mb-4">Dúvidas frequentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
              <p className="text-gray-600 text-sm">
                Sim, você pode cancelar sua assinatura a qualquer momento. Você continuará tendo acesso aos recursos
                premium até o final do período pago.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Como funciona o plano Couple?</h4>
              <p className="text-gray-600 text-sm">
                O plano Couple permite que duas contas tenham acesso a todos os recursos Diamond, com funcionalidades
                especiais para casais.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Quais formas de pagamento aceitas?</h4>
              <p className="text-gray-600 text-sm">
                Aceitamos cartão de crédito, débito e PIX. Todos os pagamentos são processados de forma segura.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Há desconto no plano anual?</h4>
              <p className="text-gray-600 text-sm">
                Sim! No plano anual você ganha 2 meses grátis, economizando mais de 15%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
