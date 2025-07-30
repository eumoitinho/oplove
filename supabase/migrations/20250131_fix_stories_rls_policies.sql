-- =====================================================
-- FIX STORIES SYSTEM RLS POLICIES
-- =====================================================

-- Add missing RLS policies for story_daily_limits table
CREATE POLICY "Users can view own story limits" ON story_daily_limits
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own story limits" ON story_daily_limits
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert story limits" ON story_daily_limits
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add missing policy for credits
CREATE POLICY "System can insert user credits" ON user_credits
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (user_id = auth.uid());

-- Add missing policy for credit transactions
CREATE POLICY "System can insert credit transactions" ON user_credit_transactions
    FOR INSERT WITH CHECK (user_id = auth.uid() OR other_user_id = auth.uid());