-- =====================================================
-- RE-ENABLE RLS WITH PROPER POLICIES
-- =====================================================

-- 1. Re-enable RLS on all tables
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_seals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_seals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_boosts ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for stories table
CREATE POLICY "Enable all for authenticated users" ON stories
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read for authenticated users" ON stories
    FOR SELECT 
    TO authenticated
    USING (true);

-- 3. Create policies for story_daily_limits
CREATE POLICY "Enable all for authenticated users" ON story_daily_limits
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Create policies for story_views
CREATE POLICY "Enable insert for authenticated users" ON story_views
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Enable select for authenticated users" ON story_views
    FOR SELECT 
    TO authenticated
    USING (true);

-- 5. Create policies for story_replies
CREATE POLICY "Enable all for authenticated users" ON story_replies
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (auth.uid() = sender_id);

-- 6. Create policies for story_boosts
CREATE POLICY "Enable all for authenticated users" ON story_boosts
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (auth.uid() = user_id);

-- 7. Create policies for user_credits
CREATE POLICY "Enable all for authenticated users" ON user_credits
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. Create policies for user_credit_transactions
CREATE POLICY "Enable all for authenticated users" ON user_credit_transactions
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = other_user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. Create policies for profile_seals
CREATE POLICY "Enable read for all authenticated users" ON profile_seals
    FOR SELECT 
    TO authenticated
    USING (is_available = true);

-- 10. Create policies for user_profile_seals
CREATE POLICY "Enable all for authenticated users" ON user_profile_seals
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (auth.uid() = sender_id);

-- 11. Create policies for trending_boosts
CREATE POLICY "Enable all for authenticated users" ON trending_boosts
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 12. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('stories', 'story_daily_limits', 'story_views', 'story_replies', 'story_boosts', 'user_credits', 'user_credit_transactions', 'profile_seals', 'user_profile_seals', 'trending_boosts')
ORDER BY tablename;