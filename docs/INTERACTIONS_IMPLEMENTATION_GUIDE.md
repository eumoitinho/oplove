# Guia de Implementação do Sistema de Interações - OpenLove v0.3.5

## 📋 Status da Implementação

### ✅ Concluído
1. **Estrutura do Banco de Dados**
   - Tabelas `post_likes`, `comments`, `post_shares`, `saved_posts` criadas
   - Tabela `notifications` usando `recipient_id` e `sender_id` (padrão correto)
   - Contadores na tabela `posts`: `likes_count`, `comments_count`, `shares_count`, `saves_count`

2. **APIs de Interação**
   - `/api/v1/posts/[id]/like` - Like/Unlike posts ✅
   - `/api/v1/posts/[id]/comments` - Add/Get comments ✅
   - `/api/v1/posts/[id]/share` - Share posts ✅
   - `/api/v1/posts/[id]/save` - Save/Unsave posts ✅

3. **Sistema de Notificações**
   - Notificações criadas ao curtir posts
   - Notificações criadas ao comentar
   - Notificações criadas ao compartilhar
   - Usa corretamente `recipient_id` (quem recebe) e `sender_id` (quem enviou)

4. **Frontend Components**
   - `PostCard.tsx` - Implementa todas as interações
   - `PostActions.tsx` - Botões de interação
   - `usePostInteractions.ts` - Hook para gerenciar estado

## 🔧 Como Aplicar as Correções

### 1. Aplicar Migração no Banco de Dados

Execute no Supabase SQL Editor:

```sql
-- Copie o conteúdo do arquivo:
-- supabase/migrations/20250808_fix_interactions_system.sql
```

### 2. Testar as Interações

#### Via API de Teste:
```bash
# Verificar estrutura
GET http://localhost:3000/api/v1/test/interactions

# Executar todos os testes
POST http://localhost:3000/api/v1/test/interactions

# Executar com limpeza
POST http://localhost:3000/api/v1/test/interactions?cleanup=true
```

#### Via Interface:
1. Faça login na aplicação
2. Crie um post
3. Teste cada interação:
   - 🔥 Curtir (deve incrementar contador)
   - 💬 Comentar (deve abrir modal e adicionar comentário)
   - 🔄 Compartilhar (deve copiar link)
   - 🔖 Salvar (deve marcar como salvo)
4. Verifique as notificações em `/feed?view=notifications`

## 📊 Estrutura das Tabelas

### post_likes
```sql
CREATE TABLE post_likes (
    id UUID PRIMARY KEY,
    post_id UUID REFERENCES posts(id),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ,
    UNIQUE(post_id, user_id)
);
```

### comments
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    post_id UUID REFERENCES posts(id),
    user_id UUID REFERENCES users(id),
    parent_id UUID REFERENCES comments(id), -- Para respostas
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ
);
```

### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    recipient_id UUID,  -- Quem recebe a notificação
    sender_id UUID,     -- Quem causou a notificação
    type VARCHAR(50),   -- 'like', 'comment', 'share', etc
    title TEXT,
    message TEXT,
    entity_id UUID,     -- ID do post/comment relacionado
    entity_type VARCHAR(50), -- 'post', 'comment', etc
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ
);
```

## 🔄 Fluxo de Interações

### Like/Unlike
1. Usuário clica no botão de curtir
2. Frontend faz otimistic update (atualiza UI imediatamente)
3. API `/api/v1/posts/[id]/like` é chamada
4. Backend:
   - Insere/Remove registro em `post_likes`
   - Trigger atualiza `likes_count` no post
   - Cria notificação para o autor do post
5. Frontend confirma ou reverte mudança

### Comentário
1. Usuário clica no botão de comentar
2. Modal de comentários abre
3. Usuário digita e envia comentário
4. API `/api/v1/posts/[id]/comments` é chamada
5. Backend:
   - Insere registro em `comments`
   - Trigger atualiza `comments_count` no post
   - Cria notificação para o autor do post
   - Se for resposta, notifica autor do comentário pai
6. Comentário aparece na lista

## 🐛 Problemas Comuns e Soluções

### Contador não atualiza
**Problema**: Likes/comments são salvos mas contador não muda
**Solução**: Verificar se triggers estão ativos:
```sql
-- Verificar triggers
SELECT * FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Recriar triggers se necessário
-- Use a migração 20250808_fix_interactions_system.sql
```

### Notificações não aparecem
**Problema**: Interações funcionam mas notificações não são criadas
**Solução**: Verificar se a API está criando notificações:
```sql
-- Verificar últimas notificações
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar se tem recipient_id e sender_id
SELECT recipient_id, sender_id, type, title 
FROM notifications 
WHERE recipient_id IS NOT NULL 
AND sender_id IS NOT NULL;
```

### Erro de permissão
**Problema**: User cannot perform action
**Solução**: Verificar RLS policies:
```sql
-- Verificar se RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('post_likes', 'comments', 'post_shares', 'saved_posts');

-- Se não estiver, ativar
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
-- etc para outras tabelas
```

## 📈 Monitoramento

### Queries Úteis

#### Ver posts mais curtidos:
```sql
SELECT p.id, p.content, p.likes_count, u.username
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.likes_count DESC
LIMIT 10;
```

#### Ver atividade recente:
```sql
SELECT 
    n.type,
    n.title,
    n.created_at,
    sender.username as sender,
    recipient.username as recipient
FROM notifications n
JOIN users sender ON n.sender_id = sender.id
JOIN users recipient ON n.recipient_id = recipient.id
ORDER BY n.created_at DESC
LIMIT 20;
```

#### Verificar integridade dos contadores:
```sql
-- Comparar contadores reais vs armazenados
SELECT 
    p.id,
    p.likes_count as stored_likes,
    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as real_likes,
    p.comments_count as stored_comments,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as real_comments
FROM posts p
WHERE p.likes_count != (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id)
   OR p.comments_count != (SELECT COUNT(*) FROM comments WHERE post_id = p.id);
```

## 🚀 Próximos Passos

1. **Real-time Updates**
   - Implementar subscriptions do Supabase
   - Atualizar UI quando outros usuários interagem
   - Notificações push em tempo real

2. **Analytics**
   - Dashboard de engajamento
   - Métricas de interação por post
   - Trending posts algorithm

3. **Gamification**
   - Badges por interações
   - Leaderboards
   - Achievements system

## 📝 Notas Importantes

- **Sempre** use `recipient_id` e `sender_id` em notificações
- **Nunca** permita que usuários curtam/comentem próprios posts (verificar no backend)
- **Sempre** use transações para operações múltiplas
- **Cache** contadores no frontend mas sempre confie no backend
- **Rate limiting** deve ser implementado para prevenir spam

## 🔗 Arquivos Relacionados

- `/app/api/v1/posts/[id]/like/route.ts` - API de likes
- `/app/api/v1/posts/[id]/comments/route.ts` - API de comentários
- `/app/api/v1/posts/[id]/share/route.ts` - API de compartilhamento
- `/app/api/v1/posts/[id]/save/route.ts` - API de salvamento
- `/components/feed/post/PostCard.tsx` - Componente principal
- `/hooks/usePostInteractions.ts` - Hook de interações
- `/supabase/migrations/20250808_fix_interactions_system.sql` - Migração completa