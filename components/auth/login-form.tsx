"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Mail, ArrowRight } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase-browser"
import { toast } from "sonner"

interface LoginFormErrors {
  email: string
  password: string
}

interface UserData {
  id: string
  account_type?: string
  business_id?: string
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<LoginFormErrors>({ email: "", password: "" })
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // Traduzir mensagens de erro do Supabase para português
  const translateSupabaseError = (error: any): string => {
    const errorMessage = error?.message?.toLowerCase() || ""
    
    if (errorMessage.includes("invalid login credentials") || 
        errorMessage.includes("email not confirmed") ||
        errorMessage.includes("invalid credentials")) {
      return "E-mail ou senha incorretos"
    }
    
    if (errorMessage.includes("too many requests")) {
      return "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente"
    }
    
    if (errorMessage.includes("signups not allowed")) {
      return "Cadastro não permitido no momento"
    }
    
    if (errorMessage.includes("email not confirmed")) {
      return "Por favor, confirme seu e-mail antes de fazer login"
    }
    
    if (errorMessage.includes("network")) {
      return "Erro de conexão. Verifique sua internet"
    }
    
    return "Erro inesperado. Tente novamente"
  }

  // Função unificada para redirecionamento
  const redirectUser = (userData: UserData | null) => {
    // Definir URL de destino baseada no tipo de conta
    let targetUrl = "/feed" // default
    
    if (userData?.account_type === "business") {
      targetUrl = userData.business_id ? "/business/dashboard" : "/business/register"
    }
    
    router.push(targetUrl)
  }

  // Validar formulário de login
  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = { email: "", password: "" }
    let isValid = true

    if (!email.trim()) {
      newErrors.email = "E-mail é obrigatório"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "E-mail inválido"
      isValid = false
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória"
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Handle login - versão simplificada e otimizada
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Fazer login com Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (authError) {
        const errorMessage = translateSupabaseError(authError)
        setErrors({ email: "", password: errorMessage })
        toast.error("Erro ao fazer login")
        return
      }

      if (!authData.user) {
        setErrors({ email: "", password: "Erro inesperado" })
        toast.error("Erro inesperado")
        return
      }

      // Buscar dados do usuário em uma única query otimizada
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, account_type, business_id")
        .eq("id", authData.user.id)
        .single()

      // Sucesso no login
      toast.success("Login realizado com sucesso!")
      
      // Redirecionar baseado nos dados do usuário
      redirectUser(userData)

    } catch (error) {
      console.error("Login error:", error)
      setErrors({ email: "", password: "Erro de conexão. Tente novamente" })
      toast.error("Erro inesperado")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-6">
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
              disabled={loading}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400 disabled:opacity-50"
              aria-label="Digite seu e-mail"
              autoComplete="email"
              required
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
              disabled={loading}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400 disabled:opacity-50"
              aria-label="Digite sua senha"
              autoComplete="current-password"
              required
              minLength={6}
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
            className="w-full rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 py-3 text-base sm:text-lg group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
            {!loading && (
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
            )}
          </Button>
        </div>
      </form>

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