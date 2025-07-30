-- =====================================================
-- TESTE COM USUÁRIO ESPECÍFICO
-- =====================================================

-- Remover política atual
DROP POLICY IF EXISTS "stories_select_authenticated" ON stories;

-- Criar política temporária para o seu usuário específico
CREATE POLICY "stories_select_test_user" 
ON stories FOR SELECT 
USING (
  auth.uid() = '34d0164c-3ba4-403a-9c15-b896efb27e5f'::uuid 
  OR auth.uid() IS NOT NULL
);

-- Fazer a mesma coisa para story_daily_limits
DROP POLICY IF EXISTS "limits_select_own" ON story_daily_limits;

CREATE POLICY "limits_select_test_user" 
ON story_daily_limits FOR SELECT 
USING (
  user_id = '34d0164c-3ba4-403a-9c15-b896efb27e5f'::uuid 
  OR auth.uid() IS NOT NULL
);

-- Verificar se as policies foram criadas
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('stories', 'story_daily_limits')
AND policyname LIKE '%test_user%';