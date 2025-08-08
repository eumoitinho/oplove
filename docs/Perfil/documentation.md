# Sistema de Perfil - OpenLove

## Visão Geral

Sistema completo de perfis de usuário com configurações responsivas, verificação de identidade, badges especiais, configurações de privacidade e analytics pessoais.

## Componentes Principais

### Frontend Components
- `UserProfile` - Perfil público do usuário
- `ProfileSettings` - Configurações de perfil
- `ProfileEditor` - Edição de informações pessoais
- `VerificationBadge` - Badge de verificação
- `PlanBadge` - Badge do plano atual
- `ProfileSeals` - Seals recebidos de outros usuários
- `ProfileAnalytics` - Analytics do perfil (Diamond+)
- `PrivacySettings` - Configurações de privacidade

### Backend Components
- `/api/v1/users/[id]/*` - API do perfil do usuário
- `/api/v1/profile/*` - Configurações de perfil
- Profile Service - Lógica de negócio
- Analytics Service - Coleta de métricas
- Media Processing - Upload de fotos/vídeos

## Estrutura do Perfil

### Informações Básicas
```typescript
interface UserProfile {
  // Dados pessoais
  id: string;
  username: string;
  display_name: string;
  bio: string;
  location: string;
  website: string;
  birth_date: Date;
  
  // Mídia
  avatar_url: string;
  cover_url: string;
  
  // Status
  is_verified: boolean;
  premium_type: 'free' | 'gold' | 'diamond' | 'couple';
  is_business: boolean;
  is_online: boolean;
  last_seen: Date;
  
  // Estatísticas públicas
  followers_count: number;
  following_count: number;
  posts_count: number;
  likes_received: number;
  
  // Configurações
  is_private: boolean;
  show_last_seen: boolean;
  allow_messages: boolean;
  
  created_at: Date;
  updated_at: Date;
}
```

### Perfil Estendido
```typescript
interface ExtendedProfile {
  // Interesses e preferências
  interests: string[];
  relationship_status: string;
  looking_for: string[];
  languages: string[];
  
  // Localização
  city: string;
  state: string;
  country: string;
  
  // Profissional (Business accounts)
  company_name?: string;
  business_category?: string;
  business_description?: string;
  
  // Monetização (Diamond+)
  subscription_price?: number;
  content_pricing?: {
    photos: number;
    videos: number;
    custom: number;
  };
}
```

## Tipos de Perfil

### 1. Perfil Pessoal (Padrão)
- **Conteúdo social** - Posts, stories, interações
- **Networking** - Seguir/seguidores, mensagens
- **Personalização** - Bio, localização, interesses

### 2. Perfil Business
- **Monetização** - Venda de conteúdo, assinaturas
- **Analytics** - Métricas detalhadas de engajamento
- **Ferramentas** - Agendamento, automação
- **Verificação especial** - Badge dourado

### 3. Perfil Couple (Dupla)
- **Sincronização** - Dois perfis conectados
- **Conteúdo compartilhado** - Posts aparecem em ambos
- **Timeline unificada** - Feed conjunto
- **Badge especial** - "Dupla Verificada"

## Sistema de Badges

### Badge de Verificação (Azul)
```typescript
interface VerificationBadge {
  type: 'verified';
  color: 'blue';
  icon: '✓';
  tooltip: 'Perfil verificado';
  requirements: [
    'Documento validado',
    'Selfie confirmada', 
    'Liveness detection aprovada'
  ];
}
```

### Badge de Business (Dourado)
```typescript
interface BusinessBadge {
  type: 'business';
  color: 'gold';
  icon: '★';
  tooltip: 'Conta business verificada';
  requirements: [
    'Verificação pessoal',
    'Documento empresarial',
    'Faturamento comprovado'
  ];
}
```

### Badge de Casal (Coração Duplo)
```typescript
interface CoupleBadge {
  type: 'couple';
  color: 'pink';
  icon: '💕';
  tooltip: 'Dupla verificada';
  requirements: [
    'Ambos verificados',
    'Plano Couple ativo',
    'Relacionamento confirmado'
  ];
}
```

## Profile Seals (Presentes)

### Sistema de Seals Recebidos
```typescript
interface ReceivedSeal {
  id: string;
  seal: {
    name: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    cost: number;
  };
  sender: {
    id: string;
    username: string;
    avatar_url: string;
  };
  story_id?: string;        // Se foi enviado via story
  received_at: Date;
  expires_at: Date;         // 7 dias
}
```

### Exibição no Perfil
- **Grid de seals** - Exibição visual dos seals ativos
- **Contador total** - Quantos seals já recebeu
- **Valor acumulado** - Valor total em créditos recebidos
- **Top senders** - Usuários que mais enviaram seals

## Analytics do Perfil (Diamond+)

### Métricas Básicas
```typescript
interface ProfileAnalytics {
  // Crescimento
  followers_growth: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  
  // Engajamento
  engagement_rate: number;
  average_likes_per_post: number;
  average_comments_per_post: number;
  
  // Alcance
  profile_views: number;
  post_impressions: number;
  story_views: number;
  
  // Demografia dos seguidores
  followers_demographics: {
    age_groups: Record<string, number>;
    locations: Record<string, number>;
    plans: Record<string, number>;
  };
  
  // Receita (se aplicável)
  revenue?: {
    total: number;
    this_month: number;
    last_month: number;
    subscriptions: number;
    content_sales: number;
    seals_received: number;
  };
}
```

### Dashboard Analytics
- **Gráficos de crescimento** - Seguidores, engajamento
- **Mapa de calor** - Atividade por dia/hora
- **Top content** - Posts com melhor performance
- **Audience insights** - Demografia detalhada
- **Revenue tracking** - Ganhos e tendências

## Configurações de Privacidade

### Níveis de Privacidade
```typescript
interface PrivacySettings {
  // Perfil geral
  is_private: boolean;              // Perfil privado requer aprovação
  show_online_status: boolean;      // Mostrar status online
  show_last_seen: boolean;          // Mostrar "visto por último"
  
  // Conteúdo
  who_can_see_posts: 'everyone' | 'followers' | 'premium';
  who_can_see_stories: 'everyone' | 'followers' | 'close_friends';
  who_can_see_followers: 'everyone' | 'followers' | 'nobody';
  
  // Interações
  who_can_message: 'everyone' | 'followers' | 'premium' | 'nobody';
  who_can_comment: 'everyone' | 'followers' | 'nobody';
  who_can_mention: 'everyone' | 'followers' | 'nobody';
  
  // Notificações
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  
  // Conteúdo adulto
  show_nsfw_content: boolean;       // Ver conteúdo +18
  nsfw_content_creator: boolean;    // É criador de conteúdo +18
}
```

## Responsividade Mobile

### Otimizações Mobile
- **Header responsivo** - Adapta-se ao tamanho da tela
- **Navigation bottom** - Navegação inferior em mobile
- **Touch-friendly** - Botões e links otimizados para touch
- **Image optimization** - Carregamento progressivo
- **Lazy loading** - Carrega conteúdo conforme necessário

### Breakpoints
```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

## Upload de Mídia

### Avatar e Cover
- **Formatos aceitos**: JPEG, PNG, WebP
- **Tamanho máximo**: 5MB por arquivo
- **Dimensões**: Avatar 400x400, Cover 1200x400
- **Compressão automática** - Otimização para web
- **Crop tool** - Recorte na interface

### Galeria de Fotos (Diamond+)
- **Até 12 fotos** no perfil
- **Ordenação customizada** - Drag & drop
- **Álbuns temáticos** - Organização por categorias
- **Conteúdo premium** - Paywall opcional

## Database Schema

### Tabela Principal
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  
  -- Mídia
  avatar_url TEXT,
  cover_url TEXT,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  premium_type premium_type DEFAULT 'free',
  is_business BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  
  -- Estatísticas (denormalizadas para performance)
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  likes_received_count INTEGER DEFAULT 0,
  
  -- Configurações
  is_private BOOLEAN DEFAULT false,
  show_last_seen BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perfil estendido
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  
  -- Pessoal
  birth_date DATE,
  location TEXT,
  website TEXT,
  phone VARCHAR(20),
  
  -- Interesses
  interests TEXT[],
  relationship_status TEXT,
  looking_for TEXT[],
  languages TEXT[],
  
  -- Localização
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'BR',
  
  -- Business
  company_name TEXT,
  business_category TEXT,
  business_description TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações de privacidade
CREATE TABLE user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  
  -- Perfil
  who_can_see_posts privacy_level DEFAULT 'everyone',
  who_can_see_stories privacy_level DEFAULT 'everyone', 
  who_can_see_followers privacy_level DEFAULT 'everyone',
  
  -- Interações
  who_can_message privacy_level DEFAULT 'everyone',
  who_can_comment privacy_level DEFAULT 'everyone',
  who_can_mention privacy_level DEFAULT 'everyone',
  
  -- Notificações
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  
  -- Conteúdo
  show_nsfw_content BOOLEAN DEFAULT false,
  nsfw_content_creator BOOLEAN DEFAULT false,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## APIs Principais

### Perfil Público
```typescript
GET    /api/v1/users/[id]            // Perfil público
GET    /api/v1/users/[id]/posts      // Posts do usuário
GET    /api/v1/users/[id]/followers  // Seguidores (se permitido)
GET    /api/v1/users/[id]/following  // Seguindo (se permitido)
POST   /api/v1/users/[id]/follow     // Seguir/deixar de seguir
```

### Perfil Próprio
```typescript
GET    /api/v1/profile               // Meu perfil completo
PUT    /api/v1/profile               // Atualizar perfil
PUT    /api/v1/profile/avatar        // Upload de avatar
PUT    /api/v1/profile/cover         // Upload de cover
GET    /api/v1/profile/analytics     // Analytics (Diamond+)
```

### Configurações
```typescript
GET    /api/v1/profile/settings      // Todas as configurações
PUT    /api/v1/profile/settings      // Atualizar configurações
PUT    /api/v1/profile/privacy       // Configurações de privacidade
DELETE /api/v1/profile/deactivate    // Desativar conta
```

### Profile Seals
```typescript
GET    /api/v1/users/[id]/seals      // Seals do usuário
GET    /api/v1/profile/seals         // Meus seals recebidos
GET    /api/v1/profile/seals/stats   // Estatísticas de seals
```

## Cache Strategy

```typescript
// Perfis públicos
user:${userId}                       // TTL: 30 min
user:${userId}:followers            // TTL: 1 hour
user:${userId}:following            // TTL: 1 hour

// Estatísticas
user:${userId}:stats                // TTL: 15 min
user:${userId}:seals                // TTL: 10 min

// Analytics (Diamond+)
analytics:${userId}:${period}       // TTL: 6 hours
```

## SEO e Otimização

### Meta Tags Dinâmicas
```html
<meta property="og:title" content="@username no OpenLove" />
<meta property="og:description" content="Bio do usuário..." />
<meta property="og:image" content="avatar_url" />
<meta property="og:type" content="profile" />
```

### URL Structure
- `/@username` - Perfil público
- `/@username/posts` - Posts do usuário
- `/@username/about` - Informações detalhadas

## Verificação de Business

### Processo de Verificação
1. **Verificação pessoal** - Pré-requisito obrigatório
2. **Documentos empresariais** - CNPJ, contrato social
3. **Comprovação de renda** - Últimas declarações
4. **Análise manual** - Equipe especializada
5. **Aprovação** - Badge dourado ativado

### Benefícios Business
- **Comissão reduzida** - 10% vs 15-20%
- **Ferramentas avançadas** - Analytics, automação
- **Suporte prioritário** - Atendimento especializado
- **Badge dourado** - Credibilidade aumentada

## Problemas Conhecidos

1. **Avatar upload slow** - Uploads grandes podem demorar
2. **Stats inconsistency** - Ocasionalmente contadores dessincronizados
3. **Privacy settings delay** - Mudanças demoram para propagar
4. **Mobile scroll issues** - Problemas em alguns dispositivos iOS
5. **Analytics lag** - Dados podem ter delay de até 1 hora

## TODOs / Melhorias

- [ ] Profile themes customizáveis
- [ ] Multiple avatar options
- [ ] Profile video introduction
- [ ] Advanced privacy controls
- [ ] Profile backup/export
- [ ] Social media integration
- [ ] QR code for profile sharing
- [ ] Profile widgets for websites
- [ ] Advanced search filters
- [ ] Profile collaboration features
- [ ] Auto-generated bio suggestions
- [ ] Profile A/B testing

## Dependências Externas

- **Supabase Storage** - Armazenamento de mídia
- **Sharp** - Processamento de imagens
- **LocationIQ** - Geocoding de localização
- **Google Analytics** - Tracking de comportamento
- **Cloudflare** - CDN e otimização

## Configuração

### Environment Variables
```bash
# Profile features
PROFILE_ANALYTICS_ENABLED=true
PROFILE_SEALS_ENABLED=true
BUSINESS_VERIFICATION_ENABLED=true

# Upload limits
MAX_AVATAR_SIZE=5242880          # 5MB
MAX_COVER_SIZE=10485760          # 10MB
MAX_GALLERY_PHOTOS=12

# SEO
PROFILE_SEO_ENABLED=true
PROFILE_CANONICAL_DOMAIN=openlove.com.br
```

## Última Atualização

**Data**: 2025-08-07  
**Versão**: v0.3.3-alpha  
**Status**: Sistema completo com responsividade e analytics funcionais