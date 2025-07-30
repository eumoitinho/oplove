# 🌟 OpenLove - Documentação Completa e Detalhada v0.3.1

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Funcionalidades Implementadas](#funcionalidades-implementadas)
4. [Stack Tecnológica](#stack-tecnológica)
5. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
6. [Sistema de Autenticação](#sistema-de-autenticação)
7. [Sistema de Pagamentos](#sistema-de-pagamentos)
8. [Funcionalidades Premium](#funcionalidades-premium)
9. [Sistema de Posts e Timeline](#sistema-de-posts-e-timeline)
10. [Sistema de Chat e Mensagens](#sistema-de-chat-e-mensagens)
11. [Sistema de Notificações](#sistema-de-notificações)
12. [Sistema de Recomendações e IA](#sistema-de-recomendações-e-ia)
13. [Sistema de Eventos e Comunidades](#sistema-de-eventos-e-comunidades)
14. [Sistema de Verificação](#sistema-de-verificação)
15. [Sistema de Stories](#sistema-de-stories)
16. [Context Engineering](#context-engineering)
17. [Performance e Otimizações](#performance-e-otimizações)
18. [Segurança](#segurança)
19. [Deploy e Infraestrutura](#deploy-e-infraestrutura)
20. [Histórico de Desenvolvimento](#histórico-de-desenvolvimento)
21. [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

OpenLove é uma rede social moderna e completa focada em criar conexões afetivas e memórias significativas através de tecnologia de ponta e inteligência artificial. O projeto está atualmente na versão **0.3.1-alpha** e possui funcionalidades comparáveis às principais redes sociais do mercado.

### 🎨 Conceito Principal

- **Missão**: Conectar pessoas através do amor e da tecnologia
- **Visão**: Ser a plataforma líder em relacionamentos autênticos e conexões significativas
- **Valores**: Autenticidade, Privacidade, Inovação, Inclusão

### 📊 Status Atual

- ✅ **MVP Completo**: Sistema funcional em produção
- ✅ **100% Real**: Sem dados mockados, todas as funcionalidades funcionam
- ✅ **Escalável**: Arquitetura preparada para milhares de usuários
- ✅ **Monetizado**: Sistema de assinaturas e pagamentos funcionando
- ✅ **Verificação de Identidade**: Sistema de verificação implementado

---

## 🏗️ Arquitetura do Sistema

### 📐 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   App Dir   │  │  Components  │  │   Hooks/Utils    │  │
│  │  (Routes)   │  │  (React/TS)  │  │  (Custom Logic)  │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Auth     │  │   Business   │  │    External      │  │
│  │  Endpoints  │  │    Logic     │  │  Integrations    │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Backend                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ PostgreSQL  │  │   Realtime   │  │    Storage       │  │
│  │  Database   │  │  WebSockets  │  │   (S3-like)      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Auth     │  │     RLS      │  │   Functions      │  │
│  │  (JWT)      │  │  (Security)  │  │  (Triggers)      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Stripe    │  │  AbacatePay  │  │    IBGE API      │  │
│  │  (Cartão)   │  │    (PIX)     │  │  (Localização)   │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 🔧 Padrões de Desenvolvimento

- **Component-Based**: Componentes React reutilizáveis
- **Type-Safe**: TypeScript com tipagem estrita
- **Server Components**: Uso de React Server Components quando possível
- **API Routes**: Endpoints RESTful padronizados
- **Database First**: Schema robusto com migrations versionadas
- **Security First**: RLS habilitado em todas as tabelas

---

## ✨ Funcionalidades Implementadas

### 📱 Funcionalidades Core

#### 1. **Sistema de Usuários**
- ✅ Registro com validação completa
- ✅ Login/Logout seguro
- ✅ Perfis detalhados com múltiplos campos
- ✅ Upload de avatar e capa
- ✅ Edição de perfil
- ✅ Sistema de username único
- ✅ Localização com coordenadas GPS
- ✅ Estatísticas de perfil em tempo real
- ✅ **Sistema de verificação de identidade**
- ✅ **Perfis de casal (Couple)**

#### 2. **Timeline e Posts**
- ✅ Criação de posts com múltiplas mídias
- ✅ Upload de imagens (limite por plano)
- ✅ Upload de vídeos (limite por plano)
- ✅ Gravação de áudio (Gold+)
- ✅ Sistema de enquetes (Gold+)
- ✅ **Stories (Diamond+)**
- ✅ Hashtags e menções
- ✅ Visibilidade configurável (público/amigos)
- ✅ Timeline com três abas (Todos/Seguindo/Para Você)
- ✅ Algoritmo de recomendação inteligente
- ✅ **Sistema de anúncios (Free/Gold)**

#### 3. **Interações Sociais**
- ✅ Sistema de likes/reações
- ✅ Comentários com threads (**requer verificação para Free**)
- ✅ Sistema de seguir/deixar de seguir
- ✅ Amizades automáticas (follow mútuo)
- ✅ Compartilhamento de posts
- ✅ Salvar posts favoritos
- ✅ Bloquear/denunciar usuários
- ✅ **Limitações sem verificação**

#### 4. **Chat e Mensagens**
- ✅ Conversas em tempo real (Gold+)
- ✅ Mensagens de texto, imagem, vídeo e áudio
- ✅ Indicadores de digitação
- ✅ Status de leitura
- ✅ Upload de arquivos com drag & drop
- ✅ Conversas em grupo
- ✅ Reações em mensagens
- ✅ Busca em conversas
- ✅ **Limite diário sem verificação (Gold)**

#### 5. **Sistema de Notificações**
- ✅ Notificações em tempo real
- ✅ Badge com contador
- ✅ Centro de notificações
- ✅ Configurações personalizáveis
- ✅ Horário silencioso
- ✅ Notificações por email (opcional)
- ✅ Marcar como lida/todas como lidas

#### 6. **Eventos e Comunidades**
- ✅ Criação de eventos com localização (Gold+)
- ✅ Sistema de participação (**Free pode participar se verificado**)
- ✅ Eventos online/presenciais
- ✅ Comunidades públicas/privadas (Gold+)
- ✅ Sistema de moderação
- ✅ Badges de verificação
- ✅ Filtros por localização e categoria
- ✅ **Free não participa de comunidades**

#### 7. **Sistema de Busca**
- ✅ Busca de usuários
- ✅ Busca por hashtags
- ✅ Busca por localização (**requer verificação para Free**)
- ✅ Busca avançada com filtros
- ✅ Sugestões de busca

#### 8. **Chamadas e Videochamadas**
- ✅ Chamadas de voz ilimitadas (Diamond+)
- ✅ Videochamadas ilimitadas (Diamond+)
- ✅ WebRTC integrado
- ✅ Qualidade adaptativa

---

## 💻 Stack Tecnológica

### 🎨 Frontend

#### Framework Principal
- **Next.js 15.1.4** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript 5** - Linguagem com tipagem estática

#### UI/UX
- **Tailwind CSS 3.4** - Framework CSS utilitário
- **Framer Motion 11** - Animações fluidas
- **Hero UI** - Componentes base
- **Lucide React** - Ícones modernos
- **Radix UI** - Componentes acessíveis

#### Gerenciamento de Estado
- **Zustand** - Estado global simplificado
- **React Hook Form** - Formulários otimizados
- **SWR** - Data fetching e caching

#### Validação e Utilitários
- **Zod** - Validação de schemas
- **date-fns** - Manipulação de datas
- **clsx** - Utilitários de classes CSS

### 🔧 Backend

#### Infraestrutura Principal
- **Supabase** - Backend-as-a-Service completo
  - **PostgreSQL 15** - Banco de dados relacional
  - **Realtime** - WebSockets para tempo real
  - **Storage** - Armazenamento S3-compatible
  - **Auth** - Autenticação JWT
  - **Edge Functions** - Serverless functions

#### APIs e Integrações
- **Stripe** - Pagamentos com cartão
- **AbacatePay** - Pagamentos PIX
- **IBGE API** - Dados de localização brasileira
- **WebRTC** - Chamadas de voz/vídeo

### 📦 DevOps e Ferramentas

#### Build e Deploy
- **Vercel** - Plataforma de deploy
- **pnpm** - Gerenciador de pacotes
- **ESLint** - Linting de código
- **Prettier** - Formatação de código

#### Monitoramento
- **Vercel Analytics** - Analytics de performance
- **Sentry** (planejado) - Monitoramento de erros

---

## 🗄️ Estrutura do Banco de Dados

### 📊 Tabelas Principais

#### 1. **users** - Usuários do Sistema
```sql
CREATE TABLE users (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Informações Pessoais
    name VARCHAR(100),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    birth_date DATE,
    gender VARCHAR(20),
    profile_type VARCHAR(20) DEFAULT 'single',
    
    -- Localização
    location VARCHAR(255),
    city VARCHAR(100),
    uf VARCHAR(2),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Brazil',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Mídia
    avatar_url TEXT,
    cover_url TEXT,
    
    -- Interesses e Preferências
    interests TEXT[],
    seeking TEXT[],
    looking_for TEXT[],
    relationship_goals TEXT[],
    
    -- Premium e Pagamentos
    is_premium BOOLEAN DEFAULT false,
    premium_type VARCHAR(20) CHECK (premium_type IN ('free', 'gold', 'diamond', 'couple')),
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255),
    abacatepay_customer_id VARCHAR(255),
    
    -- Verificação e Status
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    role VARCHAR(20) DEFAULT 'user',
    
    -- Casal
    couple_id UUID REFERENCES couples(id),
    is_in_couple BOOLEAN DEFAULT false,
    
    -- Limites de uso (sem verificação)
    daily_message_limit INTEGER DEFAULT 0,
    daily_messages_sent INTEGER DEFAULT 0,
    monthly_photo_limit INTEGER DEFAULT 3,
    monthly_photos_uploaded INTEGER DEFAULT 0,
    monthly_video_limit INTEGER DEFAULT 0,
    monthly_videos_uploaded INTEGER DEFAULT 0,
    
    -- Configurações
    privacy_settings JSONB DEFAULT '{"show_ads": true}',
    notification_settings JSONB,
    stats JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE
);
```

#### 2. **couples** - Casais
```sql
CREATE TABLE couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id),
    user2_id UUID REFERENCES users(id),
    couple_name VARCHAR(100),
    couple_avatar_url TEXT,
    couple_cover_url TEXT,
    anniversary_date DATE,
    bio TEXT,
    
    -- Recursos exclusivos
    shared_album_id UUID,
    shared_diary_id UUID,
    shared_playlist_url TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_couple UNIQUE (user1_id, user2_id)
);
```

#### 3. **posts** - Publicações
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    couple_id UUID REFERENCES couples(id),
    
    -- Conteúdo
    content TEXT,
    media_urls TEXT[],
    media_types TEXT[],
    media_thumbnails TEXT[],
    
    -- Configurações
    visibility VARCHAR(20) DEFAULT 'public',
    is_premium_content BOOLEAN DEFAULT false,
    price DECIMAL(10, 2),
    
    -- Recursos Especiais
    poll_id UUID REFERENCES polls(id),
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    hashtags TEXT[],
    mentions TEXT[],
    
    -- Tipo de post
    post_type VARCHAR(20) DEFAULT 'regular' CHECK (post_type IN ('regular', 'story', 'event')),
    story_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Eventos
    is_event BOOLEAN DEFAULT false,
    event_id UUID REFERENCES events(id),
    
    -- Estatísticas
    stats JSONB DEFAULT '{"likes_count": 0, "comments_count": 0, "shares_count": 0, "views_count": 0}',
    
    -- Moderação
    is_reported BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. **stories** - Stories (24h)
```sql
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Conteúdo
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video')),
    caption TEXT,
    
    -- Configurações
    is_highlight BOOLEAN DEFAULT false,
    highlight_name VARCHAR(50),
    
    -- Visualizações
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);
```

#### 5. **story_views** - Visualizações de Stories
```sql
CREATE TABLE story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_story_view UNIQUE (story_id, viewer_id)
);
```

#### 6. **polls** - Enquetes
```sql
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id),
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- [{id: 1, text: "Option 1", votes: 0}]
    max_options INTEGER DEFAULT 2 CHECK (max_options BETWEEN 2 AND 4),
    allows_multiple BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7. **poll_votes** - Votos em Enquetes
```sql
CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    option_ids INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_poll_vote UNIQUE (poll_id, user_id)
);
```

#### 8. **verification_requests** - Solicitações de Verificação
```sql
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    -- Documentos
    document_type VARCHAR(50),
    document_front_url TEXT,
    document_back_url TEXT,
    selfie_url TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 9. **messages** - Sistema de Mensagens
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Conteúdo
    content TEXT,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'file')),
    media_urls TEXT[],
    
    -- Metadados
    reply_to_id UUID REFERENCES messages(id),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_count INTEGER DEFAULT 0,
    is_read BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 10. **calls** - Chamadas de Voz/Vídeo
```sql
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    caller_id UUID REFERENCES users(id),
    
    -- Tipo e status
    call_type VARCHAR(20) CHECK (call_type IN ('voice', 'video')),
    status VARCHAR(20) DEFAULT 'ringing' CHECK (status IN ('ringing', 'connected', 'ended', 'missed', 'declined')),
    
    -- Participantes
    participants UUID[],
    
    -- Duração
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 11. **subscriptions** - Assinaturas
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    -- Plano
    plan_type VARCHAR(20) CHECK (plan_type IN ('gold', 'diamond', 'couple')),
    billing_period VARCHAR(20) CHECK (billing_period IN ('monthly', 'quarterly', 'semiannual', 'annual')),
    
    -- Pagamento
    payment_method VARCHAR(20) CHECK (payment_method IN ('credit_card', 'pix')),
    provider VARCHAR(20) CHECK (provider IN ('stripe', 'abacatepay')),
    provider_subscription_id VARCHAR(255),
    
    -- Valores
    amount DECIMAL(10, 2),
    discount_percentage INTEGER DEFAULT 0,
    final_amount DECIMAL(10, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Datas
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 12. **advertisements** - Anúncios
```sql
CREATE TABLE advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID REFERENCES users(id),
    
    -- Conteúdo
    title VARCHAR(200),
    content TEXT,
    media_url TEXT,
    cta_text VARCHAR(50),
    cta_url TEXT,
    
    -- Segmentação
    target_age_min INTEGER,
    target_age_max INTEGER,
    target_genders TEXT[],
    target_locations TEXT[],
    target_interests TEXT[],
    
    -- Configurações
    budget DECIMAL(10, 2),
    cost_per_impression DECIMAL(10, 4),
    cost_per_click DECIMAL(10, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed')),
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    -- Datas
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 13. **ad_impressions** - Impressões de Anúncios
```sql
CREATE TABLE ad_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES advertisements(id),
    user_id UUID REFERENCES users(id),
    
    -- Interação
    was_clicked BOOLEAN DEFAULT false,
    click_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Context
    placement VARCHAR(50), -- 'timeline', 'stories', 'sidebar'
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🔐 Políticas de Segurança (RLS)

Todas as tabelas possuem Row Level Security (RLS) habilitado com políticas específicas:

```sql
-- Exemplo: Usuários só podem ver posts baseado em visibilidade e verificação
CREATE POLICY "View posts based on visibility and verification" ON posts
FOR SELECT USING (
  visibility = 'public' 
  OR user_id = auth.uid()
  OR (
    visibility = 'friends' 
    AND EXISTS (
      SELECT 1 FROM friends 
      WHERE (user_id = posts.user_id AND friend_id = auth.uid())
      OR (friend_id = posts.user_id AND user_id = auth.uid())
      AND status = 'accepted'
    )
  )
);

-- Exemplo: Free users need verification to comment
CREATE POLICY "Free users need verification to comment" ON comments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (is_verified = true OR premium_type != 'free')
  )
);

-- Exemplo: Message limits for non-verified Gold users
CREATE POLICY "Check message limits" ON messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (
      is_verified = true 
      OR premium_type NOT IN ('free', 'gold')
      OR daily_messages_sent < daily_message_limit
    )
  )
);
```

### 📈 Índices Otimizados

```sql
-- Performance crítica
CREATE INDEX idx_posts_timeline ON posts(visibility, created_at DESC) WHERE post_type = 'regular';
CREATE INDEX idx_posts_user ON posts(user_id, created_at DESC);
CREATE INDEX idx_stories_active ON stories(user_id, expires_at) WHERE expires_at > NOW();
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);

-- Busca
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_location ON users(city, uf);
CREATE INDEX idx_users_verified ON users(is_verified) WHERE is_verified = true;

-- Premium features
CREATE INDEX idx_users_premium ON users(premium_type) WHERE premium_type != 'free';
CREATE INDEX idx_ads_active ON advertisements(status, starts_at, ends_at) WHERE status = 'active';
```

### 🔄 Triggers e Functions

```sql
-- Function para resetar limites diários
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET daily_messages_sent = 0
  WHERE premium_type = 'gold' AND is_verified = false;
END;
$$ LANGUAGE plpgsql;

-- Function para resetar limites mensais
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET 
    monthly_photos_uploaded = 0,
    monthly_videos_uploaded = 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger para limpar stories expirados
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS trigger AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < NOW() AND is_highlight = false;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_stories
AFTER INSERT ON stories
EXECUTE FUNCTION cleanup_expired_stories();

-- Function para verificar limites antes de upload
CREATE OR REPLACE FUNCTION check_upload_limits()
RETURNS trigger AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT * INTO user_record FROM users WHERE id = NEW.user_id;
  
  -- Verificar limites baseado no plano e verificação
  IF user_record.premium_type = 'free' THEN
    IF array_length(NEW.media_urls, 1) > 0 AND user_record.monthly_photos_uploaded >= 3 THEN
      RAISE EXCEPTION 'Limite de fotos excedido para plano gratuito';
    END IF;
  END IF;
  
  -- Incrementar contador
  IF array_length(NEW.media_urls, 1) > 0 THEN
    UPDATE users 
    SET monthly_photos_uploaded = monthly_photos_uploaded + array_length(NEW.media_urls, 1)
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_upload_limits
BEFORE INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION check_upload_limits();
```

---

## 🔐 Sistema de Autenticação

### 🛡️ Fluxo de Autenticação com Verificação

1. **Registro**
   - Validação de email único
   - Validação de username único
   - Criação de perfil automática
   - Email de confirmação
   - Login automático após registro
   - **Status não verificado por padrão**

2. **Verificação de Identidade**
   - Upload de documento (RG, CNH, Passaporte)
   - Selfie segurando papel com código
   - Análise manual por moderadores
   - Aprovação/Rejeição com feedback

3. **Login**
   - Email + senha
   - JWT token seguro
   - Refresh token automático
   - Remember me opcional
   - **Verificação de limites baseado em plano**

### 🔑 Implementação

```typescript
// AuthProvider.tsx atualizado
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [limits, setLimits] = useState<UserLimits | null>(null)

  useEffect(() => {
    // Verificar sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Buscar dados completos do usuário incluindo limites
        const { data: userData } = await supabase
          .from('users')
          .select('*, couples(*)')
          .eq('auth_id', session.user.id)
          .single()
        
        setUser(userData)
        setLimits({
          canMessage: userData.premium_type !== 'free' || userData.is_verified,
          dailyMessageLimit: userData.daily_message_limit,
          messagesRemaining: userData.daily_message_limit - userData.daily_messages_sent,
          canUploadVideo: ['gold', 'diamond', 'couple'].includes(userData.premium_type),
          canCreateStory: ['diamond', 'couple'].includes(userData.premium_type),
          showAds: ['free', 'gold'].includes(userData.premium_type)
        })
      }
      setLoading(false)
    })

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, limits, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## 💳 Sistema de Pagamentos Atualizado

### 💰 Planos Disponíveis

#### **Plano Gratuito**
- ✅ Perfil básico
- ✅ Posts de texto ilimitados
- ✅ 3 fotos por mês
- ✅ Seguir até 50 pessoas
- ✅ Votar em enquetes
- ✅ Ver anúncios
- ⚠️ **Com verificação**: Comentar, participar de eventos, buscar por localização
- ❌ Sem mensagens privadas
- ❌ Não vê vídeos/áudios
- ❌ Sem comunidades

#### **Plano Gold (R$ 25,00/mês)**
- ✅ Tudo do plano gratuito
- ✅ Ver e postar vídeos/áudios
- ✅ Criar enquetes simples
- ✅ Ainda vê anúncios (menos)
- ⚠️ **Sem verificação**: 10 mensagens/dia, 20 fotos/mês
- ⚠️ **Com verificação**: Mensagens ilimitadas, 50 fotos/mês, criar 3 eventos/mês

#### **Plano Diamond (R$ 45,00/mês)**
- ✅ Tudo do plano Gold
- ✅ **Stories** (24 horas)
- ✅ Sem anúncios
- ✅ Chamadas de voz/vídeo ilimitadas
- ✅ Analytics completos
- ⚠️ **Sem verificação**: Recursos limitados
- ⚠️ **Com verificação**: Recursos ilimitados, criar comunidades

#### **Plano Couple (R$ 69,90/mês)**
- ✅ Duas contas Diamond vinculadas
- ✅ Perfil de casal compartilhado
- ✅ Recursos exclusivos para casais
- ⚠️ **Após vincular, só pode manter plano Couple**

### 💸 Períodos e Descontos

| Período | Gold | Diamond | Couple |
|---------|------|---------|--------|
| Mensal | R$ 25,00 | R$ 45,00 | R$ 69,90 |
| Trimestral | R$ 67,50 (-10%) | R$ 121,50 (-10%) | R$ 188,73 (-10%) |
| Semestral | R$ 120,00 (-20%) | R$ 216,00 (-20%) | R$ 335,52 (-20%) |
| Anual | R$ 210,00 (-30%) | R$ 378,00 (-30%) | R$ 587,16 (-30%) |

### 🎯 Teste de 1 Semana (Cartão)
- Gold: R$ 12,90
- Diamond: R$ 19,90
- Couple: R$ 29,90

### 💳 Implementação de Pagamento

```typescript
// Configuração de planos atualizada
const PLAN_CONFIG = {
  gold: {
    name: 'Gold',
    price: {
      monthly: 25.00,
      quarterly: 67.50,
      semiannual: 120.00,
      annual: 210.00,
      trial: 12.90
    },
    features: {
      messages: { unverified: 10, verified: -1 }, // -1 = ilimitado
      photos: { unverified: 20, verified: 50 },
      videos: { unverified: 5, verified: 10 },
      events: { unverified: 0, verified: 3 },
      communities: { unverified: 0, verified: 5 },
      showAds: true,
      canCreatePolls: true,
      canViewMedia: true,
      canRecordAudio: true
    }
  },
  diamond: {
    name: 'Diamond',
    price: {
      monthly: 45.00,
      quarterly: 121.50,
      semiannual: 216.00,
      annual: 378.00,
      trial: 19.90
    },
    features: {
      messages: { unverified: -1, verified: -1 },
      photos: { unverified: 100, verified: -1 },
      videos: { unverified: 20, verified: -1 },
      events: { unverified: 5, verified: -1 },
      communities: { unverified: 10, verified: -1 },
      showAds: false,
      canCreatePolls: true,
      canViewMedia: true,
      canRecordAudio: true,
      canCreateStories: true,
      canMakeCalls: true,
      hasAnalytics: true
    }
  },
  couple: {
    name: 'Couple',
    price: {
      monthly: 69.90,
      quarterly: 188.73,
      semiannual: 335.52,
      annual: 587.16,
      trial: 29.90
    },
    features: {
      // Herda tudo do Diamond para ambas as contas
      ...PLAN_CONFIG.diamond.features,
      sharedProfile: true,
      sharedAlbum: true,
      sharedDiary: true,
      coupleGames: true
    }
  }
}
```

---

## ⭐ Funcionalidades Premium Atualizadas

### 🎯 Sistema de Verificação de Recursos

```typescript
// Hook atualizado para verificar funcionalidades
export function usePremiumFeatures() {
  const { user } = useAuth()
  
  const features = {
    // Recursos de mídia
    maxImagesPerPost: getImageLimit(user),
    canUploadVideo: canUploadVideo(user),
    canRecordAudio: canRecordAudio(user),
    canViewVideos: user?.premium_type !== 'free',
    canListenAudios: user?.premium_type !== 'free',
    
    // Recursos sociais
    canCreatePolls: canCreatePolls(user),
    canVotePolls: true, // Todos podem votar
    canComment: user?.is_verified || user?.premium_type !== 'free',
    canMessage: canSendMessages(user),
    messageLimit: getMessageLimit(user),
    
    // Eventos e comunidades
    canCreateEvents: canCreateEvents(user),
    canParticipateEvents: user?.is_verified || user?.premium_type !== 'free',
    maxEventsPerMonth: getEventLimit(user),
    canJoinCommunities: user?.premium_type !== 'free',
    canCreateCommunities: user?.premium_type === 'diamond' && user?.is_verified,
    
    // Features exclusivas
    canCreateStories: ['diamond', 'couple'].includes(user?.premium_type),
    canMakeCalls: ['diamond', 'couple'].includes(user?.premium_type),
    hasVerifiedBadge: user?.is_verified,
    canViewAnalytics: ['diamond', 'couple'].includes(user?.premium_type),
    showAds: ['free', 'gold'].includes(user?.premium_type || 'free'),
    
    // Limites
    monthlyPhotoLimit: getMonthlyPhotoLimit(user),
    monthlyVideoLimit: getMonthlyVideoLimit(user),
    remainingPhotos: user?.monthly_photo_limit - user?.monthly_photos_uploaded,
    remainingVideos: user?.monthly_video_limit - user?.monthly_videos_uploaded,
  }
  
  return features
}

// Funções auxiliares
function getImageLimit(user: User) {
  if (!user) return 0
  
  const limits = {
    free: 0, // Não pode adicionar imagens em posts
    gold: user.is_verified ? 5 : 3,
    diamond: user.is_verified ? 10 : 7,
    couple: 10
  }
  
  return limits[user.premium_type] || 0
}

function getMessageLimit(user: User) {
  if (!user) return 0
  if (user.premium_type === 'free') return 0
  if (user.premium_type === 'gold' && !user.is_verified) return 10
  return -1 // Ilimitado
}

function getMonthlyPhotoLimit(user: User) {
  if (!user) return 3
  
  const limits = {
    free: 3,
    gold: user.is_verified ? 50 : 20,
    diamond: user.is_verified ? -1 : 100,
    couple: -1
  }
  
  return limits[user.premium_type] || 3
}
```

### 🔒 Paywall Modal Atualizado

```typescript
export function PaywallModal({ 
  feature, 
  requiredPlan,
  requiresVerification,
  onUpgrade,
  onVerify 
}: PaywallModalProps) {
  const { user } = useAuth()
  
  // Se precisa apenas verificação
  if (requiresVerification && !user?.is_verified) {
    return (
      <Modal>
        <h2>Verificação Necessária</h2>
        <p>Este recurso requer verificação de identidade</p>
        <Button onClick={onVerify}>
          Verificar Agora
        </Button>
      </Modal>
    )
  }
  
  // Se precisa upgrade de plano
  return (
    <Modal>
      <h2>Recurso Premium</h2>
      <p>Este recurso requer o plano {requiredPlan}</p>
      <div className="space-y-2">
        <Button onClick={onUpgrade}>
          Fazer Upgrade Agora
        </Button>
        {requiredPlan !== 'diamond' && (
          <Button variant="outline" onClick={() => onUpgrade('trial')}>
            Testar por 1 semana
          </Button>
        )}
      </div>
    </Modal>
  )
}
```

---

## 📱 Sistema de Stories

### 🎯 Implementação

```typescript
// Componente de Stories
export function StoriesBar() {
  const { user, features } = usePremiumFeatures()
  const [stories, setStories] = useState<Story[]>([])
  
  // Carregar stories ativos
  useEffect(() => {
    if (!features.canCreateStories && user?.premium_type === 'free') {
      return // Free users não veem stories
    }
    
    const loadStories = async () => {
      const { data } = await supabase
        .from('stories')
        .select('*, user:users(*)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
      
      setStories(data || [])
    }
    
    loadStories()
  }, [user])
  
  const createStory = async (file: File) => {
    if (!features.canCreateStories) {
      showPaywall('diamond')
      return
    }
    
    // Upload e criar story
    const { data: uploadData } = await uploadFile(file, 'stories')
    
    await supabase.from('stories').insert({
      user_id: user.id,
      media_url: uploadData.url,
      media_type: file.type.startsWith('video/') ? 'video' : 'image',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    })
  }
  
  return (
    <div className="stories-container">
      {features.canCreateStories && (
        <button onClick={() => fileInput.click()}>
          <PlusCircle /> Criar Story
        </button>
      )}
      {stories.map(story => (
        <StoryThumbnail key={story.id} story={story} />
      ))}
    </div>
  )
}
```

---

## 🎪 Sistema de Eventos e Comunidades Atualizado

### 🎉 Eventos com Restrições

```typescript
// Verificação para participar de eventos
export async function joinEvent(eventId: string, userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('premium_type, is_verified')
    .eq('id', userId)
    .single()
  
  // Free users precisam de verificação
  if (user.premium_type === 'free' && !user.is_verified) {
    throw new Error('Verificação necessária para participar de eventos')
  }
  
  // Adicionar participante
  await supabase.from('event_participants').insert({
    event_id: eventId,
    user_id: userId,
    status: 'going'
  })
}

// Criar evento
export async function createEvent(eventData: CreateEventData, userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('premium_type, is_verified, monthly_events_created')
    .eq('id', userId)
    .single()
  
  // Verificar permissões
  if (user.premium_type === 'free') {
    throw new Error('Plano Gold ou superior necessário')
  }
  
  if (!user.is_verified && user.premium_type === 'gold') {
    throw new Error('Verificação necessária para criar eventos')
  }
  
  // Verificar limites mensais
  const limits = {
    gold: 3,
    diamond: -1,
    couple: -1
  }
  
  if (limits[user.premium_type] !== -1 && 
      user.monthly_events_created >= limits[user.premium_type]) {
    throw new Error('Limite mensal de eventos atingido')
  }
  
  // Criar evento
  const { data: event } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single()
  
  // Incrementar contador
  await supabase
    .from('users')
    .update({ monthly_events_created: user.monthly_events_created + 1 })
    .eq('id', userId)
  
  return event
}
```

### 👥 Comunidades com Restrições

```typescript
// Sistema de comunidades
export async function joinCommunity(communityId: string, userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('premium_type, is_verified')
    .eq('id', userId)
    .single()
  
  // Free users não podem participar
  if (user.premium_type === 'free') {
    throw new Error('Plano Gold ou superior necessário para participar de comunidades')
  }
  
  // Verificar limites
  const { count } = await supabase
    .from('community_members')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'active')
  
  const limits = {
    gold: user.is_verified ? 5 : 0,
    diamond: -1,
    couple: -1
  }
  
  if (limits[user.premium_type] !== -1 && count >= limits[user.premium_type]) {
    throw new Error('Limite de comunidades atingido')
  }
  
  // Adicionar membro
  await supabase.from('community_members').insert({
    community_id: communityId,
    user_id: userId,
    role: 'member'
  })
}
```

---

## 🔔 Sistema de Notificações com Anúncios

### 📢 Integração de Anúncios

```typescript
// Sistema de anúncios na timeline
export function TimelineFeed() {
  const { user, features } = usePremiumFeatures()
  const [posts, setPosts] = useState<Post[]>([])
  const [ads, setAds] = useState<Advertisement[]>([])
  
  useEffect(() => {
    // Carregar posts
    loadPosts()
    
    // Carregar anúncios se aplicável
    if (features.showAds) {
      loadAds()
    }
  }, [features.showAds])
  
  const loadAds = async () => {
    const { data } = await supabase
      .from('advertisements')
      .select('*')
      .eq('status', 'active')
      .gte('ends_at', new Date().toISOString())
      .lte('starts_at', new Date().toISOString())
      .limit(5)
    
    setAds(data || [])
  }
  
  // Inserir anúncios entre posts
  const feedItems = useMemo(() => {
    if (!features.showAds || ads.length === 0) return posts
    
    const items = [...posts]
    const adInterval = user?.premium_type === 'gold' ? 10 : 5 // Gold vê menos
    
    ads.forEach((ad, index) => {
      const position = (index + 1) * adInterval
      if (position < items.length) {
        items.splice(position, 0, { ...ad, isAd: true })
      }
    })
    
    return items
  }, [posts, ads, features.showAds, user?.premium_type])
  
  return (
    <div className="timeline">
      {feedItems.map((item, index) => 
        item.isAd ? (
          <AdCard key={`ad-${item.id}`} ad={item} />
        ) : (
          <PostCard key={item.id} post={item} />
        )
      )}
    </div>
  )
}

// Componente de anúncio
function AdCard({ ad }: { ad: Advertisement }) {
  const trackImpression = async () => {
    await supabase.from('ad_impressions').insert({
      ad_id: ad.id,
      user_id: user.id,
      placement: 'timeline'
    })
  }
  
  useEffect(() => {
    trackImpression()
  }, [])
  
  const handleClick = async () => {
    await supabase
      .from('ad_impressions')
      .update({ was_clicked: true, click_timestamp: new Date() })
      .eq('ad_id', ad.id)
      .eq('user_id', user.id)
    
    window.open(ad.cta_url, '_blank')
  }
  
  return (
    <div className="ad-card">
      <span className="ad-label">Patrocinado</span>
      <img src={ad.media_url} alt={ad.title} />
      <h3>{ad.title}</h3>
      <p>{ad.content}</p>
      <button onClick={handleClick}>{ad.cta_text}</button>
    </div>
  )
}
```

---

## 🤖 Sistema de Recomendações e IA Atualizado

### 🧠 Algoritmo Considerando Verificação

```typescript
interface CompatibilityFactors {
  commonInterests: 0.25,      // 25% - Interesses em comum
  demographics: 0.15,         // 15% - Idade, gênero, etc
  location: 0.15,            // 15% - Proximidade geográfica
  activity: 0.10,            // 10% - Atividade recente
  profileCompleteness: 0.10,  // 10% - Perfil completo
  verificationStatus: 0.15,   // 15% - Status de verificação
  premiumStatus: 0.10        // 10% - Tipo de plano
}

// Pontuação extra para usuários verificados
function calculateUserScore(user: User, target: User) {
  let score = calculateBaseScore(user, target)
  
  // Bonus por verificação
  if (target.is_verified) {
    score *= 1.2 // 20% de bonus
  }
  
  // Bonus por plano premium
  const premiumBonus = {
    free: 1.0,
    gold: 1.1,
    diamond: 1.3,
    couple: 1.2
  }
  
  score *= premiumBonus[target.premium_type] || 1.0
  
  return score
}
```

---

## ⚡ Performance e Otimizações

### 🚀 Otimizações Específicas para Planos

```typescript
// Cache diferenciado por plano
const cacheConfig = {
  free: {
    ttl: 300, // 5 minutos
    maxSize: 50 // 50 items
  },
  gold: {
    ttl: 600, // 10 minutos
    maxSize: 100
  },
  diamond: {
    ttl: 1800, // 30 minutos
    maxSize: 500
  },
  couple: {
    ttl: 1800,
    maxSize: 500
  }
}

// Prioridade de carregamento
const loadingPriority = {
  free: 'low',
  gold: 'medium',
  diamond: 'high',
  couple: 'high'
}

// Lazy loading de recursos premium
const PremiumFeature = lazy(() => 
  user?.premium_type !== 'free' 
    ? import('./PremiumFeature')
    : Promise.resolve({ default: () => <PaywallPrompt /> })
)
```

---

## 🔒 Segurança Atualizada

### 🛡️ Validações por Plano e Verificação

```typescript
// Middleware de API atualizado
export async function validatePremiumAction(
  req: Request,
  action: string
): Promise<boolean> {
  const userId = req.headers.get('user-id')
  
  const { data: user } = await supabase
    .from('users')
    .select('premium_type, is_verified, daily_messages_sent, daily_message_limit')
    .eq('id', userId)
    .single()
  
  const permissions = {
    sendMessage: {
      free: false,
      gold: user.is_verified || user.daily_messages_sent < user.daily_message_limit,
      diamond: true,
      couple: true
    },
    uploadVideo: {
      free: false,
      gold: user.is_verified,
      diamond: true,
      couple: true
    },
    createStory: {
      free: false,
      gold: false,
      diamond: true,
      couple: true
    },
    makeCall: {
      free: false,
      gold: false,
      diamond: true,
      couple: true
    }
  }
  
  return permissions[action]?.[user.premium_type] || false
}
```

---

## 📅 Histórico de Desenvolvimento

### 🏁 Timeline do Projeto

#### **Fase 1: MVP (v0.1.0)**
- ✅ Setup inicial do projeto
- ✅ Autenticação básica
- ✅ Perfis de usuário
- ✅ Posts simples
- ✅ Timeline básica

#### **Fase 2: Social Features (v0.2.0)**
- ✅ Sistema de likes
- ✅ Comentários
- ✅ Sistema de seguir
- ✅ Chat básico
- ✅ Notificações

#### **Fase 3: Monetização (v0.3.0)**
- ✅ Integração Stripe
- ✅ Integração AbacatePay
- ✅ Planos premium
- ✅ Features pagas
- ✅ Sistema de verificação

#### **Fase 4: Premium Features (v0.3.1)**
- ✅ Sistema de verificação de identidade
- ✅ Limites por plano e verificação
- ✅ Stories para Diamond+
- ✅ Plano Couple
- ✅ Sistema de anúncios
- ✅ Chamadas de voz/vídeo

### 📈 Estatísticas do Projeto

```
Total de Commits: 520+
Arquivos: 420+
Linhas de Código: 52,000+
Componentes React: 145+
API Endpoints: 78+
Tabelas no Banco: 35+
Tempo de Desenvolvimento: 4 meses
```

---

## 🔮 Próximos Passos

### 🚧 Em Desenvolvimento

1. **Live Streaming** (v0.4.0)
   - Transmissões ao vivo (Diamond+)
   - Chat em tempo real
   - Monetização de lives
   - Gravação opcional

2. **Marketplace** (v0.5.0)
   - Venda de produtos
   - Serviços
   - Cursos online
   - Sistema de avaliações

3. **IA Avançada** (v0.6.0)
   - Moderação automática
   - Sugestões de conteúdo
   - Chatbot de suporte
   - Tradução automática

### 🎯 Roadmap 2025

#### Q2 2025
- [ ] Mobile App (React Native)
- [ ] Push Notifications (PWA)
- [ ] 2FA Authentication
- [ ] API Pública

#### Q3 2025
- [ ] Integração com outras redes
- [ ] Sistema de badges/conquistas
- [ ] Jogos integrados
- [ ] Crypto payments

#### Q4 2025
- [ ] AR Filters
- [ ] Voice messages em posts
- [ ] NFT profile pictures
- [ ] Expansão internacional

---

**🎉 OpenLove - Conectando pessoas através do amor e da tecnologia!**

*Última atualização: 28/01/2025*