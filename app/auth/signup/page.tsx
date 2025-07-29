"use client"

import { Button, Input, Checkbox, Badge } from "@heroui/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Moon, Sun, MapPin, Camera, ArrowRight, ArrowLeft, Mail, Lock, User, AtSign, Calendar, StarIcon, GemIcon, CrownIcon, CheckIcon } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PaymentProvider from "@/app/components/PaymentProvider"
import { createClient } from "@/app/lib/supabase-browser"

interface FormData {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  confirmPassword: string
  birthDate: string
  profileType: "single" | "couple"
  seeking: string[]
  interests: string[]
  otherInterest: string
  profilePicture: File | null
  bio: string
  partner: {
    nickname: string
    age: string
    height: string
    weight: string
    eyeColor: string
    hairColor: string
  }
  city: string
  plan: "free" | "gold" | "diamante" | "diamante_anual"
  latitude: number | null
  longitude: number | null
  uf: string
}

interface FormErrors {
  [key: string]: string
}

declare global {
  interface Window {
    usernameTimeout?: NodeJS.Timeout
  }
}

export default function OpenLoveRegister() {
  const [isDarkMode, setIsDarkMode] = useState(false) // Tema claro padrão
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    username: "", // @usuario único
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "", // Data de nascimento
    profileType: "single", // single or couple
    seeking: [], // woman, man, couple
    interests: [], // menage, swing, etc.
    otherInterest: "",
    profilePicture: null,
    bio: "",
    partner: {
      nickname: "",
      age: "",
      height: "",
      weight: "",
      eyeColor: "",
      hairColor: "" },
    city: "",
    plan: "free", // free or premium
    latitude: null,
    longitude: null,
    uf: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const usernameTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const router = useRouter()

  // Check system preference on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(false) // Forçar tema claro como padrão
      document.documentElement.classList.remove("dark")
    }
  }, [])

  // Limpar timeout do username quando componente for desmontado
  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current)
      }
    }
  }, [])


  // Função para buscar localização ao focar no campo de cidade
  const handleCityFocus = async () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      // Primeiro, solicitar permissão explicitamente
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          })
        })
        
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`)
          const data = await res.json()
          const city = data.address.city || data.address.town || data.address.village || data.address.county || ""
          const state = data.address.state || data.address.region || ""
          setFormData((prev) => ({ ...prev, city, uf: state, latitude, longitude }))
        } catch (e) {
          console.error("Erro ao buscar cidade:", e)
          setFormData((prev) => ({ ...prev, latitude, longitude }))
        }
      } catch (error) {
        console.error("Erro ao obter localização:", error)
        // Se não conseguir localização automática, não fazer nada
      }
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  // Mock function for username availability check
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    setCheckingUsername(true)
    try {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      setUsernameAvailable(data.available)
    } catch {
      setUsernameAvailable(null)
    } finally {
      setCheckingUsername(false)
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.includes("partner.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        partner: { ...prev.partner, [field]: value } }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))

      // Check username availability
      if (name === "username") {
        const cleanUsername = value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
        setFormData((prev) => ({ ...prev, username: cleanUsername }))
        if (cleanUsername !== value) return // Prevent checking invalid characters

        if (usernameTimeoutRef.current) {
          clearTimeout(usernameTimeoutRef.current)
        }
        usernameTimeoutRef.current = setTimeout(() => {
          checkUsernameAvailability(cleanUsername)
        }, 500)
      }
    }
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, profilePicture: file }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value) 
        ? (prev[field] as string[]).filter((item: string) => item !== value) 
        : [...(prev[field] as string[]), value] }))
  }

  // Handle textarea changes
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = "Nome é obrigatório"
      if (!formData.lastName) newErrors.lastName = "Sobrenome é obrigatório"
      if (!formData.username) {
        newErrors.username = "Nome de usuário é obrigatório"
      } else if (formData.username.length < 3) {
        newErrors.username = "Nome de usuário deve ter pelo menos 3 caracteres"
      } else if (usernameAvailable === false) {
        newErrors.username = "Este nome de usuário já está em uso"
      } else if (usernameAvailable === null && checkingUsername) {
        newErrors.username = "Verificando disponibilidade..."
      }
      if (!formData.email) newErrors.email = "E-mail é obrigatório"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "E-mail inválido"
      if (!formData.password) newErrors.password = "Senha é obrigatória"
      else if (formData.password.length < 6) newErrors.password = "Senha deve ter pelo menos 6 caracteres"
      if (!formData.confirmPassword) newErrors.confirmPassword = "Confirmação de senha é obrigatória"
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Senhas não coincidem"
      if (!formData.birthDate) {
        newErrors.birthDate = "Data de nascimento é obrigatória"
      } else {
        const age = calculateAge(formData.birthDate)
        if (age < 18) {
          newErrors.birthDate = "Você deve ter pelo menos 18 anos"
        }
      }
    } else if (step === 2) {
      if (formData.seeking.length === 0) newErrors.seeking = "Selecione pelo menos uma opção"
      if (formData.interests.length === 0 && !formData.otherInterest)
        newErrors.interests = "Selecione pelo menos um interesse ou especifique outro"
    } else if (step === 3) {
      if (!formData.profilePicture) newErrors.profilePicture = "Foto de perfil é obrigatória"
      if (!formData.bio) newErrors.bio = "Bio é obrigatória"
      if (formData.profileType === "couple") {
        if (!formData.partner.nickname) newErrors.partnerNickname = "Apelido do parceiro é obrigatório"
        if (!formData.partner.age) newErrors.partnerAge = "Idade do parceiro é obrigatória"
        else if (isNaN(Number(formData.partner.age)) || Number(formData.partner.age) < 18)
          newErrors.partnerAge = "Idade deve ser um número maior ou igual a 18"
        if (!formData.partner.height) newErrors.partnerHeight = "Altura do parceiro é obrigatória"
        if (!formData.partner.weight) newErrors.partnerWeight = "Peso do parceiro é obrigatória"
        if (!formData.partner.eyeColor) newErrors.partnerEyeColor = "Cor dos olhos é obrigatória"
        if (!formData.partner.hairColor) newErrors.partnerHairColor = "Cor do cabelo é obrigatória"
      }
    } else if (step === 4) {
      if (!formData.city) newErrors.city = "Cidade é obrigatória"
    } else if (step === 5) {
      if (!formData.plan) newErrors.plan = "Selecione um plano"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle navigation
  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  // Apenas salvar o plano selecionado, pagamento será processado após cadastro
  const handlePlanSelect = (plan: "free" | "gold" | "diamante" | "diamante_anual") => {
    setFormData((prev) => ({ ...prev, plan }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    try {
      // Converter imagem para base64 se existir
      let avatarBase64 = null
      if (formData.profilePicture) {
        const reader = new FileReader()
        avatarBase64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(formData.profilePicture as File)
        })
      }

      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        avatar_url: avatarBase64,
        profilePicture: undefined // Remover o objeto File
      }

      // Chamar API de registro
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend) })

      // Verificar se a resposta tem conteúdo antes de tentar fazer .json()
      const text = await response.text()
      const result = text ? JSON.parse(text) : {}

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta")
      }

      if (result.success) {
        // Fazer login do usuário recém criado
        const supabase = createClient()
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (signInError) {
          console.error("Erro ao fazer login após registro:", signInError)
        }

        // Upload da foto de perfil se existir
        if (formData.profilePicture) {
          const fileExt = formData.profilePicture.name.split('.').pop()
          const fileName = `${result.user.id}-${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, formData.profilePicture)

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-pictures')
              .getPublicUrl(fileName)

            await supabase
              .from("users")
              .update({ profile_picture: publicUrl })
              .eq("id", result.user.id)
          }
        }

        // Se for plano pago, redirecionar para página de checkout com opções
        if (formData.plan !== "free") {
          // Mapear nomes dos planos para compatibilidade
          let planName: string = formData.plan
          if (formData.plan === "diamante") planName = "diamond"
          if (formData.plan === "diamante_anual") planName = "diamond_annual"
          
          const checkoutUrl = `/checkout?plano=${planName}&userId=${result.user.id}&email=${encodeURIComponent(formData.email)}`
          router.push(checkoutUrl)
          return
        }

        // Redirecionar para timeline
        router.push("/timeline")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Erro ao criar conta. Tente novamente.")
      setErrors({ general: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white overflow-hidden relative">
      {/* Custom CSS */}
      <style jsx global>{`
        ::selection {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.2)"};
          color: ${isDarkMode ? "#ffffff" : "#1f2937"};
        }
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
        @keyframes subtle-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
        .subtle-breathe {
          animation: subtle-breathe 6s ease-in-out infinite;
          will-change: transform;
        }
        .carousel {
          display: flex;
          transition: transform 0.5s ease-in-out;
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

      {/* Main Content - Centralizado */}
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <main className="relative z-10 w-full max-w-2xl">
          {/* Theme Toggle */}
          <nav className="absolute -top-4 right-0 z-50" role="navigation" aria-label="Theme navigation">
            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="text-sm font-light text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 px-3 py-2 rounded-full group"
              aria-label="Toggle between light and dark theme"
            >
              <div className="group-hover:rotate-180 transition-transform duration-500">
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </div>
            </Button>
          </nav>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              <span className="text-gray-900 dark:text-white">open</span>
              <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
                love
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-700 dark:text-white/70">
              Crie sua conta e comece a se conectar
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mx-1 sm:mx-2 ${
                  s <= step ? "bg-pink-600 dark:bg-pink-400" : "bg-gray-300 dark:bg-white/20"
                } transition-colors duration-300`}
              />
            ))}
          </div>

          {/* Carousel */}
          <div className="overflow-hidden">
            <div className="carousel flex" style={{ transform: `translateX(-${(step - 1) * 100}%)` }}>
              {/* Step 1: Basic Info */}
              <div className="min-w-full">
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                    Informações Básicas
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="text-sm font-medium text-gray-900 dark:text-white">
                          Nome
                        </label>
                        <div className="relative">
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Seu nome"
                            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="text-sm font-medium text-gray-900 dark:text-white">
                          Sobrenome
                        </label>
                        <div className="relative">
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Seu sobrenome"
                            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="username" className="text-sm font-medium text-gray-900 dark:text-white">
                        Nome de usuário <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="seuusername"
                          className="pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                        />
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        {checkingUsername && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                          </div>
                        )}
                        {!checkingUsername && usernameAvailable === true && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm">✓</div>
                        )}
                        {!checkingUsername && usernameAvailable === false && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 text-sm">✗</div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Apenas letras, números e _ são permitidos. Não pode ser alterado depois.
                      </p>
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
                        E-mail
                      </label>
                      <div className="relative">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="seu@email.com"
                          className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="birthDate" className="text-sm font-medium text-gray-900 dark:text-white">
                        Data de Nascimento <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="birthDate"
                          name="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          max={
                            new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]
                          }
                          className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Você deve ter pelo menos 18 anos para se cadastrar.
                      </p>
                      {errors.birthDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.birthDate}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">
                          Senha
                        </label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900 dark:text-white">
                          Confirmar Senha
                        </label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Navigation Buttons for Step 1 */}
                  <div className="mt-6 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors duration-300 disabled:opacity-50 px-3 py-2 sm:px-4 sm:py-2"
                    >
                      <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Voltar</span>
                    </Button>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <Button
                        onClick={step === 5 ? handleSubmit : handleNext}
                        disabled={loading}
                        className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base group disabled:opacity-50"
                      >
                        {loading ? "Criando conta..." : step === 5 ? "Cadastrar" : "Próximo"}
                        <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Profile Type, Seeking, Interests */}
              <div className="min-w-full">
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Sobre o Perfil</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">Tipo de Perfil</label>
                      <Select
                        value={formData.profileType}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, profileType: value as "single" | "couple" }))
                        }}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Selecione o tipo de perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Solteiro(a)</SelectItem>
                          <SelectItem value="couple">Casal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        O que você(s) busca(m)? <span className="text-red-600">*</span>
                      </label>
                      <div className="mt-2 space-y-2">
                        {["Mulher", "Homem", "Casal"].map((option) => (
                          <div key={option} className="flex items-center">
                            <Checkbox
                              id={`seeking-${option}`}
                              checked={formData.seeking.includes(option)}
                              onChange={() => handleCheckboxChange("seeking", option)}
                            />
                            <label htmlFor={`seeking-${option}`} className="ml-2 text-sm text-gray-900 dark:text-white">
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                      {errors.seeking && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.seeking}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Interesses <span className="text-red-600">*</span>
                      </label>
                      <div className="mt-2 space-y-2">
                        {["Ménage", "Swing", "Encontros Casuais", "Amizades", "Eventos Sociais"].map((option) => (
                          <div key={option} className="flex items-center">
                            <Checkbox
                              id={`interest-${option}`}
                              checked={formData.interests.includes(option)}
                              onChange={() => handleCheckboxChange("interests", option)}
                            />
                            <label
                              htmlFor={`interest-${option}`}
                              className="ml-2 text-sm text-gray-900 dark:text-white"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                        <Input
                          name="otherInterest"
                          value={formData.otherInterest}
                          onChange={handleInputChange}
                          placeholder="Outro interesse (opcional)"
                          className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                        />
                      </div>
                      {errors.interests && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.interests}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Navigation Buttons for Step 2 */}
                  <div className="mt-6 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors duration-300 disabled:opacity-50 px-3 py-2 sm:px-4 sm:py-2"
                    >
                      <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Voltar</span>
                    </Button>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <Button
                        onClick={step === 5 ? handleSubmit : handleNext}
                        disabled={loading}
                        className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base group disabled:opacity-50"
                      >
                        {loading ? "Criando conta..." : step === 5 ? "Cadastrar" : "Próximo"}
                        <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Profile Picture, Bio, Partner Info */}
              <div className="min-w-full">
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                    Detalhes do Perfil
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="profilePicture" className="text-sm font-medium text-gray-900 dark:text-white">
                        Foto de Perfil <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="profilePicture"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                        />
                        <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.profilePicture && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.profilePicture}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="bio" className="text-sm font-medium text-gray-900 dark:text-white">
                        Bio <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleTextareaChange}
                        placeholder="Conte um pouco sobre você(s)"
                        className="w-full h-24 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400 rounded-md p-3 resize-none"
                      />
                      {errors.bio && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio}</p>}
                    </div>

                    {formData.profileType === "couple" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informações do Parceiro</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="partner.nickname"
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Apelido
                            </label>
                            <Input
                              id="partner.nickname"
                              name="partner.nickname"
                              value={formData.partner.nickname}
                              onChange={handleInputChange}
                              placeholder="Apelido do parceiro"
                              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                            />
                            {errors.partnerNickname && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.partnerNickname}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="partner.age" className="text-sm font-medium text-gray-900 dark:text-white">
                              Idade
                            </label>
                            <Input
                              id="partner.age"
                              name="partner.age"
                              type="number"
                              value={formData.partner.age}
                              onChange={handleInputChange}
                              placeholder="Idade"
                              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                            />
                            {errors.partnerAge && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.partnerAge}</p>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor="partner.height"
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Altura (cm)
                            </label>
                            <Input
                              id="partner.height"
                              name="partner.height"
                              type="number"
                              value={formData.partner.height}
                              onChange={handleInputChange}
                              placeholder="Altura em cm"
                              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                            />
                            {errors.partnerHeight && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.partnerHeight}</p>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor="partner.weight"
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Peso (kg)
                            </label>
                            <Input
                              id="partner.weight"
                              name="partner.weight"
                              type="number"
                              value={formData.partner.weight}
                              onChange={handleInputChange}
                              placeholder="Peso em kg"
                              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                            />
                            {errors.partnerWeight && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.partnerWeight}</p>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor="partner.eyeColor"
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Cor dos Olhos
                            </label>
                            <Select
                              value={formData.partner.eyeColor}
                              onValueChange={(value) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  partner: { ...prev.partner, eyeColor: value }
                                }))
                              }}
                            >
                              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white">
                                <SelectValue placeholder="Selecione a cor dos olhos" />
                              </SelectTrigger>
                              <SelectContent>
                                {["Castanho", "Azul", "Verde", "Cinza", "Outro"].map((color) => (
                                  <SelectItem key={color} value={color}>
                                    {color}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.partnerEyeColor && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.partnerEyeColor}</p>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor="partner.hairColor"
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Cor do Cabelo
                            </label>
                            <Select
                              value={formData.partner.hairColor}
                              onValueChange={(value) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  partner: { ...prev.partner, hairColor: value }
                                }))
                              }}
                            >
                              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white">
                                <SelectValue placeholder="Selecione a cor do cabelo" />
                              </SelectTrigger>
                              <SelectContent>
                                {["Preto", "Castanho", "Loiro", "Ruivo", "Outro"].map((color) => (
                                  <SelectItem key={color} value={color}>
                                    {color}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.partnerHairColor && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.partnerHairColor}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Navigation Buttons for Step 3 */}
                  <div className="mt-6 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors duration-300 disabled:opacity-50 px-3 py-2 sm:px-4 sm:py-2"
                    >
                      <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Voltar</span>
                    </Button>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <Button
                        onClick={step === 5 ? handleSubmit : handleNext}
                        disabled={loading}
                        className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base group disabled:opacity-50"
                      >
                        {loading ? "Criando conta..." : step === 5 ? "Cadastrar" : "Próximo"}
                        <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: City */}
              <div className="min-w-full">
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Localização</h2>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="city" className="text-sm font-medium text-gray-900 dark:text-white">
                        Cidade <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          onFocus={handleCityFocus}
                          placeholder="Digite sua cidade ou toque para detectar automaticamente"
                          className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Toque no campo para detectar sua localização automaticamente
                      </p>
                      {errors.city && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>}
                    </div>
                  </div>
                  
                  {/* Navigation Buttons for Step 4 */}
                  <div className="mt-6 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors duration-300 disabled:opacity-50 px-3 py-2 sm:px-4 sm:py-2"
                    >
                      <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Voltar</span>
                    </Button>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <Button
                        onClick={step === 5 ? handleSubmit : handleNext}
                        disabled={loading}
                        className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base group disabled:opacity-50"
                      >
                        {loading ? "Criando conta..." : step === 5 ? "Cadastrar" : "Próximo"}
                        <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Plan Selection */}
              <div className="min-w-full">
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                    Escolha seu Plano
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Plano <span className="text-red-600">*</span>
                      </label>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mt-6">
                        {/* Free */}
                        <div
                          className={`relative group rounded-3xl border-2 p-6 lg:p-8 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 ${formData.plan === "free" ? "border-pink-600 bg-pink-50/40 dark:bg-pink-900/20 shadow-pink-500/20" : "border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20"}`}
                          onClick={() => handlePlanSelect("free")}
                          tabIndex={0}
                          role="button"
                          aria-pressed={formData.plan === "free"}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="flat" className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1"><StarIcon className="size-4 mr-1" /> Free</Badge>
                            {formData.plan === "free" && <CheckIcon className="text-pink-600 ml-1" />}
                          </div>
                          <div className="text-2xl lg:text-3xl font-bold mb-2">Grátis</div>
                          <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">Acesso básico à plataforma</div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                            <li className="flex items-start gap-2">✔️ Conexões mútuas</li>
                            <li className="flex items-start gap-2">✔️ Eventos locais</li>
                            <li className="flex items-start gap-2">✔️ Posts de amigos</li>
                          </ul>
                          <Button size="sm" variant={formData.plan === "free" ? "solid" : "bordered"} className="w-full py-3">{formData.plan === "free" ? "Selecionado" : "Selecionar"}</Button>
                        </div>
                        {/* Gold (Mensal) */}
                        <div
                          className={`relative group rounded-3xl border-2 p-6 lg:p-8 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 ${formData.plan === "gold" ? "border-yellow-500 bg-yellow-50/40 dark:bg-yellow-900/20 shadow-yellow-500/20" : "border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20"}`}
                          onClick={() => handlePlanSelect("gold")}
                          tabIndex={0}
                          role="button"
                          aria-pressed={formData.plan === "gold"}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="flat" className="bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 px-3 py-1"><CrownIcon className="size-4 mr-1" /> Gold</Badge>
                            {formData.plan === "gold" && <CheckIcon className="text-pink-600 ml-1" />}
                          </div>
                          <div className="text-2xl lg:text-3xl font-bold mb-2">R$ 25,00/mês</div>
                          <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">Plano mensal premium</div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                            <li className="flex items-start gap-2">✔️ Converse com qualquer pessoa</li>
                            <li className="flex items-start gap-2">✔️ Veja quem visitou seu perfil</li>
                            <li className="flex items-start gap-2">✔️ Filtros avançados</li>
                          </ul>
                          <Button size="sm" variant={formData.plan === "gold" ? "solid" : "bordered"} className="w-full py-3">{formData.plan === "gold" ? "Selecionado" : "Selecionar"}</Button>
                        </div>
                        {/* Diamante (Mensal) */}
                        <div
                          className={`relative group rounded-3xl border-2 p-6 lg:p-8 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 ${formData.plan === "diamante" ? "border-purple-600 bg-purple-50/40 dark:bg-purple-900/20 shadow-purple-500/20" : "border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20"}`}
                          onClick={() => handlePlanSelect("diamante")}
                          tabIndex={0}
                          role="button"
                          aria-pressed={formData.plan === "diamante"}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="flat" className="bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 px-3 py-1"><GemIcon className="size-4 mr-1" /> Diamante</Badge>
                            {formData.plan === "diamante" && <CheckIcon className="text-pink-600 ml-1" />}
                          </div>
                          <div className="text-2xl lg:text-3xl font-bold mb-2">R$ 45,90/mês</div>
                          <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">Plano mensal premium com benefícios exclusivos</div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                            <li className="flex items-start gap-2">✔️ Todos benefícios do Gold</li>
                            <li className="flex items-start gap-2">✔️ Destaque no ranking</li>
                            <li className="flex items-start gap-2">✔️ Suporte prioritário</li>
                          </ul>
                          <Button size="sm" variant={formData.plan === "diamante" ? "solid" : "bordered"} className="w-full py-3">{formData.plan === "diamante" ? "Selecionado" : "Selecionar"}</Button>
                        </div>
                        {/* Diamante Anual */}
                        <div
                          className={`relative group rounded-3xl border-2 p-6 lg:p-8 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 ${formData.plan === "diamante_anual" ? "border-purple-800 bg-purple-100/40 dark:bg-purple-900/40 shadow-purple-500/20" : "border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20"}`}
                          onClick={() => handlePlanSelect("diamante_anual")}
                          tabIndex={0}
                          role="button"
                          aria-pressed={formData.plan === "diamante_anual"}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="flat" className="bg-purple-300 dark:bg-purple-900 text-purple-900 dark:text-purple-200 px-3 py-1"><GemIcon className="size-4 mr-1" /> Diamante Anual</Badge>
                            {formData.plan === "diamante_anual" && <CheckIcon className="text-pink-600 ml-1" />}
                          </div>
                          <div className="text-2xl lg:text-3xl font-bold mb-2">R$ 459,00/ano <span className="text-sm text-pink-600">(2 meses grátis)</span></div>
                          <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">Plano anual premium com todos os benefícios Diamante</div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                            <li className="flex items-start gap-2">✔️ Todos benefícios do Diamante Mensal</li>
                            <li className="flex items-start gap-2">✔️ 2 meses grátis (equivalente a R$ 38,25/mês)</li>
                            <li className="flex items-start gap-2">✔️ Suporte prioritário e destaque máximo</li>
                          </ul>
                          <Button size="sm" variant={formData.plan === "diamante_anual" ? "solid" : "bordered"} className="w-full py-3">{formData.plan === "diamante_anual" ? "Selecionado" : "Selecionar"}</Button>
                        </div>
                      </div>
                      {errors.plan && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.plan}</p>}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-white/70 space-y-2">
                      <p>
                        <strong>Free:</strong> Acesso a conexões mútuas, eventos locais e posts de amigos.
                      </p>
                      <p>
                        <strong>Premium:</strong> Converse com qualquer pessoa, veja quem visitou seu perfil, filtros
                        avançados e muito mais.
                      </p>
                    </div>
                  </div>
                  
                  {/* Navigation Buttons for Step 5 */}
                  <div className="mt-6 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors duration-300 disabled:opacity-50 px-3 py-2 sm:px-4 sm:py-2"
                    >
                      <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Voltar</span>
                    </Button>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <Button
                        onClick={step === 5 ? handleSubmit : handleNext}
                        disabled={loading}
                        className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base group disabled:opacity-50"
                      >
                        {loading ? "Criando conta..." : step === 5 ? "Cadastrar" : "Próximo"}
                        <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Login Link */}
          <p className="mt-4 sm:mt-6 text-center text-sm text-gray-700 dark:text-white/70">
            Já tem uma conta?{" "}
            <Link
              href="/auth/signin"
              className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors duration-300"
            >
              Faça login
            </Link>
          </p>
        </main>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center w-full text-gray-500 dark:text-white/50 text-sm">
        <p>© 2025 OpenLove. Todos os direitos reservados.</p>
      </footer>

    </div>
  )
}
