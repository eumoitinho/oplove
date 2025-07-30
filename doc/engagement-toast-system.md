# Sistema de Toasts de Engajamento - OpenLove

## Visão Geral

O OpenLove implementa um sistema unificado de notificações toast com foco em engajamento e conversão de vendas de planos premium. Todas as notificações aparecem como toasts interativos com avatares dos usuários.

## Características

### 1. Toast Unificado
- **Localização**: Centro superior da tela (principal) ou canto superior direito (secundário)
- **Design**: Cards com avatares, badges de verificação e planos
- **Animações**: Entrada suave com Framer Motion
- **Interatividade**: Clique no avatar abre o perfil do usuário

### 2. Tipos de Notificações

```typescript
type ToastType = 
  | "new_post"      // Novos posts no feed
  | "like"          // Curtidas em posts
  | "comment"       // Comentários em posts
  | "follow"        // Novos seguidores
  | "message"       // Mensagens recebidas
  | "visit"         // Visitas ao perfil
  | "story_view"    // Visualizações de stories
  | "gift_received" // Presentes virtuais recebidos
```

### 3. Estrutura dos Toasts

```typescript
interface EngagementToast {
  type: ToastType
  users: ToastUser[]      // Lista de usuários envolvidos
  count?: number          // Quantidade total (ex: "5 novos posts")
  message?: string        // Mensagem customizada
  onAction?: () => void   // Ação ao clicar no botão
  duration?: number       // Tempo de exibição (0 = permanente)
}
```

## Implementação

### 1. Componente Principal

```typescript
// components/common/EngagementToast.tsx
import { EngagementToast, EngagementToastContainer } from '@/components/common/EngagementToast'

// O container é adicionado automaticamente no Providers
```

### 2. Hook de Integração

```typescript
// hooks/useEngagementToasts.ts
import { useEngagementToasts } from '@/hooks/useEngagementToasts'

function MyComponent() {
  // Hook se conecta automaticamente ao Supabase Realtime
  useEngagementToasts()
}
```

### 3. Serviço de Toast

```typescript
// lib/services/toast-service.ts
import { toast } from '@/lib/services/toast-service'

// Mostrar notificação de novo post
toast.newPost({
  id: '123',
  name: 'Ana Silva',
  username: 'anasilva',
  avatar_url: 'https://...',
  is_verified: true,
  premium_type: 'diamond'
}, 5) // 5 novos posts

// Mostrar notificação de curtida
toast.like([user1, user2], 10) // 10 curtidas

// Mostrar notificação de comentário
toast.comment(user, "Adorei sua foto! 😍")

// Mostrar notificação de seguidor
toast.follow(user)

// Mostrar notificação de mensagem
toast.message(user, "Oi, tudo bem?")

// Mostrar notificação de visita
toast.visit([user1, user2, user3], 5)

// Mostrar notificação de story
toast.storyView([user1, user2], 20)

// Mostrar notificação de presente
toast.giftReceived(user, "Diamante 💎")
```

## Integração com Realtime

### 1. Notificações Automáticas

O sistema escuta automaticamente as tabelas do Supabase:

```typescript
// Tabela: notifications
channel.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'notifications',
  filter: `user_id=eq.${userId}`
}, handleNotification)

// Tabela: posts (para novos posts de quem você segue)
channel.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'posts'
}, handleNewPost)
```

### 2. Estrutura da Tabela de Notificações

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),        -- Destinatário
  from_user_id UUID REFERENCES users(id),   -- Remetente
  type VARCHAR(50),                         -- Tipo de notificação
  title TEXT,                               -- Título da notificação
  content TEXT,                             -- Conteúdo/mensagem
  entity_id UUID,                           -- ID da entidade relacionada
  entity_type VARCHAR(50),                  -- Tipo da entidade (post, comment, etc)
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE
);
```

## Conversão de Vendas

### 1. Estratégias de Engajamento

- **Frequência**: Notificações aparecem organicamente conforme atividade real
- **FOMO**: "5 pessoas visitaram seu perfil" (incentiva upgrade para ver quem)
- **Social Proof**: Mostra badges de verificação e planos premium
- **Reciprocidade**: "Ana começou a seguir você" (incentiva interação)

### 2. Gatilhos de Conversão

```typescript
// Usuário free recebe mensagem
toast.message(premiumUser, "enviou uma mensagem", {
  onAction: () => showUpgradeModal('gold') // Precisa Gold para responder
})

