-- Migration: Optimize Chat System for Efficient Realtime
-- Date: 2025-01-09
-- Description: Simplify chat structure and optimize for single-channel realtime

-- Ensure conversations table has proper structure
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS participants UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_message_id UUID REFERENCES messages(id),
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;

-- Create index for participants array search
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations USING GIN (participants);

-- Create index for last message sorting
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at 
ON conversations(last_message_at DESC NULLS LAST);

-- Ensure messages table has proper indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_conversation 
ON messages(sender_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(conversation_id, is_read, sender_id) 
WHERE is_read = false;

-- Add metadata column for rich message content
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS media_metadata JSONB;

-- Create function to automatically update conversation participants array
CREATE OR REPLACE FUNCTION update_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add participant to array if not already present
    UPDATE conversations 
    SET participants = array_append(
      array_remove(participants, NEW.user_id), 
      NEW.user_id
    )
    WHERE id = NEW.conversation_id 
    AND NOT (NEW.user_id = ANY(participants));
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.left_at IS NOT NULL) THEN
    -- Remove participant from array
    UPDATE conversations 
    SET participants = array_remove(participants, COALESCE(NEW.user_id, OLD.user_id))
    WHERE id = COALESCE(NEW.conversation_id, OLD.conversation_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for participant array maintenance
DROP TRIGGER IF EXISTS maintain_conversation_participants ON conversation_participants;
CREATE TRIGGER maintain_conversation_participants
AFTER INSERT OR UPDATE OR DELETE ON conversation_participants
FOR EACH ROW
EXECUTE FUNCTION update_conversation_participants();

-- Create function to get unread count efficiently
CREATE OR REPLACE FUNCTION get_unread_count(
  p_conversation_id UUID,
  p_user_id UUID
) RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages
    WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND is_read = false
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get last message efficiently
CREATE OR REPLACE FUNCTION get_last_message(p_conversation_id UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  sender_id UUID,
  created_at TIMESTAMPTZ,
  type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.content, m.sender_id, m.created_at, m.type::TEXT
  FROM messages m
  WHERE m.conversation_id = p_conversation_id
  ORDER BY m.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create view for conversation list with computed fields
CREATE OR REPLACE VIEW conversation_list AS
SELECT 
  c.id,
  c.type,
  c.name,
  c.avatar_url,
  c.participants,
  c.initiated_by,
  c.initiated_by_premium,
  c.group_type,
  c.created_at,
  c.updated_at,
  c.last_message_at,
  (
    SELECT jsonb_build_object(
      'id', m.id,
      'content', m.content,
      'sender_id', m.sender_id,
      'type', m.type,
      'created_at', m.created_at
    )
    FROM messages m
    WHERE m.id = c.last_message_id
  ) as last_message
FROM conversations c;

-- Grant access to the view
GRANT SELECT ON conversation_list TO authenticated;

-- Optimize RLS policies for better performance
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    auth.uid() = ANY(participants) OR
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = id
      AND cp.user_id = auth.uid()
      AND cp.left_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (
        auth.uid() = ANY(c.participants) OR
        EXISTS (
          SELECT 1 FROM conversation_participants cp
          WHERE cp.conversation_id = c.id
          AND cp.user_id = auth.uid()
          AND cp.left_at IS NULL
        )
      )
    )
  );

-- Add composite index for realtime subscription filtering
CREATE INDEX IF NOT EXISTS idx_messages_realtime 
ON messages(conversation_id, created_at DESC)
INCLUDE (sender_id, content, type, is_read);

-- Add index for participant queries
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_active
ON conversation_participants(user_id, conversation_id)
WHERE left_at IS NULL;

-- Create function to check message permissions
CREATE OR REPLACE FUNCTION check_message_permission(
  p_user_id UUID,
  p_conversation_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_type TEXT;
  v_conversation RECORD;
  v_daily_count INTEGER;
BEGIN
  -- Get user premium type
  SELECT premium_type INTO v_user_type
  FROM users WHERE id = p_user_id;
  
  -- Get conversation details
  SELECT * INTO v_conversation
  FROM conversations WHERE id = p_conversation_id;
  
  -- Free users can only reply if premium initiated
  IF v_user_type = 'free' THEN
    IF v_conversation.initiated_by_premium 
       AND v_conversation.initiated_by != p_user_id THEN
      RETURN TRUE;
    ELSE
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Gold users have daily limits if not verified
  IF v_user_type = 'gold' THEN
    SELECT is_verified INTO v_user_type
    FROM users WHERE id = p_user_id;
    
    IF v_user_type = 'false' THEN
      -- Check daily limit (200 messages)
      SELECT COUNT(*) INTO v_daily_count
      FROM messages
      WHERE sender_id = p_user_id
      AND created_at >= CURRENT_DATE;
      
      IF v_daily_count >= 200 THEN
        RETURN FALSE;
      END IF;
    END IF;
  END IF;
  
  -- Diamond and verified users have no limits
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create optimized realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS messages;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Add comment for documentation
COMMENT ON FUNCTION check_message_permission IS 'Checks if a user can send messages in a conversation based on their plan and verification status';
COMMENT ON VIEW conversation_list IS 'Optimized view for listing conversations with computed fields';

-- Vacuum and analyze for performance
VACUUM ANALYZE conversations;
VACUUM ANALYZE messages;
VACUUM ANALYZE conversation_participants;