"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PaymentModal } from "@/components/common/PaymentModal"

export default function TestPaymentPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"gold" | "diamond" | "couple">("gold")

  const openModal = (plan: "gold" | "diamond" | "couple") => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste do Sistema de Pagamento</h1>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Escolha um plano para testar:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => openModal("gold")}
              className="p-6 h-auto flex flex-col items-center"
              variant="outline"
            >
              <span className="text-2xl mb-2">⭐</span>
              <span className="font-bold">Plano Gold</span>
              <span className="text-sm text-gray-500">R$ 25,00/mês</span>
            </Button>
            
            <Button 
              onClick={() => openModal("diamond")}
              className="p-6 h-auto flex flex-col items-center"
              variant="outline"
            >
              <span className="text-2xl mb-2">💎</span>
              <span className="font-bold">Plano Diamond</span>
              <span className="text-sm text-gray-500">R$ 45,00/mês</span>
            </Button>
            
            <Button 
              onClick={() => openModal("couple")}
              className="p-6 h-auto flex flex-col items-center"
              variant="outline"
            >
              <span className="text-2xl mb-2">🔥</span>
              <span className="font-bold">Plano Dupla Hot</span>
              <span className="text-sm text-gray-500">R$ 69,90/mês</span>
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm">
            <strong>Modo de Teste:</strong> Use o cartão 4242 4242 4242 4242 para testar pagamentos com Stripe.
          </p>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlan}
        onSuccess={() => {
          console.log("Pagamento concluído com sucesso!")
          alert("Pagamento processado com sucesso!")
        }}
      />
    </div>
  )
}