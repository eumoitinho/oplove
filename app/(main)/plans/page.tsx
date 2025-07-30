"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, X, Star, Gem, Flame, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { PaymentModal } from "@/components/common/PaymentModal"
import { cn } from "@/lib/utils"

type PlanType = "free" | "gold" | "diamond" | "couple"
type BillingPeriod = "monthly" | "quarterly" | "semiannual" | "annual"

interface Plan {
  id: PlanType
  name: string
  description: string
  icon: React.ReactNode
  monthlyPrice: number
  features: string[]
  limitations: string[]
  highlighted?: boolean
  badge?: string
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    description: "Para quem está começando",
    icon: <Crown className="w-8 h-8" />,
    monthlyPrice: 0,
    features: [
      "Criar posts sem mídia",
      "Responder mensagens de usuários premium",
      "Ver perfis públicos",
      "3 fotos/mês no perfil",
    ],
    limitations: [
      "Não pode iniciar conversas",
      "Não pode fazer upload de mídia em posts",
      "Não pode criar eventos",
      "Não pode entrar em comunidades",
      "Vê anúncios a cada 5 posts",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    description: "Para conexões mais profundas",
    icon: <Star className="w-8 h-8 text-yellow-500" />,
    monthlyPrice: 25,
    features: [
      "10 mensagens/dia (sem verificação)",
      "Mensagens ilimitadas (com verificação)",
      "Até 5 imagens por post",
      "Criar 3 eventos/mês (sem verificação)",
      "Eventos ilimitados (com verificação)",
      "Entrar em até 5 comunidades",
      "Vê anúncios a cada 10 posts",
    ],
    limitations: [
      "Não pode criar grupos",
      "Sem chamadas de voz/vídeo",
      "Sem Stories",
      "Não pode monetizar conteúdo",
    ],
  },
  {
    id: "diamond",
    name: "Diamond",
    description: "A experiência completa",
    icon: <Gem className="w-8 h-8 text-cyan-500" />,
    monthlyPrice: 45,
    features: [
      "Tudo ilimitado",
      "Criar grupos (até 50 membros)",
      "Chamadas de voz/vídeo",
      "Stories de 24h",
      "Análises do perfil",
      "Monetização de conteúdo",
      "Sem anúncios",
      "Suporte prioritário",
    ],
    limitations: [],
    highlighted: true,
    badge: "Mais Popular",
  },
  {
    id: "couple",
    name: "Dupla Hot",
    description: "Para duplas safadas",
    icon: <Flame className="w-8 h-8 text-red-500" />,
    monthlyPrice: 69.9,
    features: [
      "Todos os recursos Diamond para 2 contas",
      "Perfis sincronizados automaticamente",
      "Posts aparecem nos dois perfis",
      "Timeline compartilhada em tempo real",
      "Lives e transmissões conjuntas",
      "Monetização em conjunto",
      "Badge especial de 'Dupla Verificada'",
    ],
    limitations: [],
  },
]

const billingPeriods = [
  { id: "monthly", label: "Mensal", discount: 0 },
  { id: "quarterly", label: "Trimestral", discount: 10 },
  { id: "semiannual", label: "Semestral", discount: 15 },
  { id: "annual", label: "Anual", discount: 20 },
]

export default function PlansPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>("monthly")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"gold" | "diamond" | "couple">("diamond")
  const { user } = useAuth()
  const router = useRouter()

  const handleSelectPlan = (planId: PlanType) => {
    if (planId === "free") return
    
    setSelectedPlan(planId as "gold" | "diamond" | "couple")
    setIsPaymentModalOpen(true)
  }

  const calculatePrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) {
      return {
        total: 0,
        monthly: 0,
        savings: 0,
        discount: 0,
      }
    }
    
    const period = billingPeriods.find((p) => p.id === selectedPeriod)
    const discount = period?.discount || 0
    
    let multiplier = 1
    switch (selectedPeriod) {
      case "quarterly":
        multiplier = 3
        break
      case "semiannual":
        multiplier = 6
        break
      case "annual":
        multiplier = 12
        break
    }
    
    const totalPrice = monthlyPrice * multiplier
    const discountedPrice = totalPrice * (1 - discount / 100)
    
    return {
      total: discountedPrice,
      monthly: discountedPrice / multiplier,
      savings: totalPrice - discountedPrice,
      discount,
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))]" />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="absolute top-[40%] right-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-pink-500/10 to-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[15%] left-[15%] w-72 h-72 rounded-full bg-gradient-to-r from-cyan-500/10 to-orange-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 text-transparent bg-clip-text mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Desbloqueie recursos premium e conecte-se de forma mais profunda
          </p>
        </motion.div>

        {/* Billing Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-full p-1 border border-gray-200 dark:border-white/10">
            {billingPeriods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id as BillingPeriod)}
                className={cn(
                  "px-6 py-2 rounded-full transition-all duration-300",
                  selectedPeriod === period.id
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {period.label}
                {period.discount > 0 && (
                  <span className="ml-2 text-xs">-{period.discount}%</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const pricing = calculatePrice(plan.monthlyPrice)
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card
                  className={cn(
                    "relative h-full flex flex-col p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105",
                    plan.highlighted
                      ? "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-cyan-500/20 border-purple-500/20"
                      : "bg-white/80 dark:bg-white/5 border-gray-200 dark:border-white/10"
                  )}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">{plan.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6">
                    {pricing.total === 0 ? (
                      <div className="text-4xl font-bold">Grátis</div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold">
                          R$ {pricing.monthly.toFixed(2)}
                          <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                            /mês
                          </span>
                        </div>
                        {selectedPeriod !== "monthly" && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Total: R$ {pricing.total.toFixed(2)}
                            {pricing.savings > 0 && (
                              <span className="text-green-600 dark:text-green-400 ml-1">
                                (economize R$ {pricing.savings.toFixed(2)})
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation) => (
                      <div key={limitation} className="flex items-start gap-2">
                        <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {limitation}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={cn(
                      "w-full",
                      plan.id === "free"
                        ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                        : plan.highlighted
                        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white"
                        : ""
                    )}
                    disabled={plan.id === "free" || user?.premium_type === plan.id}
                  >
                    {user?.premium_type === plan.id
                      ? "Plano Atual"
                      : plan.id === "free"
                      ? "Plano Atual"
                      : "Escolher Plano"}
                  </Button>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sim! Você pode cancelar sua assinatura a qualquer momento. O acesso aos recursos
                premium continuará até o final do período pago.
              </p>
            </Card>
            <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <h3 className="font-semibold mb-2">Quais formas de pagamento são aceitas?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aceitamos cartões de crédito/débito (Visa, Mastercard, Elo) e PIX. O pagamento
                é processado de forma segura através do Stripe e AbacatePay.
              </p>
            </Card>
            <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <h3 className="font-semibold mb-2">O que é a verificação de identidade?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                A verificação desbloqueia recursos adicionais no plano Gold. É um processo
                simples de envio de documento e selfie que leva até 48h para ser aprovado.
              </p>
            </Card>
          </div>
        </motion.div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPlan={selectedPlan}
        onSuccess={() => {
          setIsPaymentModalOpen(false)
          router.push('/feed')
        }}
      />
    </div>
  )
}