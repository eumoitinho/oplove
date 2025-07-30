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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  UserPlus, 
  UserX, 
  UserCheck,
  Crown,
  Star,
  Gem,
  Heart,
  Shield,
  Ban,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { toast } from "sonner"

interface UserMetrics {
  overview: {
    totalUsers: number
    activeUsers: number
    premiumUsers: number
    verifiedUsers: number
    newUsersToday: number
    newUsersWeek: number
    growthRate: number
    churnRate: number
  }
  planDistribution: {
    free: number
    gold: number
    diamond: number
    couple: number
  }
  demographics: {
    ageGroups: Array<{ range: string, count: number, percentage: number }>
    genders: Array<{ gender: string, count: number, percentage: number }>
    locations: Array<{ state: string, count: number }>
  }
  engagement: {
    dailyActive: number
    weeklyActive: number
    monthlyActive: number
    averageSessionTime: number
    postsPerUser: number
    messagesPerUser: number
  }
}

interface User {
  id: string
  authId: string
  username: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  bio?: string
  birthDate?: string
  gender?: string
  profileType: 'single' | 'couple' | 'trans' | 'other'
  location?: string
  city?: string
  uf?: string
  state?: string
  country: string
  avatarUrl?: string
  coverUrl?: string
  isPremium: boolean
  premiumType: 'free' | 'gold' | 'diamond' | 'couple'
  premiumStatus: 'active' | 'inactive' | 'cancelled' | 'pending' | 'trial'
  premiumExpiresAt?: string
  isVerified: boolean
  verifiedAt?: string
  isActive: boolean
  status: 'active' | 'suspended' | 'banned' | 'deactivated' | 'pending_verification'
  role: 'user' | 'moderator' | 'admin'
  coupleId?: string
  isInCouple: boolean
  stats: {
    posts: number
    friends: number
    followers: number
    following: number
    profileViews: number
    likesReceived: number
  }
  lastActiveAt: string
  createdAt: string
  updatedAt: string
}

