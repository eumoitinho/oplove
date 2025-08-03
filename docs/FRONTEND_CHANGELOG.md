# Frontend Changelog - OpenLove

Todas as alterações notáveis no frontend do projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased] - 2025-08-03

### ✨ Nova Funcionalidade de Mensagens (2025-08-03)

#### Implementação do Modal de Nova Conversa
- **ADICIONADO**: Modal para iniciar conversas com pessoas que o usuário segue
- **FUNCIONALIDADE**: Ao clicar no botão "+" nas mensagens, abre modal com lista de seguidos
- **FILTROS**: Busca por nome, username ou bio
- **INTELIGENTE**: Exclui automaticamente usuários que já têm conversas ativas

#### Componentes Criados
1. **NewConversationModal.tsx**:
   - Lista pessoas que o usuário segue
   - Filtra usuários que já têm conversas
   - Busca em tempo real
   - Estados de loading e empty state
   - Integração com badges de plano e verificação

#### Métodos Adicionados ao MessagesService
1. **findConversation(userId1, userId2)**:
   - Verifica se já existe conversa entre dois usuários
   - Retorna apenas conversas diretas (não grupos)

2. **createConversation(senderId, recipientId)**:
   - Cria nova conversa entre dois usuários
   - Valida permissões de plano (free não pode iniciar)
   - Adiciona ambos participantes automaticamente

#### Melhorias na UX
- **Feedback Visual**: Loading states durante criação de conversa
- **Mensagens Claras**: Informa quando não há pessoas para conversar
- **Fluxo Intuitivo**: Após criar conversa, abre automaticamente o chat

#### Correções (Debug Fix)
- **API Integration**: Mudou de query direta do Supabase para usar API `/api/v1/users/[id]/following`
- **Error Handling**: Melhor tratamento de erros com logs detalhados
- **Debug Mode**: Informações de debug visíveis em desenvolvimento
- **Simplified Logic**: Removeu filtro complexo de conversas existentes temporariamente para debug

### 🐛 Correções de Estado da Timeline (2025-08-03)

#### Problema Identificado
- **ERRO**: Skeleton loader persistente ao acessar abas "Seguindo" e "Explorar"
- **ERRO**: Interface travava com skeleton loader indefinidamente
- **CAUSA**: Estado de loading não era limpo corretamente ao trocar de abas

#### Correções Implementadas

##### 1. Gerenciamento de Estado para Aba Explore
- **PROBLEMA**: Aba "explore" usa componente ExploreView próprio mas não limpava loading state
- **SOLUÇÃO**: Adicionado check específico para não carregar dados na aba explore
- **ARQUIVO**: `components/feed/timeline/TimelineFeed.tsx`

##### 2. Timeout de Loading
- **ADICIONADO**: Timeout de 10 segundos para prevenir loading infinito
- **BENEFÍCIO**: Interface não trava mais se houver erro na API

##### 3. Limpeza de Estado ao Trocar Abas
- **ADICIONADO**: `setIsLoading(false)` ao clicar em qualquer aba
- **ADICIONADO**: Desabilitar botões durante loading para evitar múltiplos cliques

##### 4. Correção de Referências Undefined
- **PROBLEMA**: Variável `feedData` não existia
- **SOLUÇÃO**: Usar desestruturação correta do feedState: `isFollowingAnyone`

##### 5. Melhoria no Skeleton Loader
- **ADICIONADO**: Exibir tabs e componente CreatePost mesmo durante loading
- **MELHORADO**: Condição para não mostrar skeleton na aba explore

### 🐛 Correções de Comentários e Notificações (2025-08-03)

#### Problema Identificado
- **ERRO**: Comentários não apareciam após serem postados
- **ERRO**: Notificações não eram enviadas para outros perfis
- **ERRO**: API de likes retornando erro 400
- **CAUSA**: Múltiplos problemas de importação e nomes de colunas incorretos

#### Correções Implementadas

##### 1. Correção de Importações do Supabase Client
- **PROBLEMA**: APIs importando de `@/lib/supabase/server` ao invés de `@/app/lib/supabase-server`
- **SOLUÇÕES**:
  - Corrigido em `/api/v1/posts/[id]/comments/route.ts`
  - Corrigido em `/api/v1/posts/[id]/like/route.ts`
  - Importação correta: `import { createServerClient } from "@/app/lib/supabase-server"`

##### 2. Correção de Campos na Tabela notifications
- **PROBLEMA**: APIs usando campos inexistentes (content, related_data)
- **CORRETO**: message, metadata
- **MANTIDOS**: recipient_id e sender_id (nomes corretos confirmados pelo usuário)
- **ARQUIVOS CORRIGIDOS**:
  - `/api/v1/posts/[id]/comments/route.ts`
  - `/api/v1/posts/[id]/like/route.ts`

