-- Debug script to check conversations tables structure

-- Check if conversations table exists and its structure
DO $$
BEGIN
    -- Check conversations table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        RAISE NOTICE 'conversations table exists';
        
        -- Check columns
        FOR r IN 
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'conversations'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'conversations column: % (%) - nullable: %', r.column_name, r.data_type, r.is_nullable;
        END LOOP;
    ELSE
        RAISE NOTICE 'conversations table does NOT exist';
    END IF;
    
    -- Check conversation_participants table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
        RAISE NOTICE 'conversation_participants table exists';
        
        -- Check columns
        FOR r IN 
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'conversation_participants'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'conversation_participants column: % (%) - nullable: %', r.column_name, r.data_type, r.is_nullable;
        END LOOP;
    ELSE
        RAISE NOTICE 'conversation_participants table does NOT exist';
    END IF;
    
    -- Check messages table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        RAISE NOTICE 'messages table exists';
        
        -- Check columns
        FOR r IN 
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'messages'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'messages column: % (%) - nullable: %', r.column_name, r.data_type, r.is_nullable;
        END LOOP;
    ELSE
        RAISE NOTICE 'messages table does NOT exist';
    END IF;
END $$;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;