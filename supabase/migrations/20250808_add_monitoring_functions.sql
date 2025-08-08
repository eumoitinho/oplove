-- Migration: Add monitoring and analytics functions
-- Date: 2025-08-08
-- Purpose: Support health checks and performance monitoring

-- ============================================
-- Function to get average messages per conversation
-- ============================================
CREATE OR REPLACE FUNCTION get_average_messages_per_conversation()
RETURNS TABLE(avg NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(message_count), 2) as avg
  FROM (
    SELECT 
      conversation_id,
      COUNT(*) as message_count
    FROM messages
    WHERE deleted_at IS NULL
    GROUP BY conversation_id
  ) counts;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function to get average participants per conversation
-- ============================================
CREATE OR REPLACE FUNCTION get_average_participants_per_conversation()
RETURNS TABLE(avg NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(participant_count), 2) as avg
  FROM (
    SELECT 
      conversation_id,
      COUNT(*) as participant_count
    FROM conversation_participants
    WHERE left_at IS NULL
    GROUP BY conversation_id
  ) counts;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function to get messaging statistics
-- ============================================
CREATE OR REPLACE FUNCTION get_messaging_stats(
  p_period INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE(
  total_messages BIGINT,
  total_conversations BIGINT,
  active_users BIGINT,
  messages_in_period BIGINT,
  new_conversations_in_period BIGINT,
  average_response_time INTERVAL
) AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
BEGIN
  v_period_start := NOW() - p_period;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM messages WHERE deleted_at IS NULL),
    (SELECT COUNT(*) FROM conversations),
    (SELECT COUNT(DISTINCT sender_id) FROM messages WHERE created_at > v_period_start),
    (SELECT COUNT(*) FROM messages WHERE created_at > v_period_start AND deleted_at IS NULL),
    (SELECT COUNT(*) FROM conversations WHERE created_at > v_period_start),
    (
      SELECT AVG(response_time)
      FROM (
        SELECT 
          m2.created_at - m1.created_at as response_time
        FROM messages m1
        JOIN messages m2 ON m2.conversation_id = m1.conversation_id
          AND m2.sender_id != m1.sender_id
          AND m2.created_at > m1.created_at
        WHERE m1.created_at > v_period_start
        LIMIT 1000
      ) response_times
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function to get slow queries (for monitoring)
-- ============================================
CREATE OR REPLACE FUNCTION get_slow_message_queries()
RETURNS TABLE(
  query TEXT,
  calls BIGINT,
  mean_time DOUBLE PRECISION,
  total_time DOUBLE PRECISION
) AS $$
BEGIN
  -- This requires pg_stat_statements extension
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) THEN
    RETURN QUERY
    SELECT 
      pss.query,
      pss.calls,
      pss.mean_exec_time as mean_time,
      pss.total_exec_time as total_time
    FROM pg_stat_statements pss
    WHERE pss.query LIKE '%messages%' 
       OR pss.query LIKE '%conversations%'
    ORDER BY pss.mean_exec_time DESC
    LIMIT 20;
  ELSE
    -- Return empty result if extension not available
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================
-- Function to check index usage
-- ============================================
CREATE OR REPLACE FUNCTION check_messaging_index_usage()
RETURNS TABLE(
  table_name TEXT,
  index_name TEXT,
  index_scans BIGINT,
  tuples_read BIGINT,
  tuples_fetched BIGINT,
  usage_ratio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    indexname as index_name,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    CASE 
      WHEN idx_scan = 0 THEN 0
      ELSE ROUND((idx_tup_fetch::NUMERIC / idx_scan), 2)
    END as usage_ratio
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
    AND tablename IN ('messages', 'conversations', 'conversation_participants', 'message_reads')
  ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function to get message delivery stats
-- ============================================
CREATE OR REPLACE FUNCTION get_message_delivery_stats(
  p_period INTERVAL DEFAULT INTERVAL '1 hour'
)
RETURNS TABLE(
  total_sent BIGINT,
  total_delivered BIGINT,
  total_read BIGINT,
  delivery_rate NUMERIC,
  read_rate NUMERIC,
  avg_time_to_read INTERVAL
) AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
BEGIN
  v_period_start := NOW() - p_period;
  
  RETURN QUERY
  WITH sent_messages AS (
    SELECT 
      m.id,
      m.created_at,
      m.conversation_id,
      m.sender_id
    FROM messages m
    WHERE m.created_at > v_period_start
      AND m.deleted_at IS NULL
  ),
  read_messages AS (
    SELECT 
      mr.message_id,
      mr.read_at,
      sm.created_at
    FROM message_reads mr
    JOIN sent_messages sm ON sm.id = mr.message_id
    WHERE mr.user_id != sm.sender_id
  )
  SELECT 
    COUNT(DISTINCT sm.id) as total_sent,
    COUNT(DISTINCT sm.id) as total_delivered, -- In our case, sent = delivered
    COUNT(DISTINCT rm.message_id) as total_read,
    100.0 as delivery_rate, -- Always 100% in our system
    CASE 
      WHEN COUNT(DISTINCT sm.id) = 0 THEN 0
      ELSE ROUND((COUNT(DISTINCT rm.message_id)::NUMERIC / COUNT(DISTINCT sm.id)) * 100, 2)
    END as read_rate,
    AVG(rm.read_at - rm.created_at) as avg_time_to_read
  FROM sent_messages sm
  LEFT JOIN read_messages rm ON rm.message_id = sm.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function to detect and cleanup orphaned data
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_orphaned_message_data()
RETURNS TABLE(
  orphaned_reads_deleted INTEGER,
  orphaned_participants_deleted INTEGER,
  empty_conversations_deleted INTEGER
) AS $$
DECLARE
  v_reads_deleted INTEGER;
  v_participants_deleted INTEGER;
  v_conversations_deleted INTEGER;
BEGIN
  -- Delete read receipts for non-existent messages
  DELETE FROM message_reads mr
  WHERE NOT EXISTS (
    SELECT 1 FROM messages m WHERE m.id = mr.message_id
  );
  GET DIAGNOSTICS v_reads_deleted = ROW_COUNT;
  
  -- Delete participants for non-existent conversations
  DELETE FROM conversation_participants cp
  WHERE NOT EXISTS (
    SELECT 1 FROM conversations c WHERE c.id = cp.conversation_id
  );
  GET DIAGNOSTICS v_participants_deleted = ROW_COUNT;
  
  -- Delete empty conversations (no participants)
  DELETE FROM conversations c
  WHERE NOT EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = c.id AND cp.left_at IS NULL
  );
  GET DIAGNOSTICS v_conversations_deleted = ROW_COUNT;
  
  RETURN QUERY
  SELECT v_reads_deleted, v_participants_deleted, v_conversations_deleted;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================
