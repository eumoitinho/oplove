'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { businessService } from '@/lib/services/business.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { 
  Megaphone, 
  Plus, 
  Search,
  Filter,
  Play,
  Pause,
  BarChart3,
  Eye,
  MousePointer,
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react'
import type { AdCampaign, BusinessProfile } from '@/types/business.types'

export default function BusinessCampaignsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<AdCampaign[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadCampaigns()
  }, [])

  useEffect(() => {
    filterCampaigns()
  }, [campaigns, searchQuery, statusFilter])

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      
      // Get business profile
      const { data: businessData, error: businessError } = await businessService.getMyBusiness()
      if (businessError || !businessData) {
        router.push('/business/register')
        return
      }
      setBusiness(businessData)

      // Get campaigns
      const { data: campaignsData } = await businessService.getCampaigns(businessData.id)
      setCampaigns(campaignsData)
    } catch (error) {
      toast({
        title: 'Erro ao carregar campanhas',
        description: 'Tente novamente',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterCampaigns = () => {
    let filtered = campaigns

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter)
    }

    setFilteredCampaigns(filtered)
  }

  const handleStatusChange = async (campaignId: string, newStatus: 'active' | 'paused') => {
    try {
      // TODO: Implement campaign status update
      toast({
        title: 'Status atualizado',
        description: `Campanha ${newStatus === 'active' ? 'ativada' : 'pausada'} com sucesso`
      })
      
      // Reload campaigns
      await loadCampaigns()
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Tente novamente',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      pending: { label: 'Pendente', variant: 'outline' as const },
      active: { label: 'Ativa', variant: 'default' as const },
      paused: { label: 'Pausada', variant: 'secondary' as const },
      completed: { label: 'Concluída', variant: 'outline' as const },
      rejected: { label: 'Rejeitada', variant: 'destructive' as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getObjectiveIcon = (objective: string) => {
    const icons = {
      awareness: Eye,
      traffic: MousePointer,
      conversion: Target,
      engagement: BarChart3,
      app_installs: Megaphone
    }

    const Icon = icons[objective as keyof typeof icons] || Megaphone
    return <Icon className="h-4 w-4" />
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campanhas</h1>
          <p className="text-muted-foreground">
            Gerencie suas campanhas de anúncios
          </p>
        </div>
        <Button onClick={() => router.push('/business/campaigns/new')} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      {/* Balance Card */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">Saldo de Créditos</p>
            <p className="text-3xl font-bold">{formatNumber(business?.credit_balance || 0)}</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/business/credits')}>
            Comprar Créditos
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="paused">Pausadas</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {campaigns.length === 0 ? (
              <>
                <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma campanha criada</h3>
                <p className="text-muted-foreground mb-4">Crie sua primeira campanha para começar a anunciar</p>
                <Button onClick={() => router.push('/business/campaigns/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Campanha
                </Button>
              </>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
                <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{campaign.name}</CardTitle>
                      {getStatusBadge(campaign.status)}
                    </div>
                    {campaign.description && (
                      <CardDescription>{campaign.description}</CardDescription>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getObjectiveIcon(campaign.objective)}
                        <span>{campaign.objective.replace('_', ' ')}</span>
                      </div>
                      <span>•</span>
                      <span>
                        {new Date(campaign.start_date).toLocaleDateString('pt-BR')} - 
                        {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(campaign.id, 'paused')}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : campaign.status === 'paused' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(campaign.id, 'active')}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      onClick={() => router.push(`/business/campaigns/${campaign.id}`)}
                    >
                      Gerenciar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Orçamento</p>
                    <p className="font-semibold">{formatNumber(campaign.total_budget)} créditos</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gasto</p>
                    <p className="font-semibold">{formatNumber(campaign.spent_credits)} créditos</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Impressões</p>
                    <p className="font-semibold">{formatNumber(campaign.metrics.impressions)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cliques</p>
                    <p className="font-semibold">{formatNumber(campaign.metrics.clicks)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CTR</p>
                    <p className="font-semibold">{campaign.metrics.ctr.toFixed(2)}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progresso do orçamento</span>
                    <span className="font-medium">
                      {((campaign.spent_credits / campaign.total_budget) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(campaign.spent_credits / campaign.total_budget) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}