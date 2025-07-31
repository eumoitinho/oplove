# Instruções para Executar Migrations - OpenLove

## ⚠️ IMPORTANTE: Ordem das Migrations

As migrations precisam ser executadas em uma ordem específica devido às dependências entre tabelas. Execute as migrations na seguinte ordem:

### 1. Tabelas Base (Executar Primeiro)

Estas tabelas não têm dependências e devem ser criadas primeiro:

1. **Criar tabelas de posts e interações básicas**
   ```sql
   -- Execute primeiro as migrations que criam as tabelas principais
   -- Arquivo: criar_posts_table.sql (você precisa criar este arquivo)
   CREATE TABLE IF NOT EXISTS posts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     content TEXT,
     media_urls TEXT[],
     visibility TEXT DEFAULT 'public',
     is_public BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Criar outras tabelas base necessárias
   CREATE TABLE IF NOT EXISTS conversations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   CREATE TABLE IF NOT EXISTS messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
     sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   CREATE TABLE IF NOT EXISTS follows (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(follower_id, following_id)
   );
   
   CREATE TABLE IF NOT EXISTS comments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   CREATE TABLE IF NOT EXISTS businesses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   CREATE TABLE IF NOT EXISTS subscriptions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     plan_type TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   CREATE TABLE IF NOT EXISTS conversation_participants (
     conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     PRIMARY KEY (conversation_id, user_id)
   );
   ```

### 2. Ordem Correta das Migrations Existentes

Execute as migrations nesta ordem:

1. `20250130_create_user_verifications_table.sql`
2. `20250130_fix_post_interactions_rpc.sql`
3. `20250131_fix_stories_rls_policies.sql`
4. `20250131_create_auth_trigger.sql`
5. `20250131_fix_existing_users.sql`
6. `20250131_fix_missing_stories_rls.sql`
7. `20250130_add_user_blocks.sql`
8. `20250131_create_stories_system.sql`
9. `20250131_fix_post_interactions.sql`
10. `20250130_add_advanced_reactions.sql`
11. `20250130_add_reports_system.sql`
12. `20250130_add_save_system.sql`
13. `20250130_add_share_functions.sql`
14. `20250130_create_couple_tables.sql`
15. `20250129_create_notifications_table.sql`
16. `20250130_add_account_type_to_users.sql`
17. `20250131_fix_posts_rls_policies.sql`
18. `20250131_fix_timeline_and_stories_rls.sql`
19. `20250131_complete_stories_rls_fix.sql`
20. `20250131_fix_rls_correct.sql`
21. `20250131_simple_fix_rls.sql`
22. `20250130_fix_post_interaction_triggers.sql`
23. `20250201_enhanced_security_rls.sql`

### 3. Como Executar

#### Opção 1: Via Supabase CLI (Recomendado)
```bash
# Na raiz do projeto
cd D:\MSYNC PESSOAL\oplove

# Executar todas as migrations
pnpm supabase migration up

# Ou executar uma migration específica
pnpm supabase db push --db-url "sua-url-do-banco"
```

#### Opção 2: Diretamente no Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute cada arquivo SQL na ordem indicada acima
4. Verifique se não há erros antes de prosseguir para a próxima

### 4. Verificação

Após executar as migrations, verifique:

1. **Tabelas criadas**:
   - posts, conversations, messages, follows, comments
   - user_blocks, notifications, user_verifications
   - stories, story_views, story_replies, etc.
   - post_reactions, comment_reactions
   - saved_collections, post_saves
   - couple_invitations, couple_users, etc.

2. **Políticas RLS ativas**:
   ```sql
   -- Verificar se RLS está ativo
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. **Sem erros de dependência**:
   ```sql
   -- Verificar constraints
   SELECT conname, conrelid::regclass, confrelid::regclass 
   FROM pg_constraint 
   WHERE contype = 'f';
   ```

### 5. Troubleshooting

Se encontrar erros:

1. **"relation does not exist"**: 
   - A tabela referenciada não foi criada ainda
   - Execute a migration que cria essa tabela primeiro

2. **"policy already exists"**:
   - A política já foi criada
   - Pode ignorar ou adicionar IF NOT EXISTS

3. **"column does not exist"**:
   - Verifique se a estrutura da tabela está correta
   - Pode precisar adicionar a coluna primeiro

### 6. Rollback (Se Necessário)

Para reverter migrations com problemas:

```sql
-- Exemplo de rollback manual
DROP POLICY IF EXISTS "nome_da_policy" ON tabela;
DROP TABLE IF EXISTS nome_da_tabela CASCADE;
```

## 📝 Notas Importantes

1. **Sempre faça backup** antes de executar migrations em produção
2. **Teste primeiro** em um ambiente de desenvolvimento
3. **Execute na ordem correta** para evitar erros de dependência
4. **Monitore os logs** para identificar problemas rapidamente

## 🔧 Script de Verificação

Use o script `scripts/check-migrations.js` para verificar dependências:

```bash
node scripts/check-migrations.js
```

Isso gerará um relatório em `MIGRATION_REPORT.json` com detalhes sobre problemas encontrados.