-- Function to get user message activity
-- ============================================
CREATE OR REPLACE FUNCTION get_user_message_activity(
  p_user_id UUID,
  p_period INTERVAL DEFAULT INTERVAL '7 days'
)
RETURNS TABLE(
  messages_sent BIGINT,
  messages_received BIGINT,
  conversations_active BIGINT,
  avg_messages_per_day NUMERIC,
  most_active_hour INTEGER,
  response_time_avg INTERVAL
) AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
BEGIN
  v_period_start := NOW() - p_period;
  
  RETURN QUERY
  WITH user_messages AS (
    SELECT 
      m.*,
      EXTRACT(HOUR FROM m.created_at AT TIME ZONE 'America/Sao_Paulo') as hour
    FROM messages m
    WHERE (m.sender_id = p_user_id OR EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = m.conversation_id
        AND cp.user_id = p_user_id
        AND cp.left_at IS NULL
    ))
    AND m.created_at > v_period_start
    AND m.deleted_at IS NULL
  )
  SELECT 
    COUNT(*) FILTER (WHERE sender_id = p_user_id) as messages_sent,
    COUNT(*) FILTER (WHERE sender_id != p_user_id) as messages_received,
    COUNT(DISTINCT conversation_id) as conversations_active,
    ROUND(COUNT(*) FILTER (WHERE sender_id = p_user_id)::NUMERIC / 
      GREATEST(EXTRACT(DAY FROM p_period), 1), 2) as avg_messages_per_day,
    MODE() WITHIN GROUP (ORDER BY hour) as most_active_hour,
    (
      SELECT AVG(m2.created_at - m1.created_at)
      FROM messages m1
      JOIN messages m2 ON m2.conversation_id = m1.conversation_id
        AND m2.sender_id = p_user_id
        AND m1.sender_id != p_user_id
        AND m2.created_at > m1.created_at
      WHERE m1.created_at > v_period_start
      LIMIT 100
    ) as response_time_avg
  FROM user_messages;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Grant permissions for monitoring functions
-- ============================================
GRANT EXECUTE ON FUNCTION get_average_messages_per_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION get_average_participants_per_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION get_messaging_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_message_delivery_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_message_activity TO authenticated;

-- Admin-only functions
GRANT EXECUTE ON FUNCTION get_slow_message_queries TO service_role;
GRANT EXECUTE ON FUNCTION check_messaging_index_usage TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_message_data TO service_role;

COMMENT ON MIGRATION IS 'Adds monitoring and analytics functions for messaging system performance tracking';