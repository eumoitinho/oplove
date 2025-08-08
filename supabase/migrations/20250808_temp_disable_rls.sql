-- Temporarily disable RLS for testing
-- WARNING: This makes all data accessible. Only for debugging!

-- Disable RLS temporarily
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;

SELECT 'RLS disabled temporarily for debugging' as status;