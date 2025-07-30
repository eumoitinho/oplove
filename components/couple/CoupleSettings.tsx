"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Heart, 
  Settings, 
  Users, 
  Bell, 
  Shield, 
  Eye, 
  Calendar,
  Camera,
  BookOpen,
  Gamepad2,
  Share2,
  User,
  CreditCard,
  AlertTriangle,
  UserMinus,
  Save,
  Crown,
  Gem
} from "lucide-react"
import { useCouple } from "@/hooks/useCouple"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export function CoupleSettings() {
  const { user } = useAuth()
  const { 
    couple, 
    coupleSettings, 
    updateCoupleSettings, 
    updateCouple,
    leaveCouple, 
    dissolveCouple,
    loading,
    isCouplePrimary 
  } = useCouple()

  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState(coupleSettings)
  const [coupleData, setCoupleData] = useState({
    couple_name: couple?.couple_name || '',
    bio: couple?.bio || '',
    anniversary_date: couple?.anniversary_date || ''
  })
  const [showDangerZone, setShowDangerZone] = useState(false)

  useEffect(() => {
    if (coupleSettings) {
      setSettings(coupleSettings)
    }
  }, [coupleSettings])

  useEffect(() => {
    if (couple) {
      setCoupleData({
        couple_name: couple.couple_name || '',
        bio: couple.bio || '',
        anniversary_date: couple.anniversary_date || ''
      })
    }
  }, [couple])

  const handleSaveSettings = async () => {
    if (!settings) return

    const result = await updateCoupleSettings(settings)
    if (result.success) {
      toast.success('Configurações salvas!')
    } else {
      toast.error(result.error || 'Erro ao salvar configurações')
    }
  }

  const handleSaveCoupleData = async () => {
    const result = await updateCouple(coupleData)
    if (result.success) {
      toast.success('Dados do casal atualizados!')
    } else {
      toast.error(result.error || 'Erro ao atualizar dados')
    }
  }

  const handleLeaveCouple = async () => {
    if (!confirm('Tem certeza que deseja sair do casal? Esta ação não pode ser desfeita.')) {
      return
    }

    const result = await leaveCouple()
    if (result.success) {
      toast.success('Você saiu do casal')
      // Redirect to user profile
    } else {
      toast.error(result.error || 'Erro ao sair do casal')
    }
  }

  const handleDissolveCouple = async () => {
    if (!confirm('Tem certeza que deseja desfazer o casal? Todos os dados compartilhados serão perdidos permanentemente.')) {
      return
    }

    const result = await dissolveCouple()
    if (result.success) {
      toast.success('Casal desfeito')
      // Redirect to user profile
    } else {
      toast.error(result.error || 'Erro ao desfazer casal')
    }
  }

  const updateSetting = <K extends keyof typeof settings>(key: K, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  const updateNotificationSetting = (key: string, value: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    })
  }

  const updatePrivacySetting = (key: string, value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    })
  }

  if (!couple || !settings) {
    return (
      <div className="space-y-6">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 text-center">
          <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Você não está em um casal</p>
        </div>
      </div>
    )
  }

  const partner = couple.users.find(u => u.id !== user?.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200 dark:border-pink-800 rounded-3xl p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-pink-500" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Configurações do Casal
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie as configurações e preferências do seu relacionamento
        </p>
      </motion.div>

      {/* Settings Content */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-1 h-auto p-1 mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacidade</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Assinatura</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Informações do Casal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="couple_name">Nome do casal</Label>
                  <Input
                    id="couple_name"
                    value={coupleData.couple_name}
                    onChange={(e) => setCoupleData({...coupleData, couple_name: e.target.value})}
                    placeholder="João & Maria"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio do casal</Label>
                  <Input
                    id="bio"
                    value={coupleData.bio}
                    onChange={(e) => setCoupleData({...coupleData, bio: e.target.value})}
                    placeholder="Conte a história de vocês..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="anniversary">Data do relacionamento</Label>
                  <Input
                    id="anniversary"
                    type="date"
                    value={coupleData.anniversary_date}
                    onChange={(e) => setCoupleData({...coupleData, anniversary_date: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <Button 
                  onClick={handleSaveCoupleData}
                  disabled={loading}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Informações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Compartilhamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Perfil compartilhado</Label>
                    <p className="text-sm text-gray-500">
                      Mostrar vocês como um casal nos posts
                    </p>
                  </div>
                  <Switch
                    checked={settings.shared_profile}
                    onCheckedChange={(checked) => updateSetting('shared_profile', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Estatísticas compartilhadas</Label>
                    <p className="text-sm text-gray-500">
                      Combinar estatísticas de ambos os perfis
                    </p>
                  </div>
                  <Switch
                    checked={settings.shared_stats}
                    onCheckedChange={(checked) => updateSetting('shared_stats', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Parceiro pode postar por você</Label>
                    <p className="text-sm text-gray-500">
                      Permitir que o parceiro poste em seu nome
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_partner_posting}
                    onCheckedChange={(checked) => updateSetting('allow_partner_posting', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marcar parceiro automaticamente</Label>
                    <p className="text-sm text-gray-500">
                      Adicionar tag do parceiro nos seus posts
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_tag_partner}
                    onCheckedChange={(checked) => updateSetting('auto_tag_partner', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Calendário compartilhado</Label>
                    <p className="text-sm text-gray-500">
                      Sincronizar eventos e datas importantes
                    </p>
                  </div>
                  <Switch
                    checked={settings.shared_calendar}
                    onCheckedChange={(checked) => updateSetting('shared_calendar', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Visibilidade do Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Visibilidade do álbum compartilhado</Label>
                  <Select 
                    value={settings.privacy.album_visibility}
                    onValueChange={(value) => updatePrivacySetting('album_visibility', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Apenas vocês dois</SelectItem>
                      <SelectItem value="couple_only">Outros casais</SelectItem>
                      <SelectItem value="friends">Amigos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Acesso ao diário</Label>
                  <Select 
                    value={settings.privacy.diary_access}
                    onValueChange={(value) => updatePrivacySetting('diary_access', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Ambos podem ler e escrever</SelectItem>
                      <SelectItem value="creator_only">Apenas quem escreve pode ver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compartilhar estatísticas</Label>
                    <p className="text-sm text-gray-500">
                      Permitir que outros vejam estatísticas do casal
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.stats_sharing}
                    onCheckedChange={(checked) => updatePrivacySetting('stats_sharing', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações do Casal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Posts do parceiro</Label>
                    <p className="text-sm text-gray-500">
                      Notificar quando seu parceiro postar algo
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.partner_posts}
                    onCheckedChange={(checked) => updateNotificationSetting('partner_posts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lembretes de aniversário</Label>
                    <p className="text-sm text-gray-500">
                      Lembrar de datas importantes do relacionamento
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.anniversary_reminders}
                    onCheckedChange={(checked) => updateNotificationSetting('anniversary_reminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Jogos para casais</Label>
                    <p className="text-sm text-gray-500">
                      Sugestões de jogos e atividades
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.couple_games}
                    onCheckedChange={(checked) => updateNotificationSetting('couple_games', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Memórias compartilhadas</Label>
                    <p className="text-sm text-gray-500">
                      Relembrar momentos especiais
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.shared_memories}
                    onCheckedChange={(checked) => updateNotificationSetting('shared_memories', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Settings */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Plano Couple Ativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Plano Couple</h3>
                    <p className="text-sm text-gray-500">R$ 69,90/mês • Todos os recursos Diamond para 2 pessoas</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{user?.full_name || user?.username}</span>
                    </div>
                    <p className="text-xs text-green-600">Titular da assinatura</p>
                  </div>
                  
                  {partner && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{partner.full_name || partner.username}</span>
                      </div>
                      <p className="text-xs text-blue-600">Parceiro(a)</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-purple-500" />
                    <span>Todos os recursos Diamond</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-pink-500" />
                    <span>Álbum privado compartilhado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-500" />
                    <span>Diário do relacionamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-yellow-500" />
                    <span>Jogos para casais</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gerenciar Assinatura
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>

          <Button
            onClick={() => setShowDangerZone(!showDangerZone)}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Zona de Perigo
          </Button>
        </div>

        {/* Danger Zone */}
        {showDangerZone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
          >
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
              Ações Perigosas
            </h3>
            <div className="space-y-3">
              <Button
                onClick={handleLeaveCouple}
                disabled={loading}
                variant="outline"
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Sair do Casal
              </Button>
              
              {isCouplePrimary && (
                <Button
                  onClick={handleDissolveCouple}
                  disabled={loading}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Desfazer Casal Permanentemente
                </Button>
              )}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-3">
              {isCouplePrimary 
                ? "Como titular, você pode desfazer o casal. Isso removerá todos os dados compartilhados permanentemente."
                : "Apenas o titular da assinatura pode desfazer o casal completamente."
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}