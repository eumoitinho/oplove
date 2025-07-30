-- =====================================================
-- DIAGNOSE STORIES PERMISSIONS ISSUES
-- =====================================================

-- 1. Check current user
SELECT current_user, session_user;

-- 2. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stories', 'story_daily_limits', 'story_views', 'story_replies', 'story_boosts', 'user_credits', 'user_credit_transactions', 'profile_seals', 'user_profile_seals', 'trending_boosts');

-- 3. Check table ownership
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('stories', 'story_daily_limits');

-- 4. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('stories', 'story_daily_limits');

-- 5. Check policies on stories table
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'stories';

-- 6. Check policies on story_daily_limits table
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'story_daily_limits';

-- 7. Check grants on stories table
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'stories'
ORDER BY grantee, privilege_type;

-- 8. Check grants on story_daily_limits table
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'story_daily_limits'
ORDER BY grantee, privilege_type;

-- 9. Test if we can query with service role
-- This should work if the issue is with RLS policies
SET ROLE postgres;
SELECT COUNT(*) FROM stories;
SELECT COUNT(*) FROM story_daily_limits;
RESET ROLE;

-- 10. Check auth.uid() function
SELECT auth.uid();

-- 11. Check if there are any stories
SELECT COUNT(*) as total_stories FROM stories;

-- 12. Check if there are any limits
SELECT COUNT(*) as total_limits FROM story_daily_limits;