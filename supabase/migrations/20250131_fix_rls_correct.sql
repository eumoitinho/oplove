-- =====================================================
-- FIX RLS POLICIES - BASED ON ACTUAL TABLE STRUCTURE
-- =====================================================

-- 1. Drop all existing policies first
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

    -- Drop all policies from story_views
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_views')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_views', r.policyname);
    END LOOP;

    -- Drop all policies from story_replies
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_replies')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_replies', r.policyname);
    END LOOP;

    -- Drop all policies from story_boosts
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_boosts')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_boosts', r.policyname);
    END LOOP;
END $$;

-- 2. Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_boosts ENABLE ROW LEVEL SECURITY;

-- 3. Posts table - simple authenticated access
CREATE POLICY "posts_select" ON posts
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "posts_insert" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_update" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "posts_delete" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Stories table - authenticated can see active stories
CREATE POLICY "stories_select" ON stories
    FOR SELECT USING (
        expires_at > NOW() 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "stories_insert" ON stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stories_update" ON stories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "stories_delete" ON stories
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Story daily limits - users manage their own
CREATE POLICY "story_limits_all" ON story_daily_limits
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Story views - authenticated users can view and create
CREATE POLICY "story_views_insert" ON story_views
    FOR INSERT WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "story_views_select" ON story_views
    FOR SELECT USING (
        auth.uid() = viewer_id
        OR auth.uid() IN (
            SELECT user_id FROM stories WHERE id = story_views.story_id
        )
    );

-- 7. Story replies - based on actual structure (no receiver_id)
CREATE POLICY "story_replies_insert" ON story_replies
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "story_replies_select" ON story_replies
    FOR SELECT USING (
        -- Sender can see their own replies
        auth.uid() = sender_id
        -- Story owner can see all replies to their stories
        OR auth.uid() IN (
            SELECT user_id FROM stories WHERE id = story_replies.story_id
        )
    );

-- 8. Story boosts - story owners can boost
CREATE POLICY "story_boosts_insert" ON story_boosts
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM stories WHERE id = story_id
        )
    );

CREATE POLICY "story_boosts_select" ON story_boosts
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 9. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 10. Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('posts', 'stories', 'story_daily_limits', 'story_views', 'story_replies', 'story_boosts')
ORDER BY tablename;