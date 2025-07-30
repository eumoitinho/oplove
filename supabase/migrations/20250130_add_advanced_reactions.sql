-- Atualizar tabela de reações para incluir mais tipos
-- Primeiro, vamos criar uma nova tabela de reações mais robusta
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (
    reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Um usuário pode ter apenas uma reação por post
  UNIQUE(post_id, user_id)
);

-- Adicionar colunas de contadores para cada tipo de reação nos posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS love_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS laugh_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wow_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sad_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS angry_count INTEGER DEFAULT 0;

-- Migrar dados existentes da tabela post_likes para post_reactions
INSERT INTO post_reactions (post_id, user_id, reaction_type, created_at)
SELECT post_id, user_id, 'like', created_at
FROM post_likes
ON CONFLICT (post_id, user_id) DO NOTHING;

-- Função para atualizar contadores de reações
CREATE OR REPLACE FUNCTION update_post_reaction_counts(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET
    like_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'like'),
    love_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'love'),
    laugh_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'laugh'),
    wow_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'wow'),
    sad_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'sad'),
    angry_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'angry'),
    updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION handle_post_reaction_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se é INSERT ou UPDATE, atualizar contadores para o post
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_post_reaction_counts(NEW.post_id);
    RETURN NEW;
  END IF;
  
  -- Se é DELETE, atualizar contadores para o post
  IF TG_OP = 'DELETE' THEN
    PERFORM update_post_reaction_counts(OLD.post_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_reactions_change
  AFTER INSERT OR UPDATE OR DELETE ON post_reactions
  FOR EACH ROW EXECUTE FUNCTION handle_post_reaction_change();

-- Atualizar contadores existentes
DO $$
DECLARE
  post_record RECORD;
BEGIN
  FOR post_record IN SELECT DISTINCT post_id FROM post_reactions LOOP
    PERFORM update_post_reaction_counts(post_record.post_id);
  END LOOP;
END $$;

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_type ON post_reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_post_reactions_created_at ON post_reactions(created_at DESC);

-- RLS Policies
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver reações em posts que podem ver
CREATE POLICY "Users can view reactions on visible posts" ON post_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (p.is_public = true OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

-- Usuários podem criar suas próprias reações
CREATE POLICY "Users can create own reactions" ON post_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (p.is_public = true OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

-- Usuários podem atualizar suas próprias reações
CREATE POLICY "Users can update own reactions" ON post_reactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias reações
CREATE POLICY "Users can delete own reactions" ON post_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Reações em comentários
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (
    reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Um usuário pode ter apenas uma reação por comentário
  UNIQUE(comment_id, user_id)
);

-- Adicionar colunas de contadores de reações nos comentários
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS love_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS laugh_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wow_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sad_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS angry_count INTEGER DEFAULT 0;

-- Migrar dados existentes da tabela comment_likes para comment_reactions
INSERT INTO comment_reactions (comment_id, user_id, reaction_type, created_at)
SELECT comment_id, user_id, 'like', created_at
FROM comment_likes
ON CONFLICT (comment_id, user_id) DO NOTHING;

-- Função para atualizar contadores de reações de comentários
CREATE OR REPLACE FUNCTION update_comment_reaction_counts(c_comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE comments SET
    like_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'like'),
    love_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'love'),
    laugh_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'laugh'),
    wow_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'wow'),
    sad_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'sad'),
    angry_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'angry'),
    updated_at = NOW()
  WHERE id = c_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar contadores de comentários
CREATE OR REPLACE FUNCTION handle_comment_reaction_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_comment_reaction_counts(NEW.comment_id);
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM update_comment_reaction_counts(OLD.comment_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_reactions_change
  AFTER INSERT OR UPDATE OR DELETE ON comment_reactions
  FOR EACH ROW EXECUTE FUNCTION handle_comment_reaction_change();

-- Índices para reações de comentários
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_type ON comment_reactions(reaction_type);

-- RLS Policies para reações de comentários
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comment reactions" ON comment_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM comments c
      JOIN posts p ON p.id = c.post_id
      WHERE c.id = comment_id 
      AND (p.is_public = true OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), c.user_id)
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

CREATE POLICY "Users can create comment reactions" ON comment_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM comments c
      JOIN posts p ON p.id = c.post_id
      WHERE c.id = comment_id 
      AND (p.is_public = true OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), c.user_id)
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

CREATE POLICY "Users can update own comment reactions" ON comment_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment reactions" ON comment_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Atualizar contadores de comentários existentes
DO $$
DECLARE
  comment_record RECORD;
BEGIN
  FOR comment_record IN SELECT DISTINCT comment_id FROM comment_reactions LOOP
    PERFORM update_comment_reaction_counts(comment_record.comment_id);
  END LOOP;
END $$;