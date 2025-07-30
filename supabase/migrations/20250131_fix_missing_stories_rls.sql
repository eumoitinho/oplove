-- =====================================================
-- FIX MISSING STORIES RLS POLICIES
-- =====================================================

-- Drop and recreate all RLS policies to fix permission errors

-- =====================================================
-- STORIES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own stories" ON stories;
DROP POLICY IF EXISTS "Users can view active stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
DROP POLICY IF EXISTS "Everyone can view boosted stories" ON stories;

-- Recreate with proper permissions
CREATE POLICY "Users can create own stories" ON stories
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can view stories" ON stories
    FOR SELECT USING (auth.uid() IS NOT NULL AND (status = 'active' OR user_id = auth.uid()));

CREATE POLICY "Users can update own stories" ON stories
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own stories" ON stories
    FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- STORY DAILY LIMITS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can update own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can insert story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can manage own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can view story limits for triggers" ON story_daily_limits;

-- Recreate with proper permissions for authenticated users
CREATE POLICY "Authenticated users can manage story limits" ON story_daily_limits
    FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow system functions and triggers to access limits
CREATE POLICY "System can access story limits" ON story_daily_limits
    FOR ALL USING (true)
    WITH CHECK (true);

-- =====================================================
-- USER CREDITS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "System can insert user credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can manage own credits" ON user_credits;
DROP POLICY IF EXISTS "System can initialize user credits" ON user_credits;

-- Recreate with proper permissions
CREATE POLICY "Users can manage own credits" ON user_credits
    FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow system to initialize credits
CREATE POLICY "System can initialize credits" ON user_credits
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- CREDIT TRANSACTIONS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own transactions" ON user_credit_transactions;
DROP POLICY IF EXISTS "System can insert credit transactions" ON user_credit_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON user_credit_transactions;

-- Recreate with proper permissions
CREATE POLICY "Users can view own transactions" ON user_credit_transactions
    FOR SELECT USING (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR other_user_id = auth.uid()));

CREATE POLICY "Users can create transactions" ON user_credit_transactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow system to create transactions for gifts and refunds
CREATE POLICY "System can create transactions" ON user_credit_transactions
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- STORY VIEWS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view stories" ON story_views;
DROP POLICY IF EXISTS "Story owners can see who viewed" ON story_views;

-- Recreate with proper permissions
CREATE POLICY "Users can create story views" ON story_views
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND viewer_id = auth.uid());

CREATE POLICY "Story owners and viewers can see views" ON story_views
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            viewer_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM stories 
                WHERE stories.id = story_views.story_id 
                AND stories.user_id = auth.uid()
            )
        )
    );

-- =====================================================
-- OTHER POLICIES FIXES
-- =====================================================

-- Profile seals - ensure everyone can view available seals
DROP POLICY IF EXISTS "Everyone can view available seals" ON profile_seals;
CREATE POLICY "Everyone can view available seals" ON profile_seals
    FOR SELECT USING (auth.uid() IS NOT NULL AND is_available = true);