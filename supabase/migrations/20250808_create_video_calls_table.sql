-- Create video_calls table for Daily.co integration
CREATE TABLE IF NOT EXISTS video_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    room_id TEXT NOT NULL,
    room_name TEXT NOT NULL UNIQUE,
    room_url TEXT NOT NULL,
    initiated_by UUID NOT NULL REFERENCES users(id),
    call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended', 'missed')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    duration INTEGER, -- in seconds
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create call_participants table
CREATE TABLE IF NOT EXISTS call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES video_calls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    session_id TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    duration INTEGER, -- in seconds
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(call_id, user_id)
);

-- Create indexes
CREATE INDEX idx_video_calls_conversation_id ON video_calls(conversation_id);
CREATE INDEX idx_video_calls_initiated_by ON video_calls(initiated_by);
CREATE INDEX idx_video_calls_status ON video_calls(status);
CREATE INDEX idx_video_calls_expires_at ON video_calls(expires_at);
CREATE INDEX idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX idx_call_participants_user_id ON call_participants(user_id);

-- RLS Policies for video_calls
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;

-- Users can view calls for their conversations
CREATE POLICY "Users can view calls for their conversations" ON video_calls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = video_calls.conversation_id
            AND cp.user_id = auth.uid()
            AND cp.left_at IS NULL
        )
    );

-- Only Diamond and Couple users can create calls
CREATE POLICY "Diamond and Couple users can create calls" ON video_calls
    FOR INSERT WITH CHECK (
        initiated_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.premium_type IN ('diamond', 'couple')
        )
    );

-- Initiator can update their own calls
CREATE POLICY "Initiator can update their calls" ON video_calls
    FOR UPDATE USING (initiated_by = auth.uid());

-- RLS Policies for call_participants
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

-- Users can view participants in calls they're in
CREATE POLICY "Users can view call participants" ON call_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM video_calls vc
            JOIN conversation_participants cp ON cp.conversation_id = vc.conversation_id
            WHERE vc.id = call_participants.call_id
            AND cp.user_id = auth.uid()
            AND cp.left_at IS NULL
        )
    );

-- Users can join calls they're invited to
CREATE POLICY "Users can join calls" ON call_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM video_calls vc
            JOIN conversation_participants cp ON cp.conversation_id = vc.conversation_id
            WHERE vc.id = call_participants.call_id
            AND cp.user_id = auth.uid()
            AND cp.left_at IS NULL
        )
    );

-- Users can update their own participation
CREATE POLICY "Users can update their participation" ON call_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for video_calls
CREATE TRIGGER update_video_calls_updated_at BEFORE UPDATE ON video_calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-end expired calls
CREATE OR REPLACE FUNCTION end_expired_calls()
RETURNS void AS $$
BEGIN
    UPDATE video_calls
    SET status = 'ended',
        ended_at = NOW()
    WHERE status IN ('waiting', 'active')
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run every minute (requires pg_cron extension)
-- Note: This needs to be set up separately in Supabase dashboard
-- SELECT cron.schedule('end-expired-calls', '* * * * *', 'SELECT end_expired_calls();');