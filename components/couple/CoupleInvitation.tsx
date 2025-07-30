"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Heart, 
  Send, 
  UserPlus, 
  Mail, 
  MessageCircle,
  Check,
  X,
  Calendar,
  MapPin,
  Camera,
  Sparkles,
  Crown,
  Gem,
  Clock,
  AlertCircle,
  Copy,
  Share2
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface CoupleInvitation {
  id: string
  from_user_id: string
  to_user_id?: string
  to_email?: string
  to_phone?: string
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
  from_user: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
}

interface CoupleInvitationProps {
  onInvitationSent?: () => void
  onInvitationAccepted?: () => void
}

export function CoupleInvitation({ onInvitationSent, onInvitationAccepted }: CoupleInvitationProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'send' | 'received' | 'pending'>('send')
  const [loading, setLoading] = useState(false)
  
  // Send invitation state
  const [inviteMethod, setInviteMethod] = useState<'username' | 'email' | 'phone'>('username')
  const [invitationForm, setInvitationForm] = useState({
    username: '',
    email: '',
    phone: '',
    message: 'Oi! Gostaria que você fosse meu(a) parceiro(a) no OpenLove. Vamos criar um perfil de casal juntos? 💕'
  })
  
  // Mock data - replace with real API calls
  const [pendingInvitations] = useState<CoupleInvitation[]>([
    {
      id: '1',
      from_user_id: user?.id || '',
      to_email: 'partner@example.com',
      message: 'Vamos ser um casal no OpenLove?',
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      from_user: {
        id: user?.id || '',
        username: user?.username || '',
        full_name: user?.full_name || '',
        avatar_url: user?.avatar_url || ''
      }
    }
  ])
  
  const [receivedInvitations] = useState<CoupleInvitation[]>([])

  const sendInvitation = async () => {
    setLoading(true)
    try {
      // Validate form
      if (inviteMethod === 'username' && !invitationForm.username) {
        toast.error('Digite o nome de usuário')
        return
      }
      if (inviteMethod === 'email' && !invitationForm.email) {
        toast.error('Digite o email')
        return
      }
      if (inviteMethod === 'phone' && !invitationForm.phone) {
        toast.error('Digite o telefone')
        return
      }
      if (!invitationForm.message) {
        toast.error('Escreva uma mensagem')
        return
      }

      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Convite enviado com sucesso!')
      setInvitationForm({
        username: '',
        email: '',
        phone: '',
        message: 'Oi! Gostaria que você fosse meu(a) parceiro(a) no OpenLove. Vamos criar um perfil de casal juntos? 💕'
      })
      setActiveTab('pending')
      onInvitationSent?.()
    } catch (error) {
      toast.error('Erro ao enviar convite')
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async (invitationId: string) => {
    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Convite aceito! Vocês agora são um casal no OpenLove! 💕')
      onInvitationAccepted?.()
    } catch (error) {
      toast.error('Erro ao aceitar convite')
    } finally {
      setLoading(false)
    }
  }

  const declineInvitation = async (invitationId: string) => {
    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Convite recusado')
    } catch (error) {
      toast.error('Erro ao recusar convite')
    } finally {
      setLoading(false)
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Convite cancelado')
    } catch (error) {
      toast.error('Erro ao cancelar convite')
    } finally {
      setLoading(false)
    }
  }

  const copyInviteLink = async (invitationId: string) => {
    const link = `${window.location.origin}/couple/invite/${invitationId}`
    await navigator.clipboard.writeText(link)
    toast.success('Link copiado!')
  }

  const shareInvitation = (invitationId: string) => {
    const link = `${window.location.origin}/couple/invite/${invitationId}`
    const text = `${user?.full_name || user?.username} quer ser seu(a) parceiro(a) no OpenLove! 💕`
    
    if (navigator.share) {
      navigator.share({
        title: 'Convite de Casal - OpenLove',
        text: text,
        url: link
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${text}\n${link}`)
      toast.success('Link copiado!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200 dark:border-pink-800 rounded-3xl p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-6 h-6 text-pink-500" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Plano Couple
          </h1>
          <Badge className="bg-pink-500 text-white">
            <Heart className="w-3 h-3 mr-1" />
            R$ 69,90/mês
          </Badge>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Convidar alguém especial para criar um perfil de casal no OpenLove
        </p>
        
        {/* Benefits */}
        <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-purple-500" />
            <span>Todos os recursos Diamond para 2 pessoas</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-pink-500" />
            <span>Álbum privado compartilhado</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span>Diário do relacionamento</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Jogos para casais</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6">
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'send'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar Convite</span>
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'received'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Recebidos</span>
            {receivedInvitations.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {receivedInvitations.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Pendentes</span>
            {pendingInvitations.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingInvitations.length}
              </Badge>
            )}
          </button>
        </div>

        {/* Send Invitation Tab */}
        {activeTab === 'send' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Invitation Method */}
            <div>
              <Label className="text-base font-medium mb-3 block">Como você quer convidar?</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setInviteMethod('username')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    inviteMethod === 'username'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                  }`}
                >
                  <UserPlus className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                  <span className="text-sm">Username</span>
                </button>
                <button
                  onClick={() => setInviteMethod('email')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    inviteMethod === 'email'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                  }`}
                >
                  <Mail className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                  <span className="text-sm">Email</span>
                </button>
                <button
                  onClick={() => setInviteMethod('phone')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    inviteMethod === 'phone'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                  }`}
                >
                  <MessageCircle className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                  <span className="text-sm">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {inviteMethod === 'username' && (
                <div>
                  <Label htmlFor="username">Nome de usuário do seu parceiro(a)</Label>
                  <Input
                    id="username"
                    placeholder="@usuario"
                    value={invitationForm.username}
                    onChange={(e) => setInvitationForm({...invitationForm, username: e.target.value})}
                    className="mt-2"
                  />
                </div>
              )}
              
              {inviteMethod === 'email' && (
                <div>
                  <Label htmlFor="email">Email do seu parceiro(a)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="parceiro@email.com"
                    value={invitationForm.email}
                    onChange={(e) => setInvitationForm({...invitationForm, email: e.target.value})}
                    className="mt-2"
                  />
                </div>
              )}
              
              {inviteMethod === 'phone' && (
                <div>
                  <Label htmlFor="phone">WhatsApp do seu parceiro(a)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+55 11 99999-9999"
                    value={invitationForm.phone}
                    onChange={(e) => setInvitationForm({...invitationForm, phone: e.target.value})}
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="message">Mensagem personalizada</Label>
                <Textarea
                  id="message"
                  placeholder="Escreva uma mensagem carinhosa para seu convite..."
                  value={invitationForm.message}
                  onChange={(e) => setInvitationForm({...invitationForm, message: e.target.value})}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={sendInvitation}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </motion.div>
        )}

        {/* Received Invitations Tab */}
        {activeTab === 'received' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {receivedInvitations.length > 0 ? (
              receivedInvitations.map((invitation) => (
                <Card key={invitation.id} className="border-pink-200 dark:border-pink-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={invitation.from_user.avatar_url} />
                        <AvatarFallback>
                          {invitation.from_user.full_name?.charAt(0) || invitation.from_user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{invitation.from_user.full_name || invitation.from_user.username}</h3>
                          <Badge variant="outline">@{invitation.from_user.username}</Badge>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {invitation.message}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Calendar className="w-3 h-3" />
                          <span>Expira em {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => acceptInvitation(invitation.id)}
                            disabled={loading}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aceitar
                          </Button>
                          <Button
                            onClick={() => declineInvitation(invitation.id)}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhum convite recebido ainda</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Pending Invitations Tab */}
        {activeTab === 'pending' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {pendingInvitations.length > 0 ? (
              pendingInvitations.map((invitation) => (
                <Card key={invitation.id} className="border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <h3 className="font-semibold">Convite Pendente</h3>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {invitation.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Enviado para: {invitation.to_email || invitation.to_phone || `@${invitation.to_user_id}`}
                        </p>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {invitation.message}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Calendar className="w-3 h-3" />
                          <span>Expira em {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => copyInviteLink(invitation.id)}
                            size="sm"
                            variant="outline"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar Link
                          </Button>
                          <Button
                            onClick={() => shareInvitation(invitation.id)}
                            size="sm"
                            variant="outline"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Compartilhar
                          </Button>
                          <Button
                            onClick={() => cancelInvitation(invitation.id)}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhum convite pendente</p>
                <Button
                  onClick={() => setActiveTab('send')}
                  className="mt-4"
                  variant="outline"
                >
                  Enviar primeiro convite
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Como funciona o Plano Couple
            </h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Apenas um de vocês precisa pagar a assinatura</li>
              <li>• Ambos recebem todos os benefícios Diamond</li>
              <li>• Recursos exclusivos: álbum, diário e jogos para casais</li>
              <li>• Convites expiram em 7 dias</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}