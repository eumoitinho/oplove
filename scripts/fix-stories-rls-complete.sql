-- =====================================================
-- COMPLETE CLEANUP AND FIX FOR STORIES RLS
-- =====================================================

-- First, drop ALL policies from ALL stories-related tables
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies from stories table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON stories', r.policyname);
    END LOOP;
    
    -- Drop all policies from story_daily_limits table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_daily_limits')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_daily_limits', r.policyname);
    END LOOP;
    
    -- Drop all policies from story_views table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_views')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_views', r.policyname);
    END LOOP;
    
    -- Drop all policies from story_replies table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_replies')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_replies', r.policyname);
    END LOOP;
    
    -- Drop all policies from story_boosts table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_boosts')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_boosts', r.policyname);
    END LOOP;
    
    -- Drop all policies from user_credits table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_credits')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_credits', r.policyname);
    END LOOP;
    
    -- Drop all policies from user_credit_transactions table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_credit_transactions')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_credit_transactions', r.policyname);
    END LOOP;
    
    -- Drop all policies from profile_seals table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_seals')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profile_seals', r.policyname);
    END LOOP;
    
    -- Drop all policies from user_profile_seals table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profile_seals')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_profile_seals', r.policyname);
    END LOOP;
    
    -- Drop all policies from trending_boosts table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'trending_boosts')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON trending_boosts', r.policyname);
    END LOOP;
END$$;

-- Now recreate all policies with proper permissions

-- =====================================================
-- STORIES TABLE
-- =====================================================

CREATE POLICY "stories_insert_own" ON stories
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stories_select_all" ON stories
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "stories_update_own" ON stories
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stories_delete_own" ON stories
    FOR DELETE 
    USING (auth.uid() = user_id);

-- =====================================================
-- STORY_DAILY_LIMITS TABLE
-- =====================================================

CREATE POLICY "story_limits_all_own" ON story_daily_limits
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STORY_VIEWS TABLE
-- =====================================================

CREATE POLICY "story_views_insert_own" ON story_views
    FOR INSERT 
    WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "story_views_select_own_or_owner" ON story_views
    FOR SELECT 
    USING (
        auth.uid() = viewer_id 
        OR EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_views.story_id 
            AND stories.user_id = auth.uid()
        )
    );

CREATE POLICY "story_views_update_own" ON story_views
    FOR UPDATE 
    USING (auth.uid() = viewer_id)
    WITH CHECK (auth.uid() = viewer_id);

-- =====================================================
-- STORY_REPLIES TABLE
-- =====================================================

CREATE POLICY "story_replies_insert_own" ON story_replies
    FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "story_replies_select_own_or_owner" ON story_replies
    FOR SELECT 
    USING (
        auth.uid() = sender_id 
        OR EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_replies.story_id 
            AND stories.user_id = auth.uid()
        )
    );

-- =====================================================
-- STORY_BOOSTS TABLE
-- =====================================================

CREATE POLICY "story_boosts_insert_own" ON story_boosts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "story_boosts_select_all" ON story_boosts
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- USER_CREDITS TABLE
-- =====================================================

CREATE POLICY "user_credits_all_own" ON user_credits
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER_CREDIT_TRANSACTIONS TABLE
-- =====================================================

CREATE POLICY "credit_transactions_insert_own" ON user_credit_transactions
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "credit_transactions_select_own" ON user_credit_transactions
    FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() = other_user_id);

-- =====================================================
-- PROFILE_SEALS TABLE
-- =====================================================

CREATE POLICY "profile_seals_select_available" ON profile_seals
    FOR SELECT 
    USING (auth.uid() IS NOT NULL AND is_available = true);

-- =====================================================
-- USER_PROFILE_SEALS TABLE
-- =====================================================

CREATE POLICY "user_seals_insert_as_sender" ON user_profile_seals
    FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "user_seals_select_visible_or_own" ON user_profile_seals
    FOR SELECT 
    USING (
        is_displayed = true 
        OR auth.uid() = recipient_id 
        OR auth.uid() = sender_id
    );

-- =====================================================
-- TRENDING_BOOSTS TABLE
-- =====================================================

CREATE POLICY "trending_boosts_insert_own" ON trending_boosts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trending_boosts_select_own" ON trending_boosts
    FOR SELECT 
    USING (auth.uid() = user_id);

-- =====================================================
-- VERIFY ALL POLICIES WERE CREATED
-- =====================================================

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
AND tablename IN (
    'stories', 
    'story_daily_limits', 
    'story_views', 
    'story_replies',
    'story_boosts',
    'user_credits',
    'user_credit_transactions',
    'profile_seals',
    'user_profile_seals',
    'trending_boosts'
)
ORDER BY tablename, policyname;