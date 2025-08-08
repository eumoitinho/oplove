-- =====================================================
-- CREATE INDEXES SEPARATELY (RUN OUTSIDE TRANSACTION)
-- Created: 2025-01-08
-- Description: These indexes must be run separately, not in a migration
-- =====================================================

-- IMPORTANT: Run each of these commands separately in Supabase SQL Editor
-- They cannot be run inside a transaction block

-- 1. Messages table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
    ON messages(conversation_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender 
    ON messages(sender_id);

-- 2. Conversation participants indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_participants_user 
    ON conversation_participants(user_id) 
    WHERE left_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_participants_conversation 
    ON conversation_participants(conversation_id) 
    WHERE left_at IS NULL;

-- 3. Notifications indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_recipient_created 
    ON notifications(recipient_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_recipient_unread 
    ON notifications(recipient_id, is_read) 
    WHERE is_read = false;

-- 4. Conversations indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_updated 
    ON conversations(updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_type 
    ON conversations(type);

-- 5. Users indexes for messaging
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_premium_type 
    ON users(premium_type);

-- After creating indexes, analyze tables for better query planning
ANALYZE messages;
ANALYZE conversations;
ANALYZE conversation_participants;
ANALYZE notifications;
ANALYZE users;