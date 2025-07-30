import type { Metadata } from "next"
import { VerificationForm } from "@/components/verification/VerificationForm"

export const metadata: Metadata = {
  title: "Verificação de Conta - OpenLove",
  description: "Verifique sua conta para acessar recursos premium e ganhar o selo de verificado.",
}

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verificação de Conta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete a verificação para desbloquear recursos premium e ganhar credibilidade
          </p>
        </div>
        
        <VerificationForm />
      </div>
    </div>
  )
}