"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { businessService } from "@/lib/services/business.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Plus, Play, Pause, BarChart3, Eye, MousePointer, DollarSign, Calendar, Target, TrendingUp, Users, Settings } from "lucide-react"
import type { AdCampaign, AdMetrics } from "@/types/business.types"
import { toast } from "sonner"

export default function BusinessAdsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
  const [metrics, setMetrics] = useState<AdMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user?.business_id) {
      loadCampaigns()
      loadMetrics()
    }
  }, [user])

  const loadCampaigns = async () => {
    if (!user?.business_id) return

    try {
      const result = await businessService.getCampaigns(user.business_id)
      if (result.error) {
        toast.error("Erro ao carregar campanhas: " + result.error)
        return
      }
      setCampaigns(result.data || [])
    } catch (error) {
      console.error("Error loading campaigns:", error)
      toast.error("Erro inesperado ao carregar campanhas")
    } finally {
      setLoading(false)
    }
  }

  const loadMetrics = async () => {
    if (!user?.business_id) return

    try {
      const result = await businessService.getAdMetrics(user.business_id)
      if (result.error) {
        console.error("Error loading metrics:", result.error)
        return
      }
      setMetrics(result.data)
    } catch (error) {
      console.error("Error loading metrics:", error)
    }
  }

  const toggleCampaign = async (campaignId: string, action: 'play' | 'pause') => {
    setActionLoading(campaignId)
    try {
      const result = await businessService.updateCampaignStatus(campaignId, action === 'play' ? 'active' : 'paused')
      if (result.error) {
        toast.error("Erro ao " + (action === 'play' ? 'ativar' : 'pausar') + " campanha")
        return
      }
      
      // Update local state
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: action === 'play' ? 'active' : 'paused' }
          : campaign
      ))
      
      toast.success("Campanha " + (action === 'play' ? 'ativada' : 'pausada') + " com sucesso!")
    } catch (error) {
      console.error("Error toggling campaign:", error)
      toast.error("Erro inesperado")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'draft': return 'bg-gray-500'
      case 'completed': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'paused': return 'Pausada'
      case 'draft': return 'Rascunho'
      case 'completed': return 'Concluída'
      default: return 'Desconhecido'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100) // Assuming values are in cents
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Campanhas Publicitárias
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie suas campanhas e acompanhe o desempenho
            </p>
          </div>
          <Button 
            onClick={() => router.push('/business/ads/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="analytics">Relatórios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Impressões
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(metrics?.impressions || 0)}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Cliques
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(metrics?.clicks || 0)}
                      </p>
                    </div>
                    <MousePointer className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Gasto Total
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(metrics?.spent || 0)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        CTR
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {((metrics?.ctr || 0) * 100).toFixed(2)}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Recentes</CardTitle>
                <CardDescription>
                  Suas campanhas mais recentes e seu desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhuma campanha ainda
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Crie sua primeira campanha para começar a alcançar novos clientes
                    </p>
                    <Button onClick={() => router.push('/business/ads/create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Campanha
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(campaign.status)}`} />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {campaign.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {getStatusLabel(campaign.status)} • {formatCurrency(campaign.spent_credits * 10)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {campaign.metrics?.impressions || 0} impressões
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/business/ads/${campaign.id}`)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(campaign.status)}`} />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {campaign.description || 'Sem descrição'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getStatusLabel(campaign.status)}
                        </Badge>
                        {campaign.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleCampaign(campaign.id, 'pause')}
                            disabled={actionLoading === campaign.id}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : campaign.status === 'paused' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleCampaign(campaign.id, 'play')}
                            disabled={actionLoading === campaign.id}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/business/ads/${campaign.id}`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(campaign.metrics?.impressions || 0)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Impressões</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(campaign.metrics?.clicks || 0)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cliques</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(campaign.spent_credits * 10)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gasto</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {((campaign.metrics?.ctr || 0) * 100).toFixed(2)}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">CTR</p>
                      </div>
                    </div>

                    {/* Budget Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Orçamento Utilizado</span>
                        <span>
                          {formatCurrency(campaign.spent_credits * 10)} de {formatCurrency(campaign.total_budget)}
                        </span>
                      </div>
                      <Progress 
                        value={(campaign.spent_credits * 10 / campaign.total_budget) * 100} 
                        className="h-2"
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(campaign.start_date).toLocaleDateString('pt-BR')} - {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {campaign.objective}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Relatório de Performance
                </CardTitle>
                <CardDescription>
                  Análise detalhada do desempenho das suas campanhas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Relatórios Detalhados
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Em breve você terá acesso a relatórios detalhados com gráficos e métricas avançadas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}