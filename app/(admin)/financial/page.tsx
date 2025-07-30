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
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Banknote,
  RefreshCw,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { toast } from "sonner"

interface FinancialMetrics {
  summary: {
    period: string
    grossRevenue: number
    netRevenue: number
    taxes: number
    fees: {
      stripe: number
      abacatepay: number
      total: number
    }
  }
  revenueBreakdown: {
    subscriptions: {
      gold: { count: number, revenue: number }
      diamond: { count: number, revenue: number }
      couple: { count: number, revenue: number }
    }
    credits: {
      totalSold: number
      revenue: number
    }
    marketplace: {
      contentSales: number
      commission: number
      revenue: number
    }
  }
  metrics: {
    arpu: number // Average Revenue Per User
    ltv: number // Lifetime Value
    cac: number // Customer Acquisition Cost
    mrr: number // Monthly Recurring Revenue
    arr: number // Annual Recurring Revenue
    churn: number // Taxa de cancelamento
  }
  chartData: {
    revenue: Array<{ date: string, amount: number }>
    subscriptions: Array<{ date: string, gold: number, diamond: number, couple: number }>
    paymentMethods: Array<{ method: string, value: number, color: string }>
  }
}

interface Transaction {
  id: string
  userId: string
  userName: string
  type: 'subscription' | 'content' | 'credits'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: 'credit_card' | 'pix'
  provider: 'stripe' | 'abacatepay'
  createdAt: string
  description: string
}

export default function FinancialDashboard() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    loadFinancialData()
  }, [period])

  const loadFinancialData = async () => {
    setLoading(true)
    try {
      const [metricsResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/v1/admin/financial/metrics?period=${period}`),
        fetch(`/api/v1/admin/financial/transactions?limit=100`)
      ])
      
      if (!metricsResponse.ok || !transactionsResponse.ok) {
        throw new Error('Erro ao carregar dados financeiros')
      }
      
      const metricsData = await metricsResponse.json()
      const transactionsData = await transactionsResponse.json()
      
      setMetrics(metricsData)
      setTransactions(transactionsData.transactions)
    } catch (error) {
      console.error('Error loading financial data:', error)
      toast.error('Erro ao carregar dados financeiros')
      
      // Mock data para desenvolvimento
      setMetrics({
        summary: {
          period: '30d',
          grossRevenue: 125000,
          netRevenue: 118500,
          taxes: 3500,
          fees: {
            stripe: 2800,
            abacatepay: 200,
            total: 3000
          }
        },
        revenueBreakdown: {
          subscriptions: {
            gold: { count: 850, revenue: 21250 },
            diamond: { count: 320, revenue: 14400 },
            couple: { count: 95, revenue: 6640 }
          },
          credits: {
            totalSold: 45000,
            revenue: 18500
          },
          marketplace: {
            contentSales: 1250,
            commission: 64210,
            revenue: 64210
          }
        },
        metrics: {
          arpu: 47.50,
          ltv: 285.00,
          cac: 32.50,
          mrr: 42290,
          arr: 507480,
          churn: 8.5
        },
        chartData: {
          revenue: [
            { date: '2024-01-01', amount: 15000 },
            { date: '2024-01-02', amount: 18000 },
            { date: '2024-01-03', amount: 22000 },
            { date: '2024-01-04', amount: 19000 },
            { date: '2024-01-05', amount: 25000 },
            { date: '2024-01-06', amount: 28000 },
            { date: '2024-01-07', amount: 32000 }
          ],
          subscriptions: [
            { date: '2024-01', gold: 800, diamond: 300, couple: 90 },
            { date: '2024-02', gold: 820, diamond: 310, couple: 92 },
            { date: '2024-03', gold: 850, diamond: 320, couple: 95 }
          ],
          paymentMethods: [
            { method: 'Cartão de Crédito', value: 75, color: '#8B5CF6' },
            { method: 'PIX', value: 25, color: '#10B981' }
          ]
        }
      })
      
      setTransactions([
        {
          id: '1',
          userId: 'user-123',
          userName: 'João Silva',
          type: 'subscription',
          amount: 45.00,
          status: 'completed',
          paymentMethod: 'credit_card',
          provider: 'stripe',
          createdAt: '2024-01-15T10:30:00Z',
          description: 'Assinatura Diamond - Mensal'
        },
        {
          id: '2',
          userId: 'user-456',
          userName: 'Maria Santos',
          type: 'content',
          amount: 25.50,
          status: 'completed',
          paymentMethod: 'pix',
          provider: 'abacatepay',
          createdAt: '2024-01-15T09:15:00Z',
          description: 'Compra de conteúdo premium'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const exportFinancialReport = async () => {
    try {
      const response = await fetch(`/api/v1/admin/financial/export?period=${period}&format=excel`)
      
      if (!response.ok) {
        throw new Error('Erro ao gerar relatório')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-financeiro-${period}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Relatório exportado com sucesso!')
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Erro ao exportar relatório')
    }
  }

  const processRefund = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/financial/transactions/${transactionId}/refund`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Erro ao processar reembolso')
      }
      
      toast.success('Reembolso processado com sucesso!')
      loadFinancialData()
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error('Erro ao processar reembolso')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhou</Badge>
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Reembolsado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
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
            Dashboard Financeiro
          </h1>
          <p className="text-gray-500 mt-1">
            Análise completa das finanças da plataforma
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportFinancialReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          
          <Button onClick={loadFinancialData} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Resumo Financeiro */}
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
                    Receita Bruta
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    R$ {metrics?.summary.grossRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12.5%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
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
                    Receita Líquida
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    R$ {metrics?.summary.netRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Após taxas e impostos
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
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
                    MRR
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    R$ {metrics?.metrics.mrr.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Receita Recorrente Mensal
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
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
                    Taxa de Churn
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.metrics.churn}%
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">-2.1%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
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
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Receita */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução da Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics?.chartData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
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

            {/* Métodos de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={metrics?.chartData.paymentMethods}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ method, value }) => `${method}: ${value}%`}
                    >
                      {metrics?.chartData.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown de Receita */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Assinaturas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gold ({metrics?.revenueBreakdown.subscriptions.gold.count})</span>
                    <span className="font-medium">R$ {metrics?.revenueBreakdown.subscriptions.gold.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Diamond ({metrics?.revenueBreakdown.subscriptions.diamond.count})</span>
                    <span className="font-medium">R$ {metrics?.revenueBreakdown.subscriptions.diamond.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Couple ({metrics?.revenueBreakdown.subscriptions.couple.count})</span>
                    <span className="font-medium">R$ {metrics?.revenueBreakdown.subscriptions.couple.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Banknote className="w-5 h-5 mr-2" />
                  Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vendas de Conteúdo</span>
                    <span className="font-medium">{metrics?.revenueBreakdown.marketplace.contentSales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Comissão Total</span>
                    <span className="font-medium">R$ {metrics?.revenueBreakdown.marketplace.commission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Receita Líquida</span>
                    <span className="font-medium">R$ {metrics?.revenueBreakdown.marketplace.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Créditos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Créditos Vendidos</span>
                    <span className="font-medium">{metrics?.revenueBreakdown.credits.totalSold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Receita Total</span>
                    <span className="font-medium">R$ {metrics?.revenueBreakdown.credits.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ticket Médio</span>
                    <span className="font-medium">R$ {(metrics?.revenueBreakdown.credits.revenue / metrics?.revenueBreakdown.credits.totalSold * 1000).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transações */}
        <TabsContent value="transactions" className="space-y-6">
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
                      placeholder="Nome ou descrição..."
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
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                      <SelectItem value="refunded">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="subscription">Assinatura</SelectItem>
                      <SelectItem value="content">Conteúdo</SelectItem>
                      <SelectItem value="credits">Créditos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date-from">Data Inicial</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="date-to">Data Final</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Transações */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Usuário</th>
                      <th className="text-left py-3 px-4">Tipo</th>
                      <th className="text-left py-3 px-4">Valor</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Método</th>
                      <th className="text-left py-3 px-4">Data</th>
                      <th className="text-left py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{transaction.userName}</p>
                            <p className="text-sm text-gray-500">{transaction.description}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {transaction.type === 'subscription' && 'Assinatura'}
                            {transaction.type === 'content' && 'Conteúdo'}
                            {transaction.type === 'credits' && 'Créditos'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          R$ {transaction.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {transaction.paymentMethod === 'credit_card' ? (
                              <CreditCard className="w-4 h-4 mr-2" />
                            ) : (
                              <Banknote className="w-4 h-4 mr-2" />
                            )}
                            {transaction.paymentMethod === 'credit_card' ? 'Cartão' : 'PIX'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          {transaction.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => processRefund(transaction.id)}
                            >
                              Reembolsar
                            </Button>
                          )}
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