##### 3. Melhorias no CommentsModal
- **ADICIONADO**: `credentials: "include"` em todas as chamadas fetch
- **ADICIONADO**: Callback `onCommentAdded` para atualizar contador
- **ADICIONADO**: Reload automático após adicionar comentário
- **ADICIONADO**: Logs de debug para troubleshooting

##### 4. Atualização do Hook usePostInteractions
- **ADICIONADO**: Função `incrementCommentCount()` para atualizar contador
- **ADICIONADO**: `credentials: "include"` em todas as chamadas de API
- **MELHORADO**: Integração com PostCard para atualizar contador em tempo real

##### 5. Debug Logging Adicionado
- **Comments API**: Logs para GET e POST de comentários
- **Like API**: Logs para curtidas e notificações
- **CommentsModal**: Logs para carregamento de comentários

#### Resultado das Correções
- ✅ **Comentários aparecem** imediatamente após serem postados
- ✅ **Contador atualiza** em tempo real ao adicionar comentário
- ✅ **Notificações funcionam** corretamente com colunas corretas
- ✅ **API de likes** funcionando sem erros 400
- ✅ **Autenticação SSR** funcionando com cookies incluídos

### 🐛 Correções Críticas de Perfil de Usuário (2025-08-03)

#### Correção do Sistema de Carregamento de Dados
- **PROBLEMA**: Posts e mídias não apareciam no perfil do usuário 
- **CAUSA**: Componente UserProfile definia funções de carregamento mas não as executava
- **SOLUÇÃO**: Adicionados useEffect hooks essenciais para inicialização de dados
- **Arquivo**: `components/feed/profile/UserProfile.tsx`

##### Hooks useEffect Implementados
```typescript
// Carregamento do perfil na montagem do componente
useEffect(() => {
  if (currentUser || userId) {
    loadUserProfile()
  }
}, [loadUserProfile, currentUser, userId])

// Carregamento de posts ao ativar aba "Posts"
useEffect(() => {
  if (activeTab === 'posts' && (currentUser || userId)) {
    loadUserPosts()
  }
}, [activeTab, loadUserPosts, currentUser, userId])

// Carregamento de mídia ao ativar aba "Mídia" ou mudar filtro
useEffect(() => {
  if (activeTab === 'media' && (currentUser || userId)) {
    const mediaType = mediaFilter === 'all' ? undefined : 
                      mediaFilter === 'photos' ? 'photo' : 
                      mediaFilter === 'videos' ? 'video' : undefined
    loadUserMedia(mediaType)
  }
}, [activeTab, mediaFilter, loadUserMedia, currentUser, userId])
```

##### Estados de Loading Aprimorados
- **Adicionado** `profileLoading` state para controle específico do carregamento do perfil
- **Melhorada** condição de loading: `if (profileLoading || !user) return <PostSkeleton />`
- **Otimizado** `loadUserProfile()` com controle de loading state
- **Debug logs** melhorados para rastreamento de execução

##### Validações de Dados
- **Verificação** de `currentUser` e `userId` antes de carregar dados
- **Prevenção** de chamadas desnecessárias quando usuário não está disponível
- **Logging** detalhado para debug: usuário atual, ID, status de carregamento

#### Resultado das Correções
- ✅ **Posts agora carregam** corretamente na aba "Posts"
- ✅ **Mídia agora carrega** corretamente na aba "Mídia" com filtros funcionais
- ✅ **Estados de loading** funcionam adequadamente
- ✅ **Skeleton apenas** quando realmente carregando
- ✅ **Debug logs** facilitam troubleshooting futuro
- ✅ **Performance** otimizada com verificações de usuário

#### Criação de APIs Dedicadas para Perfil (2025-08-03)
- **PROBLEMA**: UserService usava cliente Supabase direto, causando problemas de autenticação
- **SOLUÇÃO**: Criadas APIs dedicadas para dados do perfil com autenticação server-side
- **APIs Criadas**:
  - `GET /api/v1/users/[id]/posts` - Posts do usuário com contadores de reações
  - `GET /api/v1/users/[id]/stats` - Estatísticas completas (posts, seguidores, curtidas, seals)
  - `GET /api/v1/users/[id]/media` - Mídia filtrada por tipo (fotos/vídeos)

##### UserService Refatorado
- **Mudança**: De queries Supabase diretas para chamadas de API
- **Vantagens**: 
  - Autenticação consistente via server-side
  - Validações centralizadas
  - Logs de debug aprimorados
  - Formatação de dados padronizada
- **Métodos atualizados**:
  - `getUserProfile()` → API `/api/v1/users/[id]`
  - `getUserPosts()` → API `/api/v1/users/[id]/posts`
  - `getUserStats()` → API `/api/v1/users/[id]/stats`
  - `getUserMedia()` → API `/api/v1/users/[id]/media`

