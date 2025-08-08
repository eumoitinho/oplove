-- CRITICAL FIX: Messages RLS Policy Security Vulnerability
-- This fixes the overly permissive policy that allows any authenticated user to view all messages

-- Drop the vulnerable policy
DROP POLICY IF EXISTS "Allow authenticated users to view messages" ON messages;

-- Create secure policy that only allows users to view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid() 
            AND left_at IS NULL
        )
    );

-- Keep other secure policies
DROP POLICY IF EXISTS "Users can send messages to conversations" ON messages;
CREATE POLICY "Users can send messages to conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid() 
            AND left_at IS NULL
        )
    );

-- Policy for updating own messages (for read receipts, edits)
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (
        sender_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid() 
            AND left_at IS NULL
        )
    );

-- Policy for deleting own messages
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (sender_id = auth.uid());

-- Note: Indexes must be created separately outside of a transaction
-- Run these commands separately in the SQL editor:
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
--     ON messages(conversation_id, created_at DESC);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_participants_user 
--     ON conversation_participants(user_id) WHERE left_at IS NULL;

-- Verify the policies
SELECT 
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'messages';