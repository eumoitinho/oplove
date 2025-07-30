-- =====================================================
-- CHECK RLS STATUS AND EXISTING POLICIES
-- =====================================================

-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('stories', 'story_daily_limits', 'user_credits', 'user_credit_transactions');

-- 2. Listar todas as políticas existentes
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies
WHERE tablename IN ('stories', 'story_daily_limits', 'user_credits', 'user_credit_transactions')
ORDER BY tablename, cmd;

-- 3. Verificar se as tabelas existem
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_name IN ('stories', 'story_daily_limits', 'user_credits', 'user_credit_transactions')
AND table_schema = 'public';

-- 4. Verificar estrutura da tabela stories
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'stories'
AND column_name IN ('id', 'user_id', 'status', 'created_at')
ORDER BY ordinal_position;