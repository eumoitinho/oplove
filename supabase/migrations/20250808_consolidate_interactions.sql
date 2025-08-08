-- ============================================================================
-- CONSOLIDAÇÃO DO SISTEMA DE INTERAÇÕES - OpenLove v0.3.5
-- Data: 2025-08-08
-- 
-- Esta migração consolida e padroniza todas as tabelas de interação,
-- garantindo consistência e eliminando duplicações.
-- ============================================================================

-- ====================
-- 1. COMMENTS - Consolidar tabelas
-- ====================

-- Verificar se existe a tabela 'comments' e migrar dados para 'post_comments'
DO $$ 
BEGIN
  -- Se ambas existem, precisamos consolidar
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') 
  AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_comments') THEN
    
    -- Migrar dados de 'comments' para 'post_comments' se não existirem
    INSERT INTO post_comments (
      id, post_id, user_id, content, parent_id, 
      is_edited, is_hidden, is_reported, media_urls, 
      stats, edited_at, created_at, updated_at
    )
    SELECT 
      c.id, c.post_id, c.user_id, c.content, c.parent_id,
      c.is_edited, c.is_hidden, c.is_reported, c.media_urls,
      c.stats, c.edited_at, c.created_at, c.updated_at
    FROM comments c
    WHERE NOT EXISTS (
      SELECT 1 FROM post_comments pc WHERE pc.id = c.id
    );
    
    -- Remover a tabela duplicada
    DROP TABLE IF EXISTS comments CASCADE;
    
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') 
  AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_comments') THEN
    
    -- Renomear 'comments' para 'post_comments'
    ALTER TABLE comments RENAME TO post_comments;
    
  END IF;
END $$;

-- Primeiro, garantir que a tabela post_comments exista
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas faltantes se não existirem
DO $$ 
BEGIN
  -- parent_id para respostas aninhadas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'parent_id') THEN
    ALTER TABLE post_comments ADD COLUMN parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE;
  END IF;
  
  -- likes_count para contagem de curtidas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'likes_count') THEN
    ALTER TABLE post_comments ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;
  
  -- is_edited para marcar comentários editados
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'is_edited') THEN
    ALTER TABLE post_comments ADD COLUMN is_edited BOOLEAN DEFAULT false;
  END IF;
  
  -- is_hidden para ocultar comentários
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'is_hidden') THEN
    ALTER TABLE post_comments ADD COLUMN is_hidden BOOLEAN DEFAULT false;
  END IF;
  
  -- is_reported para marcar comentários denunciados
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'is_reported') THEN
    ALTER TABLE post_comments ADD COLUMN is_reported BOOLEAN DEFAULT false;
  END IF;
  
  -- media_urls para mídia em comentários
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'media_urls') THEN
    ALTER TABLE post_comments ADD COLUMN media_urls TEXT[] DEFAULT '{}';
  END IF;
  
  -- stats para estatísticas do comentário
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'stats') THEN
    ALTER TABLE post_comments ADD COLUMN stats JSONB;
  END IF;
  
  -- edited_at para timestamp de edição
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'edited_at') THEN
    ALTER TABLE post_comments ADD COLUMN edited_at TIMESTAMPTZ;
  END IF;
END $$;

-- ====================
-- 2. LIKES - Garantir estrutura
-- ====================

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ====================
-- 3. SHARES - Garantir estrutura
-- ====================

CREATE TABLE IF NOT EXISTS post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- 4. SAVES - Garantir estrutura
-- ====================

-- Criar tabela de coleções se não existir
CREATE TABLE IF NOT EXISTS saved_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT true,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES saved_collections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ====================
-- 5. REPOSTS - Nova funcionalidade
-- ====================

CREATE TABLE IF NOT EXISTS post_reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ====================
-- 6. GARANTIR COLUNAS DE CONTADORES NOS POSTS
-- ====================

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
  -- likes_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'likes_count') THEN
    ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;
  
  -- comments_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'comments_count') THEN
    ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0;
  END IF;
  
  -- shares_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'shares_count') THEN
    ALTER TABLE posts ADD COLUMN shares_count INTEGER DEFAULT 0;
  END IF;
  
  -- saves_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'saves_count') THEN
    ALTER TABLE posts ADD COLUMN saves_count INTEGER DEFAULT 0;
  END IF;
  
  -- reposts_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'reposts_count') THEN
    ALTER TABLE posts ADD COLUMN reposts_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- ====================
