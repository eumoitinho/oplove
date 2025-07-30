"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Mail, ArrowRight, ArrowLeft, Shield, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase-browser"
import { toast } from "sonner"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"login" | "verification">("login")
  const [errors, setErrors] = useState({ email: "", password: "", code: "" })
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [redirectUrl, setRedirectUrl] = useState("")

  const router = useRouter()
  const supabase = createClient()

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Enviar código de verificação
  const sendVerificationCode = async () => {
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email })

      if (error) {
        console.error("Error sending verification code:", error)
        toast.error("Erro ao enviar código de verificação")
      }
    } catch (error) {
      console.error("Error sending verification code:", error)
    }
  }

  // Handle initial login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = { email: "", password: "", code: "" }
    let isValid = true

    if (!email) {
      newErrors.email = "E-mail é obrigatório"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail inválido"
      isValid = false
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória"
      isValid = false
    }

    setErrors(newErrors)

    if (isValid) {
      setLoading(true)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password })

        if (error) {
          if (error.message.includes("Email not confirmed")) {
            await sendVerificationCode()
            setStep("verification")
            setCountdown(60)
            toast.info("Código de verificação enviado para seu email")
          } else {
            setErrors({ email: "", password: error.message, code: "" })
            toast.error("Erro ao fazer login")
          }
        } else if (data.user) {
          toast.success("Login realizado com sucesso!")
          
          // Aguardar um pouco para garantir que a sessão seja estabelecida
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Try to get user profile to check account type
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("id, business_id")
              .eq("id", data.user.id)
              .single()
            
            if (!userError && userData) {
              // Check if user has account_type column
              const { data: userWithType } = await supabase
                .from("users")
                .select("account_type")
                .eq("id", data.user.id)
                .single()
              
              // Redirect based on account type if column exists
              if (userWithType?.account_type === "business" && userData?.business_id) {
                router.push("/business/dashboard")
              } else if (userWithType?.account_type === "business" && !userData?.business_id) {
                router.push("/business/register")
              } else {
                router.push("/feed")
              }
            } else {
              // Default redirect if user not found
              router.push("/feed")
            }
          } catch (error) {
            console.error("Error checking user type:", error)
            // Default redirect on error
            router.push("/feed")
          }
        }
      } catch (error) {
        console.error("Sign in error:", error)
        setErrors({ email: "", password: "Erro inesperado. Tente novamente.", code: "" })
        toast.error("Erro inesperado")
      } finally {
        setLoading(false)
      }
    }
  }

  // Verificar código
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!verificationCode) {
      setErrors({ email: "", password: "", code: "Código é obrigatório" })
      return
    }

    setLoading(true)
    
    try {
      // Tentar fazer login novamente após verificação
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password })

      if (error) {
        setErrors({ email: "", password: "", code: "Código inválido ou expirado" })
        toast.error("Código inválido")
      } else if (data.user) {
        toast.success("Verificação realizada com sucesso!")
        
        // Try to get user profile to check account type
        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, business_id")
            .eq("id", data.user.id)
            .single()
          
          let targetUrl = redirectUrl || "/feed"
          
          if (!userError && userData) {
            // Check if user has account_type column
            const { data: userWithType } = await supabase
              .from("users")
              .select("account_type")
              .eq("id", data.user.id)
              .single()
            
            // Determine redirect URL based on account type if column exists
            if (userWithType?.account_type === "business" && userData?.business_id) {
              targetUrl = "/business/dashboard"
            } else if (userWithType?.account_type === "business" && !userData?.business_id) {
              targetUrl = "/business/register"
            }
          }
          
          console.log("Redirecionando após verificação para:", targetUrl)
          // Aguardar um pouco para garantir que a sessão seja estabelecida
          setTimeout(() => {
            router.push(targetUrl as any)
          }, 500)
        } catch (error) {
          console.error("Error checking user type in verification:", error)
          // Default redirect on error
          const targetUrl = redirectUrl || "/feed"
          setTimeout(() => {
            router.push(targetUrl as any)
          }, 500)
        }
      }
    } catch (error) {
      console.error("Verification error:", error)
      setErrors({ email: "", password: "", code: "Erro inesperado" })
      toast.error("Erro na verificação")
    } finally {
      setLoading(false)
    }
  }

  // Reenviar código
  const handleResendCode = async () => {
    if (countdown > 0) return

    setLoading(true)
    try {
      await sendVerificationCode()
      setCountdown(60)
      toast.success("Código reenviado!")
    } catch (error) {
      toast.error("Erro ao reenviar código")
    } finally {
      setLoading(false)
    }
  }

  // Voltar para o login
  const handleBackToLogin = () => {
    setStep("login")
    setVerificationCode("")
    setErrors({ email: "", password: "", code: "" })
  }

  return (
    <div className="space-y-6">
      {step === "login" ? (
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              E-mail
            </label>
            <div className="mt-1 relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                aria-label="Digite seu e-mail"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              Senha
            </label>
            <div className="mt-1 relative">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                aria-label="Digite sua senha"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/forgot-password"
              className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors duration-300"
            >
              Esqueci minha senha
            </Link>
          </div>

          <div className="inline-flex w-full justify-center items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 py-3 text-base sm:text-lg group"
            >
              {loading ? "Entrando..." : "Entrar"}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerification} className="space-y-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Verificação de Segurança
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enviamos um código de verificação para <strong>{email}</strong>
            </p>
          </div>

          <div>
            <label htmlFor="code" className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              Código de Verificação
            </label>
            <div className="mt-1 relative">
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Digite o código"
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400 text-center text-lg tracking-widest"
                aria-label="Digite o código de verificação"
                maxLength={6}
              />
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.code && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code}</p>}
          </div>

          <div className="space-y-4">
            <div className="inline-flex w-full justify-center items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 py-3 text-base sm:text-lg group"
              >
                {loading ? "Verificando..." : "Verificar"}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleBackToLogin}
              className="w-full rounded-full border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || loading}
                className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `Reenviar em ${countdown}s` : "Reenviar código"}
              </button>
            </div>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm sm:text-base text-gray-700 dark:text-white/70">
        Não tem uma conta?{" "}
        <Link
          href="/register"
          className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors duration-300"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}