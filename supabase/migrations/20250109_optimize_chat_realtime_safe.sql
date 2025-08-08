-- Migration: Optimize Chat System for Efficient Realtime (Safe Version)
-- Date: 2025-01-09
-- Description: Add optimizations without breaking existing structure

-- Only add participants array if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'participants'
  ) THEN
    ALTER TABLE conversations ADD COLUMN participants UUID[] DEFAULT '{}';
  END IF;
END $$;

-- Ensure last_message columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'last_message_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN last_message_id UUID REFERENCES messages(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'last_message_at'
  ) THEN
    ALTER TABLE conversations ADD COLUMN last_message_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations USING GIN (participants);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at 
ON conversations(last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_conversation 
ON messages(sender_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(conversation_id, is_read, sender_id) 
WHERE is_read = false;

-- Add media_metadata if doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'media_metadata'
  ) THEN
    ALTER TABLE messages ADD COLUMN media_metadata JSONB;
  END IF;
END $$;

-- Populate participants array from existing conversation_participants
UPDATE conversations c
SET participants = COALESCE(
  (
    SELECT array_agg(DISTINCT cp.user_id)
    FROM conversation_participants cp
    WHERE cp.conversation_id = c.id
    AND cp.left_at IS NULL
  ),
  '{}'::UUID[]
)
WHERE participants IS NULL OR participants = '{}';

-- Create or replace function to sync participants
CREATE OR REPLACE FUNCTION sync_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add to participants array
    UPDATE conversations 
    SET participants = array_append(
      array_remove(COALESCE(participants, '{}'), NEW.user_id), 
      NEW.user_id
    )
    WHERE id = NEW.conversation_id;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
      -- User left, remove from array
      UPDATE conversations 
      SET participants = array_remove(COALESCE(participants, '{}'), NEW.user_id)
      WHERE id = NEW.conversation_id;
    ELSIF NEW.left_at IS NULL AND OLD.left_at IS NOT NULL THEN
      -- User rejoined, add to array
      UPDATE conversations 
      SET participants = array_append(
        array_remove(COALESCE(participants, '{}'), NEW.user_id), 
        NEW.user_id
      )
      WHERE id = NEW.conversation_id;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove from participants array
    UPDATE conversations 
    SET participants = array_remove(COALESCE(participants, '{}'), OLD.user_id)
    WHERE id = OLD.conversation_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if doesn't exist
DROP TRIGGER IF EXISTS sync_participants_trigger ON conversation_participants;
CREATE TRIGGER sync_participants_trigger
AFTER INSERT OR UPDATE OR DELETE ON conversation_participants
FOR EACH ROW
EXECUTE FUNCTION sync_conversation_participants();

-- Optimized function to get unread count
CREATE OR REPLACE FUNCTION get_conversation_unread_count(
  p_conversation_id UUID,
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM messages m
  WHERE m.conversation_id = p_conversation_id
  AND m.sender_id != p_user_id
  AND m.is_read = false
  AND NOT EXISTS (
    SELECT 1 FROM message_reads mr
    WHERE mr.message_id = m.id
    AND mr.user_id = p_user_id
  );
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Optimized view for conversation list with all needed data
CREATE OR REPLACE VIEW conversation_details AS
SELECT 
  c.id,
  c.type,
  c.name,
  c.avatar_url,
  c.description,
  c.participants,
  c.initiated_by,
  c.initiated_by_premium,
  c.group_type,
  c.created_at,
  c.updated_at,
  c.last_message_at,
  c.message_count,
  -- Get last message as JSON
  (
    SELECT row_to_json(m.*)
    FROM messages m
    WHERE m.id = c.last_message_id
    LIMIT 1
  ) as last_message,
  -- Get participant details
  (
    SELECT json_agg(
      json_build_object(
        'user_id', cp.user_id,
        'role', cp.role,
        'joined_at', cp.joined_at,
        'user', (
          SELECT row_to_json(u.*)
          FROM users u
          WHERE u.id = cp.user_id
        )
      )
    )
    FROM conversation_participants cp
    WHERE cp.conversation_id = c.id
    AND cp.left_at IS NULL
  ) as participant_details
FROM conversations c;

-- Grant access to the view
GRANT SELECT ON conversation_details TO authenticated;

-- Update last_message_at trigger
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations
    SET 
      last_message_id = NEW.id,
      last_message_at = NEW.created_at,
      message_count = COALESCE(message_count, 0) + 1
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating last message
DROP TRIGGER IF EXISTS update_last_message_trigger ON messages;
CREATE TRIGGER update_last_message_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Create composite index for realtime filtering
CREATE INDEX IF NOT EXISTS idx_messages_realtime_composite 
ON messages(conversation_id, created_at DESC)
INCLUDE (sender_id, content, type, is_read)
WHERE is_deleted = false;

-- Index for participant lookups
CREATE INDEX IF NOT EXISTS idx_conversation_participants_active
ON conversation_participants(user_id, conversation_id)
WHERE left_at IS NULL;

-- Index for unread messages per user
CREATE INDEX IF NOT EXISTS idx_message_reads_user
ON message_reads(user_id, message_id);

-- Function to check if user can send message (business rules)
CREATE OR REPLACE FUNCTION can_user_send_message(
  p_user_id UUID,
  p_conversation_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_user RECORD;
  v_conversation RECORD;
  v_daily_count INTEGER;
BEGIN
  -- Get user details
  SELECT * INTO v_user
  FROM users WHERE id = p_user_id;
  
  -- Get conversation details
  SELECT * INTO v_conversation
  FROM conversations WHERE id = p_conversation_id;
  
  -- Check if user is participant
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id
    AND left_at IS NULL
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Free users can only reply if premium initiated
  IF v_user.premium_type = 'free' THEN
    IF v_conversation.initiated_by_premium 
       AND v_conversation.initiated_by != p_user_id THEN
      RETURN TRUE; -- Can reply
    ELSE
      RETURN FALSE; -- Cannot initiate or send
    END IF;
  END IF;
  
  -- Gold users have daily limits if not verified
  IF v_user.premium_type = 'gold' AND NOT v_user.is_verified THEN
    -- Check daily limit (200 messages)
    SELECT COUNT(*) INTO v_daily_count
    FROM messages
    WHERE sender_id = p_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
    
    IF v_daily_count >= 200 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Diamond and verified users have no restrictions
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Optimize RLS policies for better performance
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate optimized versions
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;

-- Optimized conversation access policy
CREATE POLICY "conversation_access" ON conversations
  FOR ALL USING (
    auth.uid() = ANY(participants) OR
    auth.uid() IN (
      SELECT user_id FROM conversation_participants
      WHERE conversation_id = id AND left_at IS NULL
    )
  );

-- Optimized message view policy
CREATE POLICY "message_view" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (
        auth.uid() = ANY(c.participants) OR
        auth.uid() IN (
          SELECT user_id FROM conversation_participants
          WHERE conversation_id = c.id AND left_at IS NULL
        )
      )
    )
  );

-- Message send policy with business rules
CREATE POLICY "message_send" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    can_user_send_message(auth.uid(), conversation_id)
  );

-- Message update policy (only sender can edit)
CREATE POLICY "message_update" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Participants view policy
CREATE POLICY "participants_view" ON conversation_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
      AND cp2.user_id = auth.uid()
      AND cp2.left_at IS NULL
    )
  );

-- Add comment for documentation
COMMENT ON FUNCTION can_user_send_message IS 'Validates if user can send messages based on plan, verification status, and daily limits';
COMMENT ON VIEW conversation_details IS 'Optimized view with all conversation data including participants and last message';

-- Analyze tables for query planner
ANALYZE conversations;
ANALYZE messages;
ANALYZE conversation_participants;
ANALYZE users;