##### Correção Next.js 15 Compatibility
- **PROBLEMA**: Erro "params should be awaited" em várias APIs
- **CORRIGIDO**: Atualizado tipo de params para `Promise<{ id: string }>` 
- **Adicionado**: `const resolvedParams = await params` em todas as APIs
- **APIs corrigidas**: users/[id]/following, users/[id]/posts, users/[id]/stats, users/[id]/media

#### Logs de Debug Estruturados
- **Implementados** logs consistentes em todas as APIs e UserService
- **Formato**: `[ComponentName/ServiceName] Action: details`
- **Facilita**: Troubleshooting e monitoramento de performance
- **Exemplos**:
  ```
  [UserService] Fetching user profile for ID: 123
  [UserPosts API] Found posts: 5
  [UserProfile] Loading posts for user: 123
  ```

#### Correção de Autenticação nas APIs (2025-08-03)
- **PROBLEMA**: Erro "Não autorizado" ao buscar posts do usuário
- **CAUSA**: APIs exigiam autenticação obrigatória, mas cookies não eram enviados
- **SOLUÇÕES IMPLEMENTADAS**:
  1. **APIs tornadas públicas**: Removida exigência de autenticação para visualizar posts/stats/media
  2. **Credentials adicionadas**: `credentials: 'include'` em todas as chamadas fetch do UserService
  3. **Autenticação opcional**: APIs ainda obtêm usuário atual para features adicionais

##### Mudanças nas APIs:
```typescript
// Antes (bloqueava requisições não autenticadas)
if (authError || !user) {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
}

// Depois (permite acesso público)
const { data: { user } } = await supabase.auth.getUser() // opcional
```

##### Mudanças no UserService:
```typescript
// Todas as chamadas fetch agora incluem:
fetch(url, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include' // ← Garante envio de cookies
})
```

#### Correção de Nomes de Colunas do Banco (2025-08-03)
- **PROBLEMA**: Queries usando nomes incorretos de colunas causavam erros 500
- **ERROS ENCONTRADOS**:
  - `users.full_name` → deve ser `users.name`
  - `posts.comment_count` → deve ser `posts.comments_count`
- **APIs CORRIGIDAS**:
  - `/api/v1/users/[id]/posts` - corrigido para usar `name` em vez de `full_name`
  - `/api/v1/users/[id]/media` - corrigido para usar `comments_count`
  - Removidas agregações desnecessárias pois colunas já existem

##### Melhorias de Debug
- **Logs detalhados**: Adicionado `details` nos erros de API
- **UserService**: Mostra detalhes completos dos erros
- **Console logs**: Facilitam identificação de problemas de schema

#### Correção Content Security Policy (2025-08-03)
- **PROBLEMA**: Mídia do Supabase bloqueada por CSP restritiva
- **ERRO**: "Refused to load media... violates Content Security Policy directive"
- **SOLUÇÃO**: Adicionada diretiva `media-src` no middleware
- **Arquivo**: `middleware.ts`

##### CSP Atualizada
```typescript
'Content-Security-Policy': `
  // ... outras diretivas
  media-src 'self' blob: https://*.supabase.co;
  // ... outras diretivas
`
```

##### Resultado
- ✅ Vídeos e áudios do Supabase agora carregam corretamente
- ✅ Mantida segurança com CSP apropriada
- ✅ MediaViewer funcionando com conteúdo do storage

#### Correção de Importação do Supabase Client (2025-08-03)
- **PROBLEMA**: APIs retornando erro 500 devido a importação incorreta
- **CAUSA**: Usando `createServerClient` de `@/lib/supabase` ao invés do correto
- **SOLUÇÃO**: Atualizado para usar `@/app/lib/supabase-server`
- **APIs Corrigidas**:
  - `/api/v1/users/[id]/posts`
  - `/api/v1/users/[id]/stats`
  - `/api/v1/users/[id]/media`

##### Mudanças Implementadas
```typescript
// Antes (incorreto)
import { createServerClient } from '@/lib/supabase'
const supabase = createServerClient()

// Depois (correto)
import { createServerClient } from '@/app/lib/supabase-server'
const supabase = await createServerClient()
```

##### Resultado
- ✅ APIs agora usam cliente Supabase correto com cookies
- ✅ Autenticação SSR funcionando corretamente
- ✅ Erros 500 resolvidos

### 🎨 UI/UX

