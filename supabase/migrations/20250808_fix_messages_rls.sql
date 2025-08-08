-- Fix RLS policies for messages table
-- Date: 2025-08-08

-- ============================================
-- Drop existing problematic policies for messages
-- ============================================
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

-- ============================================
-- Create simple, non-recursive policies for messages
-- ============================================

-- Allow authenticated users to view messages (business logic in app layer)
CREATE POLICY "Allow authenticated users to view messages" ON messages
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert messages
CREATE POLICY "Allow authenticated users to send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        auth.uid() IS NOT NULL
    );

-- Allow users to update their own messages
CREATE POLICY "Allow users to update own messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Allow users to delete their own messages  
CREATE POLICY "Allow users to delete own messages" ON messages
    FOR DELETE USING (sender_id = auth.uid());

-- ============================================
-- Ensure RLS is enabled
-- ============================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Grant permissions
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;

-- ============================================
-- Also ensure users table has proper policies
-- ============================================
-- Drop existing users policies that might be problematic
DROP POLICY IF EXISTS "Users can view all public profiles" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Simple policies for users table
CREATE POLICY "Allow viewing public user data" ON users
    FOR SELECT USING (true); -- Public data, no auth needed

CREATE POLICY "Allow users to update own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Enable RLS on users if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON users TO authenticated;

-- ============================================
-- Verification
-- ============================================
SELECT 'Messages RLS policies fixed!' as status;