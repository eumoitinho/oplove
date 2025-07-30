"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  MessageSquare,
  Heart,
  Building2,
  Shield,
  Activity,
  Clock,
  CreditCard,
  Flag,
  UserPlus,
  Zap
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { toast } from "sonner"

interface DashboardMetrics {
  realTimeMetrics: {
    activeUsers: number
    dailyActiveUsers: number
    monthlyActiveUsers: number
    newRegistrations: number
    activeSubscriptions: number
  }
  financial: {
    monthlyRevenue: number
    dailyRevenue: number
    pendingPayments: number
    chargebacks: number
    creditsSold: number
  }
  moderation: {
    pendingReports: number
    pendingVerifications: number
    bannedToday: number
    contentRemoved: number
  }
  growth: {
    userGrowthRate: number
    revenueGrowthRate: number
    engagementRate: number
    retentionRate: number
  }
  content: {
    postsToday: number
    messagesCount: number
    storiesCount: number
    likesCount: number
  }
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    loadDashboardMetrics()
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadDashboardMetrics, 30000)
    return () => clearInterval(interval)
  }, [timeRange])

  const loadDashboardMetrics = async () => {
    try {
      const response = await fetch(`/api/v1/admin/dashboard/metrics?period=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar métricas')
      }
      
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error loading dashboard metrics:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Mock data para os gráficos (substituir por dados reais)
  const revenueData = [
    { name: 'Jan', value: 12000 },
    { name: 'Fev', value: 19000 },
    { name: 'Mar', value: 15000 },
    { name: 'Abr', value: 22000 },
    { name: 'Mai', value: 28000 },
    { name: 'Jun', value: 31000 },
    { name: 'Jul', value: 35000 }
  ]

  const userGrowthData = [
    { name: 'Seg', users: 120 },
    { name: 'Ter', users: 180 },
    { name: 'Qua', users: 150 },
    { name: 'Qui', users: 220 },
    { name: 'Sex', users: 280 },
    { name: 'Sab', users: 320 },
    { name: 'Dom', users: 250 }
  ]

  const planDistribution = [
    { name: 'Free', value: 65, color: '#9CA3AF' },
    { name: 'Gold', value: 25, color: '#F59E0B' },
    { name: 'Diamond', value: 8, color: '#8B5CF6' },
    { name: 'Couple', value: 2, color: '#EC4899' }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Erro ao carregar dados
        </h3>
        <p className="text-gray-500 mb-4">
          Não foi possível carregar as métricas do dashboard
        </p>
        <Button onClick={loadDashboardMetrics}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-500 mt-1">
            Visão geral da plataforma OpenLove em tempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('24h')}
          >
            24h
          </Button>
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 dias
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 dias
          </Button>
        </div>
      </div>

      {/* Métricas em Tempo Real */}
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
                    Usuários Online
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics.realTimeMetrics.activeUsers.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm text-green-600">Ao vivo</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
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
                    Receita Hoje
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    R$ {metrics.financial.dailyRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    +{metrics.growth.revenueGrowthRate}% vs ontem
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
                    Novos Cadastros
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics.realTimeMetrics.newRegistrations}
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    +{metrics.growth.userGrowthRate}% vs ontem
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-purple-600" />
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
                    Denúncias Pendentes
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics.moderation.pendingReports}
                  </p>
                  {metrics.moderation.pendingReports > 10 ? (
                    <Badge variant="destructive" className="text-xs mt-2">
                      Atenção Requerida
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs mt-2">
                      Sob Controle
                    </Badge>
                  )}
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <Flag className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita ao Longo do Tempo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Receita Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    fill="url(#colorRevenue)"
                  />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Crescimento de Usuários */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Novos Usuários (7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#EC4899" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Assinaturas Ativas
              </h3>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {metrics.realTimeMetrics.activeSubscriptions.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Receita mensal recorrente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Posts Hoje
              </h3>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {metrics.content.postsToday.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Conteúdo criado nas últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Mensagens
              </h3>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {metrics.content.messagesCount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Mensagens trocadas hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Verificações
              </h3>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {metrics.moderation.pendingVerifications}
            </p>
            <p className="text-sm text-gray-500">
              Aguardando análise
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Planos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Distribuição de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          variant="outline"
          onClick={() => window.location.href = '/admin/users'}
        >
          <Users className="w-6 h-6" />
          <span>Gerenciar Usuários</span>
        </Button>

        <Button 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          variant="outline"
          onClick={() => window.location.href = '/admin/moderation'}
        >
          <Shield className="w-6 h-6" />
          <span>Fila de Moderação</span>
        </Button>

        <Button 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          variant="outline"
          onClick={() => window.location.href = '/admin/financial'}
        >
          <DollarSign className="w-6 h-6" />
          <span>Dashboard Financeiro</span>
        </Button>

        <Button 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          variant="outline"
          onClick={() => window.location.href = '/admin/businesses'}
        >
          <Building2 className="w-6 h-6" />
          <span>Empresas</span>
        </Button>
      </div>
    </div>
  )
}