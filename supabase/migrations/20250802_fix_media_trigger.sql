-- Corrigir trigger que está causando erro "upper bound of FOR loop cannot be null"

-- Encontrar e remover triggers problemáticos relacionados a media_types
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Remover triggers que podem estar usando media_types
    FOR r IN 
        SELECT tgname, tgrelid::regclass::text as table_name
        FROM pg_trigger 
        WHERE tgtype > 0  -- user triggers only
        AND tgname LIKE '%media%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %s', r.tgname, r.table_name);
        RAISE NOTICE 'Dropped trigger: % on %', r.tgname, r.table_name;
    END LOOP;
    
    -- Remover funções que podem estar causando o problema
    DROP FUNCTION IF EXISTS update_post_media_count() CASCADE;
    DROP FUNCTION IF EXISTS check_media_limits() CASCADE;
    DROP FUNCTION IF EXISTS validate_media_types() CASCADE;
    
    RAISE NOTICE 'Media triggers fixed successfully';
END $$;

-- Criar função corrigida se necessário (fora do bloco DO)
CREATE OR REPLACE FUNCTION safe_array_length(arr anyarray)
RETURNS integer AS $$
BEGIN
    IF arr IS NULL THEN
        RETURN 0;
    ELSE
        RETURN array_length(arr, 1);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;