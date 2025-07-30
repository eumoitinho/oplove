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
import { Textarea } from "@/components/ui/textarea"
import { 
  Shield, 
  Flag, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Ban,
  UserX,
  MessageSquare,
  Image as ImageIcon,
  Video,
  FileText,
  User,
  Calendar,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface ModerationMetrics {
  queue: {
    totalReports: number
    pendingReports: number
    reviewedToday: number
    averageResponseTime: number // em horas
  }
  categories: {
    spam: number
    harassment: number
    nudity: number
    violence: number
    hateSpeech: number
    copyright: number
    other: number
  }
  actions: {
    approved: number
    removed: number
    warned: number
    suspended: number
    banned: number
  }
  autoModeration: {
    enabled: boolean
    sensitivityLevel: 'low' | 'medium' | 'high'
    autoActions: number
    falsePositives: number
    accuracy: number
  }
}

interface Report {
  id: string
  reporterId: string
  reporterName: string
  targetType: 'post' | 'comment' | 'user' | 'message'
  targetId: string
  targetContent?: string
  targetUser?: {
    id: string
    name: string
    username: string
    avatar?: string
  }
  reason: string
  category: string
  description: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  reviewedBy?: string
  reviewedAt?: string
  resolution?: string
  createdAt: string
  mediaUrls?: string[]
  metadata?: {
    aiScore?: number
    userHistory?: any
    relatedReports?: number
  }
}

interface ModerationAction {
  id: string
  moderatorId: string
  moderatorName: string
  targetId: string
  targetType: string
  action: 'approve' | 'remove' | 'warn' | 'suspend' | 'ban' | 'dismiss'
  reason: string
  duration?: number // para suspensões
  createdAt: string
  reportIds: string[]
}

export default function ModerationDashboard() {
  const [metrics, setMetrics] = useState<ModerationMetrics | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [actions, setActions] = useState<ModerationAction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('queue')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('pending')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [assignedFilter, setAssignedFilter] = useState('all')

  useEffect(() => {
    loadModerationData()
    
    // Auto-refresh a cada 30 segundos para queue de moderação
    const interval = setInterval(loadModerationData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadModerationData = async () => {
    try {
      const [metricsResponse, reportsResponse, actionsResponse] = await Promise.all([
        fetch('/api/v1/admin/moderation/metrics'),
        fetch('/api/v1/admin/moderation/reports'),
        fetch('/api/v1/admin/moderation/actions')
      ])
      
      if (!metricsResponse.ok || !reportsResponse.ok || !actionsResponse.ok) {
        throw new Error('Erro ao carregar dados de moderação')
      }
      
      const metricsData = await metricsResponse.json()
      const reportsData = await reportsResponse.json()
      const actionsData = await actionsResponse.json()
      
      setMetrics(metricsData)
      setReports(reportsData.reports)
      setActions(actionsData.actions)
    } catch (error) {
      console.error('Error loading moderation data:', error)
      toast.error('Erro ao carregar dados de moderação')
      
      // Mock data para desenvolvimento
      setMetrics({
        queue: {
          totalReports: 287,
          pendingReports: 23,
          reviewedToday: 45,
          averageResponseTime: 2.5
        },
        categories: {
          spam: 45,
          harassment: 32,
          nudity: 18,
          violence: 12,
          hateSpeech: 8,
          copyright: 5,
          other: 15
        },
        actions: {
          approved: 156,
          removed: 89,
          warned: 34,
          suspended: 12,
          banned: 3
        },
        autoModeration: {
          enabled: true,
          sensitivityLevel: 'medium',
          autoActions: 124,
          falsePositives: 8,
          accuracy: 93.5
        }
      })
      
      setReports([
        {
          id: '1',
          reporterId: 'user-123',
          reporterName: 'João Silva',
          targetType: 'post',
          targetId: 'post-456',
          targetContent: 'Conteúdo do post que foi denunciado...',
          targetUser: {
            id: 'user-789',
            name: 'Maria Santos',
            username: '@maria',
            avatar: '/placeholder-avatar.jpg'
          },
          reason: 'spam',
          category: 'Spam/Fraude',
          description: 'Este post contém spam e links suspeitos.',
          status: 'pending',
          priority: 'medium',
          createdAt: '2024-01-15T10:30:00Z',
          mediaUrls: ['/placeholder-image.jpg'],
          metadata: {
            aiScore: 0.85,
            relatedReports: 2
          }
        },
        {
          id: '2',
          reporterId: 'user-456',
          reporterName: 'Carlos Lima',
          targetType: 'user',
          targetId: 'user-789',
          targetUser: {
            id: 'user-789',
            name: 'Ana Costa',
            username: '@ana',
            avatar: '/placeholder-avatar.jpg'
          },
          reason: 'harassment',
          category: 'Assédio',
          description: 'Usuário está enviando mensagens ofensivas.',
          status: 'pending',
          priority: 'high',
          createdAt: '2024-01-15T09:15:00Z',
          metadata: {
            aiScore: 0.92,
            relatedReports: 5
          }
        }
      ])
      
      setActions([
        {
          id: '1',
          moderatorId: 'mod-123',
          moderatorName: 'Admin João',
          targetId: 'post-123',
          targetType: 'post',
          action: 'remove',
          reason: 'Conteúdo violou diretrizes de nudez',
          createdAt: '2024-01-15T08:30:00Z',
          reportIds: ['report-1', 'report-2']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleReportAction = async (reportId: string, action: string, reason?: string, duration?: number) => {
    try {
      const response = await fetch(`/api/v1/admin/moderation/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason, duration })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao processar ação')
      }
      
      toast.success('Ação processada com sucesso!')
      loadModerationData()
      setSelectedReport(null)
    } catch (error) {
      console.error('Error processing moderation action:', error)
      toast.error('Erro ao processar ação')
    }
  }

  const assignReport = async (reportId: string, moderatorId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/moderation/reports/${reportId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderatorId })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atribuir denúncia')
      }
      
      toast.success('Denúncia atribuída com sucesso!')
      loadModerationData()
    } catch (error) {
      console.error('Error assigning report:', error)
      toast.error('Erro ao atribuir denúncia')
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgente</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Alta</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Baixa</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800">Revisado</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolvido</Badge>
      case 'dismissed':
        return <Badge className="bg-gray-100 text-gray-800">Descartado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="w-4 h-4" />
      case 'comment':
        return <MessageSquare className="w-4 h-4" />
      case 'user':
        return <User className="w-4 h-4" />
      case 'message':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Flag className="w-4 h-4" />
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || report.reason === categoryFilter
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter
    const matchesSearch = report.targetUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch
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
            Moderação de Conteúdo
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie denúncias e mantenha a plataforma segura
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button onClick={loadModerationData} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Métricas de Moderação */}
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
                    Denúncias Pendentes
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.queue.pendingReports}
                  </p>
                  {metrics && metrics.queue.pendingReports > 20 ? (
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
                    Revisadas Hoje
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.queue.reviewedToday}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Tempo médio: {metrics?.queue.averageResponseTime}h
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
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
                    Auto Moderação
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.autoModeration.accuracy}%
                  </p>
                  <div className="flex items-center mt-2">
                    <div className={`w-2 h-2 rounded-full mr-2 ${metrics?.autoModeration.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-500">
                      {metrics?.autoModeration.enabled ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
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
                    Conteúdo Removido
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.actions.removed}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Este mês
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <EyeOff className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue">Fila de Moderação</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="actions">Ações Recentes</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Fila de Moderação */}
        <TabsContent value="queue" className="space-y-6">
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
                      placeholder="Usuário ou descrição..."
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
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="reviewed">Revisado</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="dismissed">Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="harassment">Assédio</SelectItem>
                      <SelectItem value="nudity">Nudez</SelectItem>
                      <SelectItem value="violence">Violência</SelectItem>
                      <SelectItem value="hateSpeech">Discurso de Ódio</SelectItem>
                      <SelectItem value="copyright">Direitos Autorais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
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

          {/* Lista de Denúncias */}
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4 flex-1">
                      {/* Avatar do usuário denunciado */}
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {report.targetUser?.avatar ? (
                          <img
                            src={report.targetUser.avatar}
                            alt={report.targetUser.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTargetIcon(report.targetType)}
                          <span className="font-medium">{report.category}</span>
                          {getPriorityBadge(report.priority)}
                          {getStatusBadge(report.status)}
                          {report.metadata?.aiScore && (
                            <Badge variant="outline" className="text-xs">
                              IA: {(report.metadata.aiScore * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Denunciado: <strong>{report.targetUser?.name}</strong> (@{report.targetUser?.username})
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Por: {report.reporterName}
                            </p>
                          </div>
                          
                          <p className="text-sm">{report.description}</p>
                          
                          {report.targetContent && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conteúdo:</p>
                              <p className="text-sm">{report.targetContent}</p>
                            </div>
                          )}
                          
                          {report.mediaUrls && report.mediaUrls.length > 0 && (
                            <div className="flex space-x-2">
                              {report.mediaUrls.map((url, index) => (
                                <div key={index} className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            {report.metadata?.relatedReports && (
                              <span>
                                {report.metadata.relatedReports} denúncias relacionadas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ações */}
                    <div className="flex items-center space-x-2">
                      {report.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleReportAction(report.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReportAction(report.id, 'remove', 'Conteúdo violou diretrizes')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Remover
                          </Button>
                        </>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Denúncia</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Tipo</p>
                                <p className="font-medium">{report.targetType}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Categoria</p>
                                <p className="font-medium">{report.category}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Prioridade</p>
                                {getPriorityBadge(report.priority)}
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                {getStatusBadge(report.status)}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Descrição da Denúncia</p>
                              <p className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{report.description}</p>
                            </div>
                            
                            {report.status === 'pending' && (
                              <div className="space-y-3">
                                <Label>Ação de Moderação</Label>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleReportAction(report.id, 'approve')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Aprovar Conteúdo
                                  </Button>
                                  
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleReportAction(report.id, 'remove')}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Remover Conteúdo
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    onClick={() => handleReportAction(report.id, 'warn')}
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                    Advertir Usuário
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    onClick={() => handleReportAction(report.id, 'suspend', 'Suspensão por violação de diretrizes', 7)}
                                  >
                                    <Ban className="w-4 h-4 mr-1" />
                                    Suspender (7 dias)
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Por Categoria */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics && Object.entries(metrics.categories).map(([category, count]) => (
              <Card key={category}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                        {category === 'hateSpeech' ? 'Discurso de Ódio' : category}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {count}
                      </p>
                      <p className="text-sm text-gray-500">
                        denúncias este mês
                      </p>
                    </div>
                    <Flag className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Ações Recentes */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações de Moderação Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        {action.action === 'approve' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {action.action === 'remove' && <XCircle className="w-5 h-5 text-red-600" />}
                        {action.action === 'warn' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                        {action.action === 'suspend' && <Ban className="w-5 h-5 text-orange-600" />}
                        {action.action === 'ban' && <UserX className="w-5 h-5 text-red-600" />}
                      </div>
                      
                      <div>
                        <p className="font-medium">{action.moderatorName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {action.action === 'approve' && 'Aprovou conteúdo'}
                          {action.action === 'remove' && 'Removeu conteúdo'}
                          {action.action === 'warn' && 'Advertiu usuário'}
                          {action.action === 'suspend' && `Suspendeu usuário${action.duration ? ` por ${action.duration} dias` : ''}`}
                          {action.action === 'ban' && 'Baniu usuário'}
                        </p>
                        <p className="text-xs text-gray-500">{action.reason}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(action.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {action.reportIds.length} denúncia(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Auto Moderação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Moderação</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ativar moderação automática por IA
                  </p>
                </div>
                <Button
                  variant={metrics?.autoModeration.enabled ? "default" : "outline"}
                  onClick={() => {
                    // Toggle auto moderation
                  }}
                >
                  {metrics?.autoModeration.enabled ? 'Ativa' : 'Inativa'}
                </Button>
              </div>
              
              <div>
                <Label>Nível de Sensibilidade</Label>
                <Select 
                  value={metrics?.autoModeration.sensitivityLevel} 
                  onValueChange={(value) => {
                    // Update sensitivity level
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Alto = mais falsos positivos, Baixo = mais falsos negativos
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {metrics?.autoModeration.accuracy}%
                  </p>
                  <p className="text-sm text-gray-600">Precisão</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics?.autoModeration.autoActions}
                  </p>
                  <p className="text-sm text-gray-600">Ações Automáticas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics?.autoModeration.falsePositives}
                  </p>
                  <p className="text-sm text-gray-600">Falsos Positivos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}