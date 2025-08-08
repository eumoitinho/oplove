# Sistema de Stories - OpenLove

## Visão Geral

Sistema de conteúdo efêmero estilo Instagram/WhatsApp Stories com funcionalidades avançadas de monetização, boosts pagos e sistema de presentes (seals) exclusivo do OpenLove.

## Componentes Principais

### Frontend Components
- `StoriesCarousel` - Carrossel horizontal de stories
- `StoryViewer` - Visualizador fullscreen com controles
- `StoryCreator` - Interface de criação de stories
- `StoryBoostModal` - Modal para comprar boosts
- `ProfileSealsModal` - Modal para enviar presentes
- `StoryReactions` - Sistema de reações rápidas
- `StoryAnalytics` - Dashboard de performance (Diamond+)

### Backend Components
- `/api/v1/stories/*` - CRUD de stories
- `/api/v1/story-boosts/*` - Sistema de boosts
- `/api/v1/profile-seals/*` - Sistema de presentes
- Story Expiration Service - Auto-exclusão após 24h
- Credits Service - Gerenciamento de créditos

## Funcionalidades Core

### 1. Criação de Stories
- **Mídia suportada**: Foto, vídeo (até 15s)
- **Texto overlay**: Texto sobre mídia com cores/fontes
- **Filtros básicos**: 8 filtros pré-definidos
- **Music overlay**: Adicionar música (Diamond+)
- **Drawing tools**: Desenhar sobre a mídia (Diamond+)

### 2. Visualização
- **Navegação**: Tap para avançar, hold para pausar
- **Progress bars**: Indicadores de progresso por story
- **Swipe navigation**: Deslizar para mudar de usuário
- **Auto-advance**: Avanço automático após 5s
- **Reactions**: 6 emojis rápidos (❤️🔥😍🤔😢😡)

### 3. Interações
- **Views tracking**: Contagem de visualizações
- **Direct replies**: Mensagem privada ao criador
- **Story reactions**: Reações que aparecem como notificações
- **Profile seals**: Presentes virtuais pagos

## Limites por Plano

### Free Users
- ❌ **Não podem postar** stories (apenas visualizar)
- ❌ Exceção: Usuários verificados podem postar 3/dia
- ✅ Podem reagir e responder
- ❌ Não podem enviar seals

### Gold Users
- ✅ **5 stories/dia** (não verificados)
- ✅ **10 stories/dia** (verificados)
- ✅ Filtros básicos
- ❌ Não podem fazer boost
- ✅ Podem enviar seals básicos

### Diamond Users
- ✅ **10 stories/dia** (não verificados)
- ✅ **Ilimitado** (verificados)
- ✅ Todos os recursos de edição
- ✅ Podem fazer boosts
- ✅ Analytics completos
- ✅ Todos os seals disponíveis

### Couple Users (Diamond para 2)
- ✅ Mesmos limites que Diamond
- ✅ Stories sincronizadas entre os dois perfis
- ✅ Badge especial "Dupla Verificada"

## Sistema de Boosts

### Tipos de Boost
```typescript
interface StoryBoost {
  duration: '6h' | '12h' | '24h';
  cost: 50 | 90 | 150;     // em créditos
  multiplier: 2 | 3.5 | 5; // multiplicador de alcance
  targeting?: {
    location: string[];
    interests: string[];
    ageRange: [number, number];
  };
}
```

### Como Funciona
1. **Story owner** clica em "Boost this story"
2. **Seleciona duração** e configurações de targeting
3. **Confirma pagamento** com saldo de créditos
4. **Story aparece** em posição privilegiada
5. **Analytics em tempo real** durante o boost

### Posicionamento
- Stories com boost aparecem **primeiro** no carrossel
- **Ícone especial** (🚀) indica story boostado
- **Maior visibilidade** no explore
- **Cross-promotion** em outros feeds

## Sistema de Profile Seals (Presentes)

### Catálogo de Seals
```typescript
interface ProfileSeal {
  id: string;
  name: string;
  icon: string;
  cost: number;        // créditos
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  category: 'love' | 'appreciation' | 'celebration' | 'luxury';
}
```

### Seals Disponíveis
1. **Rosa** (🌹) - 15 créditos - "Você é especial"
2. **Coração de Ouro** (💛) - 50 créditos - "Amor verdadeiro"
3. **Estrela** (⭐) - 25 créditos - "Você brilha"
4. **Diamante** (💎) - 100 créditos - "Precioso como diamante"
5. **Coroa Real** (👑) - 80 créditos - "Realeza pura"
6. **Fogo** (🔥) - 30 créditos - "Você é fire!"
7. **Troféu de Ouro** (🏆) - 60 créditos - "Campeão/ã"
8. **Unicórnio** (🦄) - 75 créditos - "Único e mágico"
9. **Borboleta** (🦋) - 20 créditos - "Livre como borboleta"
10. **Sol** (☀️) - 35 créditos - "Você ilumina meu dia"

### Como Enviar
1. **Durante visualização** do story, tap no ícone de presente
2. **Seleção do seal** no modal
3. **Confirmação** com preview e saldo
4. **Notificação** enviada ao destinatário
5. **Aparece no perfil** do destinatário por 7 dias

## Sistema de Créditos

### Formas de Obter Créditos
```typescript
interface CreditPackage {
  credits: number;
  price: string;      // em reais
  bonus: number;      // % bônus
  popular?: boolean;
}

// Pacotes disponíveis
[
  { credits: 100, price: 'R$ 10,00', bonus: 0 },
  { credits: 500, price: 'R$ 45,00', bonus: 10 },     // Popular
  { credits: 1000, price: 'R$ 80,00', bonus: 25 },
  { credits: 2500, price: 'R$ 180,00', bonus: 30 },
  { credits: 5000, price: 'R$ 320,00', bonus: 40 }
]
```

### Gastos de Créditos
- **Story boosts**: 50-150 créditos
- **Profile seals**: 15-100 créditos
- **Profile boosts**: 200+ créditos (futuro)
- **Premium reactions**: 5-10 créditos (futuro)

## Analytics para Stories

### Métricas Básicas (Gold+)
- Visualizações totais
- Visualizações únicas
- Taxa de conclusão
- Reações recebidas
- Replies recebidas

### Métricas Avançadas (Diamond)
```typescript
interface StoryAnalytics {
  impressions: number;
  uniqueViews: number;
  completionRate: number;
  averageViewTime: number;
  reactions: {
    like: number;
    love: number;
    fire: number;
    wow: number;
    sad: number;
    angry: number;
  };
  replies: number;
  sealsReceived: {
    [sealId: string]: {
      count: number;
      totalValue: number;
    };
  };
  demographics: {
    byAge: Record<string, number>;
    byLocation: Record<string, number>;
    byPlan: Record<string, number>;
  };
  boost?: {
    active: boolean;
    remaining: number;
    impressionsGained: number;
    creditsSpent: number;
  };
}
```

## Database Schema

### Tabelas Principais
```sql
-- Stories principais
CREATE TABLE stories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  media_url TEXT NOT NULL,
  media_type story_media_type NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Visualizações
CREATE TABLE story_views (
  story_id UUID REFERENCES stories(id),
  viewer_id UUID REFERENCES users(id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reaction story_reaction_type,
  PRIMARY KEY (story_id, viewer_id)
);

-- Replies
CREATE TABLE story_replies (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  sender_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boosts
CREATE TABLE story_boosts (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  user_id UUID REFERENCES users(id),
  duration INTERVAL NOT NULL,
  credits_spent INTEGER NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  target_settings JSONB
);

-- Créditos
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transações
CREATE TABLE user_credit_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type credit_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  reference_id UUID, -- story_id, seal_id, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile Seals
CREATE TABLE profile_seals (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  cost INTEGER NOT NULL,
  rarity seal_rarity NOT NULL,
  description TEXT,
  category TEXT
);

-- Seals enviados
CREATE TABLE user_profile_seals (
  id UUID PRIMARY KEY,
  receiver_id UUID REFERENCES users(id),
  sender_id UUID REFERENCES users(id),
  seal_id UUID REFERENCES profile_seals(id),
  story_id UUID REFERENCES stories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);
```

## APIs Principais

### Stories CRUD
```typescript
GET    /api/v1/stories              // Listar stories (seguidos + próprios)
POST   /api/v1/stories              // Criar story
DELETE /api/v1/stories/[id]         // Deletar story (próprio)
GET    /api/v1/stories/[id]/views   // Ver quem viu (próprio)

// Interações
POST   /api/v1/stories/[id]/view    // Marcar como visto
POST   /api/v1/stories/[id]/react   // Reagir
POST   /api/v1/stories/[id]/reply   // Responder

// Boosts
POST   /api/v1/stories/[id]/boost   // Fazer boost
GET    /api/v1/stories/[id]/boost   // Status do boost

// Créditos
GET    /api/v1/credits/balance      // Saldo atual
POST   /api/v1/credits/purchase     // Comprar créditos
GET    /api/v1/credits/history      // Histórico de transações

// Profile Seals
GET    /api/v1/seals/catalog        // Catálogo de seals
POST   /api/v1/seals/gift           // Enviar seal
GET    /api/v1/seals/received       // Seals recebidos
```

## Cache Strategy

```typescript
// Stories feeds
stories:${userId}:following         // TTL: 5 min
stories:boosted                    // TTL: 2 min
story:${storyId}:views            // TTL: 1 min

// User data
credits:${userId}:balance         // TTL: 30 sec
seals:catalog                     // TTL: 1 hour
user:${userId}:seals             // TTL: 10 min
```

## Real-time Features

### WebSocket Events
```typescript
// Stories
'story:new'         // Nova story de seguido
'story:expired'     // Story expirou
'story:boosted'     // Story recebeu boost

// Interações
'story:viewed'      // Alguém viu sua story
'story:reaction'    // Reação na sua story
'story:reply'       // Reply na sua story
'story:seal'        // Seal recebido

// Créditos
'credits:updated'   // Saldo alterado
'credits:low'       // Saldo baixo (< 50)
```

## Configurações e Limites

### Environment Variables
```bash
# Features
STORIES_ENABLED=true
STORY_BOOSTS_ENABLED=true
PROFILE_SEALS_ENABLED=true

# Limites
STORY_MAX_DURATION=15              # segundos
STORY_MAX_FILE_SIZE=50485760      # 50MB
STORY_EXPIRY_HOURS=24

# Créditos
CREDITS_MIN_PURCHASE=100
CREDITS_MAX_PURCHASE=10000
SEAL_MIN_COST=15
SEAL_MAX_COST=200
```

## Moderação

### Automática
- **Content filtering** em todos os uploads
- **Spam detection** para stories repetitivas
- **NSFW classification** automática
- **Audio detection** para música protegida

### Manual
- **Report system** para stories inapropriadas
- **Moderator tools** para review rápida
- **Auto-expire** stories reportadas múltiplas vezes
- **User warnings** por violações

## Problemas Conhecidos

1. **iOS video upload** - Limitações de formato/tamanho
2. **Story sync delays** - Ocasionalmente stories demoram para aparecer
3. **Boost targeting** - Ainda não implementado completamente
4. **Analytics delays** - Métricas podem ter delay de 5-10min
5. **Credits race conditions** - Raramente créditos são debitados duas vezes

## TODOs / Melhorias

- [ ] Music library integration (Spotify API)
- [ ] AR filters e efeitos
- [ ] Story highlights permanentes
- [ ] Group stories colaborativas
- [ ] Story templates para negócios
- [ ] Advanced targeting para boosts
- [ ] Seasonal seals (Natal, etc.)
- [ ] Story contests e challenges
- [ ] Integration com feed posts
- [ ] Stories scheduling

## Dependências Externas

- **Supabase Storage** - Armazenamento de mídia
- **FFmpeg** - Processamento de vídeo
- **Sharp** - Processamento de imagens
- **WebSocket** - Real-time updates
- **Stripe/PIX** - Pagamento de créditos
- **Content Moderation AI** - Filtragem automática

## Última Atualização

**Data**: 2025-08-07  
**Versão**: v0.3.3-alpha  
**Status**: Sistema completo e funcional com monetização ativa