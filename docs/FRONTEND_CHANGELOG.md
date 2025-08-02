# Frontend Changelog - OpenLove

Todas as alterações notáveis no frontend do projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased] - 2025-08-02

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