-- Check if stories tables exist and have RLS enabled
-- Run this in your Supabase SQL Editor

-- 1. Check if tables exist
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN (
  'stories', 
  'story_views', 
  'story_replies', 
  'story_daily_limits',
  'story_boosts',
  'user_credits',
  'user_credit_transactions',
  'profile_seals',
  'user_profile_seals',
  'trending_boosts'
)
AND schemaname = 'public';

-- 2. Check RLS policies for stories table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN (
  'stories', 
  'story_views', 
  'story_replies', 
  'story_daily_limits',
  'story_boosts',
  'user_credits',
  'user_credit_transactions'
)
AND schemaname = 'public';

-- 3. Check if current user can access stories table
SELECT 
  'stories' as table_name,
  (SELECT COUNT(*) FROM stories) as can_count_stories,
  (SELECT current_user) as current_user,
  (SELECT auth.uid()) as auth_uid;

-- 4. Show current user session info
SELECT 
  auth.uid() as user_id,
  auth.role() as user_role,
  current_user as current_database_user;