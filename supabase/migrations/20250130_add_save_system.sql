-- Tabela para coleções de posts salvos
CREATE TABLE IF NOT EXISTS saved_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT true,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar nomes duplicados por usuário
  UNIQUE(user_id, name)
);

-- Tabela para posts salvos
CREATE TABLE IF NOT EXISTS post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES saved_collections(id) ON DELETE SET NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar saves duplicados
  UNIQUE(post_id, user_id)
);

-- Adicionar coluna saves_count à tabela posts se não existir
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS saves_count INTEGER DEFAULT 0;

-- Funções para incrementar/decrementar contadores
CREATE OR REPLACE FUNCTION increment_post_saves(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET saves_count = COALESCE(saves_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_saves(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET saves_count = GREATEST(COALESCE(saves_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_collection_posts(collection_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE saved_collections 
  SET posts_count = COALESCE(posts_count, 0) + 1,
      updated_at = NOW()
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_collection_posts(collection_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE saved_collections 
  SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_saved_collections_user_id ON saved_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_collections_updated_at ON saved_collections(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_collection_id ON post_saves(collection_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_saved_at ON post_saves(saved_at DESC);

-- RLS Policies para saved_collections
ALTER TABLE saved_collections ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias coleções
CREATE POLICY "Users can view own collections" ON saved_collections
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias coleções
CREATE POLICY "Users can create own collections" ON saved_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias coleções
CREATE POLICY "Users can update own collections" ON saved_collections
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias coleções
CREATE POLICY "Users can delete own collections" ON saved_collections
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para post_saves
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios saves
CREATE POLICY "Users can view own saves" ON post_saves
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios saves
CREATE POLICY "Users can create own saves" ON post_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios saves
CREATE POLICY "Users can delete own saves" ON post_saves
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_saved_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_collections_updated_at
  BEFORE UPDATE ON saved_collections
  FOR EACH ROW EXECUTE FUNCTION update_saved_collections_updated_at();

-- Trigger para atualizar contador de posts quando um save é criado/deletado
CREATE OR REPLACE FUNCTION handle_post_saves_collection_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Se é INSERT e tem collection_id
  IF TG_OP = 'INSERT' AND NEW.collection_id IS NOT NULL THEN
    PERFORM increment_collection_posts(NEW.collection_id);
  END IF;
  
  -- Se é DELETE e tinha collection_id
  IF TG_OP = 'DELETE' AND OLD.collection_id IS NOT NULL THEN
    PERFORM decrement_collection_posts(OLD.collection_id);
  END IF;
  
  -- Se é UPDATE e a collection mudou
  IF TG_OP = 'UPDATE' THEN
    -- Se saiu de uma collection
    IF OLD.collection_id IS NOT NULL AND NEW.collection_id IS NULL THEN
      PERFORM decrement_collection_posts(OLD.collection_id);
    END IF;
    
    -- Se entrou em uma collection
    IF OLD.collection_id IS NULL AND NEW.collection_id IS NOT NULL THEN
      PERFORM increment_collection_posts(NEW.collection_id);
    END IF;
    
    -- Se mudou de collection
    IF OLD.collection_id IS NOT NULL AND NEW.collection_id IS NOT NULL AND OLD.collection_id != NEW.collection_id THEN
      PERFORM decrement_collection_posts(OLD.collection_id);
      PERFORM increment_collection_posts(NEW.collection_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_saves_collection_count
  AFTER INSERT OR UPDATE OR DELETE ON post_saves
  FOR EACH ROW EXECUTE FUNCTION handle_post_saves_collection_count();