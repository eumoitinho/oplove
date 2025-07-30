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
    postsPerMinute: number
    messagesPerMinute: number
    newRegistrations: number
  }
  dailyMetrics: {
    totalUsers: number
    totalRevenue: number
    totalPosts: number
    totalMessages: number
    newUsers: number
    activeSubscriptions: number
    pendingReports: number
    pendingVerifications: number
  }
  userGrowth: Array<{ date: string; users: number }>
  revenueData: Array<{ date: string; revenue: number }>
  planDistribution: Array<{ name: string; value: number; color: string }>
  topContent: Array<{ id: string; title: string; views: number; revenue: number }>
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  useEffect(() => {
    loadDashboardData()
    
    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData(true)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setRefreshing(true)
      
      const response = await fetch('/api/v1/admin/dashboard')
      
      if (!response.ok) {
        throw new Error('Failed to load dashboard data')
      }
      
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
        <Button onClick={() => loadDashboardData()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Métricas em Tempo Real</h3>
          <div className="flex items-center space-x-2">
            {refreshing && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Atualização automática
            </Badge>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Ativos
                </CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(metrics.realTimeMetrics.activeUsers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Online agora
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Posts/min
                </CardTitle>
                <Zap className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.realTimeMetrics.postsPerMinute}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 5 minutos
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mensagens/min
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.realTimeMetrics.messagesPerMinute}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 5 minutos
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Novos Cadastros
                </CardTitle>
                <UserPlus className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.realTimeMetrics.newRegistrations}
                </div>
                <p className="text-xs text-muted-foreground">
                  Última hora
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Daily Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.dailyMetrics.totalUsers)}
            </div>
            <p className="text-xs text-green-600">
              +{formatNumber(metrics.dailyMetrics.newUsers)} hoje
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.dailyMetrics.totalRevenue)}
            </div>
            <p className="text-xs text-green-600">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assinaturas Ativas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.dailyMetrics.activeSubscriptions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Planos pagos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendências
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm font-medium">{metrics.dailyMetrics.pendingReports}</p>
                <p className="text-xs text-muted-foreground">Denúncias</p>
              </div>
              <div>
                <p className="text-sm font-medium">{metrics.dailyMetrics.pendingVerifications}</p>
                <p className="text-xs text-muted-foreground">Verificações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Content */}
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo em Destaque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topContent.map((content, index) => (
              <div key={content.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <p className="text-sm font-medium">{content.title}</p>
                    <p className="text-xs text-muted-foreground">
                      <Eye className="inline w-3 h-3 mr-1" />
                      {formatNumber(content.views)} visualizações
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-green-600">
                  {formatCurrency(content.revenue)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <Flag className="mr-2 h-4 w-4" />
              Ver Denúncias
            </Button>
            <Button variant="outline" className="justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Verificações Pendentes
            </Button>
            <Button variant="outline" className="justify-start">
              <Building2 className="mr-2 h-4 w-4" />
              Aprovar Empresas
            </Button>
            <Button variant="outline" className="justify-start">
              <Heart className="mr-2 h-4 w-4" />
              Moderar Conteúdo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}