import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Criar Conta - OpenLove",
  description: "Crie sua conta OpenLove e comece a encontrar pessoas especiais.",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
            <span className="text-gray-900 dark:text-white">open</span>
            <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
              love
            </span>
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-4 text-gray-900 dark:text-white">
            Crie sua conta
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-white/70 mt-2">
            Junte-se à comunidade OpenLove e encontre conexões autênticas.
          </p>
        </div>
        
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 p-8 sm:p-12 shadow-xl">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
