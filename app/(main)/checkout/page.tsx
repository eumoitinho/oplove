"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CreditCard, Smartphone, Lock, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { paymentService } from "@/services/payment.service"
import { cn } from "@/lib/utils"
import Image from "next/image"

type PaymentMethod = "credit_card" | "pix"
type PlanType = "gold" | "diamond" | "couple"

interface CheckoutData {
  plan: PlanType
  period: "monthly" | "quarterly" | "semiannual" | "annual"
  price: number
  discount: number
}

const planDetails = {
  gold: {
    name: "Gold",
    color: "from-yellow-500 to-orange-500",
    monthly: 25,
  },
  diamond: {
    name: "Diamond",
    color: "from-cyan-500 to-blue-500",
    monthly: 45,
  },
  couple: {
    name: "Casal",
    color: "from-pink-500 to-red-500",
    monthly: 69.9,
  },
}

function CheckoutContent() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card")
  const [loading, setLoading] = useState(false)
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  })
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const plan = searchParams.get("plan") as PlanType
    const period = searchParams.get("period") as any
    
    if (!plan || !period || !planDetails[plan]) {
      router.push("/plans")
      return
    }

    const monthlyPrice = planDetails[plan].monthly
    let discount = 0
    let multiplier = 1
    
    switch (period) {
      case "quarterly":
        discount = 10
        multiplier = 3
        break
      case "semiannual":
        discount = 15
        multiplier = 6
        break
      case "annual":
        discount = 20
        multiplier = 12
        break
    }
    
    const totalPrice = monthlyPrice * multiplier
    const finalPrice = totalPrice * (1 - discount / 100)
    
    setCheckoutData({
      plan,
      period,
      price: finalPrice,
      discount,
    })
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !checkoutData) {
      toast({
        title: "Erro ao processar pagamento",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      if (paymentMethod === "credit_card") {
        // Test mode for Stripe
        const isTestMode = process.env.NODE_ENV === "development"
        
        if (isTestMode) {
          toast({
            title: "Modo de teste Stripe ativado",
            description: "Simulando pagamento com cartão de teste..."
          })
          
          // Use test card numbers
          const testCards = {
            success: "4242424242424242",
            declined: "4000000000000002",
            authentication: "4000002500003155"
          }
          
          // Check if using test card
          const cleanNumber = cardData.number.replace(/\s/g, "")
          const isTestCard = Object.values(testCards).includes(cleanNumber)
          
          if (isTestCard) {
            // Simulate Stripe payment
            await new Promise((resolve) => setTimeout(resolve, 2000))
            
            if (cleanNumber === testCards.success) {
              // Success scenario
              const result = await paymentService.createSubscription({
                planType: checkoutData.plan,
                billingCycle: checkoutData.period,
                paymentMethodId: "pm_card_visa_test",
                testMode: true,
                ...cardData,
              })
              
              if (result.success) {
                toast({
                  title: "✅ Pagamento de teste realizado com sucesso!",
                  description: `Plano ${checkoutData.plan} ativado (TESTE)`
                })
                
                // Update user's premium status locally for testing
                setTimeout(() => {
                  router.push("/feed")
                }, 1500)
              }
            } else if (cleanNumber === testCards.declined) {
              toast({
                title: "❌ Cartão recusado (teste)",
                description: "Use 4242 4242 4242 4242 para teste de sucesso",
                variant: "destructive"
              })
            } else if (cleanNumber === testCards.authentication) {
              toast({
                title: "🔐 Autenticação necessária (teste)",
                description: "Simulando 3D Secure..."
              })
              // Simulate 3D Secure flow
              await new Promise((resolve) => setTimeout(resolve, 3000))
              toast({
                title: "✅ Autenticação concluída",
                description: "Pagamento aprovado após autenticação"
              })
              router.push("/feed")
            }
          } else {
            // For non-test cards in dev mode
            toast({
              title: "Use um cartão de teste",
              description: "Em desenvolvimento, use: 4242 4242 4242 4242",
              variant: "destructive"
            })
          }
        } else {
          // Production mode - real Stripe integration
          const result = await paymentService.createSubscription({
            planType: checkoutData.plan,
            billingCycle: checkoutData.period,
            paymentMethodId: "credit_card",
            ...cardData,
          })
          
          if (result.success) {
            toast({
              title: "Pagamento realizado com sucesso!"
            })
            router.push("/feed")
          } else {
            toast({
              title: result.error || "Erro ao processar pagamento",
              variant: "destructive"
            })
          }
        }
      } else {
        // PIX payment with AbacatePay (test mode)
        toast({
          title: "Gerando PIX de teste...",
          description: "Aguarde enquanto criamos o código PIX"
        })
        
        const response = await fetch("/api/test/abacatepay-pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: checkoutData.plan,
            customer_email: user.email || "test@example.com",
            customer_name: user.name || "Test User",
            billing_cycle: checkoutData.period === "monthly" ? "monthly" : "yearly",
            simulate_payment: true,  // Auto-simulate payment
            simulate_delay: 10       // Simulate after 10 seconds
          }),
        })
        
        const data = await response.json()
        
        if (data.success) {
          toast({
            title: "✅ PIX gerado com sucesso!",
            description: "Pagamento será simulado em 10 segundos"
          })
          
          // Redirect to PIX payment page with real data
          const pixData = data.data
          router.push(
            `/payment/pix?code=${encodeURIComponent(pixData.pix_code)}&qr=${encodeURIComponent(pixData.qr_code_image)}&id=${pixData.payment_id}&expires=${pixData.expires_at}&test=true`
          )
        } else {
          toast({
            title: data.error || "Erro ao gerar PIX",
            description: "Verifique o console para mais detalhes",
            variant: "destructive"
          })
          console.error("PIX Error:", data)
        }
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Erro ao processar pagamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4)
    }
    return v
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const plan = planDetails[checkoutData.plan]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))]" />

      <main className="relative z-10 container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/plans")}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar aos Planos
          </Button>
          
          <h1 className="text-3xl font-bold">Finalizar Assinatura</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Complete seu pagamento para ativar o plano {plan.name}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <form onSubmit={handleSubmit}>
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <Label className="text-lg font-semibold mb-4 block">
                    Método de Pagamento
                  </Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  >
                    <div className="space-y-3">
                      <div
                        className={cn(
                          "flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          paymentMethod === "credit_card"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                        )}
                        onClick={() => setPaymentMethod("credit_card")}
                      >
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label htmlFor="credit_card" className="flex items-center cursor-pointer">
                          <CreditCard className="w-5 h-5 mr-2" />
                          Cartão de Crédito/Débito
                        </Label>
                      </div>
                      
                      <div
                        className={cn(
                          "flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          paymentMethod === "pix"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                        )}
                        onClick={() => setPaymentMethod("pix")}
                      >
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex items-center cursor-pointer">
                          <Smartphone className="w-5 h-5 mr-2" />
                          PIX
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Credit Card Form */}
                {paymentMethod === "credit_card" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Test Mode Banner */}
                    {process.env.NODE_ENV === "development" && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          🧪 Modo de Teste Ativado
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                          Use os seguintes cartões de teste:
                        </p>
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between items-center p-2 bg-white dark:bg-black/20 rounded">
                            <span>✅ Sucesso:</span>
                            <span className="select-all">4242 4242 4242 4242</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white dark:bg-black/20 rounded">
                            <span>❌ Recusado:</span>
                            <span className="select-all">4000 0000 0000 0002</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white dark:bg-black/20 rounded">
                            <span>🔐 3D Secure:</span>
                            <span className="select-all">4000 0025 0000 3155</span>
                          </div>
                        </div>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                          Use qualquer CVV (ex: 123) e data futura (ex: 12/25)
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.number}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            number: formatCardNumber(e.target.value),
                          })
                        }
                        maxLength={19}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        placeholder="João Silva"
                        value={cardData.name}
                        onChange={(e) =>
                          setCardData({ ...cardData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Validade</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              expiry: formatExpiry(e.target.value),
                            })
                          }
                          maxLength={5}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardCvc">CVV</Label>
                        <Input
                          id="cardCvc"
                          placeholder="123"
                          value={cardData.cvc}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              cvc: e.target.value.replace(/\D/g, "").slice(0, 3),
                            })
                          }
                          maxLength={3}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PIX Info */}
                {paymentMethod === "pix" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Test Mode Banner for PIX */}
                    {process.env.NODE_ENV === "development" && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          🧪 PIX de Teste
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          O pagamento será simulado automaticamente após 10 segundos.
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Você pode escanear o QR Code real ou aguardar a simulação automática.
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6">
                      <h3 className="font-semibold mb-3">Como funciona o PIX?</h3>
                      <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>1. Clique em "Gerar PIX" para criar o código de pagamento</li>
                        <li>2. Escaneie o QR Code ou copie o código PIX</li>
                        <li>3. Faça o pagamento usando seu app bancário</li>
                        <li>4. Sua assinatura será ativada automaticamente</li>
                      </ol>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                        {process.env.NODE_ENV === "development" 
                          ? "⚡ Em modo de teste, o pagamento será simulado em 10 segundos"
                          : "O código PIX expira em 30 minutos"}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : paymentMethod === "pix" ? (
                    "Gerar PIX"
                  ) : (
                    "Finalizar Pagamento"
                  )}
                </Button>

                {/* Security Badge */}
                <div className="flex items-center justify-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <Lock className="w-4 h-4 mr-1" />
                  Pagamento seguro processado por Stripe e AbacatePay
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
              
              {/* Plan Info */}
              <div className="mb-6">
                <div
                  className={cn(
                    "p-4 rounded-xl bg-gradient-to-r",
                    plan.color,
                    "text-white"
                  )}
                >
                  <h3 className="text-lg font-semibold">Plano {plan.name}</h3>
                  <p className="text-sm opacity-90">
                    {checkoutData.period === "monthly"
                      ? "Cobrança mensal"
                      : checkoutData.period === "quarterly"
                      ? "Cobrança trimestral"
                      : checkoutData.period === "semiannual"
                      ? "Cobrança semestral"
                      : "Cobrança anual"}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>
                    R$ {(plan.monthly * (checkoutData.period === "monthly" ? 1 : checkoutData.period === "quarterly" ? 3 : checkoutData.period === "semiannual" ? 6 : 12)).toFixed(2)}
                  </span>
                </div>
                
                {checkoutData.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Desconto ({checkoutData.discount}%)</span>
                    <span>
                      -R$ {((plan.monthly * (checkoutData.period === "monthly" ? 1 : checkoutData.period === "quarterly" ? 3 : checkoutData.period === "semiannual" ? 6 : 12)) * checkoutData.discount / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="h-px bg-gray-200 dark:bg-white/10" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>R$ {checkoutData.price.toFixed(2)}</span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Equivalente a R$ {(checkoutData.price / (checkoutData.period === "monthly" ? 1 : checkoutData.period === "quarterly" ? 3 : checkoutData.period === "semiannual" ? 6 : 12)).toFixed(2)}/mês
                </div>
              </div>

              {/* Features Reminder */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                <h4 className="font-medium mb-2">Você terá acesso a:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {checkoutData.plan === "gold" && (
                    <>
                      <li>• Mensagens ilimitadas (verificado)</li>
                      <li>• Upload de até 5 imagens por post</li>
                      <li>• Criar eventos ilimitados</li>
                    </>
                  )}
                  {checkoutData.plan === "diamond" && (
                    <>
                      <li>• Todos os recursos ilimitados</li>
                      <li>• Chamadas de voz e vídeo</li>
                      <li>• Monetização de conteúdo</li>
                      <li>• Sem anúncios</li>
                    </>
                  )}
                  {checkoutData.plan === "couple" && (
                    <>
                      <li>• Tudo do Diamond para 2 contas</li>
                      <li>• Perfil compartilhado</li>
                      <li>• Recursos exclusivos para casais</li>
                    </>
                  )}
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}