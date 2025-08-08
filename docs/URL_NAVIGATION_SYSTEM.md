# Sistema de Navegação por URL - OpenLove

**Data**: 08/01/2025
**Versão**: 0.3.4

## 📋 Resumo

Implementação de sistema de navegação que sincroniza todas as views com a URL, permitindo navegação direta, compartilhamento de links e histórico do navegador funcionais.

## 🎯 Problema Resolvido

Anteriormente, apenas o feed funcionava corretamente porque tinha lógica própria de carregamento. Outras views (perfil, mensagens, notificações) ficavam presas no skeleton porque não recebiam parâmetros necessários da URL.

## 🏗️ Solução Implementada

### 1. Hook de Navegação (`useViewNavigation`)

```typescript
// hooks/useViewNavigation.ts
export function useViewNavigation() {
  // Navega para uma view atualizando a URL
  navigateToView(view: string, params?: Record<string, string>)
  
  // Obtém parâmetros da URL
  getCurrentView(): string
  getParam(key: string): string | null
  
  // Atualiza parâmetros individuais
  updateParam(key: string, value: string)
  removeParam(key: string)
}
```

### 2. Sincronização de Estado com URL

```typescript
// app/(main)/feed/page.tsx
useEffect(() => {
  const view = currentView || 'timeline'
  setCurrentMainContent(view)
  
  if (view === 'user-profile' && urlUserId) {
    setSelectedUserId(urlUserId)
  }
}, [currentView, urlUserId])
```

### 3. Navegação com Parâmetros

```typescript
// Navegação para perfil com userId
handleViewChange('user-profile', userId)

// URL resultante: /feed?view=user-profile&userId=123
```

## 📝 URLs de Navegação

| View | URL | Parâmetros |
|------|-----|------------|
| Timeline | `/feed` | - |
| Notificações | `/feed?view=notifications` | - |
| Mensagens | `/feed?view=messages` | - |
| Perfil | `/feed?view=user-profile&userId=123` | userId |
| OpenDates | `/feed?view=open-dates` | - |
| Eventos | `/feed?view=events` | - |
| Comunidades | `/feed?view=communities` | - |
| Configurações | `/feed?view=settings` | - |
| Verificação | `/feed?view=verification` | - |

## 🔄 Fluxo de Navegação

1. **Clique no Menu**
   - LeftSidebar detecta clique
   - Chama `onViewChange(view, userId?)` 
   - FeedPage recebe e chama `navigateToView()`

2. **Atualização da URL**
   - Hook usa Next.js router
   - URL atualizada sem reload
   - Mantém histórico do navegador

3. **Sincronização de Estado**
   - useEffect observa mudanças na URL
   - Atualiza `currentMainContent`
   - Passa parâmetros para componentes

## 🎨 Componentes Atualizados

### LeftSidebar
```typescript
// Passa userId quando navega para perfil próprio
if (view === 'user-profile' && user?.id) {
  onViewChange?.(view, user.id)
}
```

### FeedPage
```typescript
// Usa hook de navegação
const { navigateToView, currentView, userId } = useViewNavigation()

// Sincroniza com URL
useEffect(() => {
  setCurrentMainContent(currentView)
  if (currentView === 'user-profile') {
    setSelectedUserId(userId)
  }
}, [currentView, userId])
```

### TimelineFeed
```typescript
// Recebe userId e passa para UserProfile
"user-profile": <UserProfile userId={userId} />
```

## ✅ Benefícios

1. **URLs Compartilháveis**: Cada view tem URL única
2. **Histórico Funcional**: Botões voltar/avançar funcionam
3. **Acesso Direto**: Pode acessar qualquer view pela URL
4. **Estado Persistente**: Refresh mantém a view atual
5. **SEO Melhorado**: URLs descritivas e navegáveis

## 🚀 Como Usar

### Navegação Simples
```typescript
import { useViewNavigation } from '@/hooks/useViewNavigation'

const { navigateToView } = useViewNavigation()

// Navegar para mensagens
navigateToView('messages')

// Navegar para perfil
navigateToView('user-profile', { userId: '123' })
```

### Obter Estado Atual
```typescript
const { currentView, userId } = useViewNavigation()

if (currentView === 'user-profile' && userId) {
  // Carregar perfil do usuário
}
```

### Atualizar Parâmetros
```typescript
const { updateParam } = useViewNavigation()

// Adicionar filtro
updateParam('filter', 'photos')

// Mudar aba
updateParam('tab', 'following')
```

## 🔍 Testando

1. **Navegação Direta**
   - Acesse `/feed?view=messages`
   - Deve abrir direto nas mensagens

2. **Perfil de Usuário**
   - Acesse `/feed?view=user-profile&userId=123`
   - Deve carregar perfil do usuário 123

3. **Histórico**
   - Navegue entre views
   - Use botões voltar/avançar
   - Deve manter navegação correta

4. **Refresh**
   - Recarregue página em qualquer view
   - Deve manter a view atual

## 📚 Próximos Passos

1. **Cache de Views**: Implementar cache para views já visitadas
2. **Preload**: Pré-carregar dados ao hover nos links
3. **Animações**: Adicionar transições entre views
4. **Deep Linking**: Suporte para sub-rotas dentro de views
5. **Analytics**: Rastrear navegação para métricas