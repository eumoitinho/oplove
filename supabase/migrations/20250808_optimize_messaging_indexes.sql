-- Migration: Optimize messaging system indexes
-- Date: 2025-08-08
-- Purpose: Add missing indexes for message queries performance

-- ============================================
-- PHASE 1: MESSAGING PERFORMANCE INDEXES
-- ============================================

-- 1. Composite index for conversation messages (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC)
WHERE deleted_at IS NULL;

-- 2. Index for unread messages per conversation
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(conversation_id, is_read, created_at DESC)
WHERE is_read = false;

-- 3. Participant lookup optimization
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
ON conversation_participants(user_id, left_at)
WHERE left_at IS NULL;

-- 4. Index for active conversations
CREATE INDEX IF NOT EXISTS idx_conversation_participants_active 
ON conversation_participants(conversation_id, user_id)
WHERE left_at IS NULL;

-- 5. Index for last message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_last_per_conversation 
ON messages(conversation_id, created_at DESC, id);

-- 6. Index for message read status tracking
CREATE INDEX IF NOT EXISTS idx_message_reads_user 
ON message_reads(user_id, read_at DESC);

-- 7. Index for daily message limits (Gold users)
CREATE INDEX IF NOT EXISTS idx_daily_message_counts_user_date 
ON daily_message_counts(user_id, date DESC);

-- 8. Index for conversation initiated_by lookups
CREATE INDEX IF NOT EXISTS idx_conversations_initiated 
ON conversations(initiated_by, created_at DESC)
WHERE initiated_by IS NOT NULL;

-- 9. Index for group conversations
CREATE INDEX IF NOT EXISTS idx_conversations_groups 
ON conversations(type, group_type)
WHERE type = 'group';

-- ============================================
-- PHASE 2: OPTIMIZE EXISTING INDEXES
-- ============================================

-- Drop redundant or inefficient indexes
DROP INDEX IF EXISTS idx_messages_sender_id; -- Rarely used alone
DROP INDEX IF EXISTS idx_messages_conversation_id; -- Replaced by composite

-- Recreate with better structure
CREATE INDEX IF NOT EXISTS idx_messages_sender_created 
ON messages(sender_id, created_at DESC);

-- ============================================
-- PHASE 3: STATISTICS UPDATE
-- ============================================

-- Update table statistics for query planner
ANALYZE messages;
ANALYZE conversations;
ANALYZE conversation_participants;
ANALYZE message_reads;
ANALYZE daily_message_counts;

-- ============================================
-- PHASE 4: PERFORMANCE HELPER FUNCTIONS
-- ============================================

-- Function to get unread count efficiently
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID, p_conversation_id UUID)
RETURNS INTEGER AS $$
DECLARE
    last_read_id UUID;
    unread_count INTEGER;
BEGIN
    -- Get the last read message ID for this user
    SELECT last_read_message_id INTO last_read_id
    FROM conversation_participants
    WHERE user_id = p_user_id 
    AND conversation_id = p_conversation_id
    AND left_at IS NULL;
    
    -- Count messages after the last read
    IF last_read_id IS NULL THEN
        -- User hasn't read any messages yet
        SELECT COUNT(*) INTO unread_count
        FROM messages
        WHERE conversation_id = p_conversation_id
        AND sender_id != p_user_id
        AND deleted_at IS NULL;
    ELSE
        -- Count messages after last read
        SELECT COUNT(*) INTO unread_count
        FROM messages
        WHERE conversation_id = p_conversation_id
        AND created_at > (
            SELECT created_at FROM messages WHERE id = last_read_id
        )
        AND sender_id != p_user_id
        AND deleted_at IS NULL;
    END IF;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get last message efficiently
CREATE OR REPLACE FUNCTION get_last_message(p_conversation_id UUID)
RETURNS TABLE(
    id UUID,
    content TEXT,
    sender_id UUID,
    created_at TIMESTAMPTZ,
    message_type message_type
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.content, m.sender_id, m.created_at, m.message_type
    FROM messages m
    WHERE m.conversation_id = p_conversation_id
    AND m.deleted_at IS NULL
    ORDER BY m.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get conversations with metadata
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
        SELECT conversation_id, COUNT(*) as count
        FROM conversation_participants
        WHERE left_at IS NULL
        GROUP BY conversation_id
    )
    SELECT 
        uc.id,
        uc.type,
        uc.name,
        lm.id,
        lm.content,
        lm.created_at,
        lm.sender_id,
        get_unread_count(p_user_id, uc.id),
        COALESCE(pc.count, 0)
    FROM user_conversations uc
    LEFT JOIN last_messages lm ON lm.conversation_id = uc.id
    LEFT JOIN participant_counts pc ON pc.conversation_id = uc.id
    ORDER BY COALESCE(lm.created_at, NOW()) DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- PHASE 5: MATERIALIZED VIEWS (OPTIONAL)
-- ============================================

-- Create materialized view for conversation summaries (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS conversation_summaries AS
SELECT 
    c.id as conversation_id,
    c.type,
    c.name,
    c.group_type,
    COUNT(DISTINCT cp.user_id) as participant_count,
    COUNT(m.id) as message_count,
    MAX(m.created_at) as last_message_at,
    c.created_at
FROM conversations c
LEFT JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.left_at IS NULL
LEFT JOIN messages m ON m.conversation_id = c.id AND m.deleted_at IS NULL
GROUP BY c.id, c.type, c.name, c.group_type, c.created_at;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_last_message 
ON conversation_summaries(last_message_at DESC);

-- ============================================
-- PHASE 6: CLEANUP AND MAINTENANCE
-- ============================================

-- Add auto-vacuum settings for high-traffic tables
ALTER TABLE messages SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE message_reads SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE conversation_participants SET (autovacuum_analyze_scale_factor = 0.02);

-- Create function to cleanup old read receipts (keep only last 100 per conversation)
CREATE OR REPLACE FUNCTION cleanup_old_read_receipts()
RETURNS void AS $$
BEGIN
    DELETE FROM message_reads mr
    WHERE mr.message_id IN (
        SELECT message_id 
        FROM (
            SELECT 
                message_id,
                ROW_NUMBER() OVER (
                    PARTITION BY m.conversation_id, mr2.user_id 
                    ORDER BY mr2.read_at DESC
                ) as rn
            FROM message_reads mr2
            JOIN messages m ON m.id = mr2.message_id
        ) ranked
        WHERE rn > 100
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Query to check index usage (run in production after some usage)
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND tablename IN ('messages', 'conversations', 'conversation_participants')
ORDER BY idx_scan DESC;
*/

-- Query to identify slow queries
/*
SELECT 
    query,
    mean_exec_time,
    calls,
    total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%messages%' OR query LIKE '%conversations%'
ORDER BY mean_exec_time DESC
LIMIT 20;
*/

COMMENT ON MIGRATION IS 'Optimizes messaging system performance with strategic indexes and helper functions';