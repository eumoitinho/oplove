-- Fix RLS policies for conversations and conversation_participants tables

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;

-- Create proper RLS policies for conversations table
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id 
            FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        initiated_by = auth.uid() AND
        (
            -- Premium users can create conversations
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND premium_type IN ('gold', 'diamond', 'couple')
            )
        )
    );

CREATE POLICY "Users can update conversations they initiated" ON conversations
    FOR UPDATE USING (initiated_by = auth.uid());

-- Create proper RLS policies for conversation_participants table
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id 
            FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join conversations" ON conversation_participants
    FOR INSERT WITH CHECK (
        -- User can add themselves to conversations
        user_id = auth.uid() OR
        -- Or conversation initiator can add others
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND initiated_by = auth.uid()
        )
    );

CREATE POLICY "Users can leave conversations" ON conversation_participants
    FOR DELETE USING (user_id = auth.uid());

-- Enable RLS on both tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Verification query
SELECT 'RLS policies updated for conversations!' as status;