// Múltiplas visitas ao perfil
toast.visit(users, 10, {
  onAction: () => showUpgradeModal('diamond') // Precisa Diamond para ver todos
})

// Stories com muitas visualizações
toast.storyView(users, 50, {
  message: "Boost seu story para mais alcance!",
  onAction: () => showBoostModal()
})
```

### 3. Personalização por Plano

```typescript
// Free users: Notificações limitadas, incentivo para upgrade
if (user.premium_type === null) {
  toast.show({
    type: 'visit',
    users: [{ name: '???', username: 'hidden' }],
    message: 'Alguém visitou seu perfil. Faça upgrade para ver quem!',
    onAction: () => showUpgradeModal()
  })
}

// Premium users: Notificações completas com detalhes
if (user.premium_type === 'diamond') {
  toast.visit(visitors, visitors.length, {
    message: `${visitors.length} pessoas visitaram seu perfil`,
    onAction: () => router.push('/profile/visitors')
  })
}
```

## Boas Práticas

### 1. Throttling
- Evitar spam de notificações
- Máximo 1 notificação a cada 5 segundos
- Agrupar notificações similares

### 2. Priorização
- Mensagens e follows têm prioridade
- Novos posts aparecem agrupados
- Likes e views são agregados

### 3. Performance
- Lazy loading de avatares
- Cache de dados de usuários
- Cleanup de notificações antigas

## Exemplos de Uso

### 1. API Endpoint
```typescript
// Ao criar um novo follow
await supabase.from('notifications').insert({
  user_id: targetUserId,
  from_user_id: currentUserId,
  type: 'follow',
  title: 'Novo seguidor',
  content: `${userName} começou a seguir você`
})
```

### 2. Component Integration
```typescript
// Em qualquer componente
import { toast } from '@/lib/services/toast-service'

function handleLikeSuccess() {
  toast.success('Post curtido com sucesso!')
}

function handleNewMessage(message: Message) {
  toast.message(
    message.sender,
    message.content.substring(0, 30)
  )
}
```

### 3. Custom Toasts
```typescript
// Toast personalizado
window.showEngagementToast({
  type: 'gift_received',
  users: [giftSender],
  message: 'enviou um Selo de Diamante 💎',
  onAction: () => router.push('/profile/gifts'),
  duration: 10000 // 10 segundos
})
```

## Migração

Para migrar do sistema antigo:

1. Remover imports de toast antigos:
```typescript
// Remover
import { useToast } from "@/components/ui/use-toast"
import { toast } from "@/components/ui/toast"

// Adicionar
import { toast } from "@/lib/services/toast-service"
```

2. Atualizar chamadas de toast:
```typescript
// Antes
toast({
  title: "Sucesso",
  description: "Ação realizada",
  variant: "success"
})

// Depois
toast.success("Ação realizada com sucesso!")
```

3. Para notificações de engajamento:
```typescript
// Antes (simulado)
setActiveToast({ type: "post", count: 5 })

// Depois (real-time)
// Automático via useEngagementToasts()
```

## Monitoramento

- Todas as notificações são registradas
- Analytics de cliques e conversões
- A/B testing de mensagens
- Métricas de engajamento por tipo

## Conclusão

O sistema unificado de toasts de engajamento do OpenLove oferece uma experiência consistente e otimizada para conversão, substituindo múltiplos sistemas de notificação por uma solução integrada e em tempo real.