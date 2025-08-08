-- Test data for messages system
-- Run this in Supabase SQL Editor to create test data

-- First, let's check if we have any conversations
SELECT COUNT(*) as conversation_count FROM conversations;
SELECT COUNT(*) as participant_count FROM conversation_participants;
SELECT COUNT(*) as message_count FROM messages;

-- If no conversations exist, let's create a test conversation
-- (Replace UUIDs with actual user IDs from your users table)

-- Get first two users for testing
WITH test_users AS (
  SELECT id, username FROM users LIMIT 2
)
SELECT * FROM test_users;

-- Create a test conversation if none exist
-- INSERT INTO conversations (id, type, name, initiated_by, initiated_by_premium)
-- VALUES (
--   '550e8400-e29b-41d4-a716-446655440000',
--   'private',
--   'Test Chat',
--   'YOUR_USER_ID_1_HERE',
--   true
-- );

-- Add participants
-- INSERT INTO conversation_participants (conversation_id, user_id, role)
-- VALUES 
--   ('550e8400-e29b-41d4-a716-446655440000', 'YOUR_USER_ID_1_HERE', 'member'),
--   ('550e8400-e29b-41d4-a716-446655440000', 'YOUR_USER_ID_2_HERE', 'member');

-- Add test messages
-- INSERT INTO messages (conversation_id, sender_id, content, type)
-- VALUES
--   ('550e8400-e29b-41d4-a716-446655440000', 'YOUR_USER_ID_1_HERE', 'Olá! Como você está?', 'text'),
--   ('550e8400-e29b-41d4-a716-446655440000', 'YOUR_USER_ID_2_HERE', 'Oi! Estou bem, obrigado! E você?', 'text'),
--   ('550e8400-e29b-41d4-a716-446655440000', 'YOUR_USER_ID_1_HERE', 'Também estou bem! Teste do sistema de mensagens 😊', 'text');

-- Verify the test data
SELECT 
  c.id as conversation_id,
  c.name,
  c.type,
  COUNT(m.id) as message_count,
  COUNT(DISTINCT cp.user_id) as participant_count
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
GROUP BY c.id, c.name, c.type;