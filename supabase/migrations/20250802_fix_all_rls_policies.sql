-- =====================================================
-- CORREÇÃO COMPLETA DE RLS - USERS, STORAGE E POSTS
-- =====================================================

-- PARTE 1: CORRIGIR TABELA USERS
-- =====================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    END LOOP;
END $$;

-- Create simple, working policies for users
CREATE POLICY "Enable read access for all authenticated users" ON users
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (
        auth.uid()::text = id::text 
        OR auth.uid()::text = auth_id::text
    )
    WITH CHECK (
        auth.uid()::text = id::text 
        OR auth.uid()::text = auth_id::text
    );

-- Fix auth_id consistency
UPDATE users 
SET auth_id = id 
WHERE auth_id IS NULL OR auth_id != id;

-- PARTE 2: CRIAR POLÍTICAS PARA STORAGE (BUCKET MEDIA)
-- =====================================================

-- Criar bucket media se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies for media bucket
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname LIKE '%media%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Políticas para upload de avatares
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND (storage.foldername(name))[1] = 'avatars'
);

-- Políticas para upload de covers
CREATE POLICY "Users can upload their own covers" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND (storage.foldername(name))[1] = 'covers'
);

-- Políticas para upload de posts
CREATE POLICY "Users can upload their own post media" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND (storage.foldername(name))[1] = 'posts'
);

-- Políticas para visualização (bucket público)
CREATE POLICY "Anyone can view media files" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Políticas para update
CREATE POLICY "Users can update their own media" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Políticas para delete
CREATE POLICY "Users can delete their own media" ON storage.objects
FOR DELETE USING (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- PARTE 3: GARANTIR QUE POSTS FUNCIONEM
-- =====================================================

-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing posts policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON posts', pol.policyname);
    END LOOP;
END $$;

-- Create simple posts policies
CREATE POLICY "Anyone can view public posts" ON posts
    FOR SELECT USING (
        visibility = 'public' 
        OR user_id = auth.uid()
    );

CREATE POLICY "Users can create their own posts" ON posts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (user_id = auth.uid());

-- PARTE 4: CRIAR FUNÇÃO AUXILIAR PARA DEBUG
-- =====================================================

-- Função para verificar políticas
CREATE OR REPLACE FUNCTION check_rls_policies()
RETURNS TABLE (
    table_name text,
    policy_count bigint,
    has_select boolean,
    has_insert boolean,
    has_update boolean,
    has_delete boolean
) AS $$
BEGIN
    RETURN QUERY
    WITH policy_summary AS (
        SELECT 
            tablename,
            COUNT(*) as policy_count,
            bool_or(policycommand = 'SELECT') as has_select,
            bool_or(policycommand = 'INSERT') as has_insert,
            bool_or(policycommand = 'UPDATE') as has_update,
            bool_or(policycommand = 'DELETE') as has_delete
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('users', 'posts')
        GROUP BY tablename
    )
    SELECT 
        tablename::text,
        policy_count,
        has_select,
        has_insert,
        has_update,
        has_delete
    FROM policy_summary
    
    UNION ALL
    
    SELECT 
        'storage.objects (media)'::text,
        COUNT(*)::bigint,
        bool_or(policycommand = 'SELECT'),
        bool_or(policycommand = 'INSERT'),
        bool_or(policycommand = 'UPDATE'),
        bool_or(policycommand = 'DELETE')
    FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%media%';
END;
$$ LANGUAGE plpgsql;

-- PARTE 5: MENSAGEM FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS CORRIGIDO COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 O que foi feito:';
    RAISE NOTICE '1. Tabela USERS: Políticas simplificadas, todos autenticados podem ler';
    RAISE NOTICE '2. Storage MEDIA: Políticas criadas para upload de avatares, covers e posts';
    RAISE NOTICE '3. Tabela POSTS: Políticas recriadas para permitir criação de posts';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Para verificar: SELECT * FROM check_rls_policies();';
    RAISE NOTICE '';
END $$;