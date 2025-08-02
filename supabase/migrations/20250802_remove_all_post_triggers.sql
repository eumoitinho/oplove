-- Remover TODOS os triggers da tabela posts que estão causando o erro

-- Listar todos os triggers antes de remover
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Triggers encontrados na tabela posts:';
    FOR r IN 
        SELECT tgname 
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'posts' 
        AND NOT t.tgisinternal
    LOOP
        RAISE NOTICE '- %', r.tgname;
        EXECUTE format('DROP TRIGGER %I ON posts', r.tgname);
    END LOOP;
    
    RAISE NOTICE 'Todos os triggers foram removidos da tabela posts';
END $$;

-- Remover funções que podem estar relacionadas
DROP FUNCTION IF EXISTS update_post_stats() CASCADE;
DROP FUNCTION IF EXISTS validate_post_media() CASCADE;
DROP FUNCTION IF EXISTS check_post_media_limits() CASCADE;
DROP FUNCTION IF EXISTS update_user_post_count() CASCADE;
DROP FUNCTION IF EXISTS process_post_media() CASCADE;

-- Verificar se ainda existem triggers
SELECT 
    t.tgname as trigger_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'posts' 
AND NOT t.tgisinternal;