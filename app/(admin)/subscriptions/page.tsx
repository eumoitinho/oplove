"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Star,
  Gem,
  Heart,
  Crown,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  UserX,
  UserCheck,
  Zap,
  BarChart3
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { toast } from "sonner"

interface SubscriptionMetrics {
  overview: {
    totalActive: number
    totalCancelled: number
    totalExpired: number
    totalTrial: number
    monthlyRevenue: number
    churnRate: number
    growthRate: number
    averageLifetime: number
  }
  planBreakdown: {
    gold: { active: number, revenue: number, churn: number }
    diamond: { active: number, revenue: number, churn: number }
    couple: { active: number, revenue: number, churn: number }
  }
  chartData: {
    growth: Array<{ date: string, new: number, cancelled: number, net: number }>
    revenue: Array<{ date: string, gold: number, diamond: number, couple: number }>
    churn: Array<{ date: string, rate: number }>
    planDistribution: Array<{ name: string, value: number, color: string }>
  }
}

interface Subscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  planType: 'gold' | 'diamond' | 'couple'
  billingPeriod: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  amount: number
  finalAmount: number
  discountPercentage: number
  paymentMethod: 'credit_card' | 'pix'
  provider: 'stripe' | 'abacatepay'
  providerSubscriptionId: string
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEndsAt?: string
  cancelledAt?: string
  createdAt: string
  lastPayment?: {
    date: string
    amount: number
    status: string
  }
}

