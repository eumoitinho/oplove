import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export const metadata: Metadata = {
  title: "Recuperar Senha - OpenLove",
  description: "Recupere o acesso à sua conta OpenLove.",
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Esqueceu sua senha?" subtitle="Digite seu email para receber instruções de recuperação.">
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
