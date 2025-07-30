-- =====================================================
-- TEMPORARILY DISABLE RLS FOR TESTING
-- =====================================================
-- WARNING: Only use this for testing! Re-enable RLS after fixing the issue

-- Disable RLS on all stories tables
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;
ALTER TABLE story_daily_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE story_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE story_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE story_boosts DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_credit_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_seals DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_seals DISABLE ROW LEVEL SECURITY;
ALTER TABLE trending_boosts DISABLE ROW LEVEL SECURITY;

-- Check if RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('stories', 'story_daily_limits', 'story_views', 'story_replies', 'story_boosts', 'user_credits', 'user_credit_transactions', 'profile_seals', 'user_profile_seals', 'trending_boosts')
ORDER BY tablename;