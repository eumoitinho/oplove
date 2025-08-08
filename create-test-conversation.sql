-- Create test conversation for user: 1c12a2f2-33c0-4763-ae6f-a7f864e98e6f
-- Execute this in Supabase SQL Editor

-- Step 1: Get another user to create conversation with
WITH other_user AS (
  SELECT id, username FROM users 
  WHERE id != '1c12a2f2-33c0-4763-ae6f-a7f864e98e6f' 
  LIMIT 1
)
SELECT 'Other user:' as label, id, username FROM other_user;

-- Step 2: Create test conversation
INSERT INTO conversations (
  id, 
  type, 
  name, 
  initiated_by, 
  initiated_by_premium,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'private',
  'Test Conversation',
  '1c12a2f2-33c0-4763-ae6f-a7f864e98e6f',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 3: Add main user as participant
INSERT INTO conversation_participants (
  conversation_id, 
  user_id, 
  role,
  joined_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '1c12a2f2-33c0-4763-ae6f-a7f864e98e6f',
  'member',
  NOW()
) ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Step 4: Add second user (get any other user)
INSERT INTO conversation_participants (
  conversation_id, 
  user_id, 
  role,
  joined_at
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  id,
  'member',
  NOW()
FROM users 
WHERE id != '1c12a2f2-33c0-4763-ae6f-a7f864e98e6f' 
LIMIT 1
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Step 5: Add test messages
INSERT INTO messages (
  conversation_id,
  sender_id,
  content,
  type,
  created_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', '1c12a2f2-33c0-4763-ae6f-a7f864e98e6f', 'Olá! Como você está?', 'text', NOW() - INTERVAL '2 hours'),
  ('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM users WHERE id != '1c12a2f2-33c0-4763-ae6f-a7f864e98e6f' LIMIT 1), 'Oi! Estou bem, obrigado!', 'text', NOW() - INTERVAL '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440000', '1c12a2f2-33c0-4763-ae6f-a7f864e98e6f', 'Que bom! Sistema funcionando! 😊', 'text', NOW() - INTERVAL '30 minutes');

-- Step 6: Verification query
SELECT 
  'Conversations for user:' as label,
  c.id as conversation_id,
  c.name,
  c.type,
  COUNT(DISTINCT m.id) as message_count,
  COUNT(DISTINCT cp.user_id) as participant_count,
  ARRAY_AGG(DISTINCT u.username) as participants
FROM conversations c
INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN messages m ON c.id = m.conversation_id
LEFT JOIN users u ON cp.user_id = u.id
WHERE c.id IN (
  SELECT conversation_id 
  FROM conversation_participants 
  WHERE user_id = '1c12a2f2-33c0-4763-ae6f-a7f864e98e6f'
)
GROUP BY c.id, c.name, c.type;

-- Step 7: Direct check
SELECT 'Direct check:' as label, * FROM conversation_participants 
WHERE user_id = '1c12a2f2-33c0-4763-ae6f-a7f864e98e6f';