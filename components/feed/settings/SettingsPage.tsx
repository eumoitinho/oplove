"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard, 
  Eye, 
  Globe, 
  Moon,
  Volume2,
  Smartphone,
  Mail,
  MessageSquare,
  Heart,
  Calendar,
  CheckCircle,
  AlertCircle,
  Crown,
  Gem,
  Download,
  Trash,
  UserX,
  Key,
  Send,
  Clock,
  Languages
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { useSettings } from "@/hooks/useSettings"
import { toast } from "sonner"

export function SettingsPage() {
  const { user } = useAuth()
  const features = usePremiumFeatures()
  
  // Criar planInfo baseado no usuário
  const planInfo = {
    name: user?.premium_type === 'gold' ? 'Gold' : 
          user?.premium_type === 'diamond' ? 'Diamond' : 
          user?.premium_type === 'couple' ? 'Couple' : 'Gratuito',
    icon: user?.premium_type === 'diamond' ? "💎" : 
          user?.premium_type === 'gold' ? "⭐" : 
          user?.premium_type === 'couple' ? "💕" : "🆓",
    expiresAt: user?.premium_expires_at
  }
  const { 
    settings, 
    updateSetting, 
    saveSettings, 
    changePassword,
    enable2FA,
    disable2FA,
    requestEmailVerification,
    deactivateAccount,
    deleteAccount,
    exportData,
    loading 
  } = useSettings()
  
  const [activeTab, setActiveTab] = useState("account")
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)

  const handleSave = async (section: string) => {
    await saveSettings(section)
  }

  const handlePasswordChange = async () => {
    const result = await changePassword(passwordData)
    if (result.success) {
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      })
    }
  }

  const handleToggle2FA = async () => {
    if (settings.two_factor_enabled) {
      await disable2FA()
    } else {
      await enable2FA()
    }
  }

  const handleUpgradePlan = () => {
    // TODO: Redirecionar para página de upgrade
    console.log("Upgrade plan")
  }

  const handleVerification = () => {
    // TODO: Iniciar processo de verificação
    console.log("Start verification")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-white/60">
          Gerencie suas preferências e configurações de conta
        </p>
      </div>

      {/* Settings Content */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
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
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="mt-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Nome de usuário</Label>
                <Input 
                  id="username"
                  value={settings.username}
                  onChange={(e) => updateSetting('username', e.target.value)}
                  disabled
                  className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                />
                <p className="text-sm text-gray-500 mt-1">
                  O nome de usuário não pode ser alterado
                </p>
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting('email', e.target.value)}
                  className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateSetting('phone', e.target.value)}
                  placeholder={user?.phone || '+55 11 99999-9999'}
                  className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                />
              </div>

              <div className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <Button 
                  onClick={() => handleSave("conta")}
                  disabled={loading}
                  className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 py-3"
                >
                  {loading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome completo</Label>
                <Input 
                  id="full_name"
                  value={settings.full_name}
                  onChange={(e) => updateSetting('full_name', e.target.value)}
                  placeholder={user?.name || 'Seu nome completo'}
                  className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio"
                  value={settings.bio}
                  onChange={(e) => updateSetting('bio', e.target.value)}
                  placeholder={user?.bio || 'Conte um pouco sobre você...'}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                  className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                />
              </div>

              <div>
                <Label htmlFor="location">Localização</Label>
                <Input 
                  id="location"
                  value={settings.location}
                  onChange={(e) => updateSetting('location', e.target.value)}
                  placeholder={user?.location || 'Cidade, Estado'}
                  placeholder="Cidade, Estado"
                  className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website"
                  type="url"
                  value={settings.website}
                  onChange={(e) => updateSetting('website', e.target.value)}
                  placeholder={user?.website || 'https://seusite.com'}
                  placeholder="https://seusite.com"
                  className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                />
              </div>

              <div>
                <Label htmlFor="birth_date">Data de nascimento</Label>
                <Input 
                  id="birth_date"
                  type="date"
                  value={settings.birth_date}
                  onChange={(e) => updateSetting('birth_date', e.target.value)}
                  placeholder={user?.birth_date || ''}
                  className="mt-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-400"
                />
              </div>

              <div className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <Button 
                  onClick={() => handleSave("perfil")}
                  disabled={loading}
                  className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 py-3"
                >
                  {loading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="mt-6 space-y-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="profile_visibility">Visibilidade do perfil</Label>
                <Select 
                  value={settings.profile_visibility}
                  onValueChange={(value) => updateSetting('profile_visibility', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="friends">Apenas amigos</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_online_status">Mostrar status online</Label>
                  <p className="text-sm text-gray-500">
                    Outros usuários podem ver quando você está online
                  </p>
                </div>
                <Switch
                  id="show_online_status"
                  checked={settings.show_online_status}
                  onCheckedChange={(checked) => 
                    updateSetting('show_online_status', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_last_seen">Mostrar "visto por último"</Label>
                  <p className="text-sm text-gray-500">
                    Mostrar quando você esteve online pela última vez
                  </p>
                </div>
                <Switch
                  id="show_last_seen"
                  checked={settings.show_last_seen}
                  onCheckedChange={(checked) => 
                    updateSetting('show_last_seen', checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="allow_messages_from">Permitir mensagens de</Label>
                <Select 
                  value={settings.allow_messages_from}
                  onValueChange={(value) => updateSetting('allow_messages_from', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Todos</SelectItem>
                    <SelectItem value="friends">Apenas amigos</SelectItem>
                    <SelectItem value="verified">Apenas verificados</SelectItem>
                    <SelectItem value="none">Ninguém</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <Button 
                  onClick={() => handleSave("privacidade")}
                  disabled={loading}
                  className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 py-3"
                >
                  {loading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="mt-6 space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Notificações gerais</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">Notificações por e-mail</Label>
                    <p className="text-sm text-gray-500">Receber atualizações por e-mail</p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => 
                      updateSetting('email_notifications', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push_notifications">Notificações push</Label>
                    <p className="text-sm text-gray-500">Receber notificações no navegador</p>
                  </div>
                  <Switch
                    id="push_notifications"
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => 
                      updateSetting('push_notifications', checked)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Tipos de notificação</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <Label htmlFor="notification_likes">Curtidas</Label>
                  </div>
                  <Switch
                    id="notification_likes"
                    checked={settings.notification_likes}
                    onCheckedChange={(checked) => 
                      updateSetting('notification_likes', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <Label htmlFor="notification_comments">Comentários</Label>
                  </div>
                  <Switch
                    id="notification_comments"
                    checked={settings.notification_comments}
                    onCheckedChange={(checked) => 
                      updateSetting('notification_comments', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    <Label htmlFor="notification_follows">Novos seguidores</Label>
                  </div>
                  <Switch
                    id="notification_follows"
                    checked={settings.notification_follows}
                    onCheckedChange={(checked) => 
                      updateSetting('notification_follows', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-500" />
                    <Label htmlFor="notification_messages">Mensagens</Label>
                  </div>
                  <Switch
                    id="notification_messages"
                    checked={settings.notification_messages}
                    onCheckedChange={(checked) => 
                      updateSetting('notification_messages', checked)
                    }
                  />
                </div>
              </div>

              <div className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <Button 
                  onClick={() => handleSave("notificações")}
                  disabled={loading}
                  className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 py-3"
                >
                  {loading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Subscription Settings */}
          <TabsContent value="subscription" className="mt-6 space-y-6">
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Plano Atual</h3>
                  {planInfo?.icon === "💎" ? (
                    <Gem className="w-6 h-6 text-purple-600" />
                  ) : planInfo?.icon === "⭐" ? (
                    <Crown className="w-6 h-6 text-yellow-600" />
                  ) : null}
                </div>
                
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{planInfo?.name || "Gratuito"}</p>
                  {user?.premium_type !== "free" && (
                    <p className="text-sm text-gray-500">
                      Válido até {planInfo?.expiresAt ? 
                        new Date(planInfo.expiresAt).toLocaleDateString("pt-BR") : 
                        "Indefinido"
                      }
                    </p>
                  )}
                </div>

                {user?.premium_type === "free" && (
                  <Button 
                    onClick={handleUpgradePlan}
                    className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Fazer upgrade
                  </Button>
                )}
              </div>

              {/* Verification Status */}
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Status de Verificação</h3>
                  {user?.is_verified ? (
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.is_verified ? 
                    "Sua conta está verificada" : 
                    "Verifique sua conta para desbloquear mais recursos"
                  }
                </p>

                {!user?.is_verified && (
                  <Button 
                    onClick={handleVerification}
                    variant="outline"
                    className="mt-4 w-full"
                  >
                    Iniciar verificação
                  </Button>
                )}
              </div>

              {/* Benefits */}
              <div>
                <h3 className="font-semibold mb-4">Benefícios do seu plano</h3>
                <div className="space-y-2">
                  {features.canSendMessages && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Mensagens ilimitadas</span>
                    </div>
                  )}
                  {features.canCreateStories && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Stories de 24 horas</span>
                    </div>
                  )}
                  {features.canMakeCalls && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Chamadas de voz e vídeo</span>
                    </div>
                  )}
                  {!features.showAds && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Sem anúncios</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="mt-6 space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Alterar Senha</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="current_password">Senha atual</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new_password">Nova senha</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm_password">Confirmar nova senha</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={loading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                    className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {loading ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two_factor">Autenticação de dois fatores</Label>
                  <p className="text-sm text-gray-500">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
                <Switch
                  id="two_factor"
                  checked={settings.two_factor_enabled}
                  onCheckedChange={handleToggle2FA}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="login_alerts">Alertas de login</Label>
                  <p className="text-sm text-gray-500">
                    Receber notificações de novos logins
                  </p>
                </div>
                <Switch
                  id="login_alerts"
                  checked={settings.login_alerts}
                  onCheckedChange={(checked) => 
                    updateSetting('login_alerts', checked)
                  }
                />
              </div>

              <div>
                <h3 className="font-semibold mb-4">Sessões ativas</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Chrome - Windows</p>
                          <p className="text-sm text-gray-500">São Paulo, Brasil • Agora</p>
                        </div>
                      </div>
                      <span className="text-sm text-green-500">Ativo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <Button 
                  onClick={() => handleSave("segurança")}
                  disabled={loading}
                  className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 py-3"
                >
                  {loading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Data Export and Danger Zone */}  
      <div className="space-y-6">
        {/* Data Export */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-3xl p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Seus Dados</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Baixe uma cópia dos seus dados do OpenLove
          </p>
          <Button 
            onClick={exportData}
            disabled={loading}
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? "Exportando..." : "Exportar Dados"}
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-6">
          <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Zona de Perigo</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Ações irreversíveis. Tenha certeza antes de continuar.
          </p>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeactivateConfirm(true)}
              className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full"
            >
              <UserX className="w-4 h-4 mr-2" />
              Desativar conta temporariamente
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="ml-3 rounded-full bg-red-600 hover:bg-red-700"
            >
              <Trash className="w-4 h-4 mr-2" />
              Excluir conta permanentemente
            </Button>
          </div>
        </div>
      </div>

      {/* Deactivate Account Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Desativar Conta</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sua conta será desativada temporariamente. Você pode reativá-la fazendo login novamente.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowDeactivateConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await deactivateAccount()
                  setShowDeactivateConfirm(false)
                }}
                disabled={loading}
              >
                {loading ? "Desativando..." : "Desativar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Excluir Conta</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente excluídos:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
              <li>• Perfil e informações pessoais</li>
              <li>• Posts, fotos e vídeos</li>
              <li>• Mensagens e conversas</li>
              <li>• Assinatura e histórico de pagamentos</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await deleteAccount()
                  setShowDeleteConfirm(false)
                }}
                disabled={loading}
              >
                {loading ? "Excluindo..." : "Excluir Permanentemente"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}