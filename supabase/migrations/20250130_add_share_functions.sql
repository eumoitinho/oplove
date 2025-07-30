-- Função para incrementar contador de compartilhamentos
CREATE OR REPLACE FUNCTION increment_post_shares(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET shares_count = COALESCE(shares_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar contador de compartilhamentos
CREATE OR REPLACE FUNCTION decrement_post_shares(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabela para armazenar compartilhamentos
CREATE TABLE IF NOT EXISTS post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  share_type VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (share_type IN ('public', 'private', 'story')),
  message TEXT,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para performance
  UNIQUE(post_id, user_id)
);

-- Adicionar coluna shares_count à tabela posts se não existir
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_shared_at ON post_shares(shared_at DESC);

-- RLS Policies
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver compartilhamentos públicos
CREATE POLICY "Users can view public shares" ON post_shares
  FOR SELECT USING (share_type = 'public');

-- Usuários podem ver seus próprios compartilhamentos
CREATE POLICY "Users can view own shares" ON post_shares
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar compartilhamentos
CREATE POLICY "Users can create shares" ON post_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios compartilhamentos
CREATE POLICY "Users can delete own shares" ON post_shares
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_post_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_shares_updated_at
  BEFORE UPDATE ON post_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_shares_updated_at();