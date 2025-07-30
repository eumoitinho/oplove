'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { businessService } from '@/lib/services/business.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Building2, User, Phone, Mail, Globe, MapPin, Loader2 } from 'lucide-react'
import type { BusinessType } from '@/types/business.types'

// Business categories by type
const businessCategories: Record<BusinessType, string[]> = {
  venue: ['Balada', 'Bar', 'Restaurante', 'Casa de Shows', 'Hotel', 'Motel'],
  content_creator: ['Modelo', 'Influencer', 'Fotógrafo', 'Artista', 'Educador'],
  service_provider: ['Fotografia', 'DJ', 'Decoração', 'Buffet', 'Música ao Vivo'],
  event_organizer: ['Festas', 'Shows', 'Workshops', 'Encontros', 'Festivais'],
  brand: ['Moda', 'Beleza', 'Lifestyle', 'Tecnologia', 'Saúde'],
  influencer: ['Fashion', 'Fitness', 'Travel', 'Food', 'Entertainment']
}

const schema = z.object({
  business_type: z.enum(['venue', 'content_creator', 'service_provider', 'event_organizer', 'brand', 'influencer']),
  business_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  legal_name: z.string().optional(),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido').optional().or(z.literal('')),
  description: z.string().min(50, 'Descrição deve ter pelo menos 50 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  contact: z.object({
    phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
    whatsapp: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'WhatsApp inválido').optional().or(z.literal('')),
    email: z.string().email('Email inválido'),
    website: z.string().url('URL inválida').optional().or(z.literal(''))
  }),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }).optional(),
  social_links: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    tiktok: z.string().optional()
  }).optional()
})

type FormData = z.infer<typeof schema>

export default function BusinessRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const businessType = watch('business_type')

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      
      const { data: business, error } = await businessService.createBusiness(data)
      
      if (error) {
        toast({
          title: 'Erro ao criar perfil empresarial',
          description: error.message || 'Tente novamente',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Perfil empresarial criado!',
        description: 'Você será redirecionado para o dashboard'
      })

      // Redirect to business dashboard
      router.push('/business/dashboard')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Algo deu errado. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return value
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Criar Perfil Empresarial</CardTitle>
          <CardDescription>
            Transforme sua conta em um perfil empresarial e acesse ferramentas exclusivas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Business Type Selection */}
            <div className="space-y-4">
              <Label>Tipo de Negócio</Label>
              <RadioGroup
                value={businessType}
                onValueChange={(value) => {
                  setValue('business_type', value as BusinessType)
                  setSelectedType(value as BusinessType)
                  setValue('category', '') // Reset category when type changes
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="venue" id="venue" />
                    <div>
                      <Label htmlFor="venue" className="cursor-pointer">
                        <div className="font-medium">Local/Estabelecimento</div>
                        <div className="text-sm text-muted-foreground">
                          Baladas, bares, restaurantes, hotéis
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="content_creator" id="content_creator" />
                    <div>
                      <Label htmlFor="content_creator" className="cursor-pointer">
                        <div className="font-medium">Criador de Conteúdo</div>
                        <div className="text-sm text-muted-foreground">
                          Modelos, influencers, artistas
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="service_provider" id="service_provider" />
                    <div>
                      <Label htmlFor="service_provider" className="cursor-pointer">
                        <div className="font-medium">Prestador de Serviços</div>
                        <div className="text-sm text-muted-foreground">
                          Fotógrafos, DJs, decoradores
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="event_organizer" id="event_organizer" />
                    <div>
                      <Label htmlFor="event_organizer" className="cursor-pointer">
                        <div className="font-medium">Organizador de Eventos</div>
                        <div className="text-sm text-muted-foreground">
                          Produtoras, promoters, agências
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="brand" id="brand" />
                    <div>
                      <Label htmlFor="brand" className="cursor-pointer">
                        <div className="font-medium">Marca</div>
                        <div className="text-sm text-muted-foreground">
                          Produtos, serviços, lojas
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="influencer" id="influencer" />
                    <div>
                      <Label htmlFor="influencer" className="cursor-pointer">
                        <div className="font-medium">Influenciador</div>
                        <div className="text-sm text-muted-foreground">
                          Criadores verificados com grande alcance
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
              </RadioGroup>
              {errors.business_type && (
                <p className="text-sm text-destructive">{errors.business_type.message}</p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business_name">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Nome do Negócio *
                </Label>
                <Input
                  id="business_name"
                  {...register('business_name')}
                  placeholder="Ex: Balada XYZ"
                />
                {errors.business_name && (
                  <p className="text-sm text-destructive">{errors.business_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_name">
                  Razão Social
                </Label>
                <Input
                  id="legal_name"
                  {...register('legal_name')}
                  placeholder="Nome legal da empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">
                  CNPJ
                </Label>
                <Input
                  id="cnpj"
                  {...register('cnpj')}
                  placeholder="00.000.000/0000-00"
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value)
                    setValue('cnpj', formatted)
                  }}
                />
                {errors.cnpj && (
                  <p className="text-sm text-destructive">{errors.cnpj.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Categoria *
                </Label>
                <Select
                  value={watch('category')}
                  onValueChange={(value) => setValue('category', value)}
                  disabled={!businessType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessType && businessCategories[businessType]?.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição *
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descreva seu negócio, serviços oferecidos, diferenciais..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações de Contato</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    {...register('contact.phone')}
                    placeholder="(11) 98765-4321"
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      setValue('contact.phone', formatted)
                    }}
                  />
                  {errors.contact?.phone && (
                    <p className="text-sm text-destructive">{errors.contact.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    {...register('contact.whatsapp')}
                    placeholder="(11) 98765-4321"
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      setValue('contact.whatsapp', formatted)
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('contact.email')}
                    placeholder="contato@empresa.com"
                  />
                  {errors.contact?.email && (
                    <p className="text-sm text-destructive">{errors.contact.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    {...register('contact.website')}
                    placeholder="https://www.empresa.com"
                  />
                </div>
              </div>
            </div>

            {/* Address (for venues) */}
            {businessType === 'venue' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Endereço
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      {...register('address.street')}
                      placeholder="Av. Paulista"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      {...register('address.number')}
                      placeholder="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      {...register('address.complement')}
                      placeholder="Sala 101"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      {...register('address.neighborhood')}
                      placeholder="Bela Vista"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      {...register('address.city')}
                      placeholder="São Paulo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      {...register('address.state')}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Redes Sociais</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    {...register('social_links.instagram')}
                    placeholder="@empresa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    {...register('social_links.facebook')}
                    placeholder="facebook.com/empresa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    {...register('social_links.twitter')}
                    placeholder="@empresa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    {...register('social_links.tiktok')}
                    placeholder="@empresa"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando perfil...
                  </>
                ) : (
                  'Criar Perfil Empresarial'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}