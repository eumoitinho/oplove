-- =====================================================
-- POLÍTICAS TEMPORÁRIAS MAIS PERMISSIVAS PARA TESTE
-- =====================================================

-- REMOVER políticas restritivas atuais
DROP POLICY IF EXISTS "stories_select_authenticated" ON stories;
DROP POLICY IF EXISTS "limits_select_own" ON story_daily_limits;

-- CRIAR políticas temporárias que permitem acesso sem autenticação (APENAS PARA TESTE)
CREATE POLICY "stories_select_temp" 
ON stories FOR SELECT 
USING (true); -- Permite acesso a todos

CREATE POLICY "limits_select_temp" 
ON story_daily_limits FOR SELECT 
USING (true); -- Permite acesso a todos

-- VERIFICAR se as policies foram criadas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('stories', 'story_daily_limits')
AND policyname LIKE '%temp%';