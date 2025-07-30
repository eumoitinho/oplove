-- =====================================================
-- CHECK AND FIX STORIES PERMISSIONS
-- =====================================================

-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('stories', 'story_daily_limits', 'story_views', 'story_replies', 'story_boosts', 'user_credits', 'user_credit_transactions', 'profile_seals', 'user_profile_seals', 'trending_boosts');

-- 2. Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('stories', 'story_daily_limits')
ORDER BY tablename, policyname;

-- 3. Drop ALL policies for stories table
DROP POLICY IF EXISTS "Users can create own stories" ON stories;
DROP POLICY IF EXISTS "Users can view active stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can view stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
DROP POLICY IF EXISTS "Everyone can view boosted stories" ON stories;
DROP POLICY IF EXISTS "stories_insert_own" ON stories;
DROP POLICY IF EXISTS "stories_select_all" ON stories;
DROP POLICY IF EXISTS "stories_update_own" ON stories;
DROP POLICY IF EXISTS "stories_delete_own" ON stories;

-- 4. Drop ALL policies for story_daily_limits
DROP POLICY IF EXISTS "Users can view own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can update own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can insert story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can manage own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Authenticated users can manage story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can access story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can view story limits for triggers" ON story_daily_limits;
DROP POLICY IF EXISTS "story_limits_all_own" ON story_daily_limits;

-- 5. Create simple, permissive policies for stories
CREATE POLICY "stories_all_authenticated" ON stories
    FOR ALL 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Create simple, permissive policies for story_daily_limits
CREATE POLICY "story_limits_all_authenticated" ON story_daily_limits
    FOR ALL 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 7. Verify policies were created
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('stories', 'story_daily_limits')
ORDER BY tablename, policyname;

-- 8. Grant permissions to authenticated role
GRANT ALL ON stories TO authenticated;
GRANT ALL ON story_daily_limits TO authenticated;
GRANT ALL ON story_views TO authenticated;
GRANT ALL ON story_replies TO authenticated;
GRANT ALL ON story_boosts TO authenticated;
GRANT ALL ON user_credits TO authenticated;
GRANT ALL ON user_credit_transactions TO authenticated;
GRANT ALL ON profile_seals TO authenticated;
GRANT ALL ON user_profile_seals TO authenticated;
GRANT ALL ON trending_boosts TO authenticated;

-- 9. Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;