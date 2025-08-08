# 🚨 GUIA DE EXECUÇÃO DAS CORREÇÕES DO SISTEMA DE MENSAGENS

## ORDEM DE EXECUÇÃO NO SUPABASE SQL EDITOR

### ⚠️ IMPORTANTE
- Execute cada arquivo na ordem indicada
- Alguns comandos precisam ser executados SEPARADAMENTE (fora de transação)
- Verifique o resultado de cada etapa antes de prosseguir

---

## 📝 ETAPA 1: Corrigir RLS das Mensagens (CRÍTICO - SEGURANÇA)

Execute o arquivo completo:
```sql
-- Arquivo: 20250808_fix_messages_rls_critical.sql
-- Execute todo o conteúdo EXCETO os comandos CREATE INDEX CONCURRENTLY
```

**Verificação:**
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'messages';
-- Deve mostrar apenas políticas seguras, NÃO deve ter "Allow authenticated users to view messages"
```

---

## 📝 ETAPA 2: Corrigir Notificações

Execute o arquivo completo:
```sql
-- Arquivo: 20250108_fix_notifications_complete.sql
-- Execute todo o conteúdo
```

**Verificação:**
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'notifications';
-- Deve mostrar 4 políticas
```

---

## 📝 ETAPA 3: Adicionar Campos e Tabelas Faltantes

Execute o arquivo completo:
```sql
-- Arquivo: 20250108_add_missing_fields.sql
-- Execute todo o conteúdo
```

**Verificação:**
```sql
-- Verificar se campos foram adicionados
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name IN ('group_type', 'initiated_by', 'initiated_by_premium');

-- Verificar se tabela calls foi criada
SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'calls');
```

---

## 📝 ETAPA 4: Criar Índices (EXECUTAR SEPARADAMENTE!)

⚠️ **ATENÇÃO: Execute cada comando CREATE INDEX CONCURRENTLY individualmente!**

Abra o arquivo `20250108_create_indexes_separately.sql` e execute CADA comando separadamente:

```sql
-- Execute um por vez, esperando cada um completar:

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
    ON messages(conversation_id, created_at DESC);

-- Aguarde completar, então execute o próximo:

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender 
    ON messages(sender_id);

-- Continue assim para cada índice...
```

**Verificação:**
```sql
-- Listar todos os índices criados
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('messages', 'conversations', 'notifications', 'conversation_participants')
AND indexname LIKE 'idx_%';
```

---

## ✅ ETAPA 5: Verificação Final

Execute este script de verificação:

```sql
-- 1. Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('messages', 'conversations', 'notifications', 'calls')
ORDER BY tablename;

-- 2. Verificar políticas de segurança
SELECT tablename, count(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('messages', 'conversations', 'notifications', 'calls')
GROUP BY tablename
ORDER BY tablename;

-- 3. Verificar campos críticos
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'initiated_by') 
        THEN '✅ initiated_by exists' 
        ELSE '❌ initiated_by missing' 
    END as check_1,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'calls') 
        THEN '✅ calls table exists' 
        ELSE '❌ calls table missing' 
    END as check_2;
```

---

## 🔧 CORREÇÕES NO CÓDIGO (Já Aplicadas)

✅ **MessageService** (`lib/services/message.service.ts`)
- Adicionado método `createGroupConversation`
- Corrigida validação de permissões

✅ **useMessagePermissions** (`hooks/useMessagePermissions.ts`)
- Corrigida lógica para usuários free poderem responder

✅ **Migrations SQL**
- Criadas migrações para corrigir RLS
- Adicionados campos e tabelas faltantes
- Separados índices CONCURRENTLY

---

## 🚀 APÓS APLICAR TUDO

1. **Teste criar uma conversa** com usuário premium
2. **Teste enviar mensagem** 
3. **Teste responder** com usuário free
4. **Verifique notificações** funcionando
5. **Limpe o cache** do Redis se necessário

## ⚠️ SE ALGO DER ERRADO

1. Verifique os logs do Supabase
2. Execute as verificações para identificar o que faltou
3. Os índices CONCURRENTLY podem ser criados depois sem problema
4. As políticas RLS são críticas - garanta que estão corretas

---

## 📊 STATUS ESPERADO APÓS TUDO

- ✅ Mensagens com RLS seguro
- ✅ Notificações funcionando
- ✅ Tabela calls criada
- ✅ Campos initiated_by em conversations
- ✅ Índices otimizados
- ✅ Usuários free podem responder
- ✅ Grupos só para Diamond/Couple