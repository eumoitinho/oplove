"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Camera, ArrowRight, ArrowLeft, Mail, Lock, User, AtSign, Calendar, Star, Gem, Crown, Check, Heart, Users, Building2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase-browser"
import { toast } from "sonner"
import type { PremiumType } from "@/types/user.types"
import { PaymentModal } from "@/components/common/PaymentModal"

interface FormData {
  // Account type selection
  accountType: "personal" | "business"
  
  // Basic user info (matching database schema)
  name: string
  username: string
  email: string
  password: string
  confirmPassword: string
  birthDate: string
  
  // Profile details
  bio: string
  profilePicture: File | null
  gender: "male" | "female" | "other" | "prefer_not_to_say"
  lookingFor: "friendship" | "dating" | "relationship" | "networking"
  
  // Location
  city: string
  state: string
  latitude: number | null
  longitude: number | null
  
  // Plan selection
  plan: "free" | "gold" | "diamond" | "couple"
  
  // Terms
  termsAccepted: boolean
  privacyAccepted: boolean
}

interface FormErrors {
  [key: string]: string
}

export function RegisterForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    // Account type
    accountType: "personal",
    
    // Basic info
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    
    // Profile
    bio: "",
    profilePicture: null,
    gender: "prefer_not_to_say",
    lookingFor: "friendship",
    
    // Location
    city: "",
    state: "",
    latitude: null,
    longitude: null,
    
    // Plan
    plan: "free",
    
    // Terms
    termsAccepted: false,
    privacyAccepted: false
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const usernameTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const imageUrlRef = useRef<string | null>(null)

  const router = useRouter()

  // Cleanup username timeout and image URLs
  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current)
      }
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current)
      }
    }
  }, [])

  // Handle location detection
  const handleCityFocus = async () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
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
          setFormData((prev) => ({ ...prev, city, state, latitude, longitude }))
        } catch (e) {
          console.error("Erro ao buscar cidade:", e)
          setFormData((prev) => ({ ...prev, latitude, longitude }))
        }
      } catch (error) {
        console.error("Erro ao obter localização:", error)
      }
    }
  }

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    setCheckingUsername(true)
    try {
      const res = await fetch(`/api/v1/check-username?username=${encodeURIComponent(username)}`)
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
    const { name, value, type, checked } = e.target
    
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))

      // Check username availability
      if (name === "username") {
        const cleanUsername = value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
        setFormData((prev) => ({ ...prev, username: cleanUsername }))
        if (cleanUsername !== value) return

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
    
    if (file) {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("A imagem deve ter no máximo 5MB")
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error("Formato não suportado. Use JPG, PNG ou WEBP")
        return
      }
    }
    
    setFormData((prev) => ({ ...prev, profilePicture: file }))
  }

  // Handle select changes
  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
      // Account type selection validation
      if (!formData.accountType) newErrors.accountType = "Selecione um tipo de conta"
    } else if (step === 2) {
      // Basic info validation
      if (!formData.name) newErrors.name = "Nome completo é obrigatório"
      else if (formData.name.length < 2) newErrors.name = "Nome deve ter pelo menos 2 caracteres"
      
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
    } else if (step === 3) {
      // Profile preferences validation - Skip for business accounts
      if (formData.accountType === "personal") {
        if (!formData.gender) newErrors.gender = "Selecione seu gênero"
        if (!formData.lookingFor) newErrors.lookingFor = "Selecione o que você procura"
      }
    } else if (step === 4) {
      // Profile details validation
      if (!formData.bio) newErrors.bio = "Bio é obrigatória"
      else if (formData.bio.length < 10) newErrors.bio = "Bio deve ter pelo menos 10 caracteres"
      
      // Profile picture is optional in the database, so we won't require it
    } else if (step === 5) {
      // Location validation
      if (!formData.city) newErrors.city = "Cidade é obrigatória"
    } else if (step === 6) {
      // Plan and terms validation - Different plans for business
      if (formData.accountType === "personal") {
        if (!formData.plan) newErrors.plan = "Selecione um plano"
      }
      if (!formData.termsAccepted) newErrors.terms = "Você deve aceitar os termos de uso"
      if (!formData.privacyAccepted) newErrors.privacy = "Você deve aceitar a política de privacidade"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle navigation
  const handleNext = () => {
    if (validateStep()) {
      let nextStep = step + 1
      
      // Skip profile preferences for business accounts
      if (formData.accountType === "business" && nextStep === 3) {
        nextStep = 4
      }
      
      setStep(Math.min(nextStep, 6))
    }
  }

  const handleBack = () => {
    let prevStep = step - 1
    
    // Skip profile preferences for business accounts when going back
    if (formData.accountType === "business" && prevStep === 3) {
      prevStep = 2
    }
    
    setStep(Math.max(prevStep, 1))
  }

  // Handle plan selection
  const handlePlanSelect = (plan: "free" | "gold" | "diamond" | "couple") => {
    setFormData((prev) => ({ ...prev, plan }))
  }

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    try {
      // Prepare registration data matching the API schema
      const registrationData = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        name: formData.name,
        birth_date: formData.birthDate,
      }

      // Call registration API
      const response = await fetch("/api/v1/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registrationData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta")
      }

      if (result.success) {
        const supabase = createClient()
        
        // Update user profile with additional information
        if (result.data?.user) {
          const updateData: any = {
            bio: formData.bio,
            location: `${formData.city}, ${formData.state}`,
            account_type: formData.accountType
          }

          // Only set premium_type for personal accounts
          if (formData.accountType === "personal") {
            updateData.premium_type = formData.plan
          }

          const { error: updateError } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", result.data.user.id)

          if (updateError) {
            console.error("Erro ao atualizar perfil:", updateError)
          }

          // Upload profile picture if exists
          if (formData.profilePicture) {
            try {
              // Upload to the new upload API endpoint
              const uploadFormData = new FormData()
              uploadFormData.append('file', formData.profilePicture)
              uploadFormData.append('type', 'avatar')

              const uploadResponse = await fetch('/api/v1/upload', {
                method: 'POST',
                body: uploadFormData
              })

              if (uploadResponse.ok) {
                const { url } = await uploadResponse.json()
                
                // Update user profile with avatar URL
                await supabase
                  .from("users")
                  .update({ avatar_url: url })
                  .eq("id", result.data.user.id)
              } else {
                console.error('Failed to upload profile picture')
              }
            } catch (error) {
              console.error('Error uploading profile picture:', error)
            }
          }
        }

        // Auto login the user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (signInError) {
          toast.error("Conta criada, mas erro ao fazer login. Por favor, faça login manualmente.")
          router.push("/login")
          return
        }

        // Handle routing based on account type
        if (formData.accountType === "business") {
          toast.success("Conta empresarial criada! Redirecionando para configurar seu negócio...")
          router.push("/business/register")
          return
        }

        // Open payment modal for paid plans (personal accounts only)
        if (formData.plan !== "free") {
          setShowPaymentModal(true)
          return
        }

        toast.success("Conta criada com sucesso!")
        router.push("/feed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao criar conta. Tente novamente.")
      setErrors({ general: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Progress Indicator */}
      <div className="flex justify-center mb-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div
            key={s}
            className={`h-2 w-2 rounded-full transition-colors ${
              s <= step 
                ? "bg-pink-600 dark:bg-pink-400" 
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Form Steps */}
      <div className="space-y-6">
        {/* Step 1: Account Type Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Tipo de Conta</h2>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Escolha o tipo de conta que melhor se adequa às suas necessidades
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Personal Account */}
              <div
                className={`relative rounded-lg border-2 p-6 transition-all cursor-pointer hover:shadow-md ${
                  formData.accountType === "personal" 
                    ? "border-pink-600 bg-pink-50 dark:bg-pink-900/20" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => setFormData(prev => ({ ...prev, accountType: "personal" }))}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900/50">
                    <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">Conta Pessoal</h3>
                      {formData.accountType === "personal" && <Check className="w-5 h-5 text-pink-600" />}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Para pessoas que querem se conectar, fazer amigos e encontrar relacionamentos
                    </p>
                    <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• Criar perfil pessoal</li>
                      <li>• Enviar mensagens e fazer posts</li>
                      <li>• Participar de comunidades</li>
                      <li>• Encontrar eventos e pessoas</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Business Account */}
              <div
                className={`relative rounded-lg border-2 p-6 transition-all cursor-pointer hover:shadow-md ${
                  formData.accountType === "business" 
                    ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => setFormData(prev => ({ ...prev, accountType: "business" }))}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                    <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">Conta Profissional</h3>
                      {formData.accountType === "business" && <Check className="w-5 h-5 text-purple-600" />}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Para empresas, criadores de conteúdo e profissionais
                    </p>
                    <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• Criar perfil empresarial</li>
                      <li>• Fazer anúncios e campanhas</li>
                      <li>• Vender conteúdo e serviços</li>
                      <li>• Dashboard e analytics</li>
                      <li>• Criar eventos e promoções</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Dica:</strong> Você pode converter uma conta pessoal em profissional mais tarde se desejar.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Informações Básicas</h2>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="pl-10"
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="seuusername"
                  className="pl-10 pr-10"
                />
                <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                {checkingUsername && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                  </div>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <Check className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="absolute right-3 top-3 text-red-600">✗</span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Apenas letras, números e _ são permitidos. Não pode ser alterado depois.
              </p>
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <div className="relative">
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                Você deve ter pelo menos 18 anos para se cadastrar.
              </p>
              {errors.birthDate && (
                <p className="text-sm text-red-500">{errors.birthDate}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Profile Preferences - Only for personal accounts */}
        {step === 3 && formData.accountType === "personal" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Preferências do Perfil</h2>
            
            <div className="space-y-2">
              <Label>Gênero</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefiro não dizer</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>O que você procura?</Label>
              <Select
                value={formData.lookingFor}
                onValueChange={(value) => handleSelectChange("lookingFor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o que você procura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendship">Amizade</SelectItem>
                  <SelectItem value="dating">Encontros</SelectItem>
                  <SelectItem value="relationship">Relacionamento</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                </SelectContent>
              </Select>
              {errors.lookingFor && (
                <p className="text-sm text-red-500">{errors.lookingFor}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Profile Details */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Detalhes do Perfil</h2>
            
            <div className="space-y-2">
              <Label htmlFor="profilePicture">Foto de Perfil (opcional)</Label>
              
              {/* Profile Picture Preview */}
              {formData.profilePicture && (
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                      <img
                        src={(() => {
                          if (imageUrlRef.current) {
                            URL.revokeObjectURL(imageUrlRef.current)
                          }
                          imageUrlRef.current = URL.createObjectURL(formData.profilePicture)
                          return imageUrlRef.current
                        })()}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (imageUrlRef.current) {
                          URL.revokeObjectURL(imageUrlRef.current)
                          imageUrlRef.current = null
                        }
                        setFormData(prev => ({ ...prev, profilePicture: null }))
                      }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              {/* File Upload */}
              <div className="relative">
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="pl-10"
                />
                <Camera className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                Você pode adicionar uma foto de perfil mais tarde se preferir. Formatos aceitos: JPG, PNG, WEBP (máx. 5MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleTextareaChange}
                placeholder="Conte um pouco sobre você"
                className="resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Mínimo de 10 caracteres. Seja criativo!
              </p>
              {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
            </div>
          </div>
        )}

        {/* Step 5: Location */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Localização</h2>
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <div className="relative">
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onFocus={handleCityFocus}
                  placeholder="Digite sua cidade ou toque para detectar"
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                Toque no campo para detectar sua localização automaticamente
              </p>
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            {formData.state && (
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Estado"
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 6: Plan Selection & Terms */}
        {step === 6 && (
          <div className="space-y-4">
            {formData.accountType === "personal" ? (
              <>
                <h2 className="text-xl font-semibold text-center">Escolha seu Plano</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Free Plan */}
              <div
                className={`relative rounded-lg border-2 p-4 transition-all cursor-pointer hover:shadow-md ${
                  formData.plan === "free" 
                    ? "border-pink-600 bg-pink-50 dark:bg-pink-900/20" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => handlePlanSelect("free")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    <Star className="w-3 h-3 mr-1" /> Free
                  </Badge>
                  {formData.plan === "free" && <Check className="w-4 h-4 text-pink-600" />}
                </div>
                <div className="text-2xl font-bold mb-1">Grátis</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Acesso básico
                </div>
                <ul className="text-sm space-y-1">
                  <li>• Responder mensagens</li>
                  <li>• 3 fotos/mês</li>
                  <li>• Ver posts de amigos</li>
                  <li>• Anúncios frequentes</li>
                </ul>
              </div>

              {/* Gold Plan */}
              <div
                className={`relative rounded-lg border-2 p-4 transition-all cursor-pointer hover:shadow-md ${
                  formData.plan === "gold" 
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => handlePlanSelect("gold")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <Crown className="w-3 h-3 mr-1" /> Gold
                  </Badge>
                  {formData.plan === "gold" && <Check className="w-4 h-4 text-pink-600" />}
                </div>
                <div className="text-2xl font-bold mb-1">R$ 25/mês</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Recursos premium
                </div>
                <ul className="text-sm space-y-1">
                  <li>✓ 10 mensagens/dia</li>
                  <li>✓ 5 imagens por post</li>
                  <li>✓ Criar 3 eventos/mês</li>
                  <li>✓ Menos anúncios</li>
                </ul>
              </div>

              {/* Diamond Plan */}
              <div
                className={`relative rounded-lg border-2 p-4 transition-all cursor-pointer hover:shadow-md ${
                  formData.plan === "diamond" 
                    ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => handlePlanSelect("diamond")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    <Gem className="w-3 h-3 mr-1" /> Diamond
                  </Badge>
                  {formData.plan === "diamond" && <Check className="w-4 h-4 text-pink-600" />}
                </div>
                <div className="text-2xl font-bold mb-1">R$ 45/mês</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Tudo ilimitado
                </div>
                <ul className="text-sm space-y-1">
                  <li>✓ Mensagens ilimitadas</li>
                  <li>✓ Grupos e videochamadas</li>
                  <li>✓ Stories 24h</li>
                  <li>✓ Sem anúncios</li>
                  <li>✓ Monetização</li>
                </ul>
              </div>

              {/* Couple Plan */}
              <div
                className={`relative rounded-lg border-2 p-4 transition-all cursor-pointer hover:shadow-md ${
                  formData.plan === "couple" 
                    ? "border-pink-600 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => handlePlanSelect("couple")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 dark:from-pink-900 dark:to-purple-900 dark:text-purple-200">
                    <Users className="w-3 h-3 mr-1" /> Casal
                  </Badge>
                  {formData.plan === "couple" && <Check className="w-4 h-4 text-pink-600" />}
                </div>
                <div className="text-2xl font-bold mb-1">R$ 69,90/mês</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  2 contas Diamond
                </div>
                <ul className="text-sm space-y-1">
                  <li>✓ Tudo do Diamond para 2</li>
                  <li>✓ Perfil compartilhado</li>
                  <li>✓ Álbum privado</li>
                  <li>✓ Diário do casal</li>
                  <li>✓ Jogos exclusivos</li>
                </ul>
              </div>
                </div>

                {errors.plan && <p className="text-sm text-red-500">{errors.plan}</p>}
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-center">Termos para Conta Profissional</h2>
                
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold mb-2">Conta Profissional Inclui:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Dashboard completo com analytics</li>
                    <li>• Sistema de créditos para anúncios</li>
                    <li>• Criação de campanhas publicitárias</li>
                    <li>• Venda de conteúdo e serviços</li>
                    <li>• Suporte prioritário</li>
                  </ul>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Após criar sua conta, você será direcionado para configurar seu perfil empresarial.
                  </p>
                </div>
              </>
            )}

            {/* Terms and Privacy */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: !!checked }))}
                />
                <Label htmlFor="terms" className="text-sm">
                  Li e aceito os{" "}
                  <a href="/terms" className="text-pink-600 hover:underline" target="_blank">
                    Termos de Uso
                  </a>
                </Label>
              </div>
              {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privacy"
                  name="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privacyAccepted: !!checked }))}
                />
                <Label htmlFor="privacy" className="text-sm">
                  Li e aceito a{" "}
                  <a href="/privacy" className="text-pink-600 hover:underline" target="_blank">
                    Política de Privacidade
                  </a>
                </Label>
              </div>
              {errors.privacy && <p className="text-sm text-red-500">{errors.privacy}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1}
          className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Button
          onClick={step === 6 ? handleSubmit : handleNext}
          disabled={loading || (step === 2 && checkingUsername)}
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
        >
          {loading ? "Processando..." : step === 6 ? "Criar Conta" : "Próximo"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Error message */}
      {errors.general && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
        >
          Faça login
        </Link>
      </p>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={formData.plan !== "free" ? formData.plan as "gold" | "diamond" | "couple" : "gold"}
        onSuccess={() => {
          toast.success("Pagamento processado com sucesso!")
          router.push("/feed")
        }}
      />
    </div>
  )
}