export default function SubscriptionsManagement() {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    setLoading(true)
    try {
      const [metricsResponse, subscriptionsResponse] = await Promise.all([
        fetch('/api/v1/admin/subscriptions/metrics'),
        fetch(`/api/v1/admin/subscriptions?page=${currentPage}&limit=${itemsPerPage}`)
      ])
      
      if (!metricsResponse.ok || !subscriptionsResponse.ok) {
        throw new Error('Erro ao carregar dados de assinaturas')
      }
      
      const metricsData = await metricsResponse.json()
      const subscriptionsData = await subscriptionsResponse.json()
      
      setMetrics(metricsData)
      setSubscriptions(subscriptionsData.subscriptions)
    } catch (error) {
      console.error('Error loading subscription data:', error)
      toast.error('Erro ao carregar dados de assinaturas')
      
      // Mock data para desenvolvimento
      setMetrics({
        overview: {
          totalActive: 1265,
          totalCancelled: 187,
          totalExpired: 45,
          totalTrial: 89,
          monthlyRevenue: 42290,
          churnRate: 8.5,
          growthRate: 12.3,
          averageLifetime: 8.5 // meses
        },
        planBreakdown: {
          gold: { active: 850, revenue: 21250, churn: 9.2 },
          diamond: { active: 320, revenue: 14400, churn: 6.8 },
          couple: { active: 95, revenue: 6640, churn: 5.1 }
        },
        chartData: {
          growth: [
            { date: '2024-01', new: 120, cancelled: 15, net: 105 },
            { date: '2024-02', new: 135, cancelled: 18, net: 117 },
            { date: '2024-03', new: 142, cancelled: 22, net: 120 }
          ],
          revenue: [
            { date: '2024-01', gold: 20000, diamond: 13500, couple: 6200 },
            { date: '2024-02', gold: 20800, diamond: 14100, couple: 6400 },
            { date: '2024-03', gold: 21250, diamond: 14400, couple: 6640 }
          ],
          churn: [
            { date: '2024-01', rate: 9.5 },
            { date: '2024-02', rate: 8.8 },
            { date: '2024-03', rate: 8.5 }
          ],
          planDistribution: [
            { name: 'Gold', value: 67, color: '#F59E0B' },
            { name: 'Diamond', value: 25, color: '#8B5CF6' },
            { name: 'Couple', value: 8, color: '#EC4899' }
          ]
        }
      })
      
      setSubscriptions([
        {
          id: '1',
          userId: 'user-123',
          userName: 'João Silva',
          userEmail: 'joao@email.com',
          planType: 'diamond',
          billingPeriod: 'monthly',
          status: 'active',
          amount: 45.00,
          finalAmount: 45.00,
          discountPercentage: 0,
          paymentMethod: 'credit_card',
          provider: 'stripe',
          providerSubscriptionId: 'sub_123456',
          currentPeriodStart: '2024-01-15T00:00:00Z',
          currentPeriodEnd: '2024-02-15T00:00:00Z',
          createdAt: '2024-01-15T10:30:00Z',
          lastPayment: {
            date: '2024-01-15T10:30:00Z',
            amount: 45.00,
            status: 'completed'
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async (subscriptionId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/v1/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao cancelar assinatura')
      }
      
      toast.success('Assinatura cancelada com sucesso!')
      loadSubscriptionData()
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Erro ao cancelar assinatura')
    }
  }

  const reactivateSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/subscriptions/${subscriptionId}/reactivate`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Erro ao reativar assinatura')
      }
      
      toast.success('Assinatura reativada com sucesso!')
      loadSubscriptionData()
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      toast.error('Erro ao reativar assinatura')
    }
  }

  const updateSubscriptionPlan = async (subscriptionId: string, newPlan: string) => {
    try {
      const response = await fetch(`/api/v1/admin/subscriptions/${subscriptionId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: newPlan })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao alterar plano')
      }
      
      toast.success('Plano alterado com sucesso!')
      loadSubscriptionData()
    } catch (error) {
      console.error('Error updating subscription plan:', error)
      toast.error('Erro ao alterar plano')
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'gold':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'diamond':
        return <Gem className="w-4 h-4 text-purple-500" />
      case 'couple':
        return <Heart className="w-4 h-4 text-pink-500" />
      default:
        return <Crown className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expirada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
    const matchesPlan = planFilter === 'all' || subscription.planType === planFilter
    const matchesPeriod = periodFilter === 'all' || subscription.billingPeriod === periodFilter
    
    return matchesSearch && matchesStatus && matchesPlan && matchesPeriod
  })

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestão de Assinaturas
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie todas as assinaturas da plataforma
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button onClick={() => {}} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          
          <Button onClick={loadSubscriptionData} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Métricas de Assinaturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Assinaturas Ativas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.overview.totalActive.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{metrics?.overview.growthRate}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Receita Mensal
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    R$ {metrics?.overview.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    MRR (Monthly Recurring Revenue)
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Taxa de Churn
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.overview.churnRate}%
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">-1.2%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Lifetime Médio
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.overview.averageLifetime} meses
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Duração média das assinaturas
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="plans">Por Planos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="subscriptions">Lista</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crescimento de Assinaturas */}
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Assinaturas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics?.chartData.growth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="new" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981"
                      name="Novas"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cancelled" 
                      stackId="2"
                      stroke="#EF4444" 
                      fill="#EF4444"
                      name="Canceladas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Planos */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Planos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics?.chartData.planDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {metrics?.chartData.planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Receita por Plano */}
          <Card>
            <CardHeader>
              <CardTitle>Receita por Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics?.chartData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="gold" fill="#F59E0B" name="Gold" />
                  <Bar dataKey="diamond" fill="#8B5CF6" name="Diamond" />
                  <Bar dataKey="couple" fill="#EC4899" name="Couple" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Por Planos */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gold */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  Plano Gold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Assinantes Ativos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics?.planBreakdown.gold.active.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receita Mensal</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      R$ {metrics?.planBreakdown.gold.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Churn</p>
                    <p className="text-lg font-medium text-red-600">
                      {metrics?.planBreakdown.gold.churn}%
                    </p>
                  </div>
                  <div className="pt-2">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      R$ 25/mês
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diamond */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gem className="w-5 h-5 text-purple-500 mr-2" />
                  Plano Diamond
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Assinantes Ativos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics?.planBreakdown.diamond.active.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receita Mensal</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      R$ {metrics?.planBreakdown.diamond.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Churn</p>
                    <p className="text-lg font-medium text-red-600">
                      {metrics?.planBreakdown.diamond.churn}%
                    </p>
                  </div>
                  <div className="pt-2">
                    <Badge className="bg-purple-100 text-purple-800">
                      R$ 45/mês
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Couple */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 text-pink-500 mr-2" />
                  Plano Couple
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Assinantes Ativos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics?.planBreakdown.couple.active.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receita Mensal</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      R$ {metrics?.planBreakdown.couple.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Churn</p>
                    <p className="text-lg font-medium text-red-600">
                      {metrics?.planBreakdown.couple.churn}%
                    </p>
                  </div>
                  <div className="pt-2">
                    <Badge className="bg-pink-100 text-pink-800">
                      R$ 69,90/mês
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lista de Assinaturas */}
        <TabsContent value="subscriptions" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                      <SelectItem value="expired">Expirada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="plan">Plano</Label>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="couple">Couple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="period">Período</Label>
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="semiannual">Semestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista */}
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas ({filteredSubscriptions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Usuário</th>
                      <th className="text-left py-3 px-4">Plano</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Valor</th>
                      <th className="text-left py-3 px-4">Próximo Pagamento</th>
                      <th className="text-left py-3 px-4">Criada</th>
                      <th className="text-left py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{subscription.userName}</p>
                            <p className="text-sm text-gray-500">{subscription.userEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getPlanIcon(subscription.planType)}
                            <span className="ml-2 capitalize">
                              {subscription.planType}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(subscription.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">R$ {subscription.finalAmount.toFixed(2)}</p>
                            {subscription.discountPercentage > 0 && (
                              <p className="text-sm text-green-600">
                                -{subscription.discountPercentage}% desconto
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(subscription.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  Ver
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Assinatura</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="font-medium">{subscription.userName}</p>
                                    <p className="text-sm text-gray-500">{subscription.userEmail}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-600">Plano</p>
                                      <p className="font-medium capitalize">{subscription.planType}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Período</p>
                                      <p className="font-medium">{subscription.billingPeriod}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Valor</p>
                                      <p className="font-medium">R$ {subscription.finalAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Método</p>
                                      <p className="font-medium">
                                        {subscription.paymentMethod === 'credit_card' ? 'Cartão' : 'PIX'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    {subscription.status === 'active' && (
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => cancelSubscription(subscription.id)}
                                      >
                                        Cancelar
                                      </Button>
                                    )}
                                    {subscription.status === 'cancelled' && (
                                      <Button
                                        size="sm"
                                        onClick={() => reactivateSubscription(subscription.id)}
                                      >
                                        Reativar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}