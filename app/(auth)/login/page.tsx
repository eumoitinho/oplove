import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export const metadata: Metadata = {
  title: "Entrar - OpenLove",
  description: "Entre na sua conta OpenLove e conecte-se com pessoas especiais.",
}

export default function LoginPage() {
  return (
    <AuthLayout title="Bem-vindo de volta!" subtitle="Entre na sua conta para continuar sua jornada no amor.">
      <LoginForm />
    </AuthLayout>
  )
}
