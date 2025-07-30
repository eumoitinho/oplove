-- =====================================================
-- COMPLETE RLS POLICIES FIX FOR STORIES SYSTEM
-- Based on Supabase AI analysis
-- =====================================================

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credit_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STORIES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Permitir leitura de stories para usuários autenticados" ON stories;
DROP POLICY IF EXISTS "Permitir leitura de stories próprias" ON stories;
DROP POLICY IF EXISTS "Permitir criação de stories próprias" ON stories;
DROP POLICY IF EXISTS "Permitir atualização de stories próprias" ON stories;
DROP POLICY IF EXISTS "Permitir exclusão de stories próprias" ON stories;

-- Create comprehensive policies for stories
CREATE POLICY "Usuários autenticados podem ver stories" 
ON stories
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem ver suas próprias stories" 
ON stories
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias stories" 
ON stories
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias stories" 
ON stories
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias stories" 
ON stories
FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- STORY_DAILY_LIMITS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can update own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can insert story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Permitir leitura de limites diários próprios" ON story_daily_limits;
DROP POLICY IF EXISTS "Permitir criação de limites diários próprios" ON story_daily_limits;
DROP POLICY IF EXISTS "Permitir atualização de limites diários próprios" ON story_daily_limits;

-- Create policies for story_daily_limits
CREATE POLICY "Usuários podem ver seus próprios limites diários" 
ON story_daily_limits
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios limites diários" 
ON story_daily_limits
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios limites diários" 
ON story_daily_limits
FOR UPDATE 
USING (auth.uid() = user_id);

-- =====================================================
-- USER_CREDITS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "System can insert user credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;

-- Create policies for user_credits
CREATE POLICY "Usuários podem ver seus próprios créditos" 
ON user_credits
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios créditos" 
ON user_credits
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios créditos" 
ON user_credits
FOR UPDATE 
USING (auth.uid() = user_id);

-- =====================================================
-- USER_CREDIT_TRANSACTIONS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "System can insert credit transactions" ON user_credit_transactions;

-- Create policies for user_credit_transactions
CREATE POLICY "Usuários podem ver suas próprias transações" 
ON user_credit_transactions
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = other_user_id);

CREATE POLICY "Usuários podem criar suas próprias transações" 
ON user_credit_transactions
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() = other_user_id);

-- =====================================================
-- VERIFY POLICIES WERE CREATED
-- =====================================================

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('stories', 'story_daily_limits', 'user_credits', 'user_credit_transactions');

-- Check created policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('stories', 'story_daily_limits', 'user_credits', 'user_credit_transactions')
ORDER BY tablename, cmd;