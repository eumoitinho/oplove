import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export const metadata: Metadata = {
  title: "Criar Conta - OpenLove",
  description: "Crie sua conta OpenLove e comece a encontrar pessoas especiais.",
}

export default function RegisterPage() {
  return (
    <AuthLayout title="Crie sua conta" subtitle="Junte-se à comunidade OpenLove e encontre conexões autênticas.">
      <RegisterForm />
    </AuthLayout>
  )
}
