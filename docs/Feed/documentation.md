# Sistema de Feed - OpenLove

## Visão Geral

O sistema de feed do OpenLove é o coração da plataforma social, gerenciando timeline, posts, interações e algoritmos de recomendação com foco em conteúdo adulto monetizável.

## Componentes Principais

### Frontend Components
- `TimelineFeed` - Feed principal com abas (Para Você, Seguindo, Explorar)
- `PostCard` - Card individual de post com interações
- `CreatePost` - Formulário de criação de posts
- `MediaViewer` - Visualizador de mídia com fullscreen
- `PostActions` - Ações do post (curtir, comentar, compartilhar)
- `PostComments` - Sistema de comentários
- `SecureMedia` - Componente de mídia com watermark

### Backend Components
- `/api/v1/posts/*` - CRUD de posts
- `/api/v1/feed/*` - Algoritmo de feed
- `/api/v1/interactions/*` - Curtidas, comentários, shares
- Algorithm Service - Motor de recomendações
- Media Processing - Processamento de imagens/vídeos

## Tipos de Posts

### Por Conteúdo
1. **Texto** - Posts somente texto (todos os planos)
2. **Imagem** - 1-5 imagens (Gold+)
3. **Vídeo** - Vídeos até 60s (Gold+)
4. **Áudio** - Mensagens de voz (Diamond+)
5. **Poll** - Enquetes interativas (Diamond+)

### Por Visibilidade
1. **Público** - Visível para todos
2. **Seguidores** - Apenas seguidores
3. **Premium** - Apenas assinantes pagos
4. **Privado** - Rascunho/não publicado

## Algoritmo de Feed

### Abas do Timeline

#### 1. Para Você (For You)
- **Algoritmo ML** baseado em interações
- **Peso das interações**:
  - Curtida: 1 ponto
  - Comentário: 3 pontos
  - Compartilhamento: 5 pontos
  - Tempo de visualização: 0.1 ponto/segundo
- **Fatores de ranking**:
  - Engajamento recente (70%)
  - Similaridade de interesse (20%)
  - Novidade temporal (10%)
- **Cache**: 5 minutos

#### 2. Seguindo (Following)
- **Ordem cronológica** dos seguidos
- **Boosts pagos** aparecem em destaque
- **Posts premium** sinalizados
- **Cache**: 10 minutos

#### 3. Explorar (Explore)
- **Trending posts** das últimas 24h
- **Conteúdo viral** com alto engajamento
- **Descoberta de novos criadores**
- **Filtros por categoria** (opcional)
- **Cache**: 15 minutos

### Sistema de Pontuação
```typescript
interface PostScore {
  baseScore: number;        // Engajamento total
  timeDecay: number;        // Decaimento temporal
  userAffinity: number;     // Afinidade com criador
  contentQuality: number;   // Qualidade do conteúdo
  premiumBoost: number;     // Boost pago
  finalScore: number;       // Score final
}
```

## Restrições por Plano

### Free Users
- ❌ Não podem fazer upload de mídia
- ✅ Podem curtir/comentar/compartilhar
- ✅ Veem todos os posts públicos
- 📢 Veem ads a cada 5 posts
- 📊 Timeline limitada a 20 posts por carregamento

### Gold Users
- ✅ Upload de até 5 imagens por post
- ✅ Vídeos até 30 segundos
- ✅ Criação de polls simples
- 📢 Veem ads a cada 10 posts
- 📊 Timeline com 50 posts por carregamento

### Diamond Users
- ✅ Mídia ilimitada (até 10 por post)
- ✅ Vídeos até 60 segundos
- ✅ Mensagens de áudio
- ✅ Polls avançadas com múltiplas opções
- ✅ Analytics detalhados
- ✅ Podem monetizar conteúdo
- 🚫 Sem anúncios
- 📊 Timeline ilimitada

## Sistema de Interações

### Tipos de Interação
```typescript
interface PostInteraction {
  type: 'like' | 'comment' | 'share' | 'save' | 'report';
  userId: string;
  postId: string;
  timestamp: Date;
  metadata?: {
    commentText?: string;
    shareMessage?: string;
    reportReason?: string;
  };
}
```

### Contadores em Tempo Real
- WebSocket para atualizações instantâneas
- Otimistic updates no frontend
- Debounce para evitar spam
- Rate limiting por usuário

## Processamento de Mídia

### Imagens
- **Formatos**: JPEG, PNG, WebP, AVIF
- **Tamanho máximo**: 10MB por arquivo
- **Compressão**: Automática com quality 85%
- **Redimensionamento**: Múltiplas resoluções (thumbnail, medium, full)
- **Watermark**: Aplicado em conteúdo premium

### Vídeos
- **Formatos**: MP4, WebM, MOV
- **Duração**: 30s (Gold), 60s (Diamond)
- **Tamanho**: 100MB máximo
- **Processamento**: FFmpeg para otimização
- **Thumbnail**: Frame no segundo 1

### Áudio
- **Formatos**: MP3, OGG, WAV
- **Duração**: 60s máximo
- **Processamento**: Normalização de volume
- **Visualização**: Waveform gerada automaticamente

## Cache e Performance

### Estratégias de Cache
```typescript
// Timeline feeds (SWR)
timeline:${userId}:${tab}:${page}    // TTL: 5-15min
post:${postId}                       // TTL: 30min
user_posts:${userId}:${page}        // TTL: 10min
trending_posts                       // TTL: 5min

// Interações
post_likes:${postId}                // TTL: 2min
post_comments:${postId}:${page}     // TTL: 3min
```

### Otimizações
- **Lazy loading** de mídia off-screen
- **Virtual scrolling** para feeds longos
- **Image optimization** com Next.js
- **Prefetch** de próximas páginas
- **Compression** de payloads grandes

## APIs Principais

### Endpoints CRUD
```typescript
GET    /api/v1/posts              // Listar posts (com filtros)
POST   /api/v1/posts              // Criar post
GET    /api/v1/posts/[id]         // Obter post específico
PUT    /api/v1/posts/[id]         // Atualizar post
DELETE /api/v1/posts/[id]         // Deletar post

// Timeline feeds
GET    /api/v1/feed/for-you       // Feed algorítmico
GET    /api/v1/feed/following     // Feed dos seguidos
GET    /api/v1/feed/explore       // Feed de exploração

// Interações
POST   /api/v1/posts/[id]/like    // Curtir/descurtir
POST   /api/v1/posts/[id]/comment // Comentar
POST   /api/v1/posts/[id]/share   // Compartilhar
```

### Payloads Exemplo
```typescript
// Criar post
{
  content: "Texto do post",
  mediaFiles: File[],
  visibility: "public",
  isPremium: false,
  tags: ["tag1", "tag2"]
}

// Curtir post
{
  action: "like" // ou "unlike"
}

// Comentário
{
  text: "Ótimo post!",
  parentCommentId?: string // Para replies
}
```

## Database Schema

### Tabelas Principais
```sql
-- Posts principais
posts (
  id, user_id, content, media_urls, 
  visibility, is_premium, created_at,
  like_count, comment_count, share_count
)

-- Interações
post_likes (user_id, post_id, created_at)
post_comments (id, post_id, user_id, content, parent_id)
post_shares (user_id, post_id, message, created_at)

-- Mídia
post_media (
  id, post_id, url, type, size,
  width, height, duration, processed
)

-- Timeline cache
user_timeline_cache (
  user_id, tab, page, data, expires_at
)
```

## Moderação de Conteúdo

### Automática
- **AI Content Filtering** - Detecta conteúdo inadequado
- **Spam Detection** - Identifica posts repetitivos
- **DMCA Scanner** - Verifica direitos autorais
- **Age Verification** - Confirma conteúdo 18+

### Manual
- **Sistema de Reports** - Usuários podem reportar
- **Moderator Dashboard** - Interface para moderadores
- **Content Flags** - Marcação de conteúdo sensível
- **User Warnings** - Sistema de advertências

## Monetização

### Posts Premium
- Apenas Diamond+ podem criar
- Paywall automático para não-assinantes
- Preview limitado (primeiras linhas + thumbnail)
- Analytics de conversão

### Boosts Pagos
- Aumenta visibilidade no feed
- Preços dinâmicos baseados em alcance
- Targeting por demografia/interesses
- ROI tracking em tempo real

## Analytics e Métricas

### Métricas por Post
```typescript
interface PostAnalytics {
  impressions: number;      // Visualizações
  reach: number;           // Usuários únicos
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  demographics: {
    ageGroups: Record<string, number>;
    locations: Record<string, number>;
    plans: Record<string, number>;
  };
  revenue?: {
    premiumViews: number;
    earnings: number;
    conversions: number;
  };
}
```

### Dashboard do Criador
- Gráficos de engajamento
- Análise de audiência
- Performance de conteúdo
- Receita e conversões (Diamond+)

## Problemas Conhecidos

1. **Performance em feeds longos** - Virtual scrolling nem sempre funciona
2. **Cache inconsistency** - Raramente timelines dessincronizadas
3. **Video processing delays** - Vídeos grandes demoram para processar
4. **Mobile media upload** - iOS tem limitações de tamanho
5. **Algorithm bias** - Favorece conteúdo visual vs texto

## TODOs / Melhorias

- [ ] Implementar Stories integration no feed
- [ ] Adicionar reações além de curtidas
- [ ] Sistema de hashtags automáticas
- [ ] Feed personalizado por interesses
- [ ] Live streaming integration
- [ ] Cross-posting para outras redes
- [ ] AI-generated captions
- [ ] Advanced post scheduling
- [ ] Collaborative posts
- [ ] Post templates para criadores

## Dependências Externas

- **Supabase Storage** - Armazenamento de mídia
- **FFmpeg** - Processamento de vídeo
- **Sharp** - Processamento de imagens
- **AWS CloudFront** - CDN para mídia
- **Redis Upstash** - Cache distribuído
- **OpenAI** - Moderação de conteúdo AI

## Última Atualização

**Data**: 2025-08-07  
**Versão**: v0.3.3-alpha  
**Status**: Sistema completo com algoritmo ML ativo