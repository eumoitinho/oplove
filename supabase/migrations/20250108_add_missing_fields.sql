-- =====================================================
-- ADD MISSING FIELDS TO TABLES
-- Created: 2025-01-08
-- Description: Add missing fields identified in the analysis
-- =====================================================

-- 1. Add missing fields to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS group_type VARCHAR(50) CHECK (group_type IN ('user_created', 'event', 'community')),
ADD COLUMN IF NOT EXISTS initiated_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS initiated_by_premium BOOLEAN DEFAULT false;

-- 2. Add missing fields to messages table (if needed)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

-- 3. Create calls table if it doesn't exist
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    caller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    call_type VARCHAR(20) CHECK (call_type IN ('voice', 'video')),
    status VARCHAR(20) CHECK (status IN ('ringing', 'connecting', 'connected', 'ended', 'declined', 'missed')),
    participants UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0,
    recording_url TEXT,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    end_reason VARCHAR(50)
);

-- 4. Add indexes for the calls table
CREATE INDEX IF NOT EXISTS idx_calls_conversation ON calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calls_caller ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_created ON calls(created_at DESC);

-- 5. Add RLS policies for calls table
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Users can view calls they participated in
CREATE POLICY "Users can view their calls" ON calls
    FOR SELECT USING (
        caller_id = auth.uid() OR 
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = calls.conversation_id 
            AND user_id = auth.uid()
        )
    );

-- Users can create calls in their conversations
CREATE POLICY "Users can create calls" ON calls
    FOR INSERT WITH CHECK (
        caller_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = calls.conversation_id 
            AND user_id = auth.uid()
        )
    );

-- Users can update calls they initiated
CREATE POLICY "Users can update their calls" ON calls
    FOR UPDATE USING (caller_id = auth.uid());

-- 6. Add daily message tracking for Gold users
CREATE TABLE IF NOT EXISTS user_daily_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Index for daily message tracking
CREATE INDEX IF NOT EXISTS idx_user_daily_messages_user_date 
    ON user_daily_messages(user_id, date DESC);

-- RLS for user_daily_messages
ALTER TABLE user_daily_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily messages" ON user_daily_messages
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own daily messages" ON user_daily_messages
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert daily messages" ON user_daily_messages
    FOR INSERT WITH CHECK (true);

-- 7. Grant permissions
GRANT ALL ON calls TO authenticated;
GRANT ALL ON user_daily_messages TO authenticated;

-- 8. Function to reset daily message counts (run daily via cron)
CREATE OR REPLACE FUNCTION reset_daily_message_counts()
RETURNS void AS $$
BEGIN
    -- Archive yesterday's counts if needed
    INSERT INTO user_daily_messages (user_id, date, message_count)
    SELECT id, CURRENT_DATE - INTERVAL '1 day', daily_message_count
    FROM users
    WHERE premium_type = 'gold' AND daily_message_count > 0
    ON CONFLICT (user_id, date) DO NOTHING;
    
    -- Reset counts for Gold users
    UPDATE users 
    SET daily_message_count = 0 
    WHERE premium_type = 'gold';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify all changes
SELECT 
    'Tables Created' as check_type,
    tablename as detail
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('calls', 'user_daily_messages')
UNION ALL
SELECT 
    'Columns Added' as check_type,
    column_name || ' in ' || table_name as detail
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'conversations'
AND column_name IN ('group_type', 'initiated_by', 'initiated_by_premium');