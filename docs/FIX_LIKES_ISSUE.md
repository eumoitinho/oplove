# 🔧 Como Corrigir o Problema de Likes (Error 400)

## Problema Identificado
O botão de like está retornando erro 400. Possíveis causas:
1. Estrutura incorreta da tabela `post_likes`
2. Falta de colunas necessárias
3. Constraints duplicadas ou incorretas
4. Políticas RLS bloqueando inserção

## Solução Passo a Passo

### 1. Execute o Script de Correção no Supabase

No **Supabase Dashboard > SQL Editor**, execute:

```sql
-- Quick fix for post_likes table
-- Run this if likes are not working

-- 1. Drop the existing constraint if it exists
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_pkey CASCADE;
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_unique_user_post CASCADE;

-- 2. Ensure all columns exist
ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS post_id UUID;

ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Set NOT NULL constraints
ALTER TABLE post_likes ALTER COLUMN post_id SET NOT NULL;
ALTER TABLE post_likes ALTER COLUMN user_id SET NOT NULL;

-- 4. Add primary key
ALTER TABLE post_likes ADD PRIMARY KEY (id);

-- 5. Add unique constraint to prevent duplicate likes
ALTER TABLE post_likes 
ADD CONSTRAINT post_likes_unique_user_post UNIQUE (post_id, user_id);

-- 6. Add foreign keys if missing
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;
ALTER TABLE post_likes 
ADD CONSTRAINT post_likes_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
ALTER TABLE post_likes 
ADD CONSTRAINT post_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 7. Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- 8. Create policies
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
CREATE POLICY "Users can view all likes" ON post_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own likes" ON post_likes;
CREATE POLICY "Users can create own likes" ON post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON post_likes;
CREATE POLICY "Users can delete own likes" ON post_likes
    FOR DELETE USING (auth.uid() = user_id);
```

### 2. Verifique a Estrutura

Execute esta query para confirmar:

```sql
-- Check structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'post_likes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'post_likes'
AND table_schema = 'public';

-- Check if you can insert
SELECT * FROM post_likes LIMIT 5;
```

### 3. Teste no App

1. Acesse: http://localhost:3000/api/v1/test/check-likes (logado)
2. Verifique o resultado - deve mostrar:
   - Se a tabela está acessível
   - Se já existe like
   - Se consegue inserir

### 4. Teste Manual de Like

No console do navegador (F12), com você logado:

```javascript
// Teste de like
const postId = '9aa1ffb4-845f-4bdd-88b8-c1f622758a3b'; // Use um ID de post real

fetch(`/api/v1/posts/${postId}/like`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 5. Se Ainda Não Funcionar

Execute esta query para limpar dados corrompidos:

```sql
-- Remove any corrupted likes
DELETE FROM post_likes 
WHERE post_id IS NULL 
   OR user_id IS NULL;

-- Reset all counters
UPDATE posts p SET
    likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id);

-- Check for duplicate entries
SELECT post_id, user_id, COUNT(*) 
FROM post_likes 
GROUP BY post_id, user_id 
HAVING COUNT(*) > 1;
```

## Logs para Debug

No código, já adicionamos logs em:
- `/app/api/v1/posts/[id]/like/route.ts`

Você verá no terminal:
- `[Like API] POST request for post: xxx by user: xxx`
- `[Like API] Post already liked by user` (se já curtido)
- `[Like API] Error creating like:` (se erro ao inserir)

## Verificação Final

Após aplicar as correções:

1. **Curtir um post**: Deve funcionar e incrementar contador
2. **Descurtir**: DELETE para `/api/v1/posts/[id]/like` deve funcionar
3. **Notificação**: Deve aparecer para o autor do post
4. **Contador**: Deve atualizar em tempo real

## Arquivos Relacionados

- `/app/api/v1/posts/[id]/like/route.ts` - API endpoint
- `/supabase/migrations/20250808_fix_post_likes_simple.sql` - Script de correção
- `/app/api/v1/test/check-likes/route.ts` - Teste de diagnóstico