# 🏢 OpenLove - Sistema Administrativo, Business e Open Dates

## 📋 Índice

1. [Sistema Administrativo](#sistema-administrativo)
2. [Dashboard de Faturamento](#dashboard-de-faturamento)
3. [Open Dates (Match System)](#open-dates-match-system)
4. [Perfis Empresariais](#perfis-empresariais)
5. [Sistema de Créditos e Anúncios](#sistema-de-créditos-e-anúncios)
6. [Tipos de Contas Business](#tipos-de-contas-business)
7. [Marketplace de Conteúdo](#marketplace-de-conteúdo)
8. [Analytics para Empresas](#analytics-para-empresas)
9. [Implementação Técnica](#implementação-técnica)

---

## 🎛️ Sistema Administrativo

### 📊 Dashboard Principal

```typescript
interface AdminDashboard {
  // Métricas em tempo real
  realTimeMetrics: {
    activeUsers: number // Usuários online agora
    dailyActiveUsers: number // DAU
    monthlyActiveUsers: number // MAU
    newRegistrations: number // Hoje
    activeSubscriptions: number // Total ativo
  }
  
  // Financeiro
  financial: {
    monthlyRevenue: number // Receita do mês
    dailyRevenue: number // Receita hoje
    pendingPayments: number // Pagamentos pendentes
    chargebacks: number // Contestações
    creditsSold: number // Créditos vendidos hoje
  }
  
  // Moderação
  moderation: {
    pendingReports: number // Denúncias pendentes
    pendingVerifications: number // Verificações pendentes
    bannedToday: number // Banimentos hoje
    contentRemoved: number // Conteúdo removido
  }
}
```

### 🛠️ Funcionalidades Administrativas

#### 1. **Gestão de Usuários**
```typescript
// Painel de usuários
interface UserManagement {
  search: {
    byUsername: string
    byEmail: string
    byId: string
    byPhone: string
    byCPF: string // Apenas admins nivel 3
  }
  
  actions: {
    viewProfile: boolean
    editProfile: boolean
    suspendAccount: boolean
    banAccount: boolean
    resetPassword: boolean
    impersonate: boolean // Login como usuário
    viewPaymentHistory: boolean
    grantPremium: boolean
    removeVerification: boolean
  }
  
  bulkActions: {
    sendNotification: boolean
    grantCredits: boolean
    exportData: boolean
  }
}
```

#### 2. **Gestão Financeira**
```typescript
interface FinancialManagement {
  // Dashboard financeiro
  overview: {
    totalRevenue: number
    subscriptionRevenue: number
    creditsRevenue: number
    contentRevenue: number // Marketplace
    refunds: number
    netRevenue: number
  }
  
  // Relatórios
  reports: {
    daily: FinancialReport
    weekly: FinancialReport
    monthly: FinancialReport
    yearly: FinancialReport
    custom: (startDate: Date, endDate: Date) => FinancialReport
  }
  
  // Gestão de assinaturas
  subscriptions: {
    active: number
    cancelled: number
    expired: number
    trial: number
    churnRate: number
    averageLifetime: number
  }
  
  // Créditos
  credits: {
    totalSold: number
    totalUsed: number
    averagePurchase: number
    topBuyers: User[]
  }
}
```

#### 3. **Sistema de Moderação**
```typescript
interface ModerationSystem {
  // Fila de moderação
  queue: {
    reports: Report[] // Denúncias
    verifications: VerificationRequest[] // Verificações
    contents: FlaggedContent[] // Conteúdo suspeito
    appeals: Appeal[] // Apelações
  }
  
  // Ações
  actions: {
    approveContent: (id: string) => void
    removeContent: (id: string, reason: string) => void
    warnUser: (userId: string, reason: string) => void
    suspendUser: (userId: string, duration: number) => void
    banUser: (userId: string, reason: string) => void
    approveVerification: (id: string) => void
    rejectVerification: (id: string, reason: string) => void
  }
  
  // Auto moderação
  autoModeration: {
    enabled: boolean
    sensitivityLevel: 'low' | 'medium' | 'high'
    autoRemoveNudity: boolean
    autoRemoveViolence: boolean
    autoRemoveHateSpeech: boolean
  }
}
```

### 📈 Analytics Administrativo

```typescript
interface AdminAnalytics {
  // Crescimento
  growth: {
    userGrowthRate: number
    revenueGrowthRate: number
    engagementRate: number
    retentionRate: number
  }
  
  // Comportamento
  behavior: {
    averageSessionDuration: number
    averagePostsPerUser: number
    averageMessagesPerUser: number
    mostUsedFeatures: Feature[]
  }
  
  // Conversão
  conversion: {
    signupToSubscription: number
    freeToGold: number
    goldToDiamond: number
    trialConversion: number
  }
  
  // Geografico
  geographic: {
    usersByState: Record<string, number>
    revenueByState: Record<string, number>
    growthByRegion: Record<string, number>
  }
}
```

---

## 💰 Dashboard de Faturamento

### 📊 Visão Geral Financeira

```typescript
interface BillingDashboard {
  // Resumo do período
  summary: {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
    grossRevenue: number
    netRevenue: number
    taxes: number
    fees: {
      stripe: number
      abacatepay: number
      total: number
    }
  }
  
  // Breakdown por fonte
  revenueBreakdown: {
    subscriptions: {
      gold: { count: number, revenue: number }
      diamond: { count: number, revenue: number }
      couple: { count: number, revenue: number }
    }
    credits: {
      packages: CreditPackage[]
      totalSold: number
      revenue: number
    }
    marketplace: {
      contentSales: number
      commission: number
      revenue: number
    }
  }
  
  // Métricas importantes
  metrics: {
    arpu: number // Average Revenue Per User
    ltv: number // Lifetime Value
    cac: number // Customer Acquisition Cost
    mrr: number // Monthly Recurring Revenue
    arr: number // Annual Recurring Revenue
    churn: number // Taxa de cancelamento
  }
}
```

### 💳 Gestão de Pagamentos

```typescript
interface PaymentManagement {
  // Transações
  transactions: {
    pending: Transaction[]
    completed: Transaction[]
    failed: Transaction[]
    refunded: Transaction[]
  }
  
  // Ações
  actions: {
    refund: (transactionId: string, amount?: number) => Promise<void>
    retry: (transactionId: string) => Promise<void>
    cancel: (subscriptionId: string) => Promise<void>
    updatePaymentMethod: (userId: string) => Promise<void>
  }
  
  // Relatórios fiscais
  taxReports: {
    generateNF: (period: DateRange) => Promise<Buffer> // Nota fiscal
    generateDAS: (period: DateRange) => Promise<Buffer> // DAS
    exportTransactions: (period: DateRange) => Promise<CSV>
  }
}
```

---

## 💕 Open Dates (Match System)

### 🎯 Sistema de Match tipo Tinder

```typescript
interface OpenDatesSystem {
  // Perfil de dating
  datingProfile: {
    userId: string
    isActive: boolean
    
    // Preferências
    preferences: {
      ageRange: { min: number, max: number }
      distance: number // km
      genders: gender_type[]
      interests: string[]
      relationshipGoals: string[]
    }
    
    // Fotos específicas
    photos: {
      url: string
      isVerified: boolean
      order: number
    }[]
    
    // Bio curta
    bio: string // Max 500 chars
    prompts: {
      question: string
      answer: string
    }[]
  }
  
  // Sistema de swipe
  swipeSystem: {
    dailyLikes: number // Baseado no plano
    superLikes: number // Diamond tem mais
    rewind: boolean // Desfazer último swipe
    passport: boolean // Mudar localização (Diamond)
  }
  
  // Matches
  matches: {
    active: Match[]
    expired: Match[] // Sem interação em 30 dias
    blocked: string[] // IDs bloqueados
  }
}
```

### 💬 Interface do Open Dates

```typescript
// Componente principal
export function OpenDates() {
  const { user, features } = useAuth()
  const [profiles, setProfiles] = useState<DatingProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Limites por plano
  const swipeLimits = {
    free: 0, // Não tem acesso
    gold: 50, // 50 likes por dia
    diamond: 200, // 200 likes por dia
    couple: 0 // Casais não usam
  }
  
  // Super likes por mês
  const superLikeLimits = {
    free: 0,
    gold: 5,
    diamond: 20,
    couple: 0
  }
  
  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (direction === 'right' || direction === 'super') {
      await createLike(profiles[currentIndex].userId, direction === 'super')
      
      // Verificar match
      const isMatch = await checkMatch(profiles[currentIndex].userId)
      if (isMatch) {
        showMatchAnimation()
        createConversation(profiles[currentIndex].userId)
      }
    }
    
    setCurrentIndex(prev => prev + 1)
  }
  
  return (
    <div className="open-dates-container">
      <SwipeableCards 
        profiles={profiles}
        onSwipe={handleSwipe}
        currentIndex={currentIndex}
      />
      
      <div className="action-buttons">
        <button onClick={() => handleSwipe('left')}>
          <X className="text-red-500" />
        </button>
        
        {features.canUseSuperLike && (
          <button onClick={() => handleSwipe('super')}>
            <Star className="text-blue-500" />
          </button>
        )}
        
        <button onClick={() => handleSwipe('right')}>
          <Heart className="text-green-500" />
        </button>
      </div>
    </div>
  )
}
```

### 🎯 Algoritmo de Recomendação para Dating

```typescript
interface DatingAlgorithm {
  // Fatores de compatibilidade
  factors: {
    ageCompatibility: 0.15,
    locationProximity: 0.20,
    commonInterests: 0.25,
    activityLevel: 0.10,
    attractiveness: 0.15, // Baseado em likes recebidos
    relationshipGoals: 0.15
  }
  
  // Filtros obrigatórios
  filters: {
    age: boolean
    distance: boolean
    gender: boolean
    blockedUsers: boolean
  }
  
  // Boost de visibilidade
  boosts: {
    newUser: 1.5, // Novos usuários
    premiumUser: 1.3, // Usuários premium
    completeProfile: 1.2, // Perfil completo
    recentlyActive: 1.1 // Ativo recentemente
  }
}
```

---

## 🏢 Perfis Empresariais

### 🎭 Tipos de Perfis Business

```typescript
enum BusinessType {
  VENUE = 'venue', // Baladas, bares, restaurantes
  CONTENT_CREATOR = 'content_creator', // Criadores de conteúdo
  SERVICE_PROVIDER = 'service_provider', // Fotógrafos, DJs
  EVENT_ORGANIZER = 'event_organizer', // Produtoras de eventos
  BRAND = 'brand', // Marcas e produtos
  INFLUENCER = 'influencer' // Influenciadores verificados
}

interface BusinessProfile {
  // Identificação
  id: string
  businessType: BusinessType
  businessName: string
  cnpj?: string // Opcional
  
  // Informações
  description: string
  category: string
  subcategories: string[]
  
  // Localização (para venues)
  address?: {
    street: string
    number: string
    city: string
    state: string
    zipCode: string
    coordinates: { lat: number, lng: number }
  }
  
  // Horários (para venues)
  businessHours?: {
    [key: string]: { open: string, close: string }
  }
  
  // Contato
  contact: {
    phone: string
    whatsapp: string
    email: string
    website?: string
    instagram?: string
  }
  
  // Verificação
  isVerified: boolean
  verificationDate?: Date
  verificationDocuments?: string[]
  
  // Recursos
  features: {
    canSellContent: boolean
    canCreateEvents: boolean
    canAdvertise: boolean
    canHaveStore: boolean
    maxProducts: number
    maxEvents: number
  }
  
  // Financeiro
  billing: {
    creditBalance: number
    totalSpent: number
    paymentMethods: PaymentMethod[]
  }
}
```

### 🎪 Dashboard para Venues (Baladas, Bares, etc)

```typescript
interface VenueDashboard {
  // Overview
  overview: {
    profileViews: number
    eventViews: number
    ticketsSold: number
    revenue: number
    upcomingEvents: Event[]
  }
  
  // Gestão de eventos
  eventManagement: {
    create: () => void
    edit: (eventId: string) => void
    cancel: (eventId: string) => void
    duplicate: (eventId: string) => void
    
    // Lista de convidados
    guestList: {
      add: (userId: string) => void
      remove: (userId: string) => void
      import: (file: File) => void
      export: () => CSV
    }
    
    // Ingressos
    ticketing: {
      types: TicketType[]
      pricing: PricingRule[]
      capacity: number
      sold: number
      checkIn: (ticketId: string) => void
    }
  }
  
  // Promoções
  promotions: {
    create: (promo: Promotion) => void
    active: Promotion[]
    schedule: (promo: Promotion, date: Date) => void
  }
  
  // Analytics
  analytics: {
    demographics: {
      age: Record<string, number>
      gender: Record<string, number>
      location: Record<string, number>
    }
    peakTimes: Hour[]
    conversionRate: number
    repeatCustomers: number
  }
}
```

### 👙 Dashboard para Criadores de Conteúdo

```typescript
interface ContentCreatorDashboard {
  // Loja de conteúdo
  contentStore: {
    // Upload de conteúdo
    upload: {
      photos: (files: File[]) => void
      videos: (files: File[]) => void
      albums: (album: Album) => void
    }
    
    // Precificação
    pricing: {
      individual: number
      album: number
      subscription: {
        monthly: number
        quarterly: number
        annual: number
      }
    }
    
    // Gestão
    content: {
      published: Content[]
      drafts: Content[]
      scheduled: Content[]
      stats: {
        views: number
        purchases: number
        revenue: number
      }
    }
  }
  
  // Assinantes
  subscribers: {
    total: number
    active: number
    revenue: number
    churn: number
    
    // Gestão
    list: Subscriber[]
    message: (subscriberId: string) => void
    gift: (subscriberId: string, content: Content) => void
  }
  
  // Live streaming (futuro)
  streaming: {
    schedule: (stream: Stream) => void
    start: () => void
    viewers: number
    tips: number
  }
  
  // Vendas
  sales: {
    today: number
    month: number
    topContent: Content[]
    conversionRate: number
  }
}
```

---

## 💳 Sistema de Créditos e Anúncios

### 🪙 Pacotes de Créditos

```typescript
interface CreditPackages {
  starter: {
    credits: 100,
    price: 50.00,
    bonus: 0
  },
  business: {
    credits: 500,
    price: 200.00,
    bonus: 50 // +10%
  },
  professional: {
    credits: 1000,
    price: 350.00,
    bonus: 150 // +15%
  },
  enterprise: {
    credits: 5000,
    price: 1500.00,
    bonus: 1000 // +20%
  }
}

// Custos por ação
interface CreditCosts {
  // Anúncios
  timelineAd: 10, // Por 1000 impressões
  sidebarAd: 5, // Por 1000 impressões
  storyAd: 15, // Por 1000 views
  
  // Promoções
  eventBoost: 50, // Destacar evento por 24h
  profileBoost: 30, // Destacar perfil por 24h
  
  // Funcionalidades
  bulkMessage: 1, // Por destinatário
  analytics: 100, // Relatório mensal detalhado
  verificationFast: 200 // Verificação expressa
}
```

### 📢 Sistema de Anúncios Empresariais

```typescript
interface BusinessAdvertising {
  // Criação de campanha
  campaign: {
    name: string
    objective: 'awareness' | 'traffic' | 'conversion' | 'engagement'
    budget: {
      total: number // Em créditos
      daily: number // Limite diário
    }
    schedule: {
      startDate: Date
      endDate: Date
      hours?: number[] // Horários específicos
    }
  }
  
  // Formatos de anúncio
  formats: {
    timeline: {
      title: string
      description: string
      media: string
      cta: {
        text: string
        url: string
      }
      placement: 'timeline'
    },
    sidebar: {
      banner: string // 300x250
      url: string
      placement: 'sidebar'
    },
    story: {
      media: string // Vertical
      url: string
      duration: number // 5-15 segundos
      placement: 'stories'
    }
  }
  
  // Segmentação
  targeting: {
    demographics: {
      age: { min: number, max: number }
      gender: gender_type[]
      location: {
        cities?: string[]
        states?: string[]
        radius?: number // km do estabelecimento
      }
    }
    interests: string[]
    behaviors: {
      frequentUsers: boolean
      premiumUsers: boolean
      eventGoers: boolean
    }
  }
  
  // Métricas
  metrics: {
    impressions: number
    clicks: number
    ctr: number // Click-through rate
    spent: number // Créditos gastos
    conversions: number
    roi: number
  }
}
```

### 🎯 Dashboard de Campanhas

```typescript
export function CampaignDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  
  return (
    <div className="campaign-dashboard">
      {/* Overview */}
      <div className="overview-cards">
        <Card>
          <h3>Créditos Disponíveis</h3>
          <p className="text-3xl">{user.creditBalance}</p>
          <Button onClick={openCreditPurchase}>Comprar Mais</Button>
        </Card>
        
        <Card>
          <h3>Campanhas Ativas</h3>
          <p className="text-3xl">{campaigns.filter(c => c.status === 'active').length}</p>
        </Card>
        
        <Card>
          <h3>Alcance Total</h3>
          <p className="text-3xl">{formatNumber(totalReach)}</p>
        </Card>
        
        <Card>
          <h3>Taxa de Conversão</h3>
          <p className="text-3xl">{conversionRate}%</p>
        </Card>
      </div>
      
      {/* Lista de campanhas */}
      <div className="campaigns-list">
        {campaigns.map(campaign => (
          <CampaignCard 
            key={campaign.id}
            campaign={campaign}
            onClick={() => setSelectedCampaign(campaign)}
          />
        ))}
      </div>
      
      {/* Detalhes da campanha */}
      {selectedCampaign && (
        <CampaignDetails 
          campaign={selectedCampaign}
          onEdit={handleEdit}
          onPause={handlePause}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
```

---

## 🏪 Marketplace de Conteúdo

### 💰 Sistema de Vendas

```typescript
interface ContentMarketplace {
  // Tipos de conteúdo
  contentTypes: {
    photos: {
      single: { minPrice: 5.00, maxPrice: 100.00 }
      album: { minPrice: 20.00, maxPrice: 500.00 }
    }
    videos: {
      short: { minPrice: 10.00, maxPrice: 200.00 } // < 5 min
      medium: { minPrice: 25.00, maxPrice: 500.00 } // 5-15 min
      long: { minPrice: 50.00, maxPrice: 1000.00 } // > 15 min
    }
    live: {
      private: { perMinute: 5.00 }
      group: { perViewer: 10.00 }
    }
    custom: {
      photo: { basePrice: 50.00 }
      video: { basePrice: 100.00 }
    }
  }
  
  // Comissões da plataforma
  commissions: {
    standard: 0.20, // 20%
    verified: 0.15, // 15% para verificados
    premium: 0.10, // 10% para premium creators
  }
  
  // Sistema de pagamento
  payouts: {
    minimum: 50.00, // Valor mínimo para saque
    frequency: 'weekly' | 'biweekly' | 'monthly',
    methods: ['bank_transfer', 'pix'],
    automaticPayout: boolean
  }
}
```

### 📸 Gestão de Conteúdo Pago

```typescript
interface PaidContent {
  id: string
  creatorId: string
  
  // Detalhes
  title: string
  description: string
  tags: string[]
  category: 'artistic' | 'sensual' | 'fitness' | 'lifestyle' | 'educational'
  
  // Mídia
  preview: {
    thumbnail: string
    watermarked: boolean
    blurred: boolean
  }
  content: {
    urls: string[]
    type: 'photo' | 'video' | 'album'
    duration?: number // Para vídeos
    count?: number // Para álbuns
  }
  
  // Preço e vendas
  pricing: {
    price: number
    currency: string
    discount?: {
      percentage: number
      validUntil: Date
    }
  }
  sales: {
    total: number
    revenue: number
    buyers: string[] // IDs dos compradores
  }
  
  // Configurações
  settings: {
    allowComments: boolean
    allowRatings: boolean
    exclusive: boolean // Conteúdo exclusivo
    expiresAt?: Date // Conteúdo temporário
  }
}
```

---

## 📊 Analytics para Empresas

### 📈 Métricas Detalhadas

```typescript
interface BusinessAnalytics {
  // Visão geral
  overview: {
    period: DateRange
    metrics: {
      profileViews: number
      uniqueVisitors: number
      engagement: number
      conversion: number
      revenue: number
    }
  }
  
  // Demografia
  demographics: {
    age: ChartData
    gender: ChartData
    location: MapData
    interests: CloudData
  }
  
  // Comportamento
  behavior: {
    peakHours: HeatmapData
    deviceTypes: PieData
    trafficSources: SourceData
    userJourney: FlowData
  }
  
  // Vendas (para content creators)
  sales: {
    byContent: ContentSales[]
    byTime: TimeSeriesData
    byCategory: CategoryData
    topBuyers: Customer[]
    ltv: number // Lifetime value
  }
  
  // Eventos (para venues)
  events: {
    attendance: number
    noShowRate: number
    repeatAttendees: number
    averageSpend: number
    satisfaction: number
  }
  
  // Comparação com concorrência
  competitive: {
    marketShare: number
    growthRate: number
    positioning: RadarData
  }
}
```

### 📊 Relatórios Personalizados

```typescript
interface CustomReports {
  // Templates disponíveis
  templates: {
    monthly: 'Relatório Mensal Completo',
    sales: 'Análise de Vendas',
    audience: 'Perfil de Audiência',
    campaign: 'Performance de Campanhas',
    competitive: 'Análise Competitiva'
  }
  
  // Gerador de relatórios
  generator: {
    selectMetrics: Metric[]
    selectPeriod: DateRange
    selectFormat: 'pdf' | 'excel' | 'powerpoint'
    addComparison: boolean
    addProjections: boolean
    schedule: 'once' | 'weekly' | 'monthly'
  }
  
  // Insights automáticos
  insights: {
    opportunities: Insight[]
    warnings: Alert[]
    recommendations: Recommendation[]
  }
}
```

---

## 🔧 Implementação Técnica

### 🗄️ Novas Tabelas do Banco de Dados

```sql
-- Tabela de tipos de conta
CREATE TYPE account_type AS ENUM ('personal', 'business');
CREATE TYPE business_type AS ENUM ('venue', 'content_creator', 'service_provider', 'event_organizer', 'brand', 'influencer');

-- Atualizar tabela users
ALTER TABLE users ADD COLUMN account_type account_type DEFAULT 'personal';
ALTER TABLE users ADD COLUMN business_id UUID REFERENCES businesses(id);

-- Tabela de empresas
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Identificação
    business_type business_type NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18),
    
    -- Informações
    description TEXT,
    category VARCHAR(100),
    subcategories TEXT[] DEFAULT '{}',
    
    -- Localização
    address JSONB,
    coordinates POINT,
    business_hours JSONB,
    
    -- Contato
    contact JSONB NOT NULL,
    social_links JSONB,
    
    -- Verificação
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_documents TEXT[],
    
    -- Créditos
    credit_balance INTEGER DEFAULT 0,
    total_credits_purchased INTEGER DEFAULT 0,
    total_credits_spent INTEGER DEFAULT 0,
    
    -- Configurações
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de créditos
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Transação
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'spend', 'refund', 'bonus')),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    
    -- Detalhes
    description TEXT,
    reference_id UUID, -- ID do anúncio, campanha, etc
    reference_type VARCHAR(50),
    
    -- Pagamento (se for compra)
    payment_method payment_method,
    payment_amount DECIMAL(10, 2),
    payment_status VARCHAR(20),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Open Dates
CREATE TABLE dating_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Preferências
    preferences JSONB NOT NULL DEFAULT '{
        "age_range": {"min": 18, "max": 99},
        "distance": 50,
        "genders": [],
        "interests": [],
        "relationship_goals": []
    }',
    
    -- Perfil
    bio TEXT,
    prompts JSONB DEFAULT '[]',
    photos JSONB DEFAULT '[]',
    
    -- Limites
    daily_likes_used INTEGER DEFAULT 0,
    daily_super_likes_used INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    
    -- Localização
    current_location POINT,
    passport_location POINT, -- Diamond feature
    
    -- Stats
    stats JSONB DEFAULT '{"likes_given": 0, "likes_received": 0, "matches": 0}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de swipes/likes do Open Dates
CREATE TABLE dating_swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID REFERENCES users(id) ON DELETE CASCADE,
    swiped_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ação
    action VARCHAR(20) NOT NULL CHECK (action IN ('like', 'super_like', 'pass')),
    
    -- Match
    is_match BOOLEAN DEFAULT false,
    matched_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_swipe UNIQUE (swiper_id, swiped_id)
);

-- Tabela de matches
CREATE TABLE dating_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'unmatched')),
    
    -- Interação
    last_interaction TIMESTAMP WITH TIME ZONE,
    conversation_id UUID REFERENCES conversations(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    CONSTRAINT unique_match UNIQUE (user1_id, user2_id)
);

-- Tabela de conteúdo pago
CREATE TABLE paid_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id),
    
    -- Detalhes
    title VARCHAR(200) NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(50),
    
    -- Mídia
    preview_url TEXT NOT NULL,
    content_urls TEXT[] NOT NULL,
    content_type VARCHAR(20) CHECK (content_type IN ('photo', 'video', 'album')),
    duration INTEGER, -- Para vídeos em segundos
    item_count INTEGER, -- Para álbuns
    
    -- Preço
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    discount_percentage INTEGER,
    discount_valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Vendas
    sales_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    
    -- Configurações
    settings JSONB DEFAULT '{}',
    is_exclusive BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de compras de conteúdo
CREATE TABLE content_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES paid_content(id) ON DELETE CASCADE,
    
    -- Pagamento
    amount_paid DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    payment_method payment_method,
    
    -- Comissão
    platform_fee DECIMAL(10, 2),
    creator_revenue DECIMAL(10, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_purchase UNIQUE (buyer_id, content_id)
);

-- Tabela de campanhas de anúncios
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Detalhes
    name VARCHAR(200) NOT NULL,
    objective VARCHAR(50),
    
    -- Budget
    total_budget INTEGER NOT NULL, -- Em créditos
    daily_budget INTEGER,
    spent_credits INTEGER DEFAULT 0,
    
    -- Schedule
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    schedule_hours INTEGER[],
    
    -- Targeting
    targeting JSONB NOT NULL,
    
    -- Status
    status ad_status DEFAULT 'pending',
    
    -- Métricas
    metrics JSONB DEFAULT '{"impressions": 0, "clicks": 0, "conversions": 0}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de anúncios empresariais
CREATE TABLE business_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Formato
    format VARCHAR(20) CHECK (format IN ('timeline', 'sidebar', 'story')),
    
    -- Conteúdo
    content JSONB NOT NULL, -- Estrutura varia por formato
    
    -- Performance
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    credits_spent INTEGER DEFAULT 0,
    
    -- Status
    status ad_status DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de admin users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Níveis de acesso
    access_level INTEGER NOT NULL CHECK (access_level BETWEEN 1 AND 3),
    permissions JSONB NOT NULL DEFAULT '{}',
    
    -- Áreas
    departments TEXT[] DEFAULT '{}', -- ['financial', 'moderation', 'support', 'marketing']
    
    -- Auditoria
    last_login TIMESTAMP WITH TIME ZONE,
    actions_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs administrativos
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id),
    
    -- Ação
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    
    -- Detalhes
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_businesses_type ON businesses(business_type);
CREATE INDEX idx_businesses_verified ON businesses(is_verified) WHERE is_verified = true;
CREATE INDEX idx_dating_profiles_active ON dating_profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_dating_swipes_user ON dating_swipes(swiper_id, created_at DESC);
CREATE INDEX idx_dating_matches_users ON dating_matches(user1_id, user2_id);
CREATE INDEX idx_paid_content_creator ON paid_content(creator_id, status);
CREATE INDEX idx_content_purchases_buyer ON content_purchases(buyer_id);
CREATE INDEX idx_ad_campaigns_business ON ad_campaigns(business_id, status);
CREATE INDEX idx_business_ads_performance ON business_ads(impressions DESC);

-- Triggers para Open Dates
CREATE OR REPLACE FUNCTION check_dating_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se é um match mútuo
    IF NEW.action IN ('like', 'super_like') THEN
        IF EXISTS (
            SELECT 1 FROM dating_swipes 
            WHERE swiper_id = NEW.swiped_id 
            AND swiped_id = NEW.swiper_id
            AND action IN ('like', 'super_like')
        ) THEN
            -- Criar match
            INSERT INTO dating_matches (user1_id, user2_id)
            VALUES (
                LEAST(NEW.swiper_id, NEW.swiped_id),
                GREATEST(NEW.swiper_id, NEW.swiped_id)
            );
            
            -- Atualizar ambos os swipes
            UPDATE dating_swipes 
            SET is_match = true, matched_at = NOW()
            WHERE (swiper_id = NEW.swiper_id AND swiped_id = NEW.swiped_id)
               OR (swiper_id = NEW.swiped_id AND swiped_id = NEW.swiper_id);
            
            -- Criar conversa automaticamente
            -- ... código para criar conversa
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_dating_match
AFTER INSERT ON dating_swipes
FOR EACH ROW EXECUTE FUNCTION check_dating_match();

-- Trigger para resetar likes diários
CREATE OR REPLACE FUNCTION reset_daily_dating_limits()
RETURNS void AS $$
BEGIN
    UPDATE dating_profiles 
    SET 
        daily_likes_used = 0,
        daily_super_likes_used = 0,
        last_reset_date = CURRENT_DATE
    WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Políticas RLS para business
CREATE POLICY "Business owners can manage their business" ON businesses
    FOR ALL USING (owner_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "View active business ads" ON business_ads
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can purchase content" ON content_purchases
    FOR INSERT WITH CHECK (buyer_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Função para calcular comissões
CREATE OR REPLACE FUNCTION calculate_content_commission(
    creator_id UUID,
    amount DECIMAL
) RETURNS TABLE (
    platform_fee DECIMAL,
    creator_revenue DECIMAL
) AS $$
DECLARE
    commission_rate DECIMAL;
BEGIN
    -- Determinar taxa de comissão
    SELECT CASE
        WHEN u.is_verified AND b.is_verified THEN 0.10  -- 10% para criadores verificados
        WHEN u.is_verified OR b.is_verified THEN 0.15   -- 15% para parcialmente verificados
        ELSE 0.20                                        -- 20% padrão
    END INTO commission_rate
    FROM users u
    LEFT JOIN businesses b ON u.business_id = b.id
    WHERE u.id = creator_id;
    
    platform_fee := amount * commission_rate;
    creator_revenue := amount - platform_fee;
    
    RETURN QUERY SELECT platform_fee, creator_revenue;
END;
$$ LANGUAGE plpgsql;
```

### 🎛️ Interface Administrativa

```typescript
// Admin Dashboard Principal
export function AdminDashboard() {
  const { user, permissions } = useAdmin()
  const [metrics, setMetrics] = useState<AdminMetrics>()
  
  // Verificar permissões
  if (!permissions.canAccessAdmin) {
    return <Unauthorized />
  }
  
  return (
    <div className="admin-dashboard">
      {/* Navegação */}
      <AdminSidebar permissions={permissions} />
      
      {/* Conteúdo Principal */}
      <div className="admin-content">
        {/* Métricas em tempo real */}
        <div className="realtime-metrics">
          <MetricCard
            title="Usuários Online"
            value={metrics?.activeUsers}
            change={metrics?.activeUsersChange}
            icon={<Users />}
          />
          
          <MetricCard
            title="Receita Hoje"
            value={formatCurrency(metrics?.dailyRevenue)}
            change={metrics?.revenueChange}
            icon={<DollarSign />}
          />
          
          <MetricCard
            title="Novos Cadastros"
            value={metrics?.newRegistrations}
            change={metrics?.registrationsChange}
            icon={<UserPlus />}
          />
          
          <MetricCard
            title="Denúncias Pendentes"
            value={metrics?.pendingReports}
            urgent={metrics?.pendingReports > 10}
            icon={<AlertTriangle />}
          />
        </div>
        
        {/* Gráficos */}
        <div className="admin-charts">
          <RevenueChart period="monthly" />
          <UserGrowthChart period="weekly" />
          <EngagementChart />
          <GeographicMap />
        </div>
        
        {/* Ações Rápidas */}
        <div className="quick-actions">
          <Button onClick={() => navigate('/admin/users')}>
            Gerenciar Usuários
          </Button>
          
          <Button onClick={() => navigate('/admin/moderation')}>
            Fila de Moderação
          </Button>
          
          <Button onClick={() => navigate('/admin/financeiro')}>
            Dashboard Financeiro
          </Button>
          
          <Button onClick={() => navigate('/admin/businesses')}>
            Empresas e Criadores
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

Este sistema completo adiciona todas as funcionalidades administrativas, Open Dates estilo Tinder, perfis empresariais com sistema de créditos e marketplace de conteúdo. O sistema está preparado para diferentes tipos de negócios na plataforma, desde baladas até criadores de conteúdo, com dashboards específicos e ferramentas de monetização.

As principais adições incluem:

1. **Painel Administrativo Completo** com gestão financeira, moderação e analytics
2. **Open Dates** com sistema de match tipo Tinder
3. **Perfis Empresariais** para venues, criadores de conteúdo, etc
4. **Sistema de Créditos** para anúncios e promoções
5. **Marketplace** para venda de conteúdo
6. **Analytics Avançado** para empresas
7. **Gestão de Campanhas** publicitárias

Tudo integrado com o sistema de planos existente e com políticas de segurança robustas!