"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import toast from "react-hot-toast"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, isLoading } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    const result = await signIn(data.email, data.password)

    if (result.success) {
      toast.success("Login realizado com sucesso!")
      router.push("/feed")
    } else {
      toast.error(result.error || "Erro ao fazer login")
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div>
        <Input
          {...register("email")}
          type="email"
          placeholder="Seu email"
          icon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
        />
      </div>

      <div>
        <Input
          {...register("password")}
          type={showPassword ? "text" : "password"}
          placeholder="Sua senha"
          icon={<Lock className="h-5 w-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          error={errors.password?.message}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Lembrar de mim</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400">
          Esqueceu a senha?
        </Link>
      </div>

      <Button type="submit" className="w-full" loading={isLoading}>
        Entrar
      </Button>

      <div className="text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-purple-600 hover:text-purple-500 dark:text-purple-400 font-medium">
            Cadastre-se
          </Link>
        </span>
      </div>
    </motion.form>
  )
}
