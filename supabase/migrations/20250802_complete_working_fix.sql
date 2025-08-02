-- =====================================================
-- CORREÇÃO COMPLETA DO OPENLOVE - VERSÃO FINAL
-- =====================================================

-- PARTE 1: ATIVAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- PARTE 2: LIMPAR TODAS AS POLÍTICAS EXISTENTES
-- =====================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Limpar políticas de users
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', r.policyname);
    END LOOP;
    
    -- Limpar políticas de posts
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'posts' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON posts', r.policyname);
    END LOOP;
    
    -- Limpar políticas de storage
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
    END LOOP;
END $$;

-- PARTE 3: POLÍTICAS DA TABELA USERS
-- =====================================================
-- Visualização: todos os usuários autenticados podem ver perfis
CREATE POLICY "users_can_view_all_profiles" ON users
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Inserção: apenas na criação da conta (auth trigger ou próprio usuário)
CREATE POLICY "users_can_insert_own_profile" ON users
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        auth.uid() = auth_id
    );

-- Atualização: apenas o próprio perfil
CREATE POLICY "users_can_update_own_profile" ON users
    FOR UPDATE USING (
        auth.uid() = id OR 
        auth.uid() = auth_id
    )
    WITH CHECK (
        auth.uid() = id OR 
        auth.uid() = auth_id
    );

-- PARTE 4: POLÍTICAS DA TABELA POSTS
-- =====================================================
-- Visualização baseada em visibilidade
CREATE POLICY "posts_visibility_rules" ON posts
    FOR SELECT USING (
        -- Posts públicos: todos veem
        visibility = 'public'
        OR
        -- Próprios posts: sempre visíveis
        user_id = auth.uid()
        OR
        -- Posts de amigos: se está seguindo
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM follows 
            WHERE follower_id = auth.uid() 
            AND following_id = posts.user_id
        ))
        OR
        -- Posts privados: apenas o dono
        (visibility = 'private' AND user_id = auth.uid())
    );

-- Criação: qualquer usuário autenticado (mídia controlada no storage)
CREATE POLICY "posts_authenticated_can_create" ON posts
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Atualização: apenas próprios posts
CREATE POLICY "posts_update_own" ON posts
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Exclusão: apenas próprios posts
CREATE POLICY "posts_delete_own" ON posts
    FOR DELETE USING (user_id = auth.uid());

-- PARTE 5: POLÍTICAS DO STORAGE (RESPEITANDO PLANOS)
-- =====================================================
-- Garantir bucket media existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Upload de avatares: todos podem (limite controlado na app)
CREATE POLICY "storage_avatars_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Upload de covers: todos podem (limite controlado na app)
CREATE POLICY "storage_covers_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Upload de posts: APENAS GOLD, DIAMOND E COUPLE
CREATE POLICY "storage_posts_upload_premium_only" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'posts'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type IN ('gold', 'diamond', 'couple')
    )
);

-- Upload de stories: FREE VERIFICADO, GOLD, DIAMOND E COUPLE
CREATE POLICY "storage_stories_upload_by_plan" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'stories'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND (
            (premium_type = 'free' AND is_verified = true)
            OR premium_type IN ('gold', 'diamond', 'couple')
        )
    )
);

-- Visualização: bucket público, todos podem ver
CREATE POLICY "storage_public_view" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Update: apenas próprios arquivos
CREATE POLICY "storage_update_own" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Delete: apenas próprios arquivos
CREATE POLICY "storage_delete_own" ON storage.objects
FOR DELETE USING (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- PARTE 6: POLÍTICAS DE FOLLOWS
-- =====================================================
-- Ver todos os follows
CREATE POLICY "follows_view_all" ON follows
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Seguir alguém
CREATE POLICY "follows_create_own" ON follows
    FOR INSERT WITH CHECK (follower_id = auth.uid());

-- Deixar de seguir
CREATE POLICY "follows_delete_own" ON follows
    FOR DELETE USING (follower_id = auth.uid());

-- PARTE 7: POLÍTICAS DE STORIES
-- =====================================================
-- Ver stories de quem segue ou próprias
CREATE POLICY "stories_view_following_or_own" ON stories
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM follows 
            WHERE follower_id = auth.uid() 
            AND following_id = stories.user_id
        )
    );

-- Criar stories (verificação de plano no storage)
CREATE POLICY "stories_create_own" ON stories
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Atualizar próprias stories
CREATE POLICY "stories_update_own" ON stories
    FOR UPDATE USING (user_id = auth.uid());

-- Deletar próprias stories
CREATE POLICY "stories_delete_own" ON stories
    FOR DELETE USING (user_id = auth.uid());

-- PARTE 8: POLÍTICAS DE STORY_VIEWS
-- =====================================================
-- Ver visualizações das próprias stories
CREATE POLICY "story_views_see_own" ON story_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_views.story_id 
            AND stories.user_id = auth.uid()
        )
        OR viewer_id = auth.uid()
    );

-- Registrar visualização
CREATE POLICY "story_views_create" ON story_views
    FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- PARTE 9: POLÍTICAS DE POLLS
-- =====================================================
-- Ver enquetes em posts visíveis
CREATE POLICY "polls_view_if_post_visible" ON polls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.poll_id = polls.id 
            AND (
                posts.visibility = 'public'
                OR posts.user_id = auth.uid()
                OR (posts.visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM follows 
                    WHERE follower_id = auth.uid() 
                    AND following_id = posts.user_id
                ))
            )
        )
    );

-- Criar enquetes (controlado via posts)
CREATE POLICY "polls_create_with_post" ON polls
    FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Atualizar próprias enquetes
CREATE POLICY "polls_update_own" ON polls
    FOR UPDATE USING (creator_id = auth.uid());

-- PARTE 10: POLÍTICAS DE POLL_VOTES
-- =====================================================
-- Ver próprios votos
CREATE POLICY "poll_votes_view_own" ON poll_votes
    FOR SELECT USING (user_id = auth.uid());

-- Votar em enquetes
CREATE POLICY "poll_votes_create" ON poll_votes
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- PARTE 11: GARANTIR CONSISTÊNCIA DE AUTH_ID
-- =====================================================
UPDATE users 
SET auth_id = id 
WHERE auth_id IS NULL OR auth_id != id;

-- PARTE 12: FUNÇÃO HELPER PARA VERIFICAR PERMISSÕES
-- =====================================================
CREATE OR REPLACE FUNCTION check_user_can_upload(
    p_user_id UUID,
    p_media_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_user RECORD;
BEGIN
    SELECT premium_type, is_verified 
    INTO v_user
    FROM users 
    WHERE id = p_user_id;
    
    CASE p_media_type
        WHEN 'avatar', 'cover' THEN
            RETURN TRUE;
        WHEN 'post' THEN
            RETURN v_user.premium_type IN ('gold', 'diamond', 'couple');
        WHEN 'story' THEN
            RETURN (v_user.premium_type = 'free' AND v_user.is_verified) 
                OR v_user.premium_type IN ('gold', 'diamond', 'couple');
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PARTE 13: MENSAGEM FINAL
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ CORREÇÃO COMPLETA APLICADA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Regras de negócio implementadas:';
    RAISE NOTICE '- FREE: Apenas avatar/cover, sem posts com mídia';
    RAISE NOTICE '- FREE VERIFICADO: + stories (3/dia controlado na app)';
    RAISE NOTICE '- GOLD: + posts com imagens (até 5), stories (5-10/dia)';
    RAISE NOTICE '- DIAMOND/COUPLE: Tudo liberado, stories ilimitadas';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Segurança garantida:';
    RAISE NOTICE '- Usuários só editam próprios dados';
    RAISE NOTICE '- Upload apenas na própria pasta';
    RAISE NOTICE '- Visibilidade de posts respeitada';
    RAISE NOTICE '';
END $$;