export default function UserManagement() {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)

  useEffect(() => {
    loadUserData()
  }, [currentPage])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const [metricsResponse, usersResponse] = await Promise.all([
        fetch('/api/v1/admin/users/metrics'),
        fetch(`/api/v1/admin/users?page=${currentPage}&limit=${itemsPerPage}`)
      ])
      
      if (!metricsResponse.ok || !usersResponse.ok) {
        throw new Error('Erro ao carregar dados de usuários')
      }
      
      const metricsData = await metricsResponse.json()
      const usersData = await usersResponse.json()
      
      setMetrics(metricsData)
      setUsers(usersData.users)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Erro ao carregar dados de usuários')
      
      // Mock data para desenvolvimento
      setMetrics({
        overview: {
          totalUsers: 15420,
          activeUsers: 12380,
          premiumUsers: 3210,
          verifiedUsers: 2890,
          newUsersToday: 45,
          newUsersWeek: 312,
          growthRate: 15.2,
          churnRate: 8.5
        },
        planDistribution: {
          free: 12210,
          gold: 1850,
          diamond: 1120,
          couple: 240
        },
        demographics: {
          ageGroups: [
            { range: '18-24', count: 3850, percentage: 25 },
            { range: '25-34', count: 6940, percentage: 45 },
            { range: '35-44', count: 3080, percentage: 20 },
            { range: '45+', count: 1550, percentage: 10 }
          ],
          genders: [
            { gender: 'male', count: 7710, percentage: 50 },
            { gender: 'female', count: 6940, percentage: 45 },
            { gender: 'other', count: 770, percentage: 5 }
          ],
          locations: [
            { state: 'SP', count: 5400 },
            { state: 'RJ', count: 3080 },
            { state: 'MG', count: 2310 },
            { state: 'PR', count: 1850 },
            { state: 'RS', count: 1540 }
          ]
        },
        engagement: {
          dailyActive: 8250,
          weeklyActive: 11340,
          monthlyActive: 14120,
          averageSessionTime: 25, // minutos
          postsPerUser: 12.5,
          messagesPerUser: 145.8
        }
      })
      
      setUsers([
        {
          id: '1',
          authId: 'auth-123',
          username: 'joao_silva',
          email: 'joao@email.com',
          name: 'João Silva',
          firstName: 'João',
          lastName: 'Silva',
          bio: 'Desenvolvedor apaixonado por tecnologia',
          birthDate: '1990-05-15',
          gender: 'male',
          profileType: 'single',
          location: 'São Paulo, SP',
          city: 'São Paulo',
          uf: 'SP',
          state: 'São Paulo',
          country: 'Brasil',
          avatarUrl: '/placeholder-avatar.jpg',
          isPremium: true,
          premiumType: 'diamond',
          premiumStatus: 'active',
          premiumExpiresAt: '2024-02-15T00:00:00Z',
          isVerified: true,
          verifiedAt: '2024-01-10T10:30:00Z',
          isActive: true,
          status: 'active',
          role: 'user',
          isInCouple: false,
          stats: {
            posts: 45,
            friends: 123,
            followers: 234,
            following: 156,
            profileViews: 1245,
            likesReceived: 567
          },
          lastActiveAt: '2024-01-15T14:30:00Z',
          createdAt: '2023-12-01T10:30:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          authId: 'auth-456',
          username: 'maria_santos',
          email: 'maria@email.com',
          name: 'Maria Santos',
          firstName: 'Maria',
          lastName: 'Santos',
          bio: 'Fotógrafa e criadora de conteúdo',
          birthDate: '1985-08-22',
          gender: 'female',
          profileType: 'single',
          location: 'Rio de Janeiro, RJ',
          city: 'Rio de Janeiro',
          uf: 'RJ',
          state: 'Rio de Janeiro',
          country: 'Brasil',
          avatarUrl: '/placeholder-avatar.jpg',
          isPremium: true,
          premiumType: 'gold',
          premiumStatus: 'active',
          premiumExpiresAt: '2024-02-20T00:00:00Z',
          isVerified: false,
          isActive: true,
          status: 'active',
          role: 'user',
          isInCouple: false,
          stats: {
            posts: 89,
            friends: 67,
            followers: 456,
            following: 89,
            profileViews: 2340,
            likesReceived: 1234
          },
          lastActiveAt: '2024-01-15T16:45:00Z',
          createdAt: '2023-11-15T08:20:00Z',
          updatedAt: '2024-01-15T16:45:00Z'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const suspendUser = async (userId: string, reason: string, duration?: number) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, duration })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao suspender usuário')
      }
      
      toast.success('Usuário suspenso com sucesso!')
      loadUserData()
    } catch (error) {
      console.error('Error suspending user:', error)
      toast.error('Erro ao suspender usuário')
    }
  }

  const banUser = async (userId: string, reason: string) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao banir usuário')
      }
      
      toast.success('Usuário banido com sucesso!')
      loadUserData()
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('Erro ao banir usuário')
    }
  }

  const verifyUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/verify`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Erro ao verificar usuário')
      }
      
      toast.success('Usuário verificado com sucesso!')
      loadUserData()
    } catch (error) {
      console.error('Error verifying user:', error)
      toast.error('Erro ao verificar usuário')
    }
  }

  const grantPremium = async (userId: string, planType: string) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao conceder premium')
      }
      
      toast.success('Premium concedido com sucesso!')
      loadUserData()
    } catch (error) {
      console.error('Error granting premium:', error)
      toast.error('Erro ao conceder premium')
    }
  }

  const impersonateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/impersonate`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Erro ao fazer login como usuário')
      }
      
      const data = await response.json()
      
      // Redirecionar para a sessão do usuário
      window.open(`/feed?impersonate=${data.token}`, '_blank')
      toast.success('Login como usuário realizado!')
    } catch (error) {
      console.error('Error impersonating user:', error)
      toast.error('Erro ao fazer login como usuário')
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
        return <Crown className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'suspended':
        return <Badge className="bg-orange-100 text-orange-800">Suspenso</Badge>
      case 'banned':
        return <Badge className="bg-red-100 text-red-800">Banido</Badge>
      case 'deactivated':
        return <Badge className="bg-gray-100 text-gray-800">Desativado</Badge>
      case 'pending_verification':
        return <Badge className="bg-blue-100 text-blue-800">Pendente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesPlan = planFilter === 'all' || user.premiumType === planFilter
    const matchesVerified = verifiedFilter === 'all' || 
                           (verifiedFilter === 'verified' && user.isVerified) ||
                           (verifiedFilter === 'unverified' && !user.isVerified)
    const matchesLocation = locationFilter === 'all' || user.uf === locationFilter
    
    return matchesSearch && matchesStatus && matchesPlan && matchesVerified && matchesLocation
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
            Gestão de Usuários
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie todos os usuários da plataforma
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button onClick={() => {}} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          
          <Button onClick={loadUserData} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Métricas de Usuários */}
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
                    Total de Usuários
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.overview.totalUsers.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{metrics?.overview.growthRate}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
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
                    Usuários Ativos
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.overview.activeUsers.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {metrics && ((metrics.overview.activeUsers / metrics.overview.totalUsers) * 100).toFixed(1)}% do total
                  </p>
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
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Usuários Premium
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.overview.premiumUsers.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {metrics && ((metrics.overview.premiumUsers / metrics.overview.totalUsers) * 100).toFixed(1)}% conversão
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-purple-600" />
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
                    Usuários Verificados
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.overview.verifiedUsers.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {metrics && ((metrics.overview.verifiedUsers / metrics.overview.totalUsers) * 100).toFixed(1)}% verificados
                  </p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyan-600" />
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
          <TabsTrigger value="demographics">Demografia</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="users">Lista de Usuários</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Novos Usuários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Novos Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Hoje</span>
                    <span className="text-2xl font-bold">{metrics?.overview.newUsersToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Esta semana</span>
                    <span className="text-xl font-semibold">{metrics?.overview.newUsersWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Taxa de crescimento</span>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">{metrics?.overview.growthRate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Planos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Distribuição de Planos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span>Free</span>
                    </div>
                    <span className="font-medium">{metrics?.planDistribution.free.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-500 mr-2" />
                      <span>Gold</span>
                    </div>
                    <span className="font-medium">{metrics?.planDistribution.gold.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Gem className="w-3 h-3 text-purple-500 mr-2" />
                      <span>Diamond</span>
                    </div>
                    <span className="font-medium">{metrics?.planDistribution.diamond.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="w-3 h-3 text-pink-500 mr-2" />
                      <span>Couple</span>
                    </div>
                    <span className="font-medium">{metrics?.planDistribution.couple.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demografia */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Faixa Etária */}
            <Card>
              <CardHeader>
                <CardTitle>Faixa Etária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.demographics.ageGroups.map((group) => (
                    <div key={group.range} className="flex items-center justify-between">
                      <span className="text-sm">{group.range} anos</span>
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${group.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{group.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gênero */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Gênero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.demographics.genders.map((gender) => (
                    <div key={gender.gender} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {gender.gender === 'male' ? 'Masculino' : 
                         gender.gender === 'female' ? 'Feminino' : 'Outro'}
                      </span>
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            style={{ width: `${gender.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{gender.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card>
              <CardHeader>
                <CardTitle>Top Estados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.demographics.locations.map((location) => (
                    <div key={location.state} className="flex items-center justify-between">
                      <span className="text-sm">{location.state}</span>
                      <span className="text-sm font-medium">{location.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lista de Usuários */}
        <TabsContent value="users" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nome, email ou username..."
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
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="suspended">Suspenso</SelectItem>
                      <SelectItem value="banned">Banido</SelectItem>
                      <SelectItem value="deactivated">Desativado</SelectItem>
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
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="couple">Couple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="verified">Verificação</Label>
                  <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="verified">Verificados</SelectItem>
                      <SelectItem value="unverified">Não Verificados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location">Estado</Label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
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
              <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{user.name}</p>
                          {user.isVerified && (
                            <Shield className="w-4 h-4 text-blue-500" />
                          )}
                          {getPlanIcon(user.premiumType)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          @{user.username} • {user.email}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {user.location}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center">
                            <Activity className="w-3 h-3 mr-1" />
                            {new Date(user.lastActiveAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(user.status)}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Usuário</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-16 h-16">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-lg font-semibold">{user.name}</h3>
                                  {user.isVerified && (
                                    <Shield className="w-5 h-5 text-blue-500" />
                                  )}
                                </div>
                                <p className="text-gray-600">@{user.username}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Plano</p>
                                <div className="flex items-center">
                                  {getPlanIcon(user.premiumType)}
                                  <span className="ml-2 capitalize">{user.premiumType}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Status</p>
                                {getStatusBadge(user.status)}
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Localização</p>
                                <p>{user.location}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Cadastro</p>
                                <p>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                              </div>
                            </div>
                            
                            {user.bio && (
                              <div>
                                <p className="text-sm text-gray-600">Bio</p>
                                <p className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{user.bio}</p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-2xl font-bold text-blue-600">{user.stats.posts}</p>
                                <p className="text-sm text-gray-600">Posts</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-green-600">{user.stats.followers}</p>
                                <p className="text-sm text-gray-600">Seguidores</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-purple-600">{user.stats.following}</p>
                                <p className="text-sm text-gray-600">Seguindo</p>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              {user.status === 'active' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => impersonateUser(user.id)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Login como
                                  </Button>
                                  
                                  {!user.isVerified && (
                                    <Button
                                      size="sm"
                                      onClick={() => verifyUser(user.id)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Verificar
                                    </Button>
                                  )}
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => suspendUser(user.id, 'Suspensão administrativa', 7)}
                                  >
                                    <Ban className="w-4 h-4 mr-1" />
                                    Suspender
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => banUser(user.id, 'Banimento administrativo')}
                                  >
                                    <UserX className="w-4 h-4 mr-1" />
                                    Banir
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}