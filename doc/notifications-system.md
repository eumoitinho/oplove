# Sistema de Notificações - OpenLove

## Visão Geral

O sistema de notificações do OpenLove fornece atualizações em tempo real para os usuários sobre atividades importantes em suas contas.

## Componentes

### 1. NotificationsView (`components/feed/notifications/NotificationsView.tsx`)
- Componente principal que exibe a lista de notificações
- Suporta filtros por tipo e status (lida/não lida)
- Paginação infinita
- Ações rápidas (seguir de volta, marcar como lida, deletar)
- Integração com Supabase Realtime para atualizações instantâneas

### 2. NotificationsService (`lib/services/notifications-service.ts`)
- Serviço centralizado para gerenciar notificações
- Métodos principais:
  - `getNotifications()` - Busca notificações com paginação e filtros
  - `getUnreadCount()` - Retorna contagem de não lidas
  - `markAsRead()` - Marca notificação como lida
  - `markAllAsRead()` - Marca todas como lidas
  - `deleteNotification()` - Remove notificação
  - `subscribeToNotifications()` - Inscreve para atualizações em tempo real

### 3. useNotifications Hook (`hooks/useNotifications.ts`)
- Hook customizado para gerenciar estado de notificações
- Mantém contagem de notificações não lidas
- Atualiza automaticamente via realtime

### 4. Badge de Notificações
- Integrado no LeftSidebar
- Mostra contagem de notificações não lidas
- Atualiza em tempo real

## Tipos de Notificações

1. **Like** - Quando alguém curte seu post
2. **Comment** - Quando alguém comenta em seu post
3. **Follow** - Quando alguém começa a seguir você
4. **Message** - Quando recebe nova mensagem
5. **Post** - Quando alguém que você segue cria novo post

## Banco de Dados

### Tabela `notifications`
```sql
- id (UUID)
- user_id (UUID) - Usuário que recebe a notificação
- from_user_id (UUID) - Usuário que gerou a notificação
- type (VARCHAR) - Tipo da notificação
- title (VARCHAR) - Título da notificação
- message (TEXT) - Mensagem detalhada
- read (BOOLEAN) - Status de leitura
- entity_id (UUID) - ID da entidade relacionada
- entity_type (VARCHAR) - Tipo da entidade
- action_taken (BOOLEAN) - Para ações como "seguir de volta"
- metadata (JSONB) - Dados adicionais
- created_at (TIMESTAMP)
```

### Triggers Automáticos
- `notify_on_like` - Cria notificação quando post é curtido
- `notify_on_comment` - Cria notificação quando post recebe comentário
- `notify_on_follow` - Cria notificação quando usuário é seguido
- `notify_on_message` - Cria notificação quando mensagem é recebida

## Uso

### Visualizar Notificações
```typescript
// No componente principal do feed
import { NotificationsView } from '@/components/feed/notifications/NotificationsView'

// Renderizar quando view === 'notifications'
<NotificationsView />
```

### Obter Contagem de Não Lidas
```typescript
import { useNotifications } from '@/hooks/useNotifications'

function MyComponent() {
  const { unreadCount } = useNotifications()
  
  return <Badge>{unreadCount}</Badge>
}
```

### Criar Notificação Programaticamente
```typescript
import { notificationsService } from '@/lib/services/notifications-service'

await notificationsService.createNotification({
  user_id: 'recipient-user-id',
  from_user_id: 'sender-user-id',
  type: 'like',
  title: 'Nova curtida',
  message: 'João curtiu seu post',
  entity_id: 'post-id',
  entity_type: 'post'
})
```

## Fluxo de Notificações

1. **Ação do Usuário** → Trigger no banco → Cria notificação
2. **Realtime** → Supabase envia atualização → Cliente recebe
3. **UI Update** → Badge atualiza + Toast opcional + Lista atualiza
4. **Interação** → Clique navega para conteúdo relacionado

## Funcionalidades Futuras

- [ ] Configurações de notificações por tipo
- [ ] Notificações push (mobile/web)
- [ ] Agrupamento de notificações similares
- [ ] Som/vibração para novas notificações
- [ ] Notificações por email (digest diário/semanal)