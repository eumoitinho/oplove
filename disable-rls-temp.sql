-- DISABLE RLS TEMPORARILY FOR TESTING
-- Execute this in Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON conversations TO anon, authenticated;
GRANT ALL ON conversation_participants TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;

SELECT 'RLS DISABLED - TESTING MODE' as status;