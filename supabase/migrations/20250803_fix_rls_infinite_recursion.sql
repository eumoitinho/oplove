-- Fix infinite recursion in RLS policies for conversations and conversation_participants

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they initiated" ON conversations;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON conversation_participants;

-- Simple, non-recursive policies for conversation_participants
CREATE POLICY "Users can view own participations" ON conversation_participants
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own participations" ON conversation_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Conversation creators can add participants" ON conversation_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND initiated_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete own participations" ON conversation_participants
    FOR DELETE USING (user_id = auth.uid());

-- Simple, non-recursive policies for conversations
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (
        initiated_by = auth.uid() OR
        id IN (
            SELECT conversation_id 
            FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Premium users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        initiated_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND premium_type IN ('gold', 'diamond', 'couple')
        )
    );

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (initiated_by = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Verification
SELECT 'Fixed RLS infinite recursion!' as status;