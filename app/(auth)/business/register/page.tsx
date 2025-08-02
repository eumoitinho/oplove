import type { Metadata } from "next"
import { BusinessRegisterForm } from "@/components/auth/business-register-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export const metadata: Metadata = {
  title: "Configurar Negócio - OpenLove",
  description: "Configure seu perfil empresarial no OpenLove.",
}

export default function BusinessRegisterPage() {
  return (
    <AuthLayout 
      title="Configure seu Negócio" 
      subtitle="Complete o seu perfil empresarial para começar a vender e anunciar no OpenLove."
    >
      <BusinessRegisterForm />
    </AuthLayout>
  )
}