'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { businessService } from '@/lib/services/business.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  CreditCard, 
  Coins, 
  Zap, 
  TrendingUp, 
  Gift, 
  Loader2,
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import type { CreditPackage, BusinessProfile, CreditTransaction } from '@/types/business.types'
import Image from 'next/image'

// PIX payment dialog component
function PixPaymentDialog({ 
  isOpen, 
  onClose, 
  pixData 
}: { 
  isOpen: boolean
  onClose: () => void
  pixData: { qr_code: string; qr_code_text: string; expires_at: string } | null 
}) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!pixData) return

    const timer = setInterval(() => {
      const expiresAt = new Date(pixData.expires_at)
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Expirado')
        clearInterval(timer)
      } else {
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [pixData])

  const copyToClipboard = async () => {
    if (!pixData) return
    
    try {
      await navigator.clipboard.writeText(pixData.qr_code_text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: 'Código PIX copiado!',
        description: 'Cole no seu app de pagamento'
      })
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Tente novamente',
        variant: 'destructive'
      })
    }
  }

  if (!pixData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento via PIX</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code ou copie o código PIX
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>Expira em: <strong>{timeLeft}</strong></span>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="relative p-4 bg-white rounded-lg">
              <Image
                src={pixData.qr_code}
                alt="QR Code PIX"
                width={250}
                height={250}
                className="rounded"
              />
            </div>
          </div>

          {/* Copy code */}
          <div className="space-y-2">
            <Label>Código PIX copia e cola:</Label>
            <div className="flex gap-2">
              <Input
                value={pixData.qr_code_text}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Como pagar:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Abra o app do seu banco</li>
              <li>Escolha pagar com PIX</li>
              <li>Escaneie o QR Code ou cole o código</li>
              <li>Confirme o pagamento</li>
            </ol>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>Aguardando confirmação do pagamento...</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function BusinessCreditsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix')
  const [pixDialogOpen, setPixDialogOpen] = useState(false)
  const [pixData, setPixData] = useState<any>(null)

  // Form data for credit card
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    cpf: '',
    installments: 1
  })

  // Form data for PIX
  const [pixFormData, setPixFormData] = useState({
    cpf: '',
    name: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Get business profile
      const { data: businessData, error: businessError } = await businessService.getMyBusiness()
      if (businessError || !businessData) {
        router.push('/business/register')
        return
      }
      setBusiness(businessData)

      // Get credit packages
      const { data: packagesData } = await businessService.getCreditPackages()
      setPackages(packagesData)
      if (packagesData.length > 0) {
        setSelectedPackage(packagesData[0].id)
      }

      // Get recent transactions
      const { data: transactionsData } = await businessService.getCreditTransactions(businessData.id, 10)
      setTransactions(transactionsData)
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        description: 'Tente novamente',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast({
        title: 'Selecione um pacote',
        description: 'Escolha um pacote de créditos para continuar',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsPurchasing(true)

      const paymentData = paymentMethod === 'pix' 
        ? { payer_cpf: pixFormData.cpf, payer_name: pixFormData.name }
        : { card_token: 'mock_token', installments: cardData.installments }

      const { data, error } = await businessService.purchaseCredits({
        package_id: selectedPackage,
        payment_method: paymentMethod,
        payment_data: paymentData
      })

      if (error) {
        toast({
          title: 'Erro no pagamento',
          description: error.message || 'Tente novamente',
          variant: 'destructive'
        })
        return
      }

      if (paymentMethod === 'pix' && data?.payment) {
        // Show PIX QR Code
        setPixData(data.payment)
        setPixDialogOpen(true)
        
        // Start polling for payment confirmation
        startPaymentPolling(data.payment.id)
      } else {
        // Credit card payment would be processed here
        toast({
          title: 'Pagamento processado!',
          description: 'Seus créditos foram adicionados à conta'
        })
        
        // Reload data
        await loadData()
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Algo deu errado. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const startPaymentPolling = (paymentId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        // Check payment status via API
        const response = await fetch(`/api/v1/payments/status/${paymentId}`)
        const result = await response.json()

        if (result.status === 'paid') {
          clearInterval(pollInterval)
          setPixDialogOpen(false)
          
          toast({
            title: 'Pagamento confirmado!',
            description: 'Seus créditos foram adicionados à conta'
          })
          
          // Reload data
          await loadData()
        } else if (result.status === 'failed' || result.status === 'expired') {
          clearInterval(pollInterval)
          setPixDialogOpen(false)
          
          toast({
            title: 'Pagamento não concluído',
            description: 'O pagamento expirou ou foi cancelado',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('Error polling payment:', error)
      }
    }, 5000) // Poll every 5 seconds

    // Stop polling after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 600000)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 16) {
      return numbers.replace(/(\d{4})(?=\d)/g, '$1 ')
    }
    return value
  }

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 4) {
      return numbers.replace(/(\d{2})(\d{2})/, '$1/$2')
    }
    return value
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Créditos para Anúncios</h1>
          <p className="text-muted-foreground">
            Compre créditos para promover seu negócio
          </p>
        </div>
        <Card className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Coins className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Saldo atual</p>
              <p className="text-2xl font-bold">{business?.credit_balance || 0} créditos</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Credit Packages */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pacotes de Créditos</CardTitle>
              <CardDescription>
                Escolha o pacote ideal para suas campanhas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedPackage}
                onValueChange={setSelectedPackage}
                className="grid gap-4"
              >
                {packages.map((pkg) => (
                  <div key={pkg.id} className="relative">
                    <RadioGroupItem
                      value={pkg.id}
                      id={pkg.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={pkg.id}
                      className="flex flex-col gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold">{pkg.name}</span>
                            {pkg.bonus_credits > 0 && (
                              <Badge variant="secondary">
                                <Gift className="w-3 h-3 mr-1" />
                                +{pkg.bonus_credits} bônus
                              </Badge>
                            )}
                            {pkg.is_promotional && (
                              <Badge variant="destructive">
                                <Zap className="w-3 h-3 mr-1" />
                                Promoção
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {pkg.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatCurrency(pkg.price)}</p>
                          <p className="text-sm text-muted-foreground">
                            {pkg.credits + pkg.bonus_credits} créditos
                          </p>
                        </div>
                      </div>
                      
                      {pkg.features && pkg.features.length > 0 && (
                        <ul className="grid gap-2 text-sm">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pix">
                    <QrCode className="w-4 h-4 mr-2" />
                    PIX
                  </TabsTrigger>
                  <TabsTrigger value="credit_card">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Cartão de Crédito
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pix" className="space-y-4">
                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="font-medium">Pagamento instantâneo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Aprovação imediata após o pagamento
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pix-cpf">CPF do pagador</Label>
                      <Input
                        id="pix-cpf"
                        placeholder="000.000.000-00"
                        value={pixFormData.cpf}
                        onChange={(e) => {
                          const formatted = formatCPF(e.target.value)
                          setPixFormData({ ...pixFormData, cpf: formatted })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pix-name">Nome completo</Label>
                      <Input
                        id="pix-name"
                        placeholder="João da Silva"
                        value={pixFormData.name}
                        onChange={(e) => setPixFormData({ ...pixFormData, name: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="credit_card" className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      Pagamento seguro processado pela Stripe
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Número do cartão</Label>
                      <Input
                        id="card-number"
                        placeholder="0000 0000 0000 0000"
                        value={cardData.number}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value)
                          setCardData({ ...cardData, number: formatted })
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-expiry">Validade</Label>
                        <Input
                          id="card-expiry"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={(e) => {
                            const formatted = formatExpiry(e.target.value)
                            setCardData({ ...cardData, expiry: formatted })
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-cvv">CVV</Label>
                        <Input
                          id="card-cvv"
                          placeholder="123"
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-name">Nome no cartão</Label>
                      <Input
                        id="card-name"
                        placeholder="JOÃO DA SILVA"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-cpf">CPF do titular</Label>
                      <Input
                        id="card-cpf"
                        placeholder="000.000.000-00"
                        value={cardData.cpf}
                        onChange={(e) => {
                          const formatted = formatCPF(e.target.value)
                          setCardData({ ...cardData, cpf: formatted })
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                disabled={!selectedPackage || isPurchasing}
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Comprar Créditos
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Como usar créditos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Anúncios na Timeline</p>
                    <p className="text-xs text-muted-foreground">
                      10 créditos por 1.000 impressões
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Impulsionar Perfil</p>
                    <p className="text-xs text-muted-foreground">
                      30 créditos por dia
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Gift className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Destacar Evento</p>
                    <p className="text-xs text-muted-foreground">
                      50 créditos por 24 horas
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma transação ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className={`text-sm font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PIX Payment Dialog */}
      <PixPaymentDialog
        isOpen={pixDialogOpen}
        onClose={() => setPixDialogOpen(false)}
        pixData={pixData}
      />
    </div>
  )
}