# Sistema de Mensagens - OpenLove

## Visão Geral

Sistema completo de mensagens instantâneas com restrições baseadas em planos, grupos, e integração com stories e feed. Implementa regras de negócio específicas para monetização.

## Componentes Principais

### Frontend Components
- `MessagesView` - Interface principal de conversas
- `ConversationList` - Lista de conversas ativas
- `ChatWindow` - Janela de chat individual
- `MessageBubble` - Bolha de mensagem individual
- `MediaMessage` - Mensagens com mídia
- `VoiceMessage` - Mensagens de áudio
- `GroupChatModal` - Criação de grupos
- `NewConversationModal` - Iniciar nova conversa

### Backend Components
- `/api/v1/conversations/*` - Gerenciamento de conversas
- `/api/v1/messages/*` - CRUD de mensagens
- Real-time Service - WebSocket para tempo real
- Notification Service - Push notifications
- Media Processing - Processamento de arquivos

## Regras de Negócio (v0.3.2)

### Iniciação de Conversas
```typescript
interface ConversationRules {
  // Usuários FREE não podem iniciar conversas
  canInitiate: boolean;
  
  // Mas podem responder se premium user mandar mensagem primeiro
  canReply: boolean;
  
  // Grupos só podem ser criados por Diamond+
  canCreateGroups: boolean;
}

// Implementação
const rules = getMessagePermissions(user.premium_type, user.is_verified);
```

### Por Plano de Usuário

#### Free Users
- ❌ **Não podem iniciar** conversas privadas
- ✅ **Podem responder** se premium user iniciar primeiro
- ❌ Não podem criar grupos
- ❌ Não podem participar de grupos criados por usuários
- ✅ Grupos automáticos (eventos, comunidades) são permitidos
- 📨 Limitados a texto simples

#### Gold Users
- ✅ **10 mensagens/dia** (não verificados)
- ✅ **Ilimitado** (verificados)
- ✅ Podem iniciar conversas
- ✅ Upload de imagens/vídeos
- ❌ Não podem criar grupos personalizados
- ✅ Participar de até 5 grupos
- ❌ Sem calls de voz/vídeo

#### Diamond Users
- ✅ **Mensagens ilimitadas**
- ✅ Todos os tipos de mídia
- ✅ **Criar grupos** (até 50 membros)
- ✅ **Voice/video calls**
- ✅ Grupos ilimitados
- ✅ Mensagens de áudio
- ✅ Reações avançadas

#### Couple Users
- ✅ Todos os recursos Diamond
- ✅ **Chat sincronizado** entre os dois perfis
- ✅ Mensagens aparecem para ambos
- ✅ Status online compartilhado

## Tipos de Conversas

### 1. Conversas Privadas (1-on-1)
```typescript
interface PrivateConversation {
  type: 'private';
  participants: [string, string];    // Exatamente 2 usuários
  initiated_by: string;              // Quem iniciou
  initiated_by_premium: boolean;     // Se era premium ao iniciar
}
```

### 2. Grupos Personalizados
```typescript
interface GroupConversation {
  type: 'group';
  name: string;
  description?: string;
  participants: string[];            // Até 50 membros
  admins: string[];                 // Múltiplos admins
  created_by: string;               // Criador (sempre admin)
  group_type: 'user_created';
}
```

### 3. Grupos Automáticos
```typescript
interface AutoGroup {
  type: 'group';
  group_type: 'event' | 'community';
  reference_id: string;             // ID do evento/comunidade
  auto_join: boolean;               // Join automático
}
```

## Database Schema

### Tabelas Principais
```sql
-- Conversas
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  type conversation_type NOT NULL DEFAULT 'private',
  name TEXT, -- Para grupos
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Novos campos v0.3.2
  initiated_by UUID REFERENCES users(id),
  initiated_by_premium BOOLEAN DEFAULT false,
  group_type VARCHAR(50) CHECK (group_type IN ('user_created', 'event', 'community'))
);

-- Participantes
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role participant_role DEFAULT 'member',
  is_admin BOOLEAN DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);

-- Mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES users(id),
  content TEXT,
  message_type message_type DEFAULT 'text',
  media_url TEXT,
  media_type TEXT,
  reply_to UUID REFERENCES messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Status de leitura
CREATE TABLE message_reads (
  message_id UUID REFERENCES messages(id),
  user_id UUID REFERENCES users(id),
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- Rate limiting para Gold users
CREATE TABLE daily_message_counts (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);
```