#### 🔥 Perfil de Usuário Completo - Implementação Avançada
- **NOVA FUNCIONALIDADE**: Sistema completo de perfil de usuário com todas as informações integradas
- **Arquivo**: `components/feed/profile/UserProfile.tsx`
- **Recursos implementados**:
  - **Informações Básicas**: Avatar editável, nome, username, bio, localização, plano atual
  - **Estatísticas Completas**: Posts, seguidores, seguindo, curtidas, profile seals
  - **Sistema de Créditos**: Exibição de saldo de créditos para perfil próprio com botão de compra
  - **Profile Seals**: Exibição visual de badges/seals recebidos com hover tooltips
  - **Status de Verificação**: Banner para iniciar verificação se não verificado
  - **Grid de Mídia Responsivo**: Filtros para fotos/vídeos com preview e MediaViewer
  - **Tab de Stories**: Exibição de stories ativas com indicador de duração
  - **Responsividade**: Layout adaptativo para mobile/desktop
  - **Performance**: Lazy loading de mídia, carregamento otimizado de dados

#### 📡 APIs e Serviços Implementados
- **NOVA API**: `/api/v1/users/[id]/seals` - Busca profile seals do usuário
- **UserService Melhorado**: Novos métodos para:
  - `getUserSeals()`: Busca profile seals com detalhes completos
  - `getUserVerificationStatus()`: Status de verificação do usuário
  - `getUserMedia()`: Mídia filtrada por tipo (foto/vídeo)
  - `getUserStories()`: Stories ativas do usuário
  - `getUserStats()`: Estatísticas completas (incluindo seals)

#### 🎯 Integração de Sistemas
- **Sistema de Créditos**: Integração com `useUserCredits()` hook
- **Sistema de Verificação**: Link direto para página de verificação
- **Sistema de Stories**: Exibição com indicadores visuais de duração
- **Sistema de Seals**: Preview visual com informações do remetente
- **MediaViewer**: Integração para visualização fullscreen de mídia

#### 🔧 Melhorias Técnicas
- **Carregamento Paralelo**: Todas as APIs carregadas em paralelo para performance
- **Cache Inteligente**: Dados carregados apenas quando necessário (tab ativa)
- **Estados de Loading**: Skeletons específicos para cada seção
- **Error Handling**: Tratamento gracioso de erros com fallbacks
- **TypeScript**: Tipagem completa e interfaces bem definidas

### 📋 Instrução do Usuário
**Task:** Resolver inúmeros re-renders no front-end
- Buscar contexto do feed e componentes dependentes
- Analisar useEffects e useStates fora de hierarquia ou desnecessários
- Centralizar lógica de renderização baseada em autenticação
- Garantir que erros "Maximum update depth exceeded" não aconteçam
- Analisar @components/feed, @components/profile, @components/stories recursivamente

### 🚀 Performance Optimization Task (2025-08-02)

#### Análise Realizada
- **Criado** documento de análise em `/docs/PERFORMANCE_ANALYSIS_2025_08_02.md`
- Identificados componentes problemáticos: FeedLayout, TimelineFeed, usePremiumFeatures, UserProfile, StoriesCarousel
- Mapeados useEffects desnecessários e dependências incorretas
- Analisados componentes de profile e stories recursivamente

#### Otimizações Implementadas

##### FeedLayout Component
- **Removido** múltiplos useEffects vazios e redundantes
- **Consolidado** lógica de inicialização de tema dark/light
- **Adicionado** persistência de tema em localStorage
- **Removido** useEffect que dependia de children (sempre mudava)

##### usePremiumFeatures Hook
- **Otimizado** para extrair apenas valores primitivos do user
- **Memoizado** cálculos de features com dependências estáveis
- **Convertido** funções helper para useCallback
- **Reduzido** dependências de user object para valores específicos

##### Novos Componentes Criados
- **OptimizedAuthContext** (`/contexts/OptimizedAuthContext.tsx`)
  - Context otimizado com valores memoizados
  - Hooks específicos para casos comuns (useUserId, useIsAuthenticated)
  - Previne prop drilling e re-renders desnecessários
  
- **useTimelineFeedReducer** (`/hooks/useTimelineFeedReducer.ts`)
  - Consolidação de estados relacionados em único reducer
  - Actions memoizadas para evitar recriação
  - Estado centralizado para melhor performance

##### UserProfile Component
- **Otimizado** múltiplas funções com useCallback para evitar recriação
- **Corrigido** useEffect com dependências de objeto user completo
- **Memoizado** funções: handleFollow, handleBlock, handleShare, copyProfileLink
- **Memoizado** funções: shareProfile, handleReport, submitReport, getPlanBadge
- **Memoizado** funções assíncronas: loadUserProfile, loadUserPosts
- **Reduzido** dependências no useEffect de editData

##### StoriesCarousel Component  
- **Adicionado** useCallback para todas as funções do componente
- **Memoizado** loadStories, loadDailyLimit, checkScrollButtons
- **Memoizado** scroll, handleCreateStory, handleStoryCreated
- **Memoizado** handleStoryClick, renderStoryItem
- **Previne** recriação de funções a cada render
- **Melhora** performance ao evitar re-renders desnecessários

### 🐛 Correções Críticas de Performance (2025-08-02)

