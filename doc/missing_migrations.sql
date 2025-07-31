-- ================================================================
-- MIGRAÇÕES ADICIONAIS PARA OPENLOVE DATABASE
-- ================================================================
-- Este arquivo contém apenas as migrações que estão faltando no backup
-- Execute estas migrações após restaurar o backup

BEGIN;

-- ================================================================
-- 1. CRIAR TABELA user_blocks (equivalente à blocked_users mas com estrutura das migrações)
-- ================================================================

-- Verificar se a tabela blocked_users já tem a estrutura correta
-- Se não, criar uma nova estrutura ou alterar a existente

-- Renomear blocked_users para user_blocks se necessário
DO $$
BEGIN
    -- Verificar se blocked_users existe mas user_blocks não
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocked_users')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_blocks') THEN
        
        -- Adicionar colunas faltantes se necessário
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blocked_users' AND column_name = 'blocked_at') THEN
            ALTER TABLE public.blocked_users ADD COLUMN blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        -- Criar alias/view para user_blocks se necessário
        CREATE OR REPLACE VIEW public.user_blocks AS 
        SELECT 
            id,
            blocker_id,
            blocked_id,
            reason,
            created_at as blocked_at,
            created_at
        FROM public.blocked_users;
    END IF;
END $$;

-- ================================================================
-- 2. CRIAR TABELA post_reactions (sistema de reações avançadas)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (
        reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Um usuário pode ter apenas uma reação por post
    UNIQUE(post_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_type ON public.post_reactions(reaction_type);

-- RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions" ON public.post_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can create reactions" ON public.post_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reactions" ON public.post_reactions
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions" ON public.post_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 3. ADICIONAR COLUNAS DE CONTADOR DE REAÇÕES NOS POSTS
-- ================================================================

DO $$
BEGIN
    -- Adicionar colunas de contadores de reação se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'like_count') THEN
        ALTER TABLE public.posts ADD COLUMN like_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'love_count') THEN
        ALTER TABLE public.posts ADD COLUMN love_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'laugh_count') THEN
        ALTER TABLE public.posts ADD COLUMN laugh_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'wow_count') THEN
        ALTER TABLE public.posts ADD COLUMN wow_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'sad_count') THEN
        ALTER TABLE public.posts ADD COLUMN sad_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'angry_count') THEN
        ALTER TABLE public.posts ADD COLUMN angry_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ================================================================
-- 4. CRIAR TABELA comment_likes
-- ================================================================

CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comment likes" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like comments" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 5. CRIAR TABELAS DE INTERAÇÕES DE POSTS (se não existirem)
-- ================================================================

-- Verificar e criar post_likes se não existir
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Verificar e criar post_comments se não existir
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 6. FUNÇÕES PARA ATUALIZAR CONTADORES DE REAÇÕES
-- ================================================================

-- Função para atualizar contadores de reações por post
CREATE OR REPLACE FUNCTION update_post_reaction_counts(p_post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts SET
        like_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'like'),
        love_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'love'),
        laugh_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'laugh'),
        wow_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'wow'),
        sad_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'sad'),
        angry_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id AND reaction_type = 'angry'),
        updated_at = NOW()
    WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION handle_post_reaction_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_post_reaction_counts(NEW.post_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_post_reaction_counts(OLD.post_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS post_reaction_change_trigger ON public.post_reactions;
CREATE TRIGGER post_reaction_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.post_reactions
    FOR EACH ROW EXECUTE FUNCTION handle_post_reaction_change();

-- ================================================================
-- 7. MIGRAR DADOS EXISTENTES DE likes PARA post_reactions
-- ================================================================

-- Migrar likes existentes para o novo sistema de reações
-- A tabela likes usa target_id e target_type em vez de post_id
INSERT INTO public.post_reactions (post_id, user_id, reaction_type, created_at)
SELECT target_id, user_id, COALESCE(reaction_type, 'like'), created_at
FROM public.likes
WHERE target_type = 'post'
  AND EXISTS (SELECT 1 FROM public.posts WHERE id = likes.target_id)
ON CONFLICT (post_id, user_id) DO NOTHING;

-- Migrar likes de comentários para comment_likes
INSERT INTO public.comment_likes (comment_id, user_id, created_at)
SELECT target_id, user_id, created_at
FROM public.likes
WHERE target_type = 'comment'
  AND EXISTS (SELECT 1 FROM public.comments WHERE id = likes.target_id)
ON CONFLICT (comment_id, user_id) DO NOTHING;

-- ================================================================
-- 8. ATUALIZAR CONTADORES EXISTENTES
-- ================================================================

-- Atualizar contadores de reações para todos os posts existentes
DO $$
DECLARE
    post_record RECORD;
BEGIN
    FOR post_record IN SELECT id FROM public.posts LOOP
        PERFORM update_post_reaction_counts(post_record.id);
    END LOOP;
END $$;

-- ================================================================
-- 9. ADICIONAR COLUNAS FALTANTES EM OUTRAS TABELAS
-- ================================================================

-- Adicionar colunas de contador nos posts se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes_count') THEN
        ALTER TABLE public.posts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comments_count') THEN
        ALTER TABLE public.posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'shares_count') THEN
        ALTER TABLE public.posts ADD COLUMN shares_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'saves_count') THEN
        ALTER TABLE public.posts ADD COLUMN saves_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ================================================================
-- 10. FUNÇÕES RPC PARA INCREMENTAR/DECREMENTAR CONTADORES
-- ================================================================

-- Função para incrementar likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar likes
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissões
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_post_reaction_counts(UUID) TO authenticated;

-- ================================================================
-- 11. GARANTIR QUE TODAS AS RLS POLICIES ESTÃO CORRETAS
-- ================================================================

-- Políticas para user_blocks (usando blocked_users como base)
DROP POLICY IF EXISTS "Users can view own blocks" ON public.blocked_users;
CREATE POLICY "Users can view own blocks" ON public.blocked_users
    FOR SELECT USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can create blocks" ON public.blocked_users;
CREATE POLICY "Users can create blocks" ON public.blocked_users
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can delete own blocks" ON public.blocked_users;
CREATE POLICY "Users can delete own blocks" ON public.blocked_users
    FOR DELETE USING (auth.uid() = blocker_id);

COMMIT;

-- ================================================================
-- FIM DAS MIGRAÇÕES ADICIONAIS
-- ================================================================

-- Para aplicar estas migrações:
-- 1. Restaure seu backup original
-- 2. Execute este arquivo SQL no Supabase SQL Editor
-- 3. Verifique se todas as tabelas e funções foram criadas corretamente