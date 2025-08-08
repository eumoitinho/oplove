-- ============================================
-- FIX RLS POLICIES FOR POSTS AND STORAGE
-- Execute este SQL no dashboard do Supabase
-- SQL Editor > New Query > Cole e Execute
-- ============================================

-- 1. LIMPAR POLÍTICAS ANTIGAS DA TABELA POSTS
-- ============================================
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view public posts" ON posts;
DROP POLICY IF EXISTS "Users can view public posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "posts_select" ON posts;
DROP POLICY IF EXISTS "posts_insert" ON posts;
DROP POLICY IF EXISTS "posts_update" ON posts;
DROP POLICY IF EXISTS "posts_delete" ON posts;

-- 2. HABILITAR RLS NA TABELA POSTS
-- ============================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR NOVAS POLÍTICAS PARA POSTS
-- ============================================

-- Política de SELECT (visualização)
CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT
    USING (
        visibility = 'public' 
        OR user_id = auth.uid()
        OR (
            visibility = 'friends' 
            AND EXISTS (
                SELECT 1 FROM follows 
                WHERE follower_id = auth.uid() 
                AND following_id = posts.user_id
            )
        )
    );

-- Política de INSERT (criação) - CRÍTICA!
CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND user_id = auth.uid()
    );

-- Política de UPDATE (atualização)
CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política de DELETE (exclusão)
CREATE POLICY "posts_delete_policy" ON posts
    FOR DELETE
    USING (user_id = auth.uid());

-- 4. CORRIGIR POLÍTICAS DO STORAGE (BUCKET MEDIA)
-- ============================================
DROP POLICY IF EXISTS "Users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
DROP POLICY IF EXISTS "Public media access" ON storage.objects;
DROP POLICY IF EXISTS "media_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "media_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "media_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "media_delete_policy" ON storage.objects;

-- Política de INSERT para upload de mídia
CREATE POLICY "media_insert_policy" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'media' 
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Política de SELECT para visualização de mídia (pública)
CREATE POLICY "media_select_policy" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'media'
    );

-- Política de UPDATE para atualização de mídia própria
CREATE POLICY "media_update_policy" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'media' 
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Política de DELETE para exclusão de mídia própria
CREATE POLICY "media_delete_policy" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'media' 
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 5. CORRIGIR POLÍTICAS DE TABELAS RELACIONADAS
-- ============================================

-- Tabela post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;
DROP POLICY IF EXISTS "Users can view likes" ON post_likes;

CREATE POLICY "post_likes_insert_policy" ON post_likes
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "post_likes_delete_policy" ON post_likes
    FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "post_likes_select_policy" ON post_likes
    FOR SELECT
    USING (true);

-- Tabela post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can comment on posts" ON post_comments;
DROP POLICY IF EXISTS "Users can view comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;

CREATE POLICY "post_comments_insert_policy" ON post_comments
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "post_comments_select_policy" ON post_comments
    FOR SELECT
    USING (true);

CREATE POLICY "post_comments_update_policy" ON post_comments
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "post_comments_delete_policy" ON post_comments
    FOR DELETE
    USING (user_id = auth.uid());

-- 6. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual IS NOT NULL as has_using,
    with_check IS NOT NULL as has_with_check
FROM pg_policies 
WHERE tablename IN ('posts', 'post_likes', 'post_comments')
ORDER BY tablename, policyname;

-- 7. VERIFICAR POLÍTICAS DO STORAGE
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- ============================================
-- FIM DO SCRIPT
-- Após executar, teste criar um post novamente
-- ============================================