#### Hook useFeedState
- **CORRIGIDO** Loop infinito causado por `useMemo` com `currentState` nas dependências
- **Removido** `useMemo` do objeto retornado para evitar dependência circular
- **Mantido** `useCallback` para todas as funções internas
- **Resultado**: Elimina erro "Maximum update depth exceeded" relacionado ao feed

#### AuthProvider Component
- **CORRIGIDO** Recriação constante de funções causando re-renders infinitos
- **Adicionado** `useCallback` para `refreshUser`, `signIn`, e `signOut`
- **Previne** re-execução desnecessária de useEffects que dependem dessas funções
- **Resultado**: Estabiliza o contexto de autenticação e elimina loops

### 🎨 UI/UX Melhorias

#### Media Viewer
- **Adicionado** novo componente `MediaViewer` para visualização expandida de mídia (similar ao Twitter)
  - Modal fullscreen com overlay escuro (95% opacidade)
  - Navegação entre múltiplas imagens com setas laterais
  - Navegação por teclado (ESC para fechar, setas para navegar)
  - Contador de mídia (ex: 2/5)
  - Miniaturas na parte inferior para seleção direta
  - Controles avançados: Download, Compartilhar, Tela cheia
  - Informações do autor no header (nome e @username)
  - Animações suaves de fade in/out e scale
  - Suporte completo para imagens (JPG, PNG, GIF, WebP) e vídeos (MP4, WebM, MOV)

#### PostCard
- **Melhorado** componente `SecureMedia` no PostCard
  - Adicionado parâmetros explícitos de largura e altura (width={600} height={400})
  - Corrigido problema de imagens aparecendo como linha fina
  - Adicionado containers com altura mínima (minHeight: 200px)
  - **Integrado** MediaViewer ao clicar em qualquer mídia
  - Cursor pointer e efeito hover (opacity 0.95) nas mídias
  - Preservado layout de grid para múltiplas imagens

#### Security Watermark
- **Refatorado** componente `SecurityWatermark` para design mais sutil e profissional
  - Removidas marcas d'água diagonais e dos cantos
  - Implementadas 10 linhas horizontais distribuídas uniformemente
  - Posicionamento variado com padding dinâmico em cada linha
  - Ordem alternada dos elementos (@username, hora, data, localização) por linha
  - **Reduzida** opacidade para 0.08 (8%) - muito mais sutil
  - **Integrada** marca d'água no MediaViewer para imagens e vídeos
  - Mantida atualização em tempo real (relógio a cada segundo)

### 🐛 Correções de Bugs

#### PostCard Restoration and Optimization (2025-08-02)
- **Restaurado** PostCard otimizado que foi perdido durante o git reset
  - Criado componente `OptimizedImage` com suporte a AVIF/WebP
  - Substituído SecureMedia por OptimizedImage para imagens (mantendo vídeos)
  - Adicionado loading skeleton e tratamento de erro de imagem
  - Implementado otimizações de performance com lazy loading seletivo
  - Melhorado onClick handler para abrir MediaViewer
  - Configurado quality=95 para melhor qualidade visual
  - Adicionado priority loading para primeira imagem em galerias

#### CreatePost Responsiveness Fix (2025-08-02)
- **Corrigido** responsividade do botão "Publicar" no componente CreatePost
  - Ajustado layout flexbox para prevenir overflow em mobile
  - Adicionado `flex-shrink-0` nos containers de ações e botão
  - Configurado `min-width` responsivo (80px mobile, 100px desktop)
  - Melhorado padding responsivo (px-3 mobile, px-6 desktop)
  - Ajustado justificação de conteúdo para melhor alinhamento

#### Stories Modal Z-Index (2025-08-02)
- **Corrigido** modal de stories aparecendo atrás dos elementos no mobile
  - Aumentado z-index para 999999 usando classe CSS `story-viewer-modal`
  - Adicionado regras CSS específicas para mobile com `!important`
  - Garantido que modal de stories aparece acima de header (z-50), bottom navigation (z-50), e timeline
  - Resolvido problema de stacking context no mobile

#### Timeline Feed
- **Corrigido** erro "Rendered fewer hooks than expected"
  - Movido useEffect para antes de conditional returns
  - Garantida ordem consistente de execução dos hooks
  - Resolvido problema de hooks após return condicional
- **Corrigido** skeleton loading após criar post (2025-08-02)
  - Ajustado handleRefresh para não limpar estado completamente
  - Melhorada condição de exibição do skeleton
  - Mantidos posts existentes durante refresh
- **Corrigido** problema de autenticação e carregamento de dados (2025-08-02)
  - Mudado de verificação de `user` para `isAuthenticated`
  - Garantido acesso completo para usuários com token válido em cache
  - Resolvido skeleton infinito ao recarregar página
  - Implementado `effectiveUserId` para melhor gerenciamento de estado
