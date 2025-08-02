"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Star, Gem, Flame, Crown, CreditCard, Lock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

type PlanType = "gold" | "diamond" | "couple"
type BillingPeriod = "monthly" | "quarterly" | "semiannual" | "annual"
type PaymentMethod = "card" | "pix"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan?: PlanType
  onSuccess?: () => void
}

const planDetails = {
  gold: {
    name: "Gold",
    icon: <Star className="w-8 h-8 text-yellow-500" />,
    monthlyPrice: 25,
    description: "Para conexões mais profundas",
    features: [
      "200 mensagens/dia (ilimitadas com verificação)",
      "10 fotos por post",
      "Vídeos até 5 minutos",
      "1GB de armazenamento",
      "Criar enquetes e eventos",
      "Menos anúncios"
    ]
  },
  diamond: {
    name: "Diamond",
    icon: <Gem className="w-8 h-8 text-cyan-500" />,
    monthlyPrice: 45,
    description: "A experiência completa",
    features: [
      "Mensagens ilimitadas",
      "20 fotos por post",
      "Vídeos até 30 minutos",
      "10GB de armazenamento",
      "Grupos até 50 membros",
      "Chamadas de voz/vídeo",
      "Stories exclusivos",
      "Sem anúncios"
    ]
  },
  couple: {
    name: "Dupla Hot",
    icon: <Flame className="w-8 h-8 text-red-500" />,
    monthlyPrice: 69.9,
    description: "Para duplas safadas",
    features: [
      "Todos os recursos Diamond para 2 contas",
      "30 fotos por post",
      "Vídeos até 1 hora",
      "20GB de armazenamento",
      "Grupos até 100 membros",
      "Perfil de casal",
      "Suporte prioritário"
    ]
  }
}

const billingPeriods = [
  { id: "monthly", label: "Mensal", discount: 0 },
  { id: "quarterly", label: "3 meses", discount: 10 },
  { id: "semiannual", label: "6 meses", discount: 15 },
  { id: "annual", label: "12 meses", discount: 20 },
]

export function PaymentModal({ isOpen, onClose, selectedPlan = "diamond", onSuccess }: PaymentModalProps) {
  const { user } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<PlanType>(selectedPlan)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<"plan" | "payment" | "processing" | "success">("plan")

  // Card form data
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
    cpf: ""
  })

  // PIX data
  const [pixData, setPixData] = useState({
    cpf: "",
    name: "",
    email: user?.email || ""
  })

  const plan = planDetails[currentPlan]
  const period = billingPeriods.find(p => p.id === billingPeriod)!
  
  const calculatePrice = () => {
    let multiplier = 1
    switch (billingPeriod) {
      case "quarterly": multiplier = 3; break
      case "semiannual": multiplier = 6; break
      case "annual": multiplier = 12; break
    }
    
    const totalPrice = plan.monthlyPrice * multiplier
    const discountedPrice = totalPrice * (1 - period.discount / 100)
    
    return {
      total: discountedPrice,
      monthly: discountedPrice / multiplier,
      savings: totalPrice - discountedPrice,
      discount: period.discount
    }
  }

  const pricing = calculatePrice()

  const handleCardPayment = async () => {
    setIsProcessing(true)
    setStep("processing")
    
    try {
      // Validate card data
      if (!cardData.name || !cardData.number || !cardData.expiry || !cardData.cvv || !cardData.cpf) {
        toast.error("Por favor, preencha todos os campos do cartão")
        setStep("payment")
        return
      }

      // In production, this would use Stripe Elements to tokenize card data
      // For now, we'll use a test payment method ID
      const testPaymentMethodId = process.env.NODE_ENV === 'development' 
        ? 'pm_card_visa' 
        : 'pm_card_visa' // Replace with actual Stripe Elements integration
      
      // Create subscription via API
      const response = await fetch('/api/v1/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_type: currentPlan,
          billing_period: billingPeriod,
          payment_method_id: testPaymentMethodId
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // In production, would need to confirm payment with Stripe if required
        if (data.data.status === 'requires_payment_method' || data.data.status === 'requires_confirmation') {
          // Handle 3D Secure or additional confirmation
          toast.info("Confirmação adicional necessária")
          // Would integrate Stripe confirmCardPayment here
        }
        
        setStep("success")
        toast.success("Pagamento processado com sucesso!")
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      } else {
        throw new Error(data.error || "Erro no pagamento")
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || "Erro ao processar pagamento")
      setStep("payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePixPayment = async () => {
    setIsProcessing(true)
    setStep("processing")
    
    try {
      // Validate PIX data
      if (!pixData.name || !pixData.cpf) {
        toast.error("Por favor, preencha todos os campos")
        setStep("payment")
        return
      }
      
      const response = await fetch('/api/v1/payments/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_type: currentPlan,
          billing_period: billingPeriod,
          customer_name: pixData.name,
          customer_cpf: pixData.cpf,
          customer_email: pixData.email || user?.email
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // Store PIX data for display
        const pixInfo = {
          code: data.data.pix_code,
          qrCode: data.data.qr_code,
          expiresAt: data.data.expires_at
        }
        
        // In a real implementation, would show QR code and copy button
        toast.success("PIX gerado! Copie o código e efetue o pagamento.")
        
        // Would typically show a modal with QR code here
        console.log('PIX Info:', pixInfo)
        
        setStep("success")
      } else {
        throw new Error(data.error || "Erro ao gerar PIX")
      }
    } catch (error: any) {
      console.error('PIX error:', error)
      toast.error(error.message || "Erro ao gerar PIX")
      setStep("payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async () => {
    if (paymentMethod === "card") {
      await handleCardPayment()
    } else {
      await handlePixPayment()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {step === "plan" && "Escolha seu Plano"}
              {step === "payment" && "Pagamento"}
              {step === "processing" && "Processando..."}
              {step === "success" && "Pagamento Concluído!"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6">
            {/* Step 1: Plan Selection */}
            {step === "plan" && (
              <div className="space-y-6">
                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(planDetails).map(([key, plan]) => (
                    <Card
                      key={key}
                      className={`p-4 cursor-pointer transition-all ${
                        currentPlan === key
                          ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setCurrentPlan(key as PlanType)}
                    >
                      <div className="text-center">
                        <div className="flex justify-center mb-2">{plan.icon}</div>
                        <h3 className="font-bold">{plan.name}</h3>
                        <p className="text-2xl font-bold text-purple-600">
                          R$ {plan.monthlyPrice}/mês
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {plan.description}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Billing Period */}
                <div>
                  <Label className="text-base font-semibold">Período de cobrança</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {billingPeriods.map((period) => (
                      <Button
                        key={period.id}
                        variant={billingPeriod === period.id ? "default" : "outline"}
                        onClick={() => setBillingPeriod(period.id as BillingPeriod)}
                        className="relative"
                      >
                        {period.label}
                        {period.discount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded-full">
                            -{period.discount}%
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold">
                      R$ {pricing.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>R$ {pricing.monthly.toFixed(2)}/mês</span>
                    {pricing.savings > 0 && (
                      <span className="text-green-600">
                        Economize R$ {pricing.savings.toFixed(2)}
                      </span>
                    )}
                  </div>
                </Card>

                <Button
                  onClick={() => setStep("payment")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  Continuar para Pagamento
                </Button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === "payment" && (
              <div className="space-y-6">
                {/* Payment Method Selection */}
                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="card">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Cartão
                    </TabsTrigger>
                    <TabsTrigger value="pix">
                      <CreditCard className="w-4 h-4 mr-2" />
                      PIX
                    </TabsTrigger>
                  </TabsList>

                  {/* Card Payment */}
                  <TabsContent value="card" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="card-name">Nome no cartão</Label>
                        <Input
                          id="card-name"
                          value={cardData.name}
                          onChange={(e) => setCardData({...cardData, name: e.target.value})}
                          placeholder="João Silva"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          value={cardData.cpf}
                          onChange={(e) => setCardData({...cardData, cpf: e.target.value})}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="card-number">Número do cartão</Label>
                      <Input
                        id="card-number"
                        value={cardData.number}
                        onChange={(e) => setCardData({...cardData, number: e.target.value})}
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Validade</Label>
                        <Input
                          id="expiry"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                          placeholder="MM/AA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                          placeholder="000"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* PIX Payment */}
                  <TabsContent value="pix" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pix-name">Nome completo</Label>
                        <Input
                          id="pix-name"
                          value={pixData.name}
                          onChange={(e) => setPixData({...pixData, name: e.target.value})}
                          placeholder="João Silva"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pix-cpf">CPF</Label>
                        <Input
                          id="pix-cpf"
                          value={pixData.cpf}
                          onChange={(e) => setPixData({...pixData, cpf: e.target.value})}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="pix-email">E-mail</Label>
                      <Input
                        id="pix-email"
                        type="email"
                        value={pixData.email}
                        onChange={(e) => setPixData({...pixData, email: e.target.value})}
                        placeholder="seu@email.com"
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Após confirmar, você receberá um código PIX para pagamento. 
                        Seu plano será ativado automaticamente após a confirmação do pagamento.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Security Notice */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>Seus dados estão protegidos com criptografia SSL</span>
                </div>

                {/* Payment Summary */}
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{plan.name} - {period.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        R$ {pricing.monthly.toFixed(2)}/mês
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">R$ {pricing.total.toFixed(2)}</p>
                      {pricing.savings > 0 && (
                        <p className="text-sm text-green-600">
                          Economize R$ {pricing.savings.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("plan")}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isProcessing ? "Processando..." : `Pagar R$ ${pricing.total.toFixed(2)}`}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Processing */}
            {step === "processing" && (
              <div className="text-center space-y-6 py-12">
                <div className="w-16 h-16 mx-auto">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Processando pagamento...</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Aguarde enquanto confirmamos seu pagamento
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <div className="text-center space-y-6 py-12">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Pagamento Concluído!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Seu plano {plan.name} foi ativado com sucesso
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}