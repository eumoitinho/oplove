-- =====================================================
-- FIX TIMELINE AND STORIES RLS POLICIES
-- =====================================================

-- 1. First, let's check what's breaking the timeline
-- The issue is likely that posts table needs proper policies too

-- Check if posts table has RLS enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting policies on posts
DROP POLICY IF EXISTS "Users can view public posts" ON posts;
DROP POLICY IF EXISTS "Users can create own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

-- Create proper policies for posts table
-- Simple policy: authenticated users can see all posts
CREATE POLICY "posts_select_all" ON posts
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "posts_insert_own" ON posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_update_own" ON posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_delete_own" ON posts
    FOR DELETE
    USING (auth.uid() = user_id);

-- 2. Now fix stories with more specific policies
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "stories_all_authenticated" ON stories;
DROP POLICY IF EXISTS "story_limits_all_authenticated" ON story_daily_limits;

-- Create proper policies for stories
CREATE POLICY "stories_insert_own" ON stories
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stories_select_active" ON stories
    FOR SELECT
    USING (
        -- Can see active stories (not expired)
        expires_at > NOW()
        -- All authenticated users can see stories (social network behavior)
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "stories_update_own" ON stories
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stories_delete_own" ON stories
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create proper policies for story_daily_limits
CREATE POLICY "story_limits_insert_own" ON story_daily_limits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "story_limits_select_own" ON story_daily_limits
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "story_limits_update_own" ON story_daily_limits
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Fix other story-related tables
-- story_views policies
DROP POLICY IF EXISTS "Users can create story views" ON story_views;
DROP POLICY IF EXISTS "Users can view own story views" ON story_views;

CREATE POLICY "story_views_insert_authenticated" ON story_views
    FOR INSERT
    WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "story_views_select_related" ON story_views
    FOR SELECT
    USING (
        auth.uid() = viewer_id
        OR auth.uid() IN (SELECT user_id FROM stories WHERE id = story_views.story_id)
    );

-- story_replies policies
DROP POLICY IF EXISTS "Users can send story replies" ON story_replies;
DROP POLICY IF EXISTS "Users can view story replies" ON story_replies;

CREATE POLICY "story_replies_insert_authenticated" ON story_replies
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "story_replies_select_related" ON story_replies
    FOR SELECT
    USING (
        auth.uid() = sender_id
        OR auth.uid() = receiver_id
    );

-- story_boosts policies
DROP POLICY IF EXISTS "Users can create story boosts" ON story_boosts;
DROP POLICY IF EXISTS "Users can view story boosts" ON story_boosts;

CREATE POLICY "story_boosts_insert_own" ON story_boosts
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (SELECT user_id FROM stories WHERE id = story_id)
    );

CREATE POLICY "story_boosts_select_all" ON story_boosts
    FOR SELECT
    USING (true);

-- 4. Ensure user_credits and related tables have proper policies
-- user_credits
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;

CREATE POLICY "user_credits_all_own" ON user_credits
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_credit_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON user_credit_transactions;

CREATE POLICY "credit_transactions_select_own" ON user_credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- profile_seals (public table)
DROP POLICY IF EXISTS "Everyone can view seals" ON profile_seals;

CREATE POLICY "profile_seals_select_all" ON profile_seals
    FOR SELECT
    USING (true);

-- user_profile_seals
DROP POLICY IF EXISTS "Users can view profile seals" ON user_profile_seals;

CREATE POLICY "user_profile_seals_select_all" ON user_profile_seals
    FOR SELECT
    USING (true);

CREATE POLICY "user_profile_seals_insert_authenticated" ON user_profile_seals
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Create a function to check if a user can post stories
CREATE OR REPLACE FUNCTION can_user_post_story(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_plan TEXT;
    v_is_verified BOOLEAN;
    v_today_count INTEGER;
    v_daily_limit INTEGER;
BEGIN
    -- Get user plan and verification status
    SELECT premium_type, is_verified
    INTO v_user_plan, v_is_verified
    FROM users
    WHERE id = p_user_id;

    -- Check if user can post based on plan
    IF v_user_plan = 'free' AND NOT v_is_verified THEN
        RETURN FALSE;
    END IF;

    -- Get today's story count
    SELECT stories_posted_today
    INTO v_today_count
    FROM story_daily_limits
    WHERE user_id = p_user_id
    AND date = CURRENT_DATE;

    IF v_today_count IS NULL THEN
        v_today_count := 0;
    END IF;

    -- Calculate daily limit based on plan
    CASE v_user_plan
        WHEN 'free' THEN
            v_daily_limit := CASE WHEN v_is_verified THEN 3 ELSE 0 END;
        WHEN 'gold' THEN
            v_daily_limit := CASE WHEN v_is_verified THEN 10 ELSE 5 END;
        WHEN 'diamond', 'couple' THEN
            v_daily_limit := CASE WHEN v_is_verified THEN 999 ELSE 10 END;
        ELSE
            v_daily_limit := 0;
    END CASE;

    RETURN v_today_count < v_daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update the story creation trigger to use the function
CREATE OR REPLACE FUNCTION check_story_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT can_user_post_story(NEW.user_id) THEN
        RAISE EXCEPTION 'Daily story limit reached';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS check_story_limit_trigger ON stories;
CREATE TRIGGER check_story_limit_trigger
    BEFORE INSERT ON stories
    FOR EACH ROW
    EXECUTE FUNCTION check_story_limit();

-- 7. Grant necessary permissions
GRANT ALL ON posts TO authenticated;
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

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION can_user_post_story(UUID) TO authenticated;

-- 8. Ensure all sequences are accessible
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;