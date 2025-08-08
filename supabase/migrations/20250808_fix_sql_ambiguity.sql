-- Migration: Fix SQL ambiguity in conversation functions
-- Date: 2025-08-08
-- Purpose: Resolve column reference ambiguity errors

-- ============================================
-- Drop and recreate the problematic function
-- ============================================
DROP FUNCTION IF EXISTS get_user_conversations(UUID, INTEGER, INTEGER);

-- Create corrected function with proper aliases
CREATE OR REPLACE FUNCTION get_user_conversations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    conversation_id UUID,
    conversation_type conversation_type,
    conversation_name TEXT,
    last_message_id UUID,
    last_message_content TEXT,
    last_message_at TIMESTAMPTZ,
    last_message_sender UUID,
    unread_count INTEGER,
    participant_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH user_conversations AS (
        SELECT 
            c.id as conv_id,
            c.type as conv_type,
            c.name as conv_name,
            c.created_at as conv_created_at,
            c.updated_at as conv_updated_at
        FROM conversations c
        INNER JOIN conversation_participants cp 
            ON cp.conversation_id = c.id
        WHERE cp.user_id = p_user_id
        AND (cp.left_at IS NULL OR cp.left_at > NOW())
    ),
    last_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
            m.conversation_id as msg_conv_id,
            m.id as msg_id,
            m.content as msg_content,
            m.created_at as msg_created_at,
            m.sender_id as msg_sender_id
        FROM messages m
        WHERE m.conversation_id IN (SELECT conv_id FROM user_conversations)
        AND (m.deleted_at IS NULL OR m.deleted_at > NOW())
        ORDER BY m.conversation_id, m.created_at DESC
    ),
    participant_counts AS (
        SELECT 
            cp2.conversation_id as pc_conv_id,
            COUNT(*) as participant_count
        FROM conversation_participants cp2
        WHERE cp2.conversation_id IN (SELECT conv_id FROM user_conversations)
        AND (cp2.left_at IS NULL OR cp2.left_at > NOW())
        GROUP BY cp2.conversation_id
    )
    SELECT 
        uc.conv_id as conversation_id,
        uc.conv_type as conversation_type,
        uc.conv_name as conversation_name,
        lm.msg_id as last_message_id,
        lm.msg_content as last_message_content,
        lm.msg_created_at as last_message_at,
        lm.msg_sender_id as last_message_sender,
        0 as unread_count, -- Calculate separately to avoid more complexity
        COALESCE(pc.participant_count::INTEGER, 1) as participant_count,
        uc.conv_created_at as created_at,
        uc.conv_updated_at as updated_at
    FROM user_conversations uc
    LEFT JOIN last_messages lm ON lm.msg_conv_id = uc.conv_id
    LEFT JOIN participant_counts pc ON pc.pc_conv_id = uc.conv_id
    ORDER BY COALESCE(lm.msg_created_at, uc.conv_created_at) DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Also fix the get_direct_conversation function
-- ============================================
DROP FUNCTION IF EXISTS get_direct_conversation(UUID, UUID);

CREATE OR REPLACE FUNCTION get_direct_conversation(
    user1_id UUID,
    user2_id UUID
)
RETURNS TABLE(
    conversation_id UUID,
    conversation_type conversation_type,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    initiated_by UUID,
    initiated_by_premium BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT 
        c.id as conversation_id,
        c.type as conversation_type,
        c.created_at,
        c.updated_at,
        c.initiated_by,
        c.initiated_by_premium
    FROM conversations c
    WHERE c.type IN ('private', 'direct')
    AND EXISTS (
        SELECT 1 FROM conversation_participants cp1
        WHERE cp1.conversation_id = c.id
        AND cp1.user_id = user1_id
        AND (cp1.left_at IS NULL OR cp1.left_at > NOW())
    )
    AND EXISTS (
        SELECT 1 FROM conversation_participants cp2
        WHERE cp2.conversation_id = c.id
        AND cp2.user_id = user2_id
        AND (cp2.left_at IS NULL OR cp2.left_at > NOW())
    )
    AND (
        SELECT COUNT(*) FROM conversation_participants cp3
        WHERE cp3.conversation_id = c.id
        AND (cp3.left_at IS NULL OR cp3.left_at > NOW())
    ) = 2
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION get_user_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION get_direct_conversation TO authenticated;

-- ============================================
-- Add helpful indexes if they don't exist
-- ============================================
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_left 
ON conversation_participants(user_id, conversation_id) 
WHERE left_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_not_deleted 
ON messages(conversation_id, created_at DESC) 
WHERE deleted_at IS NULL;

COMMENT ON MIGRATION IS 'Fixes SQL ambiguity issues in conversation functions by using proper table aliases';