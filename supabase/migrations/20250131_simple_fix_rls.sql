-- =====================================================
-- SIMPLE FIX FOR RLS - TESTING
-- =====================================================

-- 1. Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies from posts
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON posts', r.policyname);
    END LOOP;
    
    -- Drop all policies from stories
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON stories', r.policyname);
    END LOOP;
    
    -- Drop all policies from story_daily_limits
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_daily_limits')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_daily_limits', r.policyname);
    END LOOP;
END $$;

-- 2. Enable RLS on tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_boosts ENABLE ROW LEVEL SECURITY;

-- 3. Create simple permissive policies for posts
CREATE POLICY "posts_all" ON posts FOR ALL USING (true) WITH CHECK (true);

-- 4. Create simple permissive policies for stories
CREATE POLICY "stories_all" ON stories FOR ALL USING (true) WITH CHECK (true);

-- 5. Create simple permissive policies for story_daily_limits  
CREATE POLICY "story_limits_all" ON story_daily_limits FOR ALL USING (true) WITH CHECK (true);

-- 6. Create simple permissive policies for other story tables
CREATE POLICY "story_views_all" ON story_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "story_replies_all" ON story_replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "story_boosts_all" ON story_boosts FOR ALL USING (true) WITH CHECK (true);

-- 7. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 8. Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('posts', 'stories', 'story_daily_limits');