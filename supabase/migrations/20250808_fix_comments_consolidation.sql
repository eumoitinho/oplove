-- ============================================================================
-- CONSOLIDAÇÃO CORRETIVA DO SISTEMA DE COMENTÁRIOS - OpenLove v0.3.5
-- Data: 2025-08-08
-- 
-- Esta migração corrige a consolidação da tabela de comentários,
-- adicionando as colunas necessárias antes da migração de dados.
-- ============================================================================

-- ====================
-- 1. GARANTIR ESTRUTURA COMPLETA DA TABELA post_comments
-- ====================

-- Primeiro, verificar se post_comments existe e criar se necessário
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas que estão faltando (se não existirem)
DO $$ 
BEGIN
  -- parent_id para replies aninhados
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'parent_id') THEN
    ALTER TABLE post_comments ADD COLUMN parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE;
    RAISE NOTICE 'Adicionado parent_id à tabela post_comments';
  END IF;
  
  -- likes_count para contadores
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'likes_count') THEN
    ALTER TABLE post_comments ADD COLUMN likes_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Adicionado likes_count à tabela post_comments';
  END IF;
  
  -- is_edited para marcar comentários editados
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'is_edited') THEN
    ALTER TABLE post_comments ADD COLUMN is_edited BOOLEAN DEFAULT false;
    RAISE NOTICE 'Adicionado is_edited à tabela post_comments';
  END IF;
  
  -- is_hidden para ocultar comentários
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'is_hidden') THEN
    ALTER TABLE post_comments ADD COLUMN is_hidden BOOLEAN DEFAULT false;
    RAISE NOTICE 'Adicionado is_hidden à tabela post_comments';
  END IF;
  
  -- is_reported para comentários denunciados
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'is_reported') THEN
    ALTER TABLE post_comments ADD COLUMN is_reported BOOLEAN DEFAULT false;
    RAISE NOTICE 'Adicionado is_reported à tabela post_comments';
  END IF;
  
  -- media_urls para mídia em comentários
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'media_urls') THEN
    ALTER TABLE post_comments ADD COLUMN media_urls TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Adicionado media_urls à tabela post_comments';
  END IF;
  
  -- stats para estatísticas JSONB
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'stats') THEN
    ALTER TABLE post_comments ADD COLUMN stats JSONB;
    RAISE NOTICE 'Adicionado stats à tabela post_comments';
  END IF;
  
  -- edited_at para timestamp de edição
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'post_comments' AND column_name = 'edited_at') THEN
    ALTER TABLE post_comments ADD COLUMN edited_at TIMESTAMPTZ;
    RAISE NOTICE 'Adicionado edited_at à tabela post_comments';
  END IF;
END $$;

-- ====================
-- 2. MIGRAR DADOS DA TABELA comments (SE EXISTIR)
-- ====================

DO $$ 
DECLARE
  comments_count INTEGER := 0;
  migrated_count INTEGER := 0;
BEGIN
  -- Verificar se a tabela comments existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    
    -- Contar registros na tabela comments
    SELECT COUNT(*) INTO comments_count FROM comments;
    RAISE NOTICE 'Encontrados % comentários na tabela comments', comments_count;
    
    IF comments_count > 0 THEN
      -- Migrar dados que ainda não existem em post_comments
      INSERT INTO post_comments (
        id, post_id, user_id, content, parent_id, 
        is_edited, is_hidden, is_reported, media_urls, 
        stats, edited_at, created_at, updated_at
      )
      SELECT 
        c.id, c.post_id, c.user_id, c.content, c.parent_id,
        COALESCE(c.is_edited, false), 
        COALESCE(c.is_hidden, false), 
        COALESCE(c.is_reported, false), 
        COALESCE(c.media_urls, '{}'),
        c.stats, c.edited_at, c.created_at, c.updated_at
      FROM comments c
      WHERE NOT EXISTS (
        SELECT 1 FROM post_comments pc WHERE pc.id = c.id
      );
      
      -- Contar quantos foram migrados
      GET DIAGNOSTICS migrated_count = ROW_COUNT;
      RAISE NOTICE 'Migrados % comentários de comments para post_comments', migrated_count;
      
      -- Verificar se a migração foi bem-sucedida antes de remover
      IF migrated_count = comments_count THEN
        RAISE NOTICE 'Migração bem-sucedida, removendo tabela comments...';
        DROP TABLE comments CASCADE;
        RAISE NOTICE 'Tabela comments removida com sucesso';
      ELSE
        RAISE NOTICE 'ATENÇÃO: Migração incompleta. Comments: %, Migrados: %', comments_count, migrated_count;
        RAISE NOTICE 'Tabela comments mantida para verificação';
      END IF;
    ELSE
      RAISE NOTICE 'Tabela comments vazia, removendo...';
      DROP TABLE comments CASCADE;
    END IF;
    
  ELSE
    RAISE NOTICE 'Tabela comments não existe, nada para migrar';
  END IF;
END $$;

-- ====================
-- 3. CRIAR ÍNDICES PARA post_comments
-- ====================

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

-- ====================
-- 4. CONFIGURAR RLS PARA post_comments
-- ====================

-- Habilitar RLS
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
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

-- ====================
-- 5. VERIFICAÇÃO FINAL
-- ====================

DO $$
DECLARE
  post_comments_count INTEGER := 0;
BEGIN
  -- Contar comentários migrados
  SELECT COUNT(*) INTO post_comments_count FROM post_comments;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MIGRAÇÃO CONCLUÍDA!';
  RAISE NOTICE 'Total de comentários em post_comments: %', post_comments_count;
  RAISE NOTICE '==============================================';
END $$;

-- Dar permissões para usuários autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON post_comments TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;