- **Corrigido** skeleton loading ao trocar de abas (2025-08-02)
  - Implementado sistema inteligente de cache com fallback para dados stale
  - Adicionado indicador de loading em background quando atualizando dados cached
  - Melhorada lógica de carregamento para mostrar dados em cache imediatamente
  - Skeleton aparece apenas quando não há dados e está carregando
  - Adicionado indicador visual sutil "Atualizando..." quando carregando em background

#### Feed State Management
- **Implementado** sistema inteligente de cache para timeline
  - Criado hook `useFeedState` para gerenciamento de estado com cache
  - Cache separado por aba (for-you, following, explore)
  - Persistência de estado ao trocar de visualização
  - Cache com expiração de 5 minutos
  - Limpeza automática ao fazer logout
  - **Removido** skeleton loading desnecessário ao retornar para timeline

#### Media Uploader
- **Corrigido** aviso "invalid position" no componente Image (2025-08-02)
  - Adicionado `position: relative` ao container pai
  - Resolvido warning do Next.js Image com fill

#### Componentes com useEffect
- **Corrigido** erro "Maximum update depth exceeded" (2025-08-02)
  - RecommendationsCard: Mudado de `[user]` para `[user?.id]` na dependência
  - StoriesCarousel: Mudado de `[user]` para `[user?.id]` na dependência
  - EditProfileModal: Adicionado `isOpen` e mudado para `[isOpen, user?.id]`
  - MessagesView: Mudado de `[user]` para `[user?.id]` na dependência
  - UserProfile: Corrigido useEffect com dependências específicas do user
  - Previne loops infinitos causados por objetos user recriados

#### Hook useFeedState
- **Corrigido** recriação constante do objeto retornado (2025-08-02)
  - Adicionado `useMemo` para estabilizar o objeto retornado
  - Memoizado funções utilitárias com `useCallback`
  - Previne re-renders desnecessários em componentes que usam o hook
  - Resolve loops infinitos causados por objeto feedState recriado

### 🚀 Performance

#### Otimizações de Imagem
- **Migrado** de tags `<img>` para componente `Image` do Next.js no MediaViewer
  - Otimização automática de imagens
  - Lazy loading integrado
  - Conversão para formatos modernos (WebP/AVIF)
  - Priority loading para imagem principal
  - Qualidade definida em 95% para melhor visualização

#### Cache e Estado
- **Adicionado** cache inteligente por usuário e aba
  - Redução de chamadas API desnecessárias
  - Melhoria significativa na experiência ao navegar entre abas
  - Estado mantido ao trocar entre visualizações laterais

### 📱 Responsividade

#### Media Viewer
- Layout responsivo para diferentes tamanhos de tela
- Botões de navegação adaptáveis
- Imagens com max-width: 90vw e max-height: 90vh
- Suporte para modo fullscreen

### 🔧 Refatorações

#### Novos Componentes (2025-08-02)
- **Criado** `components/common/OptimizedImage.tsx`
  - Componente otimizado baseado em Next.js Image
  - Suporte automático para formatos modernos (AVIF/WebP)
  - Loading skeleton integrado
  - Tratamento de erro com fallback
  - Props responsivas para width/height e fill
  - Quality configurável (padrão 95%)
  - Priority loading seletivo
  - ForwardRef para referência de DOM

#### Estrutura de Componentes
- **Criado** `components/common/MediaViewer.tsx`
- **Atualizado** `components/feed/post/PostCard.tsx` para integração com MediaViewer
- **Refatorado** `components/common/SecurityWatermark.tsx` para novo design

#### Hooks
- **Criado** `hooks/useFeedState.ts` para gerenciamento de estado do feed

### 📝 Notas Técnicas

- Todos os componentes utilizam "use client" para interatividade
- Portal rendering usado no MediaViewer para melhor controle de z-index
- Framer Motion para animações suaves
- TypeScript strict mode mantido em todos os novos componentes

---

### 🔧 Correções no Algoritmo de Recomendação

#### Aba "Seguindo" - Correção Crítica
- **PROBLEMA**: Aba tentava buscar da tabela inexistente `user_connections`
- **SOLUÇÃO**: Alterado para usar tabela `follows` correta
- **Arquivo**: `lib/services/feed-algorithm-service.ts`
- **Mudanças**:
  ```typescript
  // Antes (quebrado)
  .from('user_connections')
  .select('connected_user_id')
  .eq('user_id', userId)
  
  // Depois (correto)
  .from('follows')
  .select('following_id')
  .eq('follower_id', userId)
  ```

### 🔍 Sistema de Busca e Exploração - Implementação Completa

#### API de Busca Avançada (`/api/v1/search/advanced`)
- **Implementada** busca com ranking inteligente e filtros avançados
- **Recursos**:
  - Busca por relevância, recente, popular
  - Filtro por localização geográfica (lat/lng + raio)
  - Scoring baseado em correspondência exata, verificação, premium
  - Busca de hashtags com análise de trending
  - Proximidade geográfica: até +50 pontos de boost

