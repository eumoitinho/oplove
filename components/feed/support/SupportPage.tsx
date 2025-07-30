"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  ExternalLink,
  Send,
  Headphones,
  Shield,
  CreditCard,
  Users,
  Settings,
  Bug,
  Lightbulb,
  Crown,
  Gem,
  Heart
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { toast } from "sonner"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

interface SupportTicket {
  id: string
  subject: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "pending" | "resolved" | "closed"
  created_at: string
  updated_at: string
  messages: {
    id: string
    content: string
    author: "user" | "support"
    created_at: string
  }[]
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "Como faço upgrade para um plano premium?",
    answer: "Vá até a seção 'Planos Premium' na sidebar ou acesse Configurações > Assinatura. Escolha o plano que melhor se adequa às suas necessidades e siga as instruções de pagamento.",
    category: "pagamento",
    tags: ["upgrade", "premium", "planos", "pagamento"]
  },
  {
    id: "2",
    question: "Por que não consigo enviar mensagens?",
    answer: "No plano gratuito, você só pode responder mensagens de usuários premium. Para enviar mensagens livremente, considere fazer upgrade para o plano Gold ou superior.",
    category: "mensagens",
    tags: ["mensagens", "plano gratuito", "limitações"]
  },
  {
    id: "3",
    question: "Como verificar minha conta?",
    answer: "Acesse Configurações > Segurança e clique em 'Iniciar verificação'. Você precisará enviar um documento oficial com foto e uma selfie. O processo leva até 48 horas.",
    category: "verificacao",
    tags: ["verificação", "identidade", "documentos"]
  },
  {
    id: "4",
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim! Acesse Configurações > Assinatura e clique em 'Cancelar Assinatura'. Você manterá acesso aos recursos premium até o fim do período pago.",
    category: "pagamento",
    tags: ["cancelamento", "assinatura", "reembolso"]
  },
  {
    id: "5",
    question: "Quantas fotos posso enviar por mês?",
    answer: "Plano gratuito: 3 fotos/mês. Gold: 20-50 fotos (dependendo da verificação). Diamond: ilimitado. Couple: ilimitado.",
    category: "limites",
    tags: ["fotos", "limites", "planos"]
  }
]

