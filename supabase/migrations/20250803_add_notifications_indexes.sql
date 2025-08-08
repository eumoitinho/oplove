-- Add indexes to improve notifications query performance

-- Index for recipient_id queries (most common)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id 
ON notifications(recipient_id);

-- Composite index for recipient_id + created_at (for ordering)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created 
ON notifications(recipient_id, created_at DESC);

-- Index for recipient_id + is_read (for filtering unread)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read 
ON notifications(recipient_id, is_read);

-- Index for recipient_id + type (for filtering by type)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type 
ON notifications(recipient_id, type);

-- Composite index for complex queries
CREATE INDEX IF NOT EXISTS idx_notifications_full 
ON notifications(recipient_id, is_read, type, created_at DESC);

-- Add index for sender_id for JOIN performance
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id 
ON notifications(sender_id);

-- Verification
SELECT 'Notification indexes created successfully!' as status;