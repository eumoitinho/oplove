"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  Calendar, 
  MapPin,
  Camera,
  Edit,
  Save,
  X,
  Settings,
  Users,
  Image as ImageIcon,
  BookOpen,
  Gamepad2,
  Star,
  Crown,
  Gem,
  Share2,
  MoreHorizontal,
  UserMinus,
  AlertTriangle,
  Gift,
  Music,
  Film,
  Coffee,
  Plane,
  Home,
  CheckCircle,
  Clock
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface Couple {
  id: string
  couple_name: string
  couple_avatar_url: string
  couple_cover_url: string
  anniversary_date: string
  bio: string
  status: 'active' | 'pending' | 'inactive'
  created_at: string
  updated_at: string
  users: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    role: 'primary' | 'secondary'
    joined_at: string
  }[]
  shared_album_count: number
  shared_diary_entries: number
  relationship_stats: {
    days_together: number
    posts_together: number
    memories_created: number
    games_played: number
  }
  interests: string[]
  relationship_goals: string[]
}

interface CoupleProfileProps {
  coupleId?: string
  isOwnCouple?: boolean
}

export function CoupleProfile({ coupleId, isOwnCouple = false }: CoupleProfileProps) {
  const { user } = useAuth()
  const [couple, setCouple] = useState<Couple | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    couple_name: '',
    bio: '',
    anniversary_date: '',
    interests: [] as string[],
    relationship_goals: [] as string[]
  })
  const [activeTab, setActiveTab] = useState('overview')

  const interestOptions = [
    { id: 'travel', label: 'Viagens', icon: Plane },
    { id: 'cooking', label: 'Culinária', icon: Coffee },
    { id: 'movies', label: 'Filmes', icon: Film },
    { id: 'music', label: 'Música', icon: Music },
    { id: 'fitness', label: 'Fitness', icon: Star },
    { id: 'gaming', label: 'Games', icon: Gamepad2 },
    { id: 'home', label: 'Casa', icon: Home },
    { id: 'photography', label: 'Fotografia', icon: Camera }
  ]

  const goalOptions = [
    'Viajar o mundo juntos',
    'Construir uma família',
    'Comprar a casa própria',
    'Crescer profissionalmente',
    'Viver novas aventuras',
    'Ser mais românticos',
    'Cuidar da saúde juntos',
    'Criar memórias especiais'
  ]

  useEffect(() => {
    loadCoupleProfile()
  }, [coupleId])

  useEffect(() => {
    if (couple && isOwnCouple) {
      setEditData({
        couple_name: couple.couple_name || '',
        bio: couple.bio || '',
        anniversary_date: couple.anniversary_date || '',
        interests: couple.interests || [],
        relationship_goals: couple.relationship_goals || []
      })
    }
  }, [couple, isOwnCouple])

  const loadCoupleProfile = async () => {
    setLoading(true)
    try {
      // Mock data - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockCouple: Couple = {
        id: coupleId || '1',
        couple_name: 'João & Maria',
        couple_avatar_url: '/couple-avatar.jpg',
        couple_cover_url: '/couple-cover.jpg',
        anniversary_date: '2023-02-14',
        bio: 'Casal apaixonado por tecnologia, viagens e música. Construindo nossa história juntos no OpenLove 💕',
        status: 'active',
        created_at: '2023-02-14T00:00:00Z',
        updated_at: new Date().toISOString(),
        users: [
          {
            id: '1',
            username: 'joao',
            full_name: 'João Silva',
            avatar_url: '/avatar1.jpg',
            role: 'primary',
            joined_at: '2023-02-14T00:00:00Z'
          },
          {
            id: '2',
            username: 'maria',
            full_name: 'Maria Santos',
            avatar_url: '/avatar2.jpg',
            role: 'secondary',
            joined_at: '2023-02-14T10:30:00Z'
          }
        ],
        shared_album_count: 127,
        shared_diary_entries: 45,
        relationship_stats: {
          days_together: Math.floor((Date.now() - new Date('2023-02-14').getTime()) / (1000 * 60 * 60 * 24)),
          posts_together: 89,
          memories_created: 234,
          games_played: 12
        },
        interests: ['travel', 'music', 'movies', 'cooking'],
        relationship_goals: ['Viajar o mundo juntos', 'Construir uma família', 'Comprar a casa própria']
      }
      
      setCouple(mockCouple)
    } catch (error) {
      console.error('Error loading couple profile:', error)
      toast.error('Erro ao carregar perfil do casal')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (couple) {
        setCouple({
          ...couple,
          couple_name: editData.couple_name,
          bio: editData.bio,
          anniversary_date: editData.anniversary_date,
          interests: editData.interests,
          relationship_goals: editData.relationship_goals
        })
      }
      
      setIsEditing(false)
      toast.success('Perfil do casal atualizado!')
    } catch (error) {
      toast.error('Erro ao salvar perfil')
    } finally {
      setLoading(false)
    }
  }

  const leaveCouple = async () => {
    if (!confirm('Tem certeza que deseja sair do casal? Esta ação não pode ser desfeita.')) {
      return
    }

    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Você saiu do casal')
      // Redirect to user profile or dashboard
    } catch (error) {
      toast.error('Erro ao sair do casal')
    } finally {
      setLoading(false)
    }
  }

  const dissolveCouple = async () => {
    if (!confirm('Tem certeza que deseja desfazer o casal? Todos os dados compartilhados serão perdidos.')) {
      return
    }

    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Casal desfeito')
      // Redirect to user profile or dashboard
    } catch (error) {
      toast.error('Erro ao desfazer casal')
    } finally {
      setLoading(false)
    }
  }

  const toggleInterest = (interestId: string) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }))
  }

  const toggleGoal = (goal: string) => {
    setEditData(prev => ({
      ...prev,
      relationship_goals: prev.relationship_goals.includes(goal)
        ? prev.relationship_goals.filter(g => g !== goal)
        : [...prev.relationship_goals, goal]
    }))
  }

  if (loading && !couple) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!couple) return null

  const daysTogether = couple.relationship_stats.days_together
  const primaryUser = couple.users.find(u => u.role === 'primary')
  const secondaryUser = couple.users.find(u => u.role === 'secondary')

  return (
    <div className="space-y-6">
      {/* Cover and Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm"
      >
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 relative">
          {isOwnCouple && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Editar capa
            </Button>
          )}
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar and Users */}
            <div className="flex items-center gap-4 -mt-16 lg:-mt-12">
              {/* Couple Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-900 shadow-xl">
                  <AvatarImage src={couple.couple_avatar_url} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                    <Heart className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                {isOwnCouple && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute -bottom-2 right-0 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md"
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Individual Avatars */}
              <div className="flex items-center gap-2">
                <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-900">
                  <AvatarImage src={primaryUser?.avatar_url} />
                  <AvatarFallback>{primaryUser?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Heart className="w-6 h-6 text-pink-500" />
                <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-900">
                  <AvatarImage src={secondaryUser?.avatar_url} />
                  <AvatarFallback>{secondaryUser?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Info and Actions */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  {isEditing ? (
                    <Input
                      value={editData.couple_name}
                      onChange={(e) => setEditData({...editData, couple_name: e.target.value})}
                      className="text-2xl font-bold mb-2 max-w-md"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {couple.couple_name}
                    </h1>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Users className="w-4 h-4" />
                    <span>@{primaryUser?.username} & @{secondaryUser?.username}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Juntos há {daysTogether} dias</span>
                    </div>
                    <Badge className="bg-pink-500 text-white">
                      <Heart className="w-3 h-3 mr-1" />
                      Couple
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                {isOwnCouple && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button 
                          onClick={handleSave}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </Button>
                        <Button 
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <div className="relative group">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 hidden group-hover:block">
                            <button 
                              onClick={leaveCouple}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600"
                            >
                              <UserMinus className="w-4 h-4" />
                              Sair do casal
                            </button>
                            <button 
                              onClick={dissolveCouple}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Desfazer casal
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Bio */}
              {isEditing ? (
                <Textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  placeholder="Conte a história de vocês..."
                  rows={3}
                  className="mt-4"
                />
              ) : couple.bio ? (
                <p className="mt-4 text-gray-700 dark:text-white/80 leading-relaxed">{couple.bio}</p>
              ) : isOwnCouple ? (
                <p className="mt-4 text-gray-500 dark:text-white/60 italic">
                  Adicione a história de vocês
                </p>
              ) : null}

              {/* Anniversary Date */}
              {isEditing && (
                <div className="mt-4">
                  <Label htmlFor="anniversary">Data do relacionamento</Label>
                  <Input
                    id="anniversary"
                    type="date"
                    value={editData.anniversary_date}
                    onChange={(e) => setEditData({...editData, anniversary_date: e.target.value})}
                    className="mt-2 max-w-xs"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {couple.shared_album_count}
                  </p>
                  <p className="text-sm text-gray-500">Fotos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {couple.shared_diary_entries}
                  </p>
                  <p className="text-sm text-gray-500">Memórias</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {couple.relationship_stats.posts_together}
                  </p>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {couple.relationship_stats.games_played}
                  </p>
                  <p className="text-sm text-gray-500">Jogos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interests & Goals */}
      {(couple.interests.length > 0 || couple.relationship_goals.length > 0 || isEditing) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6"
        >
          <div className="space-y-6">
            {/* Interests */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Interesses em Comum</h3>
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {interestOptions.map((interest) => {
                    const Icon = interest.icon
                    const isSelected = editData.interests.includes(interest.id)
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{interest.label}</span>
                      </button>
                    )
                  })}
                </div>
              ) : couple.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {couple.interests.map((interestId) => {
                    const interest = interestOptions.find(opt => opt.id === interestId)
                    if (!interest) return null
                    const Icon = interest.icon
                    return (
                      <div
                        key={interestId}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-700 dark:text-pink-300"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{interest.label}</span>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>

            {/* Relationship Goals */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Objetivos do Relacionamento</h3>
              {isEditing ? (
                <div className="space-y-2">
                  {goalOptions.map((goal) => {
                    const isSelected = editData.relationship_goals.includes(goal)
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && <CheckCircle className="w-4 h-4" />}
                          <span className="text-sm">{goal}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : couple.relationship_goals.length > 0 ? (
                <div className="space-y-2">
                  {couple.relationship_goals.map((goal, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-700 dark:text-purple-300">{goal}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}

      {/* Couple Features Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-1 h-auto p-1 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="album" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Álbum</span>
            </TabsTrigger>
            <TabsTrigger value="diary" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Diário</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Jogos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Marcos do Relacionamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Primeiro encontro</span>
                      <span className="text-sm text-gray-500">14 Fev 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Primeira foto juntos</span>
                      <span className="text-sm text-gray-500">15 Fev 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Entraram no OpenLove</span>
                      <span className="text-sm text-gray-500">20 Mar 2023</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Atividades Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-sm">Adicionaram 5 fotos ao álbum</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Completaram um jogo para casais</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm">Escreveram no diário do relacionamento</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="album">
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Álbum Privado do Casal</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Compartilhem fotos e vídeos especiais que só vocês podem ver
              </p>
              {isOwnCouple && (
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  <Camera className="w-4 h-4 mr-2" />
                  Adicionar Foto
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="diary">
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Diário do Relacionamento</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Registrem momentos especiais e memórias importantes
              </p>
              {isOwnCouple && (
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Escrever Memória
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="games">
            <div className="text-center py-12">
              <Gamepad2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Jogos para Casais</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Divirtam-se com jogos criados especialmente para casais
              </p>
              {isOwnCouple && (
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Jogar Agora
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}