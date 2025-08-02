# Frontend Changelog - OpenLove

Todas as alterações notáveis no frontend do projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased] - 2025-08-02

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

## Como Contribuir

Ao fazer alterações no frontend, atualize este changelog seguindo o padrão:

1. Adicione suas mudanças na seção [Unreleased]
2. Categorize usando: 🎨 UI/UX, 🐛 Correções, 🚀 Performance, 📱 Responsividade, 🔧 Refatorações
3. Seja específico sobre o que foi alterado e por quê
4. Inclua nomes de arquivos quando relevante
5. Ao fazer release, mova as alterações para uma nova seção com versão e data