export function SupportPage() {
  const { user } = useAuth()
  const features = usePremiumFeatures()
  
  const [activeTab, setActiveTab] = useState("faq")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(false)
  
  // Support ticket form
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "medium" as const,
    description: ""
  })
  
  // Contact form
  const [contactForm, setContactForm] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    subject: "",
    message: ""
  })

  const [tickets, setTickets] = useState<SupportTicket[]>([])

  // Get priority levels based on plan
  const getPriorityOptions = () => {
    const basePriorities = [
      { value: "low", label: "Baixa", description: "Resposta em até 72h" },
      { value: "medium", label: "Média", description: "Resposta em até 24h" }
    ]

    if (user?.premium_type === 'gold') {
      basePriorities.push({ value: "high", label: "Alta", description: "Resposta em até 8h" })
    }

    if (['diamond', 'couple'].includes(user?.premium_type || '')) {
      basePriorities.push(
        { value: "high", label: "Alta", description: "Resposta em até 8h" },
        { value: "urgent", label: "Urgente", description: "Resposta em até 2h" }
      )
    }

    return basePriorities
  }

  const getSupportChannels = () => {
    const channels = [
      {
        icon: MessageCircle,
        name: "Chat ao Vivo",
        description: "Disponível 9h às 18h",
        available: ['diamond', 'couple'].includes(user?.premium_type || ''),
        restricted: !['diamond', 'couple'].includes(user?.premium_type || '')
      },
      {
        icon: Phone,
        name: "WhatsApp",
        description: "(41) 99503-4442",
        available: true,
        restricted: false
      },
      {
        icon: Mail,
        name: "Email",
        description: "suporte@openlove.com.br",
        available: true,
        restricted: false
      }
    ]

    return channels
  }

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)
    
    try {
      // TODO: Implement real ticket creation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newTicket: SupportTicket = {
        id: Date.now().toString(),
        subject: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [{
          id: "1",
          content: ticketForm.description,
          author: "user",
          created_at: new Date().toISOString()
        }]
      }
      
      setTickets(prev => [newTicket, ...prev])
      setTicketForm({ subject: "", category: "", priority: "medium", description: "" })
      
      toast.success("Ticket criado com sucesso! Nossa equipe entrará em contato em breve.")
    } catch (error) {
      toast.error("Erro ao criar ticket. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    try {
      // TODO: Implement real contact form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setContactForm({ name: "", email: "", subject: "", message: "" })
      toast.success("Mensagem enviada com sucesso!")
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.")
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: "bg-blue-500", label: "Aberto" },
      pending: { color: "bg-yellow-500", label: "Pendente" },
      resolved: { color: "bg-green-500", label: "Resolvido" },
      closed: { color: "bg-gray-500", label: "Fechado" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>
  }

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
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Central de Suporte</h1>
            <p className="text-gray-500 dark:text-white/60">
              Como podemos ajudar você hoje?
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getPlanBadge(user?.premium_type || 'free')}
            {user?.is_verified && (
              <Badge className="bg-blue-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Support Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold mb-4">Canais de Atendimento</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {getSupportChannels().map((channel, index) => {
            const Icon = channel.icon
            return (
              <Card key={index} className={`p-4 ${channel.restricted ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium">{channel.name}</h3>
                  {channel.restricted && (
                    <Badge variant="outline" className="text-xs">Premium</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {channel.description}
                </p>
                {channel.restricted && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Disponível para usuários Diamond e Couple
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "faq", label: "FAQ", icon: HelpCircle },
            { id: "ticket", label: "Abrir Ticket", icon: FileText },
            { id: "tickets", label: "Meus Tickets", icon: MessageCircle },
            { id: "contact", label: "Contato", icon: Mail }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por palavra-chave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="pagamento">Pagamento</SelectItem>
                  <SelectItem value="mensagens">Mensagens</SelectItem>
                  <SelectItem value="verificacao">Verificação</SelectItem>
                  <SelectItem value="limites">Limites</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQ.map((item) => (
                <Card key={item.id} className="p-4">
                  <h3 className="font-medium mb-2 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    {item.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 pl-6">
                    {item.answer}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3 pl-6">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
              
              {filteredFAQ.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma pergunta encontrada para sua busca.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Ticket Tab */}
        {activeTab === "ticket" && (
          <form onSubmit={handleTicketSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                  placeholder="Descreva brevemente o problema"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(value) => setTicketForm({...ticketForm, category: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnico"><Bug className="w-4 h-4 mr-2" />Problema Técnico</SelectItem>
                    <SelectItem value="pagamento"><CreditCard className="w-4 h-4 mr-2" />Pagamento</SelectItem>
                    <SelectItem value="conta"><Users className="w-4 h-4 mr-2" />Conta</SelectItem>
                    <SelectItem value="verificacao"><Shield className="w-4 h-4 mr-2" />Verificação</SelectItem>
                    <SelectItem value="sugestao"><Lightbulb className="w-4 h-4 mr-2" />Sugestão</SelectItem>
                    <SelectItem value="outro"><Settings className="w-4 h-4 mr-2" />Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={ticketForm.priority}
                onValueChange={(value: any) => setTicketForm({...ticketForm, priority: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getPriorityOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                placeholder="Descreva detalhadamente o problema ou solicitação"
                rows={5}
                className="mt-2"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Criando ticket..." : "Criar Ticket"}
            </Button>
          </form>
        )}

        {/* My Tickets Tab */}
        {activeTab === "tickets" && (
          <div className="space-y-4">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium mb-1">#{ticket.id} - {ticket.subject}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Criado em {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(ticket.status)}
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm">{ticket.messages[0]?.content}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      Última atualização: {new Date(ticket.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não possui tickets de suporte.</p>
                <Button
                  onClick={() => setActiveTab("ticket")}
                  className="mt-4"
                  variant="outline"
                >
                  Criar Primeiro Ticket
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-name">Nome</Label>
                <Input
                  id="contact-name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="contact-email">E-mail</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact-subject">Assunto</Label>
              <Input
                id="contact-subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="contact-message">Mensagem</Label>
              <Textarea
                id="contact-message"
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                rows={5}
                className="mt-2"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Enviando..." : "Enviar Mensagem"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}