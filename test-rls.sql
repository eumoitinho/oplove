-- Test RLS policies by running this SQL directly in Supabase Dashboard

-- Check current policies
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants')
ORDER BY tablename, policyname;

-- Test basic select without auth context (should fail)
SELECT COUNT(*) FROM conversation_participants;
SELECT COUNT(*) FROM conversations;