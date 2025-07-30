-- Tabela para denúncias de posts
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (
    reason IN ('spam', 'harassment', 'inappropriate_content', 'copyright', 'misinformation', 'other')
  ),
  description TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'reviewed', 'resolved', 'dismissed')
  ),
  reviewer_id UUID REFERENCES users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Um usuário pode denunciar um post apenas uma vez
  UNIQUE(post_id, reporter_id)
);

-- Tabela para denúncias de usuários
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (
    reason IN ('spam', 'harassment', 'inappropriate_content', 'fake_profile', 'copyright', 'misinformation', 'other')
  ),
  description TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'reviewed', 'resolved', 'dismissed')
  ),
  reviewer_id UUID REFERENCES users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Um usuário pode denunciar outro usuário apenas uma vez
  UNIQUE(reported_id, reporter_id)
);

-- Tabela para fila de moderação
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(20) NOT NULL CHECK (
    content_type IN ('post', 'comment', 'user', 'story')
  ),
  content_id UUID NOT NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_review', 'resolved', 'dismissed')
  ),
  assigned_to UUID REFERENCES users(id),
  resolution VARCHAR(50),
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Adicionar colunas para controle de moderação
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS reports_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hidden_reason TEXT,
ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS strikes_count INTEGER DEFAULT 0;

-- Função para incrementar contador de denúncias de posts
CREATE OR REPLACE FUNCTION increment_post_reports(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET reports_count = COALESCE(reports_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar contador de denúncias de posts
CREATE OR REPLACE FUNCTION decrement_post_reports(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET reports_count = GREATEST(COALESCE(reports_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reporter_id ON post_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reported_id ON post_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);
CREATE INDEX IF NOT EXISTS idx_post_reports_created_at ON post_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_reports_reported_id ON user_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON moderation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_content_type ON moderation_queue(content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_assigned_to ON moderation_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON moderation_queue(created_at DESC);

-- RLS Policies para post_reports
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias denúncias
CREATE POLICY "Users can view own reports" ON post_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Usuários podem criar denúncias
CREATE POLICY "Users can create reports" ON post_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Moderadores podem ver todas as denúncias
CREATE POLICY "Moderators can view all reports" ON post_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );

-- Moderadores podem atualizar denúncias
CREATE POLICY "Moderators can update reports" ON post_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );

-- RLS Policies para user_reports
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias denúncias
CREATE POLICY "Users can view own user reports" ON user_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Usuários podem criar denúncias de usuários
CREATE POLICY "Users can create user reports" ON user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Moderadores podem ver todas as denúncias de usuários
CREATE POLICY "Moderators can view all user reports" ON user_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );

-- Moderadores podem atualizar denúncias de usuários
CREATE POLICY "Moderators can update user reports" ON user_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );

-- RLS Policies para moderation_queue
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Apenas moderadores podem acessar a fila de moderação
CREATE POLICY "Only moderators can access moderation queue" ON moderation_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_reports_updated_at
  BEFORE UPDATE ON post_reports
  FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();

CREATE TRIGGER user_reports_updated_at
  BEFORE UPDATE ON user_reports
  FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();

CREATE TRIGGER moderation_queue_updated_at
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();

-- Atualizar políticas de posts para considerar conteúdo oculto
DROP POLICY IF EXISTS "Users can view public posts" ON posts;
CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (
    is_public = true 
    AND NOT are_users_blocked(auth.uid(), user_id)
    AND is_hidden = false
  );

-- Usuários podem ver seus próprios posts mesmo se ocultos
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- Moderadores podem ver todos os posts
CREATE POLICY "Moderators can view all posts" ON posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );

-- Funções para moderação automática
CREATE OR REPLACE FUNCTION auto_moderate_post(p_post_id UUID)
RETURNS void AS $$
DECLARE
  report_count INTEGER;
BEGIN
  -- Contar denúncias pendentes
  SELECT COUNT(*) INTO report_count
  FROM post_reports 
  WHERE post_id = p_post_id AND status = 'pending';
  
  -- Se muitas denúncias, ocultar automaticamente
  IF report_count >= 10 THEN
    UPDATE posts 
    SET is_hidden = true,
        hidden_reason = 'Multiple reports - automatic moderation',
        hidden_at = NOW(),
        needs_review = true,
        updated_at = NOW()
    WHERE id = p_post_id;
    
    -- Adicionar à fila de moderação com prioridade alta
    INSERT INTO moderation_queue (
      content_type, content_id, reason, priority, status, metadata
    ) VALUES (
      'post', p_post_id, 'multiple_reports', 'urgent', 'pending',
      jsonb_build_object('report_count', report_count, 'auto_hidden', true)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para moderação automática quando denúncia é criada
CREATE OR REPLACE FUNCTION handle_new_post_report()
RETURNS TRIGGER AS $$
BEGIN
  -- Executar moderação automática
  PERFORM auto_moderate_post(NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_post_report_trigger
  AFTER INSERT ON post_reports
  FOR EACH ROW EXECUTE FUNCTION handle_new_post_report();