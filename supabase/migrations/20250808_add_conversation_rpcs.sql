-- Migration: Add RPC functions for conversation operations
-- Date: 2025-08-08
-- Purpose: Support optimized conversation queries

-- ============================================
-- Function to get or check existing direct conversation
-- ============================================
CREATE OR REPLACE FUNCTION get_direct_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS TABLE(
  id UUID,
  type conversation_type,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  initiated_by UUID,
  initiated_by_premium BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.id, c.type, c.created_at, c.updated_at, c.initiated_by, c.initiated_by_premium
  FROM conversations c
  WHERE c.type = 'private'
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp1
    WHERE cp1.conversation_id = c.id
    AND cp1.user_id = user1_id
    AND cp1.left_at IS NULL
  )
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp2
    WHERE cp2.conversation_id = c.id
    AND cp2.user_id = user2_id
    AND cp2.left_at IS NULL
  )
  AND (
    SELECT COUNT(*) FROM conversation_participants cp3
    WHERE cp3.conversation_id = c.id
    AND cp3.left_at IS NULL
  ) = 2
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function to validate message sending permission
-- ============================================
CREATE OR REPLACE FUNCTION validate_message_permission(
  p_user_id UUID,
  p_conversation_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_plan premium_type;
  v_is_verified BOOLEAN;
  v_conversation_type conversation_type;
  v_initiated_by UUID;
  v_initiated_by_premium BOOLEAN;
  v_is_participant BOOLEAN;
BEGIN
  -- Check if user is active participant
  SELECT EXISTS(
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id
    AND left_at IS NULL
  ) INTO v_is_participant;
  
  IF NOT v_is_participant THEN
    RETURN FALSE;
  END IF;
  
  -- Get user details
  SELECT premium_type, is_verified
  INTO v_user_plan, v_is_verified
  FROM users
  WHERE id = p_user_id;
  
  -- Get conversation details
  SELECT type, initiated_by, initiated_by_premium
  INTO v_conversation_type, v_initiated_by, v_initiated_by_premium
  FROM conversations
  WHERE id = p_conversation_id;
  
  -- Free users can only reply if premium user initiated
  IF v_user_plan = 'free' THEN
    -- Can't initiate
    IF v_initiated_by = p_user_id THEN
      RETURN FALSE;
    END IF;
    
    -- Can reply if premium user initiated
    IF v_initiated_by_premium THEN
      RETURN TRUE;
    END IF;
    
    RETURN FALSE;
  END IF;
  
  -- All other plans can send
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function to get conversation metadata
-- ============================================
CREATE OR REPLACE FUNCTION get_conversation_metadata(
  p_conversation_id UUID
)
RETURNS TABLE(
  participant_count INTEGER,
  message_count INTEGER,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM conversation_participants 
     WHERE conversation_id = p_conversation_id AND left_at IS NULL),
    (SELECT COUNT(*)::INTEGER FROM messages 
     WHERE conversation_id = p_conversation_id AND deleted_at IS NULL),
    (SELECT MAX(created_at) FROM messages 
     WHERE conversation_id = p_conversation_id AND deleted_at IS NULL),
    c.created_at
  FROM conversations c
  WHERE c.id = p_conversation_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function to batch update read receipts
-- ============================================
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_marked_count INTEGER;
BEGIN
  -- Insert read receipts for unread messages
  WITH unread_messages AS (
    SELECT m.id
    FROM messages m
    WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != p_user_id
    AND m.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM message_reads mr
      WHERE mr.message_id = m.id
      AND mr.user_id = p_user_id
    )
  )
  INSERT INTO message_reads (message_id, user_id, read_at)
  SELECT id, p_user_id, NOW()
  FROM unread_messages
  ON CONFLICT (message_id, user_id) DO NOTHING;
  
  GET DIAGNOSTICS v_marked_count = ROW_COUNT;
  
  -- Update last read message in participants
  UPDATE conversation_participants
  SET last_read_message_id = (
    SELECT id FROM messages
    WHERE conversation_id = p_conversation_id
    ORDER BY created_at DESC
    LIMIT 1
  )
  WHERE conversation_id = p_conversation_id
  AND user_id = p_user_id;
  
  RETURN v_marked_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Optimized function for typing indicators
-- ============================================
CREATE OR REPLACE FUNCTION set_typing_indicator(
  p_conversation_id UUID,
  p_user_id UUID,
  p_is_typing BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  -- This would integrate with Redis in production
  -- For now, we'll use a simple table approach
  IF p_is_typing THEN
    INSERT INTO typing_indicators (conversation_id, user_id, started_at)
    VALUES (p_conversation_id, p_user_id, NOW())
    ON CONFLICT (conversation_id, user_id) 
    DO UPDATE SET started_at = NOW();
  ELSE
    DELETE FROM typing_indicators
    WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create typing indicators table if not exists
CREATE TABLE IF NOT EXISTS typing_indicators (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Auto-cleanup old typing indicators (older than 5 seconds)
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS VOID AS $$
BEGIN
  DELETE FROM typing_indicators
  WHERE started_at < NOW() - INTERVAL '5 seconds';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Grant permissions for RPC functions
-- ============================================
GRANT EXECUTE ON FUNCTION get_direct_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION validate_message_permission TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_metadata TO authenticated;
GRANT EXECUTE ON FUNCTION mark_messages_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION set_typing_indicator TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_last_message TO authenticated;

COMMENT ON MIGRATION IS 'Adds RPC functions for optimized conversation operations';