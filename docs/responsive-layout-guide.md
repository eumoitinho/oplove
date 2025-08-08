# Sistema de Grid Responsivo - OpenLove Feed

## Visão Geral

Sistema de grid responsivo implementado com breakpoints específicos para Desktop, Tablet e Mobile, seguindo um grid de 8 colunas no desktop.

## Especificações por Dispositivo

### Desktop (1440px x 1024px)
- **Container**: 1440px largura máxima
- **Altura**: 1024px
- **Grid**: 8 colunas
- **Margens L/R**: 64px cada lado
- **Gutter**: 16px entre colunas
- **Layout**:
  - Left Sidebar: 317px (fixa, acompanha scroll)
  - Timeline: 742px (4 colunas centrais)
  - Right Sidebar: 317px (fixa, acompanha scroll)

### Tablet (1024px x 1366px)
- **Largura**: 1024px
- **Altura**: 1366px
- **Grid**: 12 colunas
- **Margens**: 32px (esquerda e direita)

#### Layout do Grid:
- **Left Sidebar**: Colunas 1-3
- **Timeline Content**: Colunas 4-9 (6 colunas)
- **Right Sidebar**: Colunas 10-12

### Mobile (384px x 800px)
- **Largura**: 384px (w-96)
- **Altura**: 800px
- **Layout**: Stack vertical
- **Margens**: 16px (esquerda e direita)

#### Layout:
- **Sidebars**: Ocultas (navegação via menu mobile)
- **Timeline Content**: Largura total
- **Navegação**: Bottom navigation bar

## Classes CSS Implementadas

### Layout Principal

```css
.layout-container
```
Contêiner principal que se adapta a diferentes breakpoints.

```css
.feed-grid
```
Grid responsivo que muda entre 8 colunas (desktop), 12 colunas (tablet) e stack vertical (mobile).

### Sidebars

```css
.left-sidebar
```
Sidebar esquerda com largura fixa de 317px no desktop, responsiva no tablet, oculta no mobile.

```css
.right-sidebar  
```
Sidebar direita com mesmas proporções da sidebar esquerda.

```css
.sidebar-sticky
```
Comportamento sticky para sidebars com overflow controlado.

```css
.sidebar-card
```
Cartões padrão das sidebars com estilo consistente.

### Timeline

```css
.timeline-content
```
Área principal do timeline que ocupa 4 colunas no desktop.

```css
.timeline-container
```
Container interno do timeline com espaçamento adequado.

```css
.timeline-post
```
Estilo base para posts individuais.

### Componentes Responsivos

```css
.post-card-responsive
```
Padding e texto responsivos para cartões de posts.

```css
.avatar-responsive
```
Tamanhos de avatar: 32px (mobile), 40px (tablet), 48px (desktop).

```css
.button-responsive
```
Padding e texto responsivos para botões.

```css
.text-responsive-lg, .text-responsive-md, .text-responsive-sm
```
Tamanhos de texto que escalam com o dispositivo.

### Utilitários de Visibilidade

```css
.desktop-only
```
Visível apenas no desktop (≥1440px).

```css
.tablet-only
```
Visível apenas no tablet (1024px - 1439px).

```css
.mobile-only
```
Visível apenas no mobile (<1024px).

```css
.not-mobile
```
Oculto no mobile, visível no tablet e desktop.

## Arquivos Modificados

### Estrutura Principal
- `tailwind.config.ts` - Configuração dos breakpoints e utilitários
- `styles/responsive-layout.css` - Classes CSS responsivas
- `app/globals.css` - Import do novo sistema de layout

### Componentes de Layout
- `app/(main)/feed/page.tsx` - Página principal com novo grid
- `components/feed/RightSidebar.tsx` - Sidebar direita responsiva
- `components/feed/LeftSidebar.tsx` - Sidebar esquerda responsiva

### Componentes de Conteúdo
- `components/feed/post/PostCard.tsx` - Posts responsivos
- `components/feed/TrendingProfilesCard.tsx` - Card "Em Alta" responsivo
- `components/feed/RecommendationsCard.tsx` - Card "Descobrir Pessoas" responsivo
- `components/feed/AdultEventsCard.tsx` - Card "Eventos" responsivo

## Como Usar

### 1. Layout Principal
```tsx
<div className="layout-container">
  <div className="feed-grid">
    <div className="left-sidebar">
      {/* Conteúdo da sidebar esquerda */}
    </div>
    
    <div className="timeline-content">
      <div className="timeline-container">
        {/* Conteúdo do timeline */}
      </div>
    </div>
    
    <div className="right-sidebar">
      {/* Conteúdo da sidebar direita */}
    </div>
  </div>
</div>
```

### 2. Componentes Responsivos
```tsx
// Post com classes responsivas
<article className="post-card-responsive timeline-post">
  <UserAvatar className="avatar-responsive" />
  <Button className="button-responsive">
    <Icon className="w-4 h-4 tablet:w-5 tablet:h-5" />
    <span className="text-responsive-md">Texto</span>
  </Button>
</article>

// Sidebar card
<div className="sidebar-card">
  <h3 className="text-responsive-md">Título</h3>
  <Button className="button-responsive">Ação</Button>
</div>
```

### 3. Visibilidade Condicional
```tsx
// Visível apenas no desktop
<div className="desktop-only">
  Conteúdo apenas desktop
</div>

// Oculto no mobile
<div className="not-mobile">
  Conteúdo tablet e desktop
</div>

// Apenas mobile
<div className="mobile-only">
  Conteúdo apenas mobile
</div>
```

## Testes de Responsividade

### Desktop (1440px)
- ✅ Grid de 8 colunas funcionando
- ✅ Sidebars com 317px de largura
- ✅ Timeline ocupando 4 colunas centrais
- ✅ Margens de 64px aplicadas

### Tablet (1024px)
- ✅ Grid de 12 colunas funcionando
- ✅ Sidebars proporcionais (3 colunas cada)
- ✅ Timeline ocupando 6 colunas centrais
- ✅ Componentes redimensionados adequadamente

### Mobile (384px)
- ✅ Layout em stack vertical
- ✅ Sidebars ocultas
- ✅ Timeline em largura total
- ✅ Navegação mobile funcional

## Manutenção

Para adicionar novos componentes responsivos:

1. Use as classes base: `sidebar-card`, `timeline-post`, etc.
2. Aplique classes responsivas: `text-responsive-*`, `button-responsive`, etc.
3. Use breakpoints de visibilidade quando necessário
4. Teste em todos os três breakpoints principais

## Próximos Passos

1. ✅ Implementar sistema de grid básico
2. ✅ Atualizar componentes principais
3. ✅ Aplicar classes responsivas
4. 🔄 Testes em dispositivos reais
5. 🔄 Otimizações de performance
6. 🔄 Acessibilidade em dispositivos móveis
