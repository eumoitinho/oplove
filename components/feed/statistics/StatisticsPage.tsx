"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Eye, 
  Calendar,
  Crown,
  Gem,
  Shield,
  Target,
  Zap,
  Star,
  Activity,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  UserCheck,
  Camera,
  Play,
  Image as ImageIcon,
  Download,
  Refresh,
  Filter,
  Lock,
  ChevronUp,
  ChevronDown,
  Info
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { toast } from "sonner"

interface StatisticsData {
  overview: {
    totalViews: number
    totalLikes: number
    totalComments: number
    totalShares: number
    totalFollowers: number
    totalFollowing: number
    engagementRate: number
    reachGrowth: number
  }
  posts: {
    totalPosts: number
    averageLikes: number
    averageComments: number
    topPost: {
      id: string
      content: string
      likes: number
      comments: number
      views: number
    }
    postTypes: {
      text: number
      image: number
      video: number
      audio: number
    }
  }
  audience: {
    demographics: {
      ageGroups: { range: string; percentage: number }[]
      locations: { city: string; state: string; percentage: number }[]
      devices: { type: string; percentage: number }[]
    }
    activity: {
      hourly: { hour: number; activity: number }[]
      daily: { day: string; activity: number }[]
      monthly: { month: string; activity: number }[]
    }
  }
  monetization?: {
    totalEarnings: number
    totalSales: number
    averageOrderValue: number
    conversionRate: number
    topSellingContent: {
      id: string
      title: string
      sales: number
      revenue: number
    }[]
  }
}

