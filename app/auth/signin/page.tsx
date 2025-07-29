"use client"

import type React from "react"

import { Button, Input } from "@heroui/react"
import { Moon, Sun, Lock, Mail, ArrowRight, ArrowLeft, Shield, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase-browser"
import { toast } from "sonner"
import { useAuth } from "@/app/components/auth/AuthProvider"

export default function SignInPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
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

  const { user, loading: authLoading } = useAuth()

  // Check system preference on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, [])

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

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
          
          // Usar router.push ao invés de window.location.href
          const targetUrl = redirectUrl || "/home"
          console.log("Redirecionando para:", targetUrl)
          
          // Aguardar a propagação da sessão
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Fazer refresh e redirecionar
          router.refresh()
          router.push(targetUrl)
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
              } else {
          toast.success("Verificação realizada com sucesso!")
          const targetUrl = redirectUrl || "/home"
          console.log("Redirecionando após verificação para:", targetUrl)
          // Aguardar um pouco para garantir que a sessão seja estabelecida
          setTimeout(() => {
            window.location.href = targetUrl
          }, 500)
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
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-500 flex items-center justify-center px-4 sm:px-6 lg:px-8`}
    >
      {/* Custom CSS for enhanced UX */}
      <style jsx global>{`
        ::selection {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.2)"};
          color: ${isDarkMode ? "#ffffff" : "#1f2937"};
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? "rgba(15, 23, 42, 0.1)" : "rgba(243, 244, 246, 0.5)"};
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.3)"};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.5)" : "rgba(190, 24, 93, 0.5)"};
        }
        /* Breathing animation */
        @keyframes subtle-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
        .subtle-breathe {
          animation: subtle-breathe 6s ease-in-out infinite;
          will-change: transform;
        }
        /* Hardware acceleration */
        .hw-accelerate {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>

      {/* Artistic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(190,24,93,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))]" />
      <div className="fixed top-0 left-0 w-full h-full">
        <div className="absolute top-[10%] left-[5%] w-32 sm:w-64 h-32 sm:h-64 rounded-full bg-gradient-to-r from-pink-500/5 to-purple-500/5 dark:from-pink-500/10 dark:to-purple-500/10 blur-3xl subtle-breathe" />
        <div
          className="absolute top-[40%] right-[10%] w-40 sm:w-80 h-40 sm:h-80 rounded-full bg-gradient-to-r from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[15%] left-[15%] w-36 sm:w-72 h-36 sm:h-72 rounded-full bg-gradient-to-r from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md">
        {/* Theme Toggle */}
        <nav
          className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50"
          role="navigation"
          aria-label="Theme navigation"
        >
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="text-sm sm:text-lg font-light text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 px-2 sm:px-4 rounded-full group"
            aria-label="Toggle between light and dark theme"
          >
            <div className="group-hover:rotate-180 transition-transform duration-500">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </div>
          </Button>
        </nav>

        {/* Login Form */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-white">open</span>
              <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
                love
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-700 dark:text-white/70 mt-2">
              {step === "login" ? "Entre para se conectar com pessoas incríveis" : "Verifique seu email para continuar"}
            </p>
          </div>

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
                  variant="bordered"
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
              href="/auth/signup"
              className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors duration-300"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center w-full text-gray-500 dark:text-white/50 text-sm">
        <p>© 2025 OpenLove. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
