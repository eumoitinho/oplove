-- Tabela para bloqueios de usuários
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar bloqueios duplicados
  UNIQUE(blocker_id, blocked_id),
  
  -- Constraint para evitar auto-bloqueio
  CHECK (blocker_id != blocked_id)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_at ON user_blocks(blocked_at DESC);

-- RLS Policies
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios bloqueios (quem eles bloquearam)
CREATE POLICY "Users can view own blocks" ON user_blocks
  FOR SELECT USING (auth.uid() = blocker_id);

-- Usuários podem criar bloqueios
CREATE POLICY "Users can create blocks" ON user_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- Usuários podem deletar seus próprios bloqueios (desbloquear)
CREATE POLICY "Users can delete own blocks" ON user_blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- Função para verificar se um usuário está bloqueado
CREATE OR REPLACE FUNCTION is_user_blocked(blocker_user_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_blocks 
    WHERE blocker_id = blocker_user_id 
    AND blocked_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar bloqueio mútuo
CREATE OR REPLACE FUNCTION are_users_blocked(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_blocks 
    WHERE (blocker_id = user1_id AND blocked_id = user2_id)
    OR (blocker_id = user2_id AND blocked_id = user1_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar políticas de posts para considerar bloqueios
DROP POLICY IF EXISTS "Users can view public posts" ON posts;
CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (
    is_public = true 
    AND NOT are_users_blocked(auth.uid(), user_id)
  );

-- Atualizar políticas de comentários para considerar bloqueios
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON comments;
CREATE POLICY "Users can view comments on visible posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (p.is_public = true OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), user_id)
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

-- Atualizar políticas de follows para considerar bloqueios
DROP POLICY IF EXISTS "Users can view follows" ON follows;
CREATE POLICY "Users can view follows" ON follows
  FOR SELECT USING (
    NOT are_users_blocked(auth.uid(), follower_id)
    AND NOT are_users_blocked(auth.uid(), following_id)
  );

-- Evitar follows entre usuários bloqueados
DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (
    auth.uid() = follower_id
    AND NOT are_users_blocked(follower_id, following_id)
  );

-- Atualizar políticas de conversas para considerar bloqueios
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    (user1_id = auth.uid() OR user2_id = auth.uid())
    AND NOT are_users_blocked(user1_id, user2_id)
  );

-- Evitar conversas entre usuários bloqueados
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    (user1_id = auth.uid() OR user2_id = auth.uid())
    AND NOT are_users_blocked(user1_id, user2_id)
  );

-- Atualizar políticas de mensagens para considerar bloqueios
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = conversation_id 
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
      AND NOT are_users_blocked(c.user1_id, c.user2_id)
    )
  );

-- Evitar mensagens entre usuários bloqueados
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = conversation_id 
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
      AND NOT are_users_blocked(c.user1_id, c.user2_id)
    )
  );