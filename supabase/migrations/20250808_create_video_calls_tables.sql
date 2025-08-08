-- Create video calls system tables
-- Date: 2025-08-08

-- ============================================
-- Create video_calls table
-- ============================================
CREATE TABLE IF NOT EXISTS video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Daily.co room information
  room_id TEXT NOT NULL,
  room_name TEXT NOT NULL UNIQUE,
  room_url TEXT NOT NULL,
  
  -- Call metadata
  initiated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended', 'missed')),
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metrics
  duration INTERVAL GENERATED ALWAYS AS (ended_at - started_at) STORED,
  max_participants INTEGER DEFAULT 4,
  
  -- Indexes
  CONSTRAINT video_calls_conversation_id_idx UNIQUE (conversation_id, created_at)
);

-- ============================================
-- Create call_participants table
-- ============================================
CREATE TABLE IF NOT EXISTS call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES video_calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Participation timing
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  
  -- Daily.co session data
  session_id TEXT,
  
  -- Metrics
  duration INTERVAL GENERATED ALWAYS AS (left_at - joined_at) STORED,
  
  -- Unique constraint
  UNIQUE(call_id, user_id)
);

-- ============================================
-- Add indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_video_calls_conversation_id 
ON video_calls(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_calls_initiated_by 
ON video_calls(initiated_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_calls_status 
ON video_calls(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_calls_expires_at 
ON video_calls(expires_at) 
WHERE status IN ('waiting', 'active');

CREATE INDEX IF NOT EXISTS idx_call_participants_call_id 
ON call_participants(call_id, joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_call_participants_user_id 
ON call_participants(user_id, joined_at DESC);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

-- Users can view calls in their conversations
CREATE POLICY "Users can view calls in their conversations" ON video_calls
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

-- Users can create calls in their conversations (premium only)
CREATE POLICY "Premium users can create calls" ON video_calls
  FOR INSERT WITH CHECK (
    initiated_by = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    ) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND premium_type IN ('gold', 'diamond', 'couple')
    )
  );

-- Users can update calls they initiated
CREATE POLICY "Users can update calls they initiated" ON video_calls
  FOR UPDATE USING (initiated_by = auth.uid());

-- Users can view participants in calls they're part of
CREATE POLICY "Users can view call participants" ON call_participants
  FOR SELECT USING (
    call_id IN (
      SELECT id FROM video_calls 
      WHERE conversation_id IN (
        SELECT conversation_id 
        FROM conversation_participants 
        WHERE user_id = auth.uid() AND left_at IS NULL
      )
    )
  );

-- Users can join calls as participants
CREATE POLICY "Users can join calls" ON call_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    call_id IN (
      SELECT id FROM video_calls 
      WHERE conversation_id IN (
        SELECT conversation_id 
        FROM conversation_participants 
        WHERE user_id = auth.uid() AND left_at IS NULL
      )
    )
  );

-- Users can update their own participation
CREATE POLICY "Users can update own participation" ON call_participants
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- Grant permissions
-- ============================================
GRANT SELECT, INSERT, UPDATE ON video_calls TO authenticated;
GRANT SELECT, INSERT, UPDATE ON call_participants TO authenticated;

-- ============================================
-- Helper functions
-- ============================================

-- Function to end expired calls
CREATE OR REPLACE FUNCTION end_expired_calls()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Update expired calls
  UPDATE video_calls 
  SET 
    status = 'ended',
    ended_at = NOW()
  WHERE 
    expires_at < NOW() 
    AND status IN ('waiting', 'active');
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get active calls for a user
CREATE OR REPLACE FUNCTION get_user_active_calls(p_user_id UUID)
RETURNS TABLE(
  call_id UUID,
  conversation_id UUID,
  room_url TEXT,
  call_type TEXT,
  initiated_by UUID,
  created_at TIMESTAMPTZ,
  participant_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vc.id,
    vc.conversation_id,
    vc.room_url,
    vc.call_type,
    vc.initiated_by,
    vc.created_at,
    COUNT(cp.user_id) as participant_count
  FROM video_calls vc
  LEFT JOIN call_participants cp ON vc.id = cp.call_id AND cp.left_at IS NULL
  WHERE vc.conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = p_user_id AND left_at IS NULL
  )
  AND vc.status IN ('waiting', 'active')
  AND vc.expires_at > NOW()
  GROUP BY vc.id, vc.conversation_id, vc.room_url, vc.call_type, vc.initiated_by, vc.created_at
  ORDER BY vc.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_active_calls TO authenticated;

-- ============================================
-- Cleanup job (to be run periodically)
-- ============================================

-- This would be called by a cron job or background task
COMMENT ON FUNCTION end_expired_calls() IS 'Call this function periodically to clean up expired calls';

-- ============================================
-- Verification
-- ============================================
SELECT 'Video calls tables created successfully!' as status;