export function StatisticsPage() {
  const { user } = useAuth()
  const features = usePremiumFeatures()
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")

  // Check if user has access to statistics
  const hasBasicStats = user?.premium_type && ['gold', 'diamond', 'couple'].includes(user.premium_type)
  const hasAdvancedStats = user?.premium_type && ['diamond', 'couple'].includes(user.premium_type)
  const hasMonetizationStats = user?.premium_type && ['diamond', 'couple'].includes(user.premium_type)

  useEffect(() => {
    if (hasBasicStats) {
      loadStatistics()
    }
  }, [selectedPeriod, hasBasicStats])

  const loadStatistics = async () => {
    setLoading(true)
    try {
      // Mock data - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: StatisticsData = {
        overview: {
          totalViews: 12500,
          totalLikes: 3200,
          totalComments: 890,
          totalShares: 245,
          totalFollowers: 1234,
          totalFollowing: 567,
          engagementRate: 7.2,
          reachGrowth: 15.3
        },
        posts: {
          totalPosts: 42,
          averageLikes: 76,
          averageComments: 21,
          topPost: {
            id: "1",
            content: "Meu post mais engajado sobre tecnologia...",
            likes: 234,
            comments: 67,
            views: 1500
          },
          postTypes: {
            text: 18,
            image: 20,
            video: 3,
            audio: 1
          }
        },
        audience: {
          demographics: {
            ageGroups: [
              { range: "18-24", percentage: 25 },
              { range: "25-34", percentage: 45 },
              { range: "35-44", percentage: 20 },
              { range: "45+", percentage: 10 }
            ],
            locations: [
              { city: "São Paulo", state: "SP", percentage: 35 },
              { city: "Rio de Janeiro", state: "RJ", percentage: 20 },
              { city: "Belo Horizonte", state: "MG", percentage: 15 },
              { city: "Porto Alegre", state: "RS", percentage: 12 },
              { city: "Curitiba", state: "PR", percentage: 18 }
            ],
            devices: [
              { type: "Mobile", percentage: 75 },
              { type: "Desktop", percentage: 20 },
              { type: "Tablet", percentage: 5 }
            ]
          },
          activity: {
            hourly: Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              activity: Math.floor(Math.random() * 100)
            })),
            daily: [
              { day: "Segunda", activity: 85 },
              { day: "Terça", activity: 78 },
              { day: "Quarta", activity: 92 },
              { day: "Quinta", activity: 88 },
              { day: "Sexta", activity: 95 },
              { day: "Sábado", activity: 70 },
              { day: "Domingo", activity: 65 }
            ],
            monthly: Array.from({ length: 12 }, (_, i) => ({
              month: new Date(2024, i).toLocaleDateString('pt-BR', { month: 'short' }),
              activity: Math.floor(Math.random() * 100) + 50
            }))
          }
        }
      }

      if (hasMonetizationStats) {
        mockData.monetization = {
          totalEarnings: 2450.00,
          totalSales: 85,
          averageOrderValue: 28.82,
          conversionRate: 3.2,
          topSellingContent: [
            { id: "1", title: "Foto exclusiva #1", sales: 25, revenue: 750.00 },
            { id: "2", title: "Vídeo premium", sales: 18, revenue: 540.00 },
            { id: "3", title: "Pack de fotos", sales: 15, revenue: 450.00 }
          ]
        }
      }

      setStatistics(mockData)
    } catch (error) {
      console.error("Error loading statistics:", error)
      toast.error("Erro ao carregar estatísticas")
    } finally {
      setLoading(false)
    }
  }

  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case "gold":
        return <Badge className="bg-yellow-500 text-white"><Crown className="w-3 h-3 mr-1" />Gold</Badge>
      case "diamond":
        return <Badge className="bg-purple-500 text-white"><Gem className="w-3 h-3 mr-1" />Diamond</Badge>
      case "couple":
        return <Badge className="bg-pink-500 text-white"><Heart className="w-3 h-3 mr-1" />Couple</Badge>
      default:
        return <Badge variant="outline">Gratuito</Badge>
    }
  }

  const exportStatistics = async () => {
    try {
      const data = {
        user: user?.username,
        period: selectedPeriod,
        statistics: statistics,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `openlove-stats-${user?.username}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success("Estatísticas exportadas com sucesso!")
    } catch (error) {
      toast.error("Erro ao exportar estatísticas")
    }
  }

  // If user doesn't have access to statistics
  if (!hasBasicStats) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Estatísticas</h1>
              <p className="text-gray-500 dark:text-white/60">
                Analise o desempenho do seu perfil
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getPlanBadge(user?.premium_type || 'free')}
              {user?.is_verified && (
                <Badge className="bg-blue-500 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* Upgrade Required */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800 rounded-3xl p-8 text-center"
        >
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Estatísticas Premium</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Desbloqueie insights detalhados sobre seu perfil e audiência com um plano premium.
            </p>
            
            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span><strong>Gold:</strong> Estatísticas básicas de engajamento</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Gem className="w-4 h-4 text-purple-500" />
                <span><strong>Diamond:</strong> Analytics avançados + monetização</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-pink-500" />
                <span><strong>Couple:</strong> Estatísticas compartilhadas do casal</span>
              </div>
            </div>

            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!statistics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Estatísticas</h1>
            <p className="text-gray-500 dark:text-white/60">
              Analise o desempenho do seu perfil nos últimos {selectedPeriod === '7d' ? '7 dias' : selectedPeriod === '30d' ? '30 dias' : '90 dias'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>
            
            {hasAdvancedStats && (
              <Button
                onClick={exportStatistics}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
            
            <Button
              onClick={loadStatistics}
              variant="outline"
              size="sm"
            >
              <Refresh className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              {getPlanBadge(user?.premium_type || 'free')}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Visualizações</p>
                  <p className="text-2xl font-bold">{statistics.overview.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+{statistics.overview.reachGrowth}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Curtidas</p>
                  <p className="text-2xl font-bold">{statistics.overview.totalLikes.toLocaleString()}</p>
                </div>
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-gray-500">Taxa: {statistics.overview.engagementRate}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comentários</p>
                  <p className="text-2xl font-bold">{statistics.overview.totalComments.toLocaleString()}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-gray-500">Média: {statistics.posts.averageComments}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Seguidores</p>
                  <p className="text-2xl font-bold">{statistics.overview.totalFollowers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-cyan-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-gray-500">Seguindo: {statistics.overview.totalFollowing}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monetization Stats (Diamond/Couple only) */}
      {hasMonetizationStats && statistics.monetization && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Monetização</h2>
            <Badge className="bg-emerald-500 text-white">
              <Gem className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">R$ {statistics.monetization.totalEarnings.toFixed(2)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receita Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{statistics.monetization.totalSales}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vendas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">R$ {statistics.monetization.averageOrderValue.toFixed(2)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor Médio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{statistics.monetization.conversionRate}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conversão</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Tipos de Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    <span>Imagens</span>
                  </div>
                  <span className="font-medium">{statistics.posts.postTypes.image}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span>Texto</span>
                  </div>
                  <span className="font-medium">{statistics.posts.postTypes.text}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-red-500" />
                    <span>Vídeos</span>
                  </div>
                  <span className="font-medium">{statistics.posts.postTypes.video}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Áudio</span>
                  </div>
                  <span className="font-medium">{statistics.posts.postTypes.audio}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Top Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  {statistics.posts.topPost.content}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-bold text-pink-600">{statistics.posts.topPost.likes}</p>
                    <p className="text-xs text-gray-500">Curtidas</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-600">{statistics.posts.topPost.comments}</p>
                    <p className="text-xs text-gray-500">Comentários</p>
                  </div>
                  <div>
                    <p className="font-bold text-purple-600">{statistics.posts.topPost.views}</p>
                    <p className="text-xs text-gray-500">Visualizações</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Advanced Analytics (Diamond/Couple only) */}
      {hasAdvancedStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-6"
        >
          {/* Demographics */}
          <Card className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Demografia da Audiência
                <Badge className="bg-purple-500 text-white">
                  <Gem className="w-3 h-3 mr-1" />
                  Avançado
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Faixa Etária</h4>
                  <div className="space-y-2">
                    {statistics.audience.demographics.ageGroups.map((group) => (
                      <div key={group.range} className="flex items-center justify-between">
                        <span className="text-sm">{group.range}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${group.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{group.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Localização</h4>
                  <div className="space-y-2">
                    {statistics.audience.demographics.locations.slice(0, 4).map((location) => (
                      <div key={`${location.city}-${location.state}`} className="flex items-center justify-between">
                        <span className="text-sm">{location.city}, {location.state}</span>
                        <span className="text-xs text-gray-500">{location.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Dispositivos</h4>
                  <div className="space-y-2">
                    {statistics.audience.demographics.devices.map((device) => (
                      <div key={device.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {device.type === 'Mobile' && <Smartphone className="w-4 h-4" />}
                          {device.type === 'Desktop' && <Monitor className="w-4 h-4" />}
                          {device.type === 'Tablet' && <Globe className="w-4 h-4" />}
                          <span className="text-sm">{device.type}</span>
                        </div>
                        <span className="text-xs text-gray-500">{device.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Patterns */}
          <Card className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Padrões de Atividade
                <Badge className="bg-purple-500 text-white">
                  <Gem className="w-3 h-3 mr-1" />
                  Avançado
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Atividade por Dia da Semana</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {statistics.audience.activity.daily.map((day) => (
                      <div key={day.day} className="text-center">
                        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-end p-1">
                          <div 
                            className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded"
                            style={{ height: `${day.activity}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">{day.day.slice(0, 3)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Horários Mais Ativos</h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>Melhor horário para postar: 18h - 21h</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    {Array.from({ length: 24 }, (_, i) => {
                      const activity = statistics.audience.activity.hourly.find(h => h.hour === i)?.activity || 0
                      return (
                        <div key={i} className="text-center">
                          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-end">
                            <div 
                              className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded"
                              style={{ height: `${activity}%` }}
                            />
                          </div>
                          {i % 4 === 0 && (
                            <span className="text-xs text-gray-500 mt-1 block">{i}h</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upgrade Prompt for Gold Users */}
      {user?.premium_type === 'gold' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800 rounded-3xl p-6 text-center"
        >
          <div className="max-w-md mx-auto">
            <Gem className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Desbloqueie Analytics Avançados</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upgrade para Diamond e tenha acesso a demografia da audiência, padrões de atividade e estatísticas de monetização.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
              <Gem className="w-4 h-4 mr-2" />
              Upgrade para Diamond
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}