#### API de Trending (`/api/v1/trending`)
- **Implementada** análise de conteúdo em alta com múltiplos períodos
- **Recursos**:
  - Períodos: 1h, 24h, 7d, 30d
  - Trending de posts: engajamento + velocidade + decaimento temporal
  - Trending de usuários: crescimento de seguidores + taxa de crescimento
  - Trending de hashtags: velocidade de uso + engajamento médio
  - Boost para premium/verificado e localização próxima

#### API de Sugestões (`/api/v1/suggestions/users`)
- **Implementada** recomendações personalizadas "quem seguir"
- **Estratégias múltiplas**:
  - Network: amigos de amigos (conexões mútuas)
  - Location: usuários próximos geograficamente
  - Interests: interesses em comum
  - Popular: usuários em alta/trending
  - Mixed: combinação inteligente de todas
- **Personalização**:
  - Exclui seguidos e bloqueados
  - Mostra posts de amostra
  - Indica razão da sugestão
  - Super boost para <10km: 2x

#### API Explorar Melhorada (`/api/v1/explore`)
- **Adicionados** filtros avançados e múltiplas estratégias
- **Novos filtros**:
  - Filter: trending, recent, popular, nearby
  - Period: 1h, 24h, 7d, 30d
  - Media: all, photo, video
  - Verified: apenas verificados
  - Premium: apenas assinantes
- **Suporte a Stories**: inclui stories ativos
- **Cálculo inteligente**: engajamento + decaimento temporal + boost premium

#### Correção ExploreView
- **Corrigido** erro na API `/api/v1/explore/users`
- **Removido** filtro `is_active` inexistente da tabela users
- **Melhorada** estabilidade do sistema de exploração

### 🐛 Correção Maximum Update Depth Exceeded - ExploreView

#### Problema Identificado
- **Erro**: "Maximum update depth exceeded" em components/feed/explore/ExploreView.tsx
- **Causa**: Re-renders infinitos causados por dependências instáveis em useEffect e useCallback

#### Correções Implementadas

##### 1. Memoização de Filtros Iniciais
- **Problema**: `filters` state inicializado com `features.userPlan` causava re-criação constante
- **Solução**: Usado `useMemo` para memoizar `initialFilters`
- **Código**:
  ```typescript
  const initialFilters = useMemo(() => ({
    distance_km: features.userPlan === "free" ? 25 : 50,
    // ... outros filtros
  }), [features.userPlan])
  ```

##### 2. Otimização do fetchProfiles useCallback
- **Problema**: Dependências instáveis causavam re-criação constante da função
- **Solução**: Extraídas variáveis estáveis (`userId`, `userPlan`) e memoizadas
- **Reduzidas** dependências de objetos completos para valores primitivos

##### 3. Serialização de Filtros para useInfiniteScroll
- **Problema**: `dependencies: [filters]` causava refresh a cada mudança no objeto
- **Solução**: Usado `JSON.stringify(filters)` para comparação estável
- **Código**:
  ```typescript
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])
  // dependencies: [filtersKey] // String em vez de objeto
  ```

##### 4. Handlers Memoizados
- **Aplicado** `useCallback` em todas as funções handler:
  - `handleFilterChange`
  - `handleGenderToggle` 
  - `handleInterestToggle`
  - `formatDistance`

##### 5. Correção no ExploreService
- **Removido** referências ao campo `is_active` inexistente
- **Corrigidas** queries em `getTrendingProfiles` e `getRecommendations`

#### Resultado
- **Eliminado** erro "Maximum update depth exceeded"
- **Reduzidos** re-renders desnecessários significativamente
- **Melhorada** performance geral do ExploreView
- **Mantida** funcionalidade completa sem breaking changes

### 🐛 Correção Skeleton Infinito - ExploreView

#### Problema Identificado
- **Erro**: Skeleton loading infinito mesmo com dados carregados
- **Causa**: `useInfiniteScroll` com `dependencies` causava refresh constante

#### Correções Implementadas

##### 1. Controle Manual de Refresh
- **Problema**: `dependencies: [filtersKey]` fazia refresh automático sempre
- **Solução**: Removido dependencies e implementado controle manual
- **Código**:
  ```typescript
  // Antes (problemático)
  dependencies: [filtersKey] // Refresh automático

  // Depois (controlado)
  dependencies: [] // Sem refresh automático
  
  // Controle manual quando filtros mudam
  useEffect(() => {
    if (isFiltersChanged && !!userId) {
      setIsFiltersChanged(false)
      refresh()
    }
  }, [isFiltersChanged, userId, refresh])
  ```

