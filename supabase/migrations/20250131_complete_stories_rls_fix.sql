-- =====================================================
-- COMPLETE FIX FOR STORIES SYSTEM RLS POLICIES
-- =====================================================
-- This migration drops ALL existing policies and recreates them properly

-- =====================================================
-- STORIES TABLE
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can create own stories" ON stories;
DROP POLICY IF EXISTS "Users can view active stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can view stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
DROP POLICY IF EXISTS "Everyone can view boosted stories" ON stories;

-- Recreate with correct permissions
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

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can update own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can insert story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can manage own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Authenticated users can manage story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can access story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can view story limits for triggers" ON story_daily_limits;

-- Recreate with correct permissions
CREATE POLICY "story_limits_all_own" ON story_daily_limits
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STORY_VIEWS TABLE
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view stories" ON story_views;
DROP POLICY IF EXISTS "Story owners can see who viewed" ON story_views;
DROP POLICY IF EXISTS "Users can create story views" ON story_views;
DROP POLICY IF EXISTS "Story owners and viewers can see views" ON story_views;

-- Recreate with correct permissions
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

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can send replies" ON story_replies;
DROP POLICY IF EXISTS "Users can view own conversations" ON story_replies;

-- Recreate with correct permissions
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

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can create own boosts" ON story_boosts;
DROP POLICY IF EXISTS "Users can view active boosts" ON story_boosts;

-- Recreate with correct permissions
CREATE POLICY "story_boosts_insert_own" ON story_boosts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "story_boosts_select_all" ON story_boosts
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- USER_CREDITS TABLE
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "System can insert user credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can manage own credits" ON user_credits;
DROP POLICY IF EXISTS "System can initialize credits" ON user_credits;

-- Recreate with correct permissions
CREATE POLICY "user_credits_all_own" ON user_credits
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER_CREDIT_TRANSACTIONS TABLE
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own transactions" ON user_credit_transactions;
DROP POLICY IF EXISTS "System can insert credit transactions" ON user_credit_transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON user_credit_transactions;
DROP POLICY IF EXISTS "System can create transactions" ON user_credit_transactions;

-- Recreate with correct permissions
CREATE POLICY "credit_transactions_insert_own" ON user_credit_transactions
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "credit_transactions_select_own" ON user_credit_transactions
    FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() = other_user_id);

-- =====================================================
-- PROFILE_SEALS TABLE
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Everyone can view available seals" ON profile_seals;

-- Recreate with correct permissions
CREATE POLICY "profile_seals_select_available" ON profile_seals
    FOR SELECT 
    USING (auth.uid() IS NOT NULL AND is_available = true);

-- =====================================================
-- USER_PROFILE_SEALS TABLE
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view profile seals" ON user_profile_seals;
DROP POLICY IF EXISTS "Users can gift seals" ON user_profile_seals;

-- Recreate with correct permissions
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

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can create own trending boosts" ON trending_boosts;
DROP POLICY IF EXISTS "Users can view own trending boosts" ON trending_boosts;

-- Recreate with correct permissions
CREATE POLICY "trending_boosts_insert_own" ON trending_boosts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trending_boosts_select_own" ON trending_boosts
    FOR SELECT 
    USING (auth.uid() = user_id);

-- =====================================================
-- FIX TRIGGER FUNCTIONS TO HANDLE AUTH PROPERLY
-- =====================================================

-- Update the check_story_limit function to handle service role
CREATE OR REPLACE FUNCTION check_story_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_plan RECORD;
    daily_limit INTEGER;
    current_count INTEGER;
BEGIN
    -- Get user plan and verification status
    SELECT premium_type, is_verified 
    INTO user_plan
    FROM users 
    WHERE id = NEW.user_id;
    
    -- Determine daily limit based on plan
    CASE user_plan.premium_type
        WHEN 'free' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 3 ELSE 0 END;
        WHEN 'gold' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 10 ELSE 5 END;
        WHEN 'diamond' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 999 ELSE 10 END;
        WHEN 'couple' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 999 ELSE 10 END;
        ELSE
            daily_limit := 0;
    END CASE;
    
    -- Check if limit record exists and reset if needed
    INSERT INTO story_daily_limits (user_id, daily_limit, stories_posted_today)
    VALUES (NEW.user_id, daily_limit, 0)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        daily_limit = daily_limit,
        stories_posted_today = CASE 
            WHEN story_daily_limits.last_reset_date < CURRENT_DATE THEN 0
            ELSE story_daily_limits.stories_posted_today
        END,
        last_reset_date = CASE 
            WHEN story_daily_limits.last_reset_date < CURRENT_DATE THEN CURRENT_DATE
            ELSE story_daily_limits.last_reset_date
        END,
        updated_at = NOW();
    
    -- Get current count
    SELECT stories_posted_today INTO current_count
    FROM story_daily_limits
    WHERE user_id = NEW.user_id;
    
    -- Check limit
    IF current_count >= daily_limit THEN
        RAISE EXCEPTION 'Daily story limit reached';
    END IF;
    
    -- Increment counter
    UPDATE story_daily_limits
    SET 
        stories_posted_today = stories_posted_today + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS check_story_limit_trigger ON stories;
CREATE TRIGGER check_story_limit_trigger
BEFORE INSERT ON stories
FOR EACH ROW EXECUTE FUNCTION check_story_limit();

-- =====================================================
-- GRANT PERMISSIONS FOR TRIGGERS
-- =====================================================

-- Grant necessary permissions for trigger functions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;