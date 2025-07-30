'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { businessService } from '@/lib/services/business.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { 
  Coins, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Target,
  DollarSign,
  Megaphone,
  Users,
  Calendar,
  Package,
  Star,
  Activity,
  Loader2,
  Plus,
  RefreshCw
} from 'lucide-react'
import type { 
  BusinessDashboard, 
  BusinessProfile, 
  ContentCreatorDashboard, 
  VenueDashboard 
} from '@/types/business.types'

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981']

export default function BusinessDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [dashboard, setDashboard] = useState<BusinessDashboard | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '90days'>('7days')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      
      // Get business profile
      const { data: businessData, error: businessError } = await businessService.getMyBusiness()
      if (businessError || !businessData) {
        router.push('/business/register')
        return
      }
      setBusiness(businessData)

      // Load dashboard based on business type
      let dashboardData
      if (businessData.business_type === 'content_creator') {
        const { data } = await businessService.getContentCreatorDashboard(businessData.id)
        dashboardData = data
      } else if (businessData.business_type === 'venue') {
        const { data } = await businessService.getVenueDashboard(businessData.id)
        dashboardData = data
      } else {
        const { data } = await businessService.getDashboard(businessData.id)
        dashboardData = data
      }
      
      setDashboard(dashboardData)
    } catch (error) {
      toast({
        title: 'Erro ao carregar dashboard',
        description: 'Tente novamente',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadDashboard()
    setIsRefreshing(false)
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

  if (!dashboard || !business) return null

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {business.business_name} • {business.business_type.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => router.push('/business/campaigns/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Disponíveis</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(dashboard.overview.credit_balance)}</div>
            <p className="text-xs text-muted-foreground">
              Total gasto: {formatNumber(dashboard.overview.total_spent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.overview.active_campaigns}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard.active_campaigns.length} campanhas no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões Totais</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(dashboard.overview.total_impressions)}</div>
            <p className="text-xs text-muted-foreground">
              CTR: {((dashboard.overview.total_clicks / dashboard.overview.total_impressions) * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.overview.conversion_rate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(dashboard.overview.total_clicks)} cliques totais
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          {business.business_type === 'content_creator' && (
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
          )}
          {business.business_type === 'venue' && (
            <TabsTrigger value="events">Eventos</TabsTrigger>
          )}
          <TabsTrigger value="transactions">Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Impressões por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboard.analytics.impressions_by_day}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cliques por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboard.analytics.clicks_by_day}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Demographics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Idade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={Object.entries(dashboard.analytics.demographics.age).map(([key, value]) => ({
                        name: key,
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(dashboard.analytics.demographics.age).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gênero</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={Object.entries(dashboard.analytics.demographics.gender).map(([key, value]) => ({
                        name: key,
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(dashboard.analytics.demographics.gender).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(dashboard.analytics.demographics.location)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([location, percentage]) => (
                      <div key={location} className="flex items-center justify-between">
                        <span className="text-sm">{location}</span>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          {dashboard.active_campaigns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma campanha ativa</h3>
                <p className="text-muted-foreground mb-4">Crie sua primeira campanha para começar a anunciar</p>
                <Button onClick={() => router.push('/business/campaigns/new')}>
                  Criar Campanha
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dashboard.active_campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{campaign.name}</CardTitle>
                        <CardDescription>
                          {campaign.objective} • {formatCurrency(campaign.spent_credits)} de {formatCurrency(campaign.total_budget)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/business/campaigns/${campaign.id}`)}
                      >
                        Gerenciar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(campaign.metrics.impressions)}</p>
                        <p className="text-xs text-muted-foreground">Impressões</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(campaign.metrics.clicks)}</p>
                        <p className="text-xs text-muted-foreground">Cliques</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{campaign.metrics.ctr.toFixed(2)}%</p>
                        <p className="text-xs text-muted-foreground">CTR</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(campaign.metrics.cpc)}</p>
                        <p className="text-xs text-muted-foreground">CPC</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gasto por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboard.analytics.spend_by_day}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Anúncios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.top_performing_ads.map((ad, index) => (
                  <div key={ad.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{ad.content.title || `Anúncio ${ad.format}`}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(ad.impressions)} impressões • {formatNumber(ad.clicks)} cliques
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{((ad.clicks / ad.impressions) * 100).toFixed(2)}% CTR</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(ad.credits_spent)} gastos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Creator Specific Tab */}
        {business.business_type === 'content_creator' && dashboard && 'content_stats' in dashboard && (
          <TabsContent value="content" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Conteúdo</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(dashboard as ContentCreatorDashboard).content_stats.total_content}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(dashboard as ContentCreatorDashboard).content_stats.total_sales}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency((dashboard as ContentCreatorDashboard).content_stats.total_revenue)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(dashboard as ContentCreatorDashboard).content_stats.average_rating.toFixed(1)}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Conteúdo Mais Vendido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboard as ContentCreatorDashboard).top_content.map((content) => (
                    <div key={content.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{content.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {content.sales} vendas • {formatCurrency(content.revenue)} receita
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{content.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Venue Specific Tab */}
        {business.business_type === 'venue' && dashboard && 'event_stats' in dashboard && (
          <TabsContent value="events" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eventos Futuros</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(dashboard as VenueDashboard).event_stats.upcoming_events}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Participantes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber((dashboard as VenueDashboard).event_stats.total_attendees)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber((dashboard as VenueDashboard).event_stats.ticket_sales)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita de Eventos</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency((dashboard as VenueDashboard).event_stats.revenue)}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboard as VenueDashboard).upcoming_events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{event.attendees} participantes</p>
                        <p className="text-sm text-muted-foreground">
                          {event.tickets_sold} ingressos vendidos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Suas últimas transações de créditos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.recent_transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} créditos
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Saldo: {transaction.balance_after}
                      </p>
                    </div>
                  </div>
                ))}

                {dashboard.recent_transactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma transação ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}