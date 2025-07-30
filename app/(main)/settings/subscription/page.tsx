"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Download,
  RefreshCw,
  X,
  Star,
  Gem,
  Heart,
  Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { paymentService } from "@/services/payment.service"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Subscription {
  id: string
  plan_type: "gold" | "diamond" | "couple"
  status: "active" | "canceled" | "past_due" | "expired"
  billing_cycle: "monthly" | "yearly"
  amount: number
  current_period_end: string
  cancel_at_period_end: boolean
}

interface BillingHistory {
  id: string
  amount: number
  status: "completed" | "failed" | "refunded"
  created_at: string
  invoice_url?: string
  description: string
}

const planDetails = {
  gold: {
    name: "Gold",
    icon: <Star className="w-6 h-6 text-yellow-500" />,
    color: "from-yellow-500 to-orange-500",
  },
  diamond: {
    name: "Diamond",
    icon: <Gem className="w-6 h-6 text-cyan-500" />,
    color: "from-cyan-500 to-blue-500",
  },
  couple: {
    name: "Casal",
    icon: <Heart className="w-6 h-6 text-pink-500" />,
    color: "from-pink-500 to-red-500",
  },
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)
  
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      
      // Load subscription
      const subResult = await paymentService.getSubscription()
      if (subResult.success && subResult.data) {
        setSubscription(subResult.data)
      }
      
      // Load billing history
      const historyResult = await paymentService.getBillingHistory()
      if (historyResult.success && historyResult.data) {
        setBillingHistory(historyResult.data)
      }
    } catch (error) {
      showToast("Erro ao carregar dados da assinatura", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setCanceling(true)
    try {
      const result = await paymentService.cancelSubscription()
      if (result.success) {
        showToast("Assinatura cancelada com sucesso", "success")
        setCancelModalOpen(false)
        loadSubscriptionData()
      } else {
        showToast(result.error || "Erro ao cancelar assinatura", "error")
      }
    } catch (error) {
      showToast("Erro ao cancelar assinatura", "error")
    } finally {
      setCanceling(false)
    }
  }

  const handleReactivate = () => {
    router.push("/plans")
  }

  const handleUpgrade = () => {
    router.push("/plans")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">Ativa</Badge>
      case "canceled":
        return <Badge className="bg-gray-500 text-white">Cancelada</Badge>
      case "past_due":
        return <Badge className="bg-orange-500 text-white">Pendente</Badge>
      case "expired":
        return <Badge className="bg-red-500 text-white">Expirada</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const plan = subscription ? planDetails[subscription.plan_type] : null

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
          <h1 className="text-3xl font-bold">Minha Assinatura</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie seu plano e histórico de pagamentos
          </p>
        </motion.div>

        {/* Current Subscription */}
        {subscription ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Plano Atual</h2>
                  <div className="flex items-center gap-3">
                    {plan?.icon}
                    <span className="text-2xl font-bold">{plan?.name}</span>
                    {getStatusBadge(subscription.status)}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    R$ {subscription.amount.toFixed(2)}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      /{subscription.billing_cycle === "monthly" ? "mês" : "ano"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Próxima cobrança
                    </p>
                    <p className="font-medium">
                      {format(new Date(subscription.current_period_end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Método de pagamento
                    </p>
                    <p className="font-medium">•••• 4242</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {subscription.status === "active" && !subscription.cancel_at_period_end && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleUpgrade}
                      className="flex-1 sm:flex-none"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Alterar Plano
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCancelModalOpen(true)}
                      className="flex-1 sm:flex-none text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar Assinatura
                    </Button>
                  </>
                )}
                
                {subscription.cancel_at_period_end && (
                  <div className="w-full">
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <AlertCircle className="w-5 h-5" />
                        <p>
                          Sua assinatura será cancelada em{" "}
                          {format(new Date(subscription.current_period_end), "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleReactivate} className="w-full">
                      Reativar Assinatura
                    </Button>
                  </div>
                )}
                
                {(subscription.status === "canceled" || subscription.status === "expired") && (
                  <Button onClick={handleReactivate} className="w-full">
                    Assinar Novamente
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          /* No Subscription */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-8 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-center">
              <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Você está no plano gratuito</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Assine um plano premium para desbloquear todos os recursos
              </p>
              <Button
                onClick={() => router.push("/plans")}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white"
              >
                Ver Planos Premium
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Billing History */}
        {billingHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <h2 className="text-xl font-semibold mb-4">Histórico de Pagamentos</h2>
              
              <div className="space-y-3">
                {billingHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5"
                  >
                    <div className="flex items-center gap-4">
                      {payment.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : payment.status === "failed" ? (
                        <X className="w-5 h-5 text-red-500" />
                      ) : (
                        <RefreshCw className="w-5 h-5 text-gray-500" />
                      )}
                      
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(payment.created_at), "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        R$ {payment.amount.toFixed(2)}
                      </span>
                      {payment.invoice_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(payment.invoice_url, "_blank")}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Cancel Subscription Modal */}
        <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancelar Assinatura</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos
                premium ao final do período pago.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Você continuará tendo acesso até{" "}
                <strong>
                  {subscription && format(new Date(subscription.current_period_end), "dd/MM/yyyy")}
                </strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Seus dados e conteúdo serão mantidos
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Você pode reativar a qualquer momento
              </p>
            </div>
            
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setCancelModalOpen(false)}
                disabled={canceling}
              >
                Manter Assinatura
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={canceling}
              >
                {canceling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  "Confirmar Cancelamento"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}