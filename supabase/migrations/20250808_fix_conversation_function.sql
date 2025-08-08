-- Migration: Fix ambiguous column reference in get_user_conversations
-- Date: 2025-08-08
-- Purpose: Fix the SQL ambiguity error in conversation queries

-- ============================================
-- Fix the get_user_conversations function
-- ============================================
CREATE OR REPLACE FUNCTION get_user_conversations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    conversation_id UUID,
    type conversation_type,
    name TEXT,
    last_message_id UUID,
    last_message_content TEXT,
    last_message_at TIMESTAMPTZ,
    last_message_sender UUID,
    unread_count INTEGER,
    participant_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH user_conversations AS (
        SELECT c.id, c.type, c.name
        FROM conversations c
        INNER JOIN conversation_participants cp 
            ON cp.conversation_id = c.id
        WHERE cp.user_id = p_user_id
        AND cp.left_at IS NULL
    ),
    last_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
            m.conversation_id,
            m.id,
            m.content,
            m.created_at,
            m.sender_id
        FROM messages m
        INNER JOIN user_conversations uc ON uc.id = m.conversation_id
        WHERE m.deleted_at IS NULL
        ORDER BY m.conversation_id, m.created_at DESC
    ),
    participant_counts AS (
        SELECT cp.conversation_id, COUNT(*) as count
        FROM conversation_participants cp
        INNER JOIN user_conversations uc ON uc.id = cp.conversation_id
        WHERE cp.left_at IS NULL
        GROUP BY cp.conversation_id
    )
    SELECT 
        uc.id as conversation_id,
        uc.type,
        uc.name,
        lm.id as last_message_id,
        lm.content as last_message_content,
        lm.created_at as last_message_at,
        lm.sender_id as last_message_sender,
        0 as unread_count, -- We'll calculate this separately
        COALESCE(pc.count::INTEGER, 0) as participant_count
    FROM user_conversations uc
    LEFT JOIN last_messages lm ON lm.conversation_id = uc.id
    LEFT JOIN participant_counts pc ON pc.conversation_id = uc.id
    ORDER BY COALESCE(lm.created_at, NOW()) DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION get_user_conversations TO authenticated;

COMMENT ON MIGRATION IS 'Fixes ambiguous column reference in get_user_conversations function';