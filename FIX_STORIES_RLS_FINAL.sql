-- =====================================================
-- POLÍTICAS RLS CORRETAS PARA STORIES BASEADO NA MIGRATION
-- =====================================================

-- STORIES - Stories públicas e ativas
DROP POLICY IF EXISTS "stories_select_authenticated" ON stories;
DROP POLICY IF EXISTS "stories_select_test_user" ON stories;
CREATE POLICY "stories_select_public" 
ON stories FOR SELECT 
USING (
  status = 'active' 
  AND expires_at > NOW() 
  AND (is_public = true OR user_id = auth.uid())
);

-- STORIES - Usuários podem criar suas próprias stories
DROP POLICY IF EXISTS "stories_insert_own" ON stories;
CREATE POLICY "stories_insert_own" 
ON stories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- STORIES - Usuários podem atualizar suas próprias stories
DROP POLICY IF EXISTS "stories_update_own" ON stories;
CREATE POLICY "stories_update_own" 
ON stories FOR UPDATE 
USING (auth.uid() = user_id);

-- STORIES - Usuários podem deletar suas próprias stories
DROP POLICY IF EXISTS "stories_delete_own" ON stories;
CREATE POLICY "stories_delete_own" 
ON stories FOR DELETE 
USING (auth.uid() = user_id);

-- STORY_VIEWS - Visualizações de stories públicas
DROP POLICY IF EXISTS "story_views_select" ON story_views;
CREATE POLICY "story_views_select" 
ON story_views FOR SELECT 
USING (
  viewer_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM stories 
    WHERE stories.id = story_views.story_id
    AND stories.user_id = auth.uid()
  )
);

-- STORY_VIEWS - Usuários podem criar views
DROP POLICY IF EXISTS "story_views_insert" ON story_views;
CREATE POLICY "story_views_insert" 
ON story_views FOR INSERT 
WITH CHECK (auth.uid() = viewer_id);

-- STORY_DAILY_LIMITS - Usuários podem ver seus próprios limites
DROP POLICY IF EXISTS "limits_select_own" ON story_daily_limits;
DROP POLICY IF EXISTS "limits_select_test_user" ON story_daily_limits;
CREATE POLICY "limits_select_own" 
ON story_daily_limits FOR SELECT 
USING (auth.uid() = user_id);

-- STORY_DAILY_LIMITS - Usuários podem inserir seus próprios limites
DROP POLICY IF EXISTS "limits_insert_own" ON story_daily_limits;
CREATE POLICY "limits_insert_own" 
ON story_daily_limits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- STORY_DAILY_LIMITS - Usuários podem atualizar seus próprios limites
DROP POLICY IF EXISTS "limits_update_own" ON story_daily_limits;
CREATE POLICY "limits_update_own" 
ON story_daily_limits FOR UPDATE 
USING (auth.uid() = user_id);

-- USER_CREDITS - Usuários podem ver seus próprios créditos
DROP POLICY IF EXISTS "user_credits_select" ON user_credits;
CREATE POLICY "user_credits_select" 
ON user_credits FOR SELECT 
USING (auth.uid() = user_id);

-- USER_CREDITS - Sistema pode inserir créditos
DROP POLICY IF EXISTS "user_credits_insert" ON user_credits;
CREATE POLICY "user_credits_insert" 
ON user_credits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- USER_CREDITS - Usuários podem atualizar seus próprios créditos
DROP POLICY IF EXISTS "user_credits_update" ON user_credits;
CREATE POLICY "user_credits_update" 
ON user_credits FOR UPDATE 
USING (auth.uid() = user_id);

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('stories', 'story_views', 'story_daily_limits', 'user_credits')
ORDER BY tablename, cmd;

-- =============================
-- POLÍTICAS PERMISSIVAS TEMPORÁRIAS PARA DEBUG
-- =============================
DROP POLICY IF EXISTS "stories_select_permissive" ON stories;
CREATE POLICY "stories_select_permissive"
ON stories FOR SELECT
USING (true);

DROP POLICY IF EXISTS "limits_select_permissive" ON story_daily_limits;
CREATE POLICY "limits_select_permissive"
ON story_daily_limits FOR SELECT
USING (true);