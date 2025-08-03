-- Simple test to check if notifications work

-- 1. First, let's check if the notifications table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications'
) as notifications_table_exists;

-- 2. Check if we can insert a test notification
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get any user ID for testing
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Try to insert a test notification
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            read,
            created_at
        ) VALUES (
            test_user_id,
            'message',
            'Teste de Sistema',
            'Esta é uma notificação de teste do sistema',
            false,
            NOW()
        );
        
        RAISE NOTICE 'Test notification created successfully for user %', test_user_id;
    ELSE
        RAISE NOTICE 'No users found in the system';
    END IF;
END $$;

-- 3. Check how many notifications exist
SELECT COUNT(*) as total_notifications FROM notifications;

-- 4. Show last 5 notifications
SELECT 
    n.id,
    n.user_id,
    n.type,
    n.title,
    n.message,
    n.created_at,
    u.email as user_email
FROM notifications n
LEFT JOIN users u ON u.id = n.user_id
ORDER BY n.created_at DESC
LIMIT 5;