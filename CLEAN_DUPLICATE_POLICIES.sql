-- =====================================================
-- CLEAN DUPLICATE RLS POLICIES
-- =====================================================

-- Remove todas as políticas duplicadas da tabela stories
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias stories" ON stories;
DROP POLICY IF EXISTS "Permitir exclusão de stories próprias" ON stories;

DROP POLICY IF EXISTS "Users can create own stories" ON stories;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias stories" ON stories;
DROP POLICY IF EXISTS "Permitir criação de stories próprias" ON stories;

DROP POLICY IF EXISTS "Permitir leitura de stories para usuários autenticados" ON stories;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias stories" ON stories;
DROP POLICY IF EXISTS "Users can view active stories" ON stories;
DROP POLICY IF EXISTS "Permitir leitura de stories próprias" ON stories;
DROP POLICY IF EXISTS "Usuários autenticados podem ver stories" ON stories;

DROP POLICY IF EXISTS "Permitir atualização de stories próprias" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias stories" ON stories;

-- Remove políticas duplicadas de story_daily_limits
DROP POLICY IF EXISTS "Users can insert own daily limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Permitir criação de limites diários próprios" ON story_daily_limits;

DROP POLICY IF EXISTS "Users can view own daily limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios limites diários" ON story_daily_limits;
DROP POLICY IF EXISTS "Permitir leitura de limites diários próprios" ON story_daily_limits;

DROP POLICY IF EXISTS "Permitir atualização de limites diários próprios" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can update own daily limits" ON story_daily_limits;

-- =====================================================
-- CREATE CLEAN, UNIFIED POLICIES
-- =====================================================

-- Políticas limpas para STORIES
CREATE POLICY "stories_select_authenticated" 
ON stories FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "stories_insert_own" 
ON stories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stories_update_own" 
ON stories FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "stories_delete_own" 
ON stories FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas limpas para STORY_DAILY_LIMITS
CREATE POLICY "limits_select_own" 
ON story_daily_limits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "limits_insert_own" 
ON story_daily_limits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "limits_update_own" 
ON story_daily_limits FOR UPDATE 
USING (auth.uid() = user_id);

-- =====================================================
-- VERIFY CLEAN POLICIES
-- =====================================================

-- Verificar políticas finais
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('stories', 'story_daily_limits')
ORDER BY tablename, cmd;