-- =====================================================
-- DEBUG RLS REAL - VERIFICAR O QUE ESTÁ ACONTECENDO
-- =====================================================

-- 1. Verificar se as tabelas realmente existem
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE tablename IN ('stories', 'story_daily_limits');

-- 2. Verificar se RLS está realmente habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('stories', 'story_daily_limits');

-- 3. Listar TODAS as políticas existentes 
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('stories', 'story_daily_limits')
ORDER BY tablename, cmd;

-- 4. Verificar se auth.uid() funciona
SELECT auth.uid() as current_user_id;

-- 5. Testar uma query simples na tabela stories
SELECT COUNT(*) as total_stories FROM stories;

-- 6. Verificar permissões na tabela
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name IN ('stories', 'story_daily_limits');

-- 7. Verificar se existe algum usuário logado de fato
SELECT 
  auth.uid() as user_id,
  auth.jwt() as jwt_info;