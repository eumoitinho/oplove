-- Debug script para verificar a estrutura da tabela posts

-- 1. Verificar se a tabela posts existe
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'posts'
ORDER BY table_schema;

-- 2. Verificar todas as colunas da tabela posts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'posts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar constraints da tabela posts
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'posts'
AND tc.table_schema = 'public';

-- 4. Tentar query simples
SELECT 
    p.id,
    p.user_id,
    p.content,
    p.created_at
FROM public.posts p
LIMIT 5;

-- 5. Verificar se existem views com nome posts
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE viewname = 'posts';