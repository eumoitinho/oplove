"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Camera, ArrowRight, ArrowLeft, Mail, Lock, User, AtSign, Calendar, Star, Gem, Crown, Check, Heart, Users, Building2, Loader2, MapPinOff, AlertCircle } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase-browser"
import { toast } from "sonner"
import type { User, PremiumType } from "@/types/database.types"
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
  gender: "couple" | "couple_ff" | "couple_mm" | "male" | "male_trans" | "female" | "female_trans" | "travesti" | "crossdresser"
  lookingFor: string[]
  relationshipGoals: string[]
  
  // Location
  city: string
  state: string
  uf: string
  latitude: number | null
  longitude: number | null
  
  // Profile customization
  coverUrl: string
  interests: string[]
  
  // Business fields (for business accounts)
  businessName?: string
  businessType?: string
  cnpj?: string
  
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
    gender: "male",
    lookingFor: [],
    relationshipGoals: [],
    
    // Location
    city: "",
    state: "",
    uf: "",
    latitude: null,
    longitude: null,
    
    // Profile customization
    coverUrl: "",
    interests: [],
    
    // Plan
    plan: "free",
    
    // Terms
    termsAccepted: false,
    privacyAccepted: false
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [locationDetecting, setLocationDetecting] = useState(false)
  const [locationError, setLocationError] = useState<string>("")
  const [showManualLocation, setShowManualLocation] = useState(false)
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

  // Handle explicit location detection with better iOS support
  const handleLocationDetection = async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocalização não suportada pelo navegador")
      setShowManualLocation(true)
      return
    }

    setLocationDetecting(true)
    setLocationError("")

    try {
      // Check geolocation permission first (for modern browsers)
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        if (permission.state === 'denied') {
          throw new Error('PERMISSION_DENIED')
        }
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const options = {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout for iOS
          maximumAge: 300000 // 5 minutes cache
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            reject(error)
          },
          options
        )
      })
      
      const { latitude, longitude } = position.coords
      
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1&accept-language=pt-BR,pt,en`,
          { headers: { 'User-Agent': 'OpenLove/1.0' } }
        )
        
        if (!res.ok) {
          throw new Error('API_ERROR')
        }
        
        const data = await res.json()
        
        // Better city name extraction with fallbacks
        let city = ""
        if (data.address) {
          city = data.address.city || 
                 data.address.town || 
                 data.address.village || 
                 data.address.municipality ||
                 data.address.city_district ||
                 data.address.suburb ||
                 data.address.neighbourhood ||
                 ""
        }
        
        // Avoid generic names like "Região Metropolitana"
        if (city.includes("Região") || city.includes("Metropolitana") || city.includes("Grande ")) {
          city = data.address.suburb || 
                 data.address.neighbourhood || 
                 data.address.city_district || 
                 ""
        }
        
        const state = data.address?.state || data.address?.region || ""
        
        // Extract UF (state abbreviation) from state name
        let uf = ""
        const stateToUF: Record<string, string> = {
          "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM",
          "Bahia": "BA", "Ceará": "CE", "Distrito Federal": "DF", "Espírito Santo": "ES",
          "Goiás": "GO", "Maranhão": "MA", "Mato Grosso": "MT", "Mato Grosso do Sul": "MS",
          "Minas Gerais": "MG", "Pará": "PA", "Paraíba": "PB", "Paraná": "PR",
          "Pernambuco": "PE", "Piauí": "PI", "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN",
          "Rio Grande do Sul": "RS", "Rondônia": "RO", "Roraima": "RR", "Santa Catarina": "SC",
          "São Paulo": "SP", "Sergipe": "SE", "Tocantins": "TO"
        }
        
        if (state && stateToUF[state]) {
          uf = stateToUF[state]
        }
        
        if (city) {
          setFormData((prev) => ({ ...prev, city, state, uf, latitude, longitude }))
          toast.success(`Localização detectada: ${city}${state ? `, ${state}` : ''}`)
        } else {
          setFormData((prev) => ({ ...prev, latitude, longitude }))
          setLocationError("Não foi possível determinar sua cidade. Digite manualmente.")
          setShowManualLocation(true)
        }
        
      } catch (geocodeError) {
        console.error("Erro na geocodificação:", geocodeError)
        setFormData((prev) => ({ ...prev, latitude, longitude }))
        setLocationError("Localização detectada, mas não foi possível determinar a cidade. Digite manualmente.")
        setShowManualLocation(true)
      }
      
    } catch (error: any) {
      console.error("Erro ao obter localização:", error)
      
      let errorMessage = ""
      
      if (error.code === 1 || error.message === 'PERMISSION_DENIED') {
        errorMessage = "Permissão de localização negada. Para detectar automaticamente, permita o acesso à localização nas configurações do seu navegador."
      } else if (error.code === 2) {
        errorMessage = "Localização indisponível. Verifique se o GPS está ativo e tente novamente."
      } else if (error.code === 3) {
        errorMessage = "Tempo limite para detectar localização. Verifique sua conexão e tente novamente."
      } else {
        errorMessage = "Erro ao detectar localização. Digite sua cidade manualmente."
      }
      
      setLocationError(errorMessage)
      setShowManualLocation(true)
      
    } finally {
      setLocationDetecting(false)
    }
  }

  // Check username availability - memoized to prevent recreating function
  const checkUsernameAvailability = useCallback(async (username: string) => {
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
  }, [])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      // Handle all text inputs including business fields
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
        if (!formData.gender) newErrors.gender = "Selecione o que você é"
        if (!formData.lookingFor || formData.lookingFor.length === 0) newErrors.lookingFor = "Selecione pelo menos uma opção do que você procura"
      }
    } else if (step === 4) {
      // Business fields validation (if business account)
      if (formData.accountType === "business") {
        if (!formData.businessName) newErrors.businessName = "Nome da empresa é obrigatório"
        else if (formData.businessName.length < 2) newErrors.businessName = "Nome deve ter pelo menos 2 caracteres"
        
        if (!formData.businessType) newErrors.businessType = "Tipo de negócio é obrigatório"
        
        // CNPJ is optional, but if provided, could add format validation here
      }
      
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
      const registrationData: any = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        name: formData.name,
        birth_date: formData.birthDate,
        account_type: formData.accountType,
        plan: formData.plan,
      }

      // Add location data
      if (formData.city) registrationData.city = formData.city
      if (formData.state) registrationData.state = formData.state
      if (formData.latitude) registrationData.latitude = formData.latitude
      if (formData.longitude) registrationData.longitude = formData.longitude

      // Add personal account fields
      if (formData.accountType === "personal") {
        if (formData.gender) registrationData.gender = formData.gender
        
        // lookingFor is already an array
        if (formData.lookingFor && formData.lookingFor.length > 0) {
          registrationData.looking_for = formData.lookingFor
        }
        
        if (formData.interests && formData.interests.length > 0) {
          registrationData.interests = formData.interests
        }
        if (formData.relationshipGoals && formData.relationshipGoals.length > 0) {
          registrationData.relationship_goals = formData.relationshipGoals
        }
        if (formData.bio) registrationData.bio = formData.bio
        
        // Add UF if available
        if (formData.uf) registrationData.uf = formData.uf
      }

      // Add business account fields
      if (formData.accountType === "business") {
        registrationData.business_name = formData.businessName
        registrationData.business_type = formData.businessType
        if (formData.cnpj) registrationData.cnpj = formData.cnpj
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
        
        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Now try to upload profile picture after login
        if (formData.profilePicture) {
          try {
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
              const { error: avatarError } = await supabase
                .from("users")
                .update({ avatar_url: url })
                .eq("id", result.data.user.id)

              if (avatarError) {
                console.error('Failed to save avatar URL:', avatarError)
              }
            } else {
              console.error('Failed to upload profile picture:', await uploadResponse.text())
            }
          } catch (error) {
            console.error('Error uploading profile picture:', error)
            // Don't show error to user as account was created successfully
          }
        }

        // Handle routing based on account type and plan
        if (formData.accountType === "business") {
          // Business accounts always go to feed for now - BUSINESS DESATIVADO TEMPORARIAMENTE
          toast.success("Conta empresarial criada! Redirecionando para o feed...")
          // router.push("/business/register") // DESATIVADO - redirecionamento removido
          router.push("/feed") // Redirecionamento temporário para o feed
          return
        }

        // For personal accounts with paid plans, open payment modal BEFORE any redirect
        if (formData.plan !== "free") {
          // Show success message but keep user on registration page
          toast.success("Conta criada com sucesso! Complete seu pagamento para ativar o plano.")
          // Open payment modal - this will handle success redirect internally
          setShowPaymentModal(true)
          return
        }

        // For free plans, redirect directly to feed
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
        {[1, 2, 3, 4, 5, 6].map((s) => {
          // Skip step 3 for business accounts in progress indicator
          if (formData.accountType === "business" && s === 3) return null
          
          const adjustedStep = formData.accountType === "business" && s > 3 ? s - 1 : s
          const isActive = s <= step || (formData.accountType === "business" && s === 3 && step >= 3)
          
          return (
            <div
              key={s}
              className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-pink-600 to-purple-600" 
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          )
        })}
      </div>

      {/* Form Steps */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Step 1: Account Type Selection - SIMPLIFICADO */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Criar Conta</h2>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Comece sua jornada no OpenLove
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Personal Account - Única opção disponível temporariamente */}
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

              {/* Business Account - DESATIVADO TEMPORARIAMENTE */}
              <div
                className="relative rounded-lg border-2 p-6 opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700"
              >
                <div className="absolute inset-0 bg-gray-900/60 rounded-lg flex items-center justify-center">
                  <div className="bg-gray-800/90 px-6 py-3 rounded-lg">
                    <p className="text-white font-semibold">Em breve</p>
                    <p className="text-gray-300 text-sm">Conta profissional em desenvolvimento</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                    <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">Conta Profissional</h3>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo (Não será divulgado)</Label>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Eu sou/somos</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="couple">Casal</SelectItem>
                  <SelectItem value="couple_ff">Casal (2 mulheres)</SelectItem>
                  <SelectItem value="couple_mm">Casal (2 homens)</SelectItem>
                  <SelectItem value="male">Homem</SelectItem>
                  <SelectItem value="male_trans">Homem Trans</SelectItem>
                  <SelectItem value="female">Mulher</SelectItem>
                  <SelectItem value="female_trans">Mulher Trans</SelectItem>
                  <SelectItem value="travesti">Travesti</SelectItem>
                  <SelectItem value="crossdresser">Cross-dressing (CD)</SelectItem>
                </SelectContent>
              </Select>
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>O que você procura? (selecione até 3)</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Escolha os tipos de pessoas que você gostaria de conhecer
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { value: "couple", label: "Casal" },
                    { value: "couple_ff", label: "Casal (2 mulheres)" },
                    { value: "couple_mm", label: "Casal (2 homens)" },
                    { value: "male", label: "Homem" },
                    { value: "male_trans", label: "Homem Trans" },
                    { value: "female", label: "Mulher" },
                    { value: "female_trans", label: "Mulher Trans" },
                    { value: "travesti", label: "Travesti" },
                    { value: "crossdresser", label: "Cross-dressing (CD)" }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        formData.lookingFor.includes(option.value)
                          ? "border-pink-600 bg-pink-50 dark:bg-pink-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      } ${formData.lookingFor.length >= 3 && !formData.lookingFor.includes(option.value) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Checkbox
                        checked={formData.lookingFor.includes(option.value)}
                        onCheckedChange={(checked) => {
                          if (checked && formData.lookingFor.length < 3) {
                            setFormData(prev => ({
                              ...prev,
                              lookingFor: [...prev.lookingFor, option.value]
                            }))
                          } else if (!checked) {
                            setFormData(prev => ({
                              ...prev,
                              lookingFor: prev.lookingFor.filter(f => f !== option.value)
                            }))
                          }
                        }}
                        disabled={formData.lookingFor.length >= 3 && !formData.lookingFor.includes(option.value)}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                {formData.lookingFor.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selecionados: {formData.lookingFor.length}/3
                  </p>
                )}
                {errors.lookingFor && (
                  <p className="text-sm text-red-500">{errors.lookingFor}</p>
                )}
              </div>
            </div>

            {/* Relationship Goals */}
            <div className="space-y-2 mt-4">
              <Label>Preferências (selecione até 3)</Label>
              <p className="text-xs text-gray-500 mb-2">
                O que você busca em encontros?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Ménage", "BDSM", "Swing", "Exibicionismo", "Voyeur",
                  "Fetiche", "Dominação", "Submissão", "Sexo casual",
                  "Sexo virtual", "Encontros discretos", "Relacionamento aberto"
                ].map((goal) => (
                  <label
                    key={goal}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.relationshipGoals.includes(goal)
                        ? "border-pink-600 bg-pink-50 dark:bg-pink-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    } ${formData.relationshipGoals.length >= 3 && !formData.relationshipGoals.includes(goal) ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Checkbox
                      checked={formData.relationshipGoals.includes(goal)}
                      onCheckedChange={(checked) => {
                        if (checked && formData.relationshipGoals.length < 3) {
                          setFormData(prev => ({
                            ...prev,
                            relationshipGoals: [...prev.relationshipGoals, goal]
                          }))
                        } else if (!checked) {
                          setFormData(prev => ({
                            ...prev,
                            relationshipGoals: prev.relationshipGoals.filter(g => g !== goal)
                          }))
                        }
                      }}
                      disabled={formData.relationshipGoals.length >= 3 && !formData.relationshipGoals.includes(goal)}
                    />
                    <span className="text-sm">{goal}</span>
                  </label>
                ))}
              </div>
              {formData.relationshipGoals.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Selecionados: {formData.relationshipGoals.length}/3
                </p>
              )}
            </div>
            
            {/* Interests Selection */}
            <div className="space-y-2 mt-6">
              <Label>Fetiches e Fantasias (selecione até 5)</Label>
              <p className="text-xs text-gray-500 mb-2">
                Escolha seus interesses para encontrar pessoas compatíveis
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  "Lingerie", "Uniformes", "Roleplay", "Massagem", "Striptease",
                  "Sexo oral", "Anal", "Brinquedos", "Cordas", "Algemas",
                  "Vendas", "Cera quente", "Spanking", "Dirty talk", "Sexo ao ar livre",
                  "Gravação", "Sexo no carro", "Quickie", "Sexo tântrico", "Pés"
                ].map((interest) => (
                  <label
                    key={interest}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.interests.includes(interest)
                        ? "border-pink-600 bg-pink-50 dark:bg-pink-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    } ${formData.interests.length >= 5 && !formData.interests.includes(interest) ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Checkbox
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={(checked) => {
                        if (checked && formData.interests.length < 5) {
                          setFormData(prev => ({
                            ...prev,
                            interests: [...prev.interests, interest]
                          }))
                        } else if (!checked) {
                          setFormData(prev => ({
                            ...prev,
                            interests: prev.interests.filter(i => i !== interest)
                          }))
                        }
                      }}
                      disabled={formData.interests.length >= 5 && !formData.interests.includes(interest)}
                    />
                    <span className="text-sm">{interest}</span>
                  </label>
                ))}
              </div>
              {formData.interests.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Selecionados: {formData.interests.length}/5
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Profile Details */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              {formData.accountType === "business" ? "Informações do Negócio" : "Detalhes do Perfil"}
            </h2>
            
            {/* Business Fields - Only for business accounts */}
            {formData.accountType === "business" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nome da Empresa *</Label>
                  <div className="relative">
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName || ""}
                      onChange={handleInputChange}
                      placeholder="Nome do seu negócio"
                      className="pl-10"
                    />
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.businessName && (
                    <p className="text-sm text-red-500">{errors.businessName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Negócio *</Label>
                  <Select
                    value={formData.businessType || ""}
                    onValueChange={(value) => handleSelectChange("businessType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de negócio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creator">Criador de Conteúdo</SelectItem>
                      <SelectItem value="product">Produtos</SelectItem>
                      <SelectItem value="service">Serviços</SelectItem>
                      <SelectItem value="event">Eventos</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.businessType && (
                    <p className="text-sm text-red-500">{errors.businessType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                  <div className="relative">
                    <Input
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj || ""}
                      onChange={handleInputChange}
                      placeholder="00.000.000/0000-00"
                      className="pl-10"
                    />
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Opcional. Formato: 00.000.000/0000-00
                  </p>
                </div>

                <div className="border-t pt-4 mt-4" />
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="profilePicture">
                {formData.accountType === "business" ? "Logo da Empresa" : "Foto de Perfil"} (opcional)
              </Label>
              
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
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Sua Localização</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Isso nos ajuda a encontrar pessoas próximas a você
              </p>
            </div>
            
            {/* Location Detection Section */}
            {!showManualLocation && !formData.city && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Detectar Localização</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Permita que detectemos sua cidade automaticamente para uma experiência personalizada
                    </p>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleLocationDetection}
                    disabled={locationDetecting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    {locationDetecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Detectando...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Detectar Minha Localização
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowManualLocation(true)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mt-2"
                  >
                    Prefiro digitar manualmente
                  </Button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {locationError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Erro na detecção de localização
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{locationError}</p>
                    
                    {locationError.includes("Permissão") && (
                      <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/40 rounded border text-xs text-red-800 dark:text-red-200">
                        <strong>Como permitir localização no iOS Safari:</strong><br/>
                        1. Vá em Configurações → Safari → Localização<br/>
                        2. Selecione "Perguntar" ou "Permitir"<br/>
                        3. Volte aqui e tente novamente
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Manual Location Input or Success State */}
            {(showManualLocation || formData.city) && (
              <div className="space-y-4">
                {formData.city && !showManualLocation && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                          Localização detectada com sucesso!
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {formData.city}{formData.state ? `, ${formData.state}` : ''}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowManualLocation(true)
                          setLocationError("")
                        }}
                        className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 ml-auto"
                      >
                        Alterar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <div className="relative">
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Digite o nome da sua cidade"
                      className="pl-10"
                    />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                </div>

                {formData.state && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Estado"
                        disabled={!!formData.latitude}
                        className={`${formData.latitude ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="uf">UF</Label>
                      <Input
                        id="uf"
                        name="uf"
                        value={formData.uf}
                        onChange={handleInputChange}
                        placeholder="UF"
                        maxLength={2}
                        disabled={!!formData.latitude}
                        className={`${formData.latitude ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                      />
                    </div>
                  </div>
                )}

                {!formData.city && showManualLocation && (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowManualLocation(false)
                        setLocationError("")
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Tentar detectar localização novamente
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Privacy Note */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border">
              <div className="flex items-start gap-3">
                <MapPinOff className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-1">Sua privacidade é importante</p>
                  <p>Usamos sua localização apenas para mostrar pessoas próximas. Você pode ajustar a visibilidade nas configurações após criar sua conta.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Plan Selection & Terms */}
        {step === 6 && (
          <div className="space-y-4">
            {formData.accountType === "personal" ? (
              <>
                <h2 className="text-xl font-semibold text-center">Escolha seu Plano</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        onClose={() => {
          setShowPaymentModal(false)
          // If modal is closed without payment, redirect to feed anyway since account was created
          toast.info("Você pode ativar seu plano premium a qualquer momento nas configurações.")
          router.push("/feed")
        }}
        selectedPlan={formData.plan !== "free" ? formData.plan as "gold" | "diamond" | "couple" : "gold"}
        onSuccess={() => {
          setShowPaymentModal(false)
          toast.success("Pagamento processado com sucesso!")
          router.push("/feed")
        }}
      />
    </div>
  )
}