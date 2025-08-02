"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Globe, Phone, MapPin, ArrowRight, CheckCircle, Briefcase, Mail } from "lucide-react"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase-browser"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface BusinessFormData {
  businessName: string
  legalName: string
  businessType: string
  description: string
  shortDescription: string
  category: string
  subcategories: string[]
  tags: string[]
  website: string
  phone: string
  whatsapp: string
  email: string
  address: string
  cnpj: string
}

interface FormErrors {
  [key: string]: string
}

const businessCategories = [
  "Saúde e Bem-estar",
  "Educação",
  "Tecnologia",
  "Alimentação",
  "Moda e Beleza",
  "Entretenimento",
  "Serviços Profissionais",
  "Varejo",
  "Turismo e Viagem",
  "Arte e Design",
  "Fitness",
  "Consultoria",
  "Outros"
]

export function BusinessRegisterForm() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: "",
    legalName: "",
    businessType: "service_provider",
    description: "",
    shortDescription: "",
    category: "",
    subcategories: [],
    tags: [],
    website: "",
    phone: "",
    whatsapp: "",
    email: user?.email || "",
    address: "",
    cnpj: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const router = useRouter()

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: keyof BusinessFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.businessName) newErrors.businessName = "Nome do negócio é obrigatório"
    if (!formData.businessType) newErrors.businessType = "Tipo de negócio é obrigatório"
    if (!formData.description) newErrors.description = "Descrição é obrigatória"
    else if (formData.description.length < 20) newErrors.description = "Descrição deve ter pelo menos 20 caracteres"
    if (!formData.shortDescription) newErrors.shortDescription = "Descrição curta é obrigatória"
    if (!formData.category) newErrors.category = "Categoria é obrigatória"
    if (!formData.phone && !formData.whatsapp) newErrors.phone = "Telefone ou WhatsApp é obrigatório"
    if (!formData.address) newErrors.address = "Endereço é obrigatório"
    if (!formData.email) newErrors.email = "E-mail é obrigatório"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "E-mail inválido"
    
    // Validate website URL if provided
    if (formData.website && !/^https?:\/\//.test(formData.website)) {
      newErrors.website = "Website deve começar com http:// ou https://"
    }

    // Validate CNPJ format if provided
    if (formData.cnpj && !/^\d{14}$/.test(formData.cnpj.replace(/\D/g, ''))) {
      newErrors.cnpj = "CNPJ deve ter 14 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !user) return

    setLoading(true)
    try {
      const supabase = createClient()

      // Create business profile with all required fields
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({
          owner_id: user.id,
          business_name: formData.businessName,
          legal_name: formData.legalName || formData.businessName,
          business_type: formData.businessType as any,
          description: formData.description,
          short_description: formData.shortDescription,
          category: formData.category,
          subcategories: formData.subcategories,
          tags: formData.tags,
          contact: {
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            email: formData.email,
            website: formData.website
          },
          address: {
            full_address: formData.address
          },
          cnpj: formData.cnpj || null,
          slug: formData.businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          meta_description: formData.shortDescription
        })
        .select()
        .single()

      if (businessError) {
        throw new Error(businessError.message)
      }

      // Update user profile to link with business
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({ 
          business_id: business.id,
          // Ensure business account has proper premium type
          premium_type: "free"
        })
        .eq("id", user.id)

      if (userUpdateError) {
        console.error("Error updating user:", userUpdateError)
        // Don't fail the process if user update fails
      }

      toast.success("Perfil empresarial criado com sucesso!")
      router.push("/feed?welcome=business")
    } catch (error) {
      console.error("Business registration error:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao criar perfil empresarial")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Você precisa estar logado para configurar um perfil empresarial.
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">Fazer Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full flex items-center justify-center shadow-lg"
          >
            <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <h2 className="text-xl font-semibold">Configure seu Negócio</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preencha as informações do seu negócio para começar a vender no OpenLove
          </p>
        </motion.div>

        {/* Business Type */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label>Tipo de Negócio *</Label>
          <Select
            value={formData.businessType}
            onValueChange={(value) => handleSelectChange("businessType", value)}
          >
            <SelectTrigger className="transition-all duration-200 hover:border-purple-400 focus:border-purple-600">
              <SelectValue placeholder="Selecione o tipo de negócio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venue">Local/Estabelecimento</SelectItem>
              <SelectItem value="content_creator">Criador de Conteúdo</SelectItem>
              <SelectItem value="service_provider">Prestador de Serviços</SelectItem>
              <SelectItem value="event_organizer">Organizador de Eventos</SelectItem>
              <SelectItem value="brand">Marca/Loja</SelectItem>
              <SelectItem value="influencer">Influenciador</SelectItem>
            </SelectContent>
          </Select>
          {errors.businessType && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-500"
            >
              {errors.businessType}
            </motion.p>
          )}
        </motion.div>

        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName">Nome do Negócio *</Label>
          <div className="relative">
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              placeholder="Nome da sua empresa"
              className="pl-10"
            />
            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          {errors.businessName && (
            <p className="text-sm text-red-500">{errors.businessName}</p>
          )}
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <Label htmlFor="shortDescription">Descrição Curta *</Label>
          <Textarea
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleTextareaChange}
            placeholder="Uma breve descrição do seu negócio (máx. 500 caracteres)"
            className="resize-none"
            rows={2}
            maxLength={500}
          />
          <p className="text-xs text-gray-500">
            {formData.shortDescription.length}/500 caracteres
          </p>
          {errors.shortDescription && (
            <p className="text-sm text-red-500">{errors.shortDescription}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição Completa *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleTextareaChange}
            placeholder="Descreva detalhadamente seu negócio, produtos ou serviços..."
            className="resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500">
            Mínimo de 20 caracteres. Seja claro sobre o que você oferece.
          </p>
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria do seu negócio" />
            </SelectTrigger>
            <SelectContent>
              {businessCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(11) 3333-3333"
                className="pl-10"
              />
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <div className="relative">
              <Input
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
                className="pl-10"
              />
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail Comercial *</Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contato@empresa.com"
                className="pl-10"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (opcional)</Label>
            <div className="relative">
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://seusite.com"
                className="pl-10"
              />
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Endereço Comercial *</Label>
          <div className="relative">
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Rua, número, bairro, cidade - UF"
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        {/* CNPJ */}
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ (opcional)</Label>
          <Input
            id="cnpj"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleInputChange}
            placeholder="00.000.000/0000-00"
          />
          <p className="text-xs text-gray-500">
            Opcional agora, mas necessário para recursos avançados como anúncios pagos.
          </p>
          {errors.cnpj && (
            <p className="text-sm text-red-500">{errors.cnpj}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold">O que você ganha com uma conta empresarial:</p>
              <ul className="space-y-1">
                <li>• Dashboard completo com analytics</li>
                <li>• Sistema de créditos para impulsionar conteúdo</li>
                <li>• Criação de campanhas publicitárias</li>
                <li>• Venda de produtos e serviços</li>
                <li>• Suporte prioritário</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          size="lg"
        >
          {loading ? "Criando perfil..." : "Criar Perfil Empresarial"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          Já tem uma conta empresarial?{" "}
          <Link
            href="/feed"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            Ir para o feed
          </Link>
        </p>
      </form>
    </motion.div>
  )
}