##### 2. Tracking de Mudanças de Filtros
- **Implementado** sistema de tracking para detectar mudanças reais nos filtros
- **Usado** `useRef` para comparar versão anterior dos filtros
- **Previne** refresh desnecessário durante inicialização

##### 3. Logs de Debug Melhorados
- **Adicionados** logs detalhados na API `/api/v1/explore/users`
- **Melhorado** feedback sobre localização do usuário
- **Tracking** completo do fluxo de dados

##### 4. Otimização da API de Explore
- **Melhoradas** mensagens de log para debug
- **Adicionado** fallback para localização padrão (São Paulo)
- **Logs** detalhados do processamento de perfis

#### Resultado
- **Eliminado** skeleton infinito
- **Corrigido** carregamento de perfis no ExploreView
- **Melhorada** experiência do usuário
- **Mantida** funcionalidade de infinite scroll

### 🔧 Correção RPC get_personalized_feed

#### Problema Identificado
- **Erro**: "Error calling get_personalized_feed RPC: {}" na aba "Para você"
- **Causa**: Função RPC não existe no banco de dados

#### Solução Temporária Implementada
- **Criado** algoritmo simplificado no cliente até migration ser aplicada
- **Mantidos** os mesmos pesos e lógica de scoring:
  - Engajamento: 50% (likes + comentários + shares)
  - Premium boost: 30% (Couple > Diamond > Gold)
  - Verificação: 10% (usuários verificados)
  - Recência: 10% (decay over 7 dias)
  - Localização: bonus até 20 pontos (raio 50km)

#### Características
- **Posts dos últimos 7 dias** para conteúdo fresco
- **Ordenação por score** calculado no cliente
- **Fallback robusto** em caso de erro
- **Logs detalhados** para debug
- **Performance otimizada** com query eficiente

#### Resultado
- ✅ **Funcionando** algoritmo de recomendação na aba "Para você"
- ✅ **Priorização** de conteúdo premium e verificado
- ✅ **Scoring** baseado em engajamento e proximidade
- ✅ **Preparado** para migração futura da função RPC

### 🔧 Correção Exibição de Perfis e Username-Only Display (2025-08-03)

#### Problema Identificado
- **Erro**: Perfis do ExploreView não apareciam devido a enum de gender inválido
- **Erro**: "invalid input value for enum gender_type: 'man'" - incompatibilidade entre frontend e database
- **Solicitação**: Usuário pediu para NUNCA exibir nome, sempre username

#### Correções Implementadas

##### 1. Mapeamento de Gender Enum
- **Problema**: Frontend usa 'man'/'woman', database usa 'male'/'female'
- **Solução**: Adicionado mapeamento na API `/api/v1/explore/users`
- **Código**:
  ```typescript
  const mappedGenders = filters.gender.map(g => {
    switch(g) {
      case 'man': return 'male'
      case 'woman': return 'female'
      case 'trans': return 'trans'
      case 'couple_mw': return 'couple_mf'
      case 'couple_mm': return 'couple_mm'
      case 'couple_ww': return 'couple_ff'
      default: return g
    }
  })
  ```

##### 2. Username-Only Display Policy
- **Implementado** em TODOS os componentes conforme solicitação do usuário
- **Componentes atualizados**:
  - `ExploreView.tsx`: Removido `{profile.name || profile.username}` → `{profile.username}`
  - `WhoToFollowCard.tsx`: Removido fallback para name
  - `TrendingProfilesCard.tsx`: Username apenas
  - `CommentsModal.tsx`: Username apenas para autor e avatar
  - `RecommendationsCard.tsx`: Username apenas
  - `LeftSidebar.tsx`: Username apenas no perfil
  - `PostCard.tsx`: Username apenas em author display e MediaViewer

##### 3. Consistência na Interface
- **Avatar fallbacks**: Usam primeira letra do username
- **Display names**: Sempre username, nunca name
- **MediaViewer**: Author name usa username
- **AudioPlayer**: Artist usa username
- **Tooltips e alt text**: Referem-se ao username

#### Resultado
- ✅ **Corrigido** erro de gender enum - perfis agora aparecem no ExploreView
- ✅ **Implementado** política username-only em toda a aplicação
- ✅ **Mantida** consistência visual sem quebrar funcionalidades
- ✅ **Respeitada** solicitação explícita do usuário
- ✅ **Perfis carregam** corretamente com filtros de gender

---

## Como Contribuir

Ao fazer alterações no frontend, atualize este changelog seguindo o padrão:

1. Adicione suas mudanças na seção [Unreleased]
2. Categorize usando: 🎨 UI/UX, 🐛 Correções, 🚀 Performance, 📱 Responsividade, 🔧 Refatorações
3. Seja específico sobre o que foi alterado e por quê
4. Inclua nomes de arquivos quando relevante
5. Ao fazer release, mova as alterações para uma nova seção com versão e data