-- 7. CRIAR/ATUALIZAR TRIGGERS PARA CONTADORES
-- ====================

-- Function genérica para atualizar contadores
CREATE OR REPLACE FUNCTION update_post_counter()
RETURNS TRIGGER AS $$
DECLARE
  counter_column TEXT;
  post_id_val UUID;
BEGIN
  -- Determinar qual contador atualizar baseado na tabela
  CASE TG_TABLE_NAME
    WHEN 'post_likes' THEN counter_column := 'likes_count';
    WHEN 'post_comments' THEN counter_column := 'comments_count';
    WHEN 'post_shares' THEN counter_column := 'shares_count';
    WHEN 'post_saves' THEN counter_column := 'saves_count';
    WHEN 'post_reposts' THEN counter_column := 'reposts_count';
    ELSE RETURN NULL;
  END CASE;
  
  -- Obter post_id
  IF TG_OP = 'DELETE' THEN
    post_id_val := OLD.post_id;
  ELSE
    post_id_val := NEW.post_id;
  END IF;
  
  -- Atualizar contador
  IF TG_OP = 'INSERT' THEN
    EXECUTE format('UPDATE posts SET %I = %I + 1 WHERE id = $1', counter_column, counter_column) 
    USING post_id_val;
  ELSIF TG_OP = 'DELETE' THEN
    EXECUTE format('UPDATE posts SET %I = GREATEST(%I - 1, 0) WHERE id = $1', counter_column, counter_column) 
    USING post_id_val;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers antigos se existirem
DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON post_likes;
DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON post_comments;
DROP TRIGGER IF EXISTS update_post_shares_count_trigger ON post_shares;
DROP TRIGGER IF EXISTS update_post_saves_count_trigger ON post_saves;
DROP TRIGGER IF EXISTS update_post_reposts_count_trigger ON post_reposts;

-- Criar novos triggers
CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_counter();

CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_counter();

CREATE TRIGGER update_post_shares_count_trigger
AFTER INSERT OR DELETE ON post_shares
FOR EACH ROW EXECUTE FUNCTION update_post_counter();

CREATE TRIGGER update_post_saves_count_trigger
AFTER INSERT OR DELETE ON post_saves
FOR EACH ROW EXECUTE FUNCTION update_post_counter();

CREATE TRIGGER update_post_reposts_count_trigger
AFTER INSERT OR DELETE ON post_reposts
FOR EACH ROW EXECUTE FUNCTION update_post_counter();

-- ====================
-- 8. CRIAR ÍNDICES DE PERFORMANCE
-- ====================

-- Índices para post_likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at DESC);

-- Índices para post_comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

-- Índices para post_shares
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_created_at ON post_shares(created_at DESC);

-- Índices para post_saves
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_collection_id ON post_saves(collection_id) WHERE collection_id IS NOT NULL;

-- Índices para post_reposts
CREATE INDEX IF NOT EXISTS idx_post_reposts_post_id ON post_reposts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reposts_user_id ON post_reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reposts_created_at ON post_reposts(created_at DESC);

-- ====================
-- 9. CONFIGURAR RLS (Row Level Security)
-- ====================

-- Habilitar RLS em todas as tabelas
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_collections ENABLE ROW LEVEL SECURITY;

-- Políticas para post_likes
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
CREATE POLICY "Users can view all likes" ON post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own likes" ON post_likes;
CREATE POLICY "Users can create own likes" ON post_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own likes" ON post_likes;
CREATE POLICY "Users can delete own likes" ON post_likes
  FOR DELETE USING (user_id = auth.uid());

-- Políticas para post_comments
DROP POLICY IF EXISTS "Users can view all comments" ON post_comments;
CREATE POLICY "Users can view all comments" ON post_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own comments" ON post_comments;
CREATE POLICY "Users can create own comments" ON post_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
CREATE POLICY "Users can update own comments" ON post_comments
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
CREATE POLICY "Users can delete own comments" ON post_comments
  FOR DELETE USING (user_id = auth.uid());

-- Políticas para post_shares
DROP POLICY IF EXISTS "Users can view all shares" ON post_shares;
CREATE POLICY "Users can view all shares" ON post_shares
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own shares" ON post_shares;
CREATE POLICY "Users can create own shares" ON post_shares
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own shares" ON post_shares;
CREATE POLICY "Users can delete own shares" ON post_shares
  FOR DELETE USING (user_id = auth.uid());

-- Políticas para post_saves
DROP POLICY IF EXISTS "Users can view own saves" ON post_saves;
CREATE POLICY "Users can view own saves" ON post_saves
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own saves" ON post_saves;
CREATE POLICY "Users can create own saves" ON post_saves
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own saves" ON post_saves;
CREATE POLICY "Users can delete own saves" ON post_saves
  FOR DELETE USING (user_id = auth.uid());

-- Políticas para post_reposts
DROP POLICY IF EXISTS "Users can view all reposts" ON post_reposts;
CREATE POLICY "Users can view all reposts" ON post_reposts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own reposts" ON post_reposts;
CREATE POLICY "Users can create own reposts" ON post_reposts
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own reposts" ON post_reposts;
CREATE POLICY "Users can delete own reposts" ON post_reposts
  FOR DELETE USING (user_id = auth.uid());

-- Políticas para saved_collections
DROP POLICY IF EXISTS "Users can view own collections" ON saved_collections;
CREATE POLICY "Users can view own collections" ON saved_collections
  FOR SELECT USING (user_id = auth.uid() OR is_private = false);

DROP POLICY IF EXISTS "Users can create own collections" ON saved_collections;
CREATE POLICY "Users can create own collections" ON saved_collections
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own collections" ON saved_collections;
CREATE POLICY "Users can update own collections" ON saved_collections
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own collections" ON saved_collections;
CREATE POLICY "Users can delete own collections" ON saved_collections
  FOR DELETE USING (user_id = auth.uid());

-- ====================
-- 10. RECALCULAR CONTADORES EXISTENTES
-- ====================

-- Atualizar contadores baseados nos dados reais
UPDATE posts SET 
  likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id),
  comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id),
  shares_count = (SELECT COUNT(*) FROM post_shares WHERE post_id = posts.id),
  saves_count = (SELECT COUNT(*) FROM post_saves WHERE post_id = posts.id),
  reposts_count = (SELECT COUNT(*) FROM post_reposts WHERE post_id = posts.id);

-- ====================
-- 11. FUNÇÕES RPC AUXILIARES
-- ====================

-- Função para verificar se já curtiu
CREATE OR REPLACE FUNCTION is_post_liked_by_user(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM post_likes WHERE post_id = p_post_id AND user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se já salvou
CREATE OR REPLACE FUNCTION is_post_saved_by_user(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM post_saves WHERE post_id = p_post_id AND user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se já repostou
CREATE OR REPLACE FUNCTION is_post_reposted_by_user(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM post_reposts WHERE post_id = p_post_id AND user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 12. GRANT PERMISSIONS
-- ====================

-- Garantir permissões para authenticated users
GRANT SELECT, INSERT, DELETE ON post_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON post_comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON post_shares TO authenticated;
GRANT SELECT, INSERT, DELETE ON post_saves TO authenticated;
GRANT SELECT, INSERT, DELETE ON post_reposts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_collections TO authenticated;

-- Permitir uso das sequências
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ====================
-- FIM DA MIGRAÇÃO
-- ====================

-- Verificar se tudo foi criado corretamente
DO $$
DECLARE
  tables_ok BOOLEAN := true;
  missing_tables TEXT := '';
BEGIN
  -- Verificar tabelas essenciais
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_likes') THEN
    tables_ok := false;
    missing_tables := missing_tables || 'post_likes, ';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_comments') THEN
    tables_ok := false;
    missing_tables := missing_tables || 'post_comments, ';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_shares') THEN
    tables_ok := false;
    missing_tables := missing_tables || 'post_shares, ';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_saves') THEN
    tables_ok := false;
    missing_tables := missing_tables || 'post_saves, ';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_reposts') THEN
    tables_ok := false;
    missing_tables := missing_tables || 'post_reposts, ';
  END IF;
  
  IF NOT tables_ok THEN
    RAISE EXCEPTION 'Migração falhou! Tabelas faltando: %', missing_tables;
  ELSE
    RAISE NOTICE 'Migração concluída com sucesso! Todas as tabelas de interação foram consolidadas.';
  END IF;
END $$;