## Validação de Mensagens

### Server-side Validation
```typescript
async function validateMessagePermission(
  senderId: string,
  conversationId: string
): Promise<boolean> {
  // 1. Verificar se usuário é participante
  const participant = await checkParticipant(senderId, conversationId);
  if (!participant) return false;
  
  // 2. Verificar plano e limites diários
  const user = await getUser(senderId);
  const limits = getMessageLimits(user);
  
  // 3. Verificar se pode enviar (regras de iniciação)
  const conversation = await getConversation(conversationId);
  const canSend = await checkSendPermission(user, conversation);
  
  return canSend && limits.canSend;
}
```

### Limites Diários
```typescript
interface MessageLimits {
  daily_limit: number | null;  // null = ilimitado
  current_count: number;
  can_send: boolean;
  resets_at: Date;
}

// Implementação por plano
function getMessageLimits(user: User): MessageLimits {
  if (user.premium_type === 'free') return { daily_limit: 0, ... };
  if (user.premium_type === 'gold' && !user.is_verified) return { daily_limit: 10, ... };
  return { daily_limit: null, ... }; // Ilimitado
}
```

## Tipos de Mensagem

### 1. Texto Simples
```typescript
interface TextMessage {
  type: 'text';
  content: string;
  mentions?: string[];    // @username
  hashtags?: string[];    // #tag
}
```

### 2. Mídia
```typescript
interface MediaMessage {
  type: 'image' | 'video' | 'audio' | 'file';
  media_url: string;
  media_type: string;     // MIME type
  caption?: string;
  duration?: number;      // Para áudio/vídeo
  size: number;          // Em bytes
  thumbnail_url?: string; // Para vídeos
}
```

### 3. Mensagem de Voz (Diamond+)
```typescript
interface VoiceMessage {
  type: 'voice';
  audio_url: string;
  duration: number;       // Em segundos
  waveform: number[];     // Para visualização
  transcription?: string;  // Transcrição automática
}
```

### 4. Reply/Quote
```typescript
interface ReplyMessage {
  reply_to: string;       // ID da mensagem original
  content: string;
  quoted_content: string; // Conteúdo da mensagem citada
  quoted_sender: string;  // Autor da mensagem citada
}
```

## Real-time Features

### WebSocket Events
```typescript
// Mensagens
'message:new'           // Nova mensagem recebida
'message:edited'        // Mensagem editada
'message:deleted'       // Mensagem deletada
'message:read'          // Mensagem lida

// Conversas
'conversation:created'  // Nova conversa
'conversation:updated'  // Conversa alterada
'participant:joined'    // Usuário entrou no grupo
'participant:left'      // Usuário saiu do grupo

// Status
'user:typing'          // Usuário digitando
'user:online'          // Usuário online
'user:offline'         // Usuário offline

// Calls (Diamond+)
'call:incoming'        // Chamada recebendo
'call:accepted'        // Chamada aceita
'call:rejected'        // Chamada rejeitada
'call:ended'           // Chamada finalizada
```

### Typing Indicators
```typescript
// Temporário, 3 segundos
await redis.setex(
  `typing:${conversationId}:${userId}`, 
  3, 
  JSON.stringify({ username, timestamp })
);
```

## Push Notifications

### Configuração
```typescript
interface NotificationConfig {
  // Por conversa
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  
  // Global
  quiet_hours: {
    start: string;  // "22:00"
    end: string;    // "08:00"
  };
  
  // Tipos
  private_messages: boolean;
  group_messages: boolean;
  mentions: boolean;
}
```

### Triggers
- Nova mensagem em conversa privada
- Menção em grupo (@username)
- Resposta direta (reply)
- Chamada de voz/vídeo incoming

## Voice/Video Calls (Diamond+)

### WebRTC Implementation
```typescript
interface CallSession {
  id: string;
  conversation_id: string;
  caller_id: string;
  callee_id: string;
  type: 'voice' | 'video';
  status: 'ringing' | 'active' | 'ended';
  started_at: Date;
  ended_at?: Date;
  duration?: number;
}
```

### Call Flow
1. **Initiate**: Caller clica em call button
2. **WebRTC**: Estabelece peer connection
3. **Signaling**: Via WebSocket server
4. **Ring**: Push notification para callee
5. **Answer/Reject**: Callee responde
6. **Active**: Call estabelecida
7. **End**: Qualquer um pode encerrar

## APIs Principais

### Conversas
```typescript
GET    /api/v1/conversations          // Listar conversas
POST   /api/v1/conversations          // Criar conversa/grupo
GET    /api/v1/conversations/[id]     // Detalhes da conversa
PUT    /api/v1/conversations/[id]     // Atualizar (nome, descrição)
DELETE /api/v1/conversations/[id]     // Sair da conversa

// Participantes
POST   /api/v1/conversations/[id]/participants    // Adicionar membro
DELETE /api/v1/conversations/[id]/participants/[userId] // Remover membro
```

### Mensagens
```typescript
GET    /api/v1/conversations/[id]/messages    // Listar mensagens (paginado)
POST   /api/v1/conversations/[id]/messages    // Enviar mensagem
PUT    /api/v1/messages/[id]                  // Editar mensagem
DELETE /api/v1/messages/[id]                  // Deletar mensagem
POST   /api/v1/messages/[id]/read            // Marcar como lida
```

### Calls
```typescript
POST   /api/v1/conversations/[id]/call        // Iniciar chamada
POST   /api/v1/calls/[id]/answer             // Aceitar chamada
POST   /api/v1/calls/[id]/reject             // Rejeitar chamada
POST   /api/v1/calls/[id]/end                // Encerrar chamada
```

## Cache Strategy

```typescript
// Conversas
conversations:${userId}               // TTL: 10 min
conversation:${conversationId}        // TTL: 5 min

// Mensagens
messages:${conversationId}:${page}    // TTL: 5 min
message:${messageId}                  // TTL: 30 min

// Status
typing:${conversationId}              // TTL: 3 sec
online:${userId}                      // TTL: 5 min

// Limites
daily_messages:${userId}:${date}      // TTL: 24 hours
```

## Moderação

### Automática
- **Spam detection** em mensagens repetitivas
- **Link scanning** para phishing/malware
- **Image moderation** para conteúdo inadequado
- **Rate limiting** para prevenir flood

### Ferramentas Manual
- **Report message** - Reportar mensagem específica
- **Block user** - Bloquear usuário completamente
- **Mute conversation** - Silenciar conversa
- **Leave group** - Sair de grupo

## Problemas Conhecidos

1. **Message ordering** - Raramente mensagens chegam fora de ordem
2. **WebRTC on mobile** - Problemas ocasionais em iOS Safari
3. **Large group performance** - Grupos com 50+ membros podem ser lentos
4. **Offline message sync** - Mensagens offline nem sempre sincronizam
5. **Push notification delays** - Atrasos de até 30s em alguns casos

## TODOs / Melhorias

- [ ] Message encryption (E2E)
- [ ] Message reactions (emoji)
- [ ] Message forwarding
- [ ] Group voice/video calls
- [ ] Screen sharing
- [ ] Message search
- [ ] Auto-delete messages
- [ ] Message backup/export
- [ ] Bot integration
- [ ] Message templates
- [ ] Conversation archiving
- [ ] Advanced group permissions

## Dependências Externas

- **Supabase Realtime** - WebSocket connections
- **WebRTC** - Voice/video calls
- **Firebase FCM** - Push notifications
- **Supabase Storage** - File sharing
- **Redis Upstash** - Caching and rate limiting

## Última Atualização

**Data**: 2025-08-07  
**Versão**: v0.3.3-alpha  
**Status**: Sistema funcional com regras de negócio implementadas