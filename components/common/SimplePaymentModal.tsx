"use client"

import { useState } from "react"
import { X, CreditCard, Smartphone, Crown, Gem, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { notification } from "@/lib/services/notification-service"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type PlanType = "gold" | "diamond" | "couple"
type PaymentMethod = "card" | "pix"

interface SimplePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan?: PlanType
  onSuccess?: () => void
}

const planConfig = {
  gold: {
    name: "Gold",
    price: "R$ 25/mês",
    icon: <Crown className="w-5 h-5 text-yellow-500" />,
    color: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
  },
  diamond: {
    name: "Diamond",
    price: "R$ 45/mês",
    icon: <Gem className="w-5 h-5 text-cyan-500" />,
    color: "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
  },
  couple: {
    name: "Dupla Hot",
    price: "R$ 69,90/mês",
    icon: <Flame className="w-5 h-5 text-red-500" />,
    color: "border-red-500 bg-red-50 dark:bg-red-900/20"
  }
}

export function SimplePaymentModal({ isOpen, onClose, selectedPlan = "gold", onSuccess }: SimplePaymentModalProps) {
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix")
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cpf, setCpf] = useState("")
  const [pixId, setPixId] = useState<string | null>(null)
  const [showPixCode, setShowPixCode] = useState(false)

  const plan = planConfig[selectedPlan]
  const isDevelopment = process.env.NODE_ENV === 'development'

  const simulatePixPayment = async () => {
    if (!pixId) return
    
    setIsProcessing(true)
    try {
      const response = await fetch('/api/v1/payments/simulate-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixId })
      })

      if (response.ok) {
        notification.success("Pagamento simulado com sucesso!")
        onSuccess?.()
        onClose()
      } else {
        throw new Error("Erro ao simular pagamento")
      }
    } catch (error) {
      notification.error("Erro ao simular pagamento")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      if (paymentMethod === "pix") {
        const response = await fetch('/api/v1/payments/create-pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_type: selectedPlan,
            billing_period: 'monthly'
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.pixCode) {
            setPixId(data.pixId)
            setShowPixCode(true)
            notification.success("PIX gerado! Copie o código ou escaneie o QR Code")
          } else {
            throw new Error("Código PIX não recebido")
          }
        } else {
          throw new Error("Erro ao gerar PIX")
        }
      } else {
        // Card payment
        const response = await fetch('/api/v1/payments/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_type: selectedPlan,
            billing_period: 'monthly',
            payment_method_id: 'pm_card_visa' // In production, use Stripe Elements
          })
        })

        if (response.ok) {
          notification.success("Pagamento processado com sucesso!")
          onSuccess?.()
          onClose()
        } else {
          throw new Error("Erro no pagamento")
        }
      }
    } catch (error) {
      notification.error("Erro ao processar pagamento")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {plan.icon}
            <div>
              <h2 className="text-lg font-semibold">Plano {plan.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{plan.price}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!showPixCode ? (
            <>
              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === "pix" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("pix")}
                  className="w-full"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  PIX
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className="w-full"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Cartão
                </Button>
              </div>

              {/* Payment Form */}
              {paymentMethod === "pix" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
                Você receberá um código PIX após confirmar. O plano será ativado automaticamente após o pagamento.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardName">Nome no cartão</Label>
                <Input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="João Silva"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Número do cartão</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardExpiry">Validade</Label>
                  <Input
                    id="cardExpiry"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cardCvv">CVV</Label>
                  <Input
                    id="cardCvv"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="000"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isProcessing ? "Processando..." : "Confirmar Pagamento"}
          </Button>

              {/* Security Notice */}
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Pagamento seguro processado por {paymentMethod === "pix" ? "AbacatePay" : "Stripe"}
              </p>
            </>
          ) : (
            // PIX Code Display
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Código PIX Gerado</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Copie o código abaixo ou escaneie o QR Code
                </p>
                
                {/* QR Code placeholder */}
                <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-sm text-gray-500">QR Code aqui</p>
                </div>
                
                {/* PIX Code */}
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg break-all text-xs">
                  {pixId || "00020126580014BR.GOV.BCB.PIX..."}
                </div>
                
                {/* Copy button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(pixId || "")
                    notification.success("Código copiado!")
                  }}
                  className="mt-4"
                >
                  Copiar código PIX
                </Button>
                
                {/* Simulate payment button (dev only) */}
                {isDevelopment && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                      Modo de desenvolvimento
                    </p>
                    <Button
                      type="button"
                      onClick={simulatePixPayment}
                      disabled={isProcessing}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isProcessing ? "Simulando..." : "Simular Pagamento PIX"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}