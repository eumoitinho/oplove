-- =====================================================
-- POLÍTICA ULTRA PERMISSIVA - SEM RLS TEMPORARIAMENTE
-- =====================================================

-- DESABILITAR RLS temporariamente para teste
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;
ALTER TABLE story_daily_limits DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('stories', 'story_daily_limits');