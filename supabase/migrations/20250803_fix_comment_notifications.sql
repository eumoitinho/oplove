-- Fix comment notifications to work with correct table structure

-- Drop existing comment notification trigger
DROP TRIGGER IF EXISTS create_comment_notification ON comments;
DROP TRIGGER IF EXISTS create_comment_notification ON post_comments;

-- Update notify_on_comment function to handle proper table structure
CREATE OR REPLACE FUNCTION notify_on_comment() RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_commenter_name TEXT;
    v_commenter_username TEXT;
BEGIN
    -- Get post owner
    SELECT user_id INTO v_post_owner_id FROM posts WHERE id = NEW.post_id;
    
    -- Don't notify if user commented on their own post
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Get commenter's name and username
    SELECT name, username INTO v_commenter_name, v_commenter_username 
    FROM users WHERE id = NEW.user_id;
    
    -- Create notification
    INSERT INTO notifications (
        user_id,
        from_user_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        metadata
    ) VALUES (
        v_post_owner_id,
        NEW.user_id,
        'comment',
        'Novo comentário',
        COALESCE(v_commenter_name, v_commenter_username, 'Alguém') || ' comentou em seu post',
        NEW.post_id,
        'post',
        jsonb_build_object(
            'post_id', NEW.post_id,
            'comment_id', NEW.id,
            'comment_content', LEFT(NEW.content, 100)
        )
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the comment creation
        RAISE WARNING 'Error creating notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on comments table
CREATE TRIGGER create_comment_notification 
AFTER INSERT ON comments
FOR EACH ROW 
EXECUTE FUNCTION notify_on_comment();

-- Also fix like notifications if needed
DROP TRIGGER IF EXISTS create_like_notification ON likes;
DROP TRIGGER IF EXISTS create_like_notification ON post_likes;

-- Check if likes table exists and create trigger
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes' AND table_schema = 'public') THEN
        CREATE TRIGGER create_like_notification 
        AFTER INSERT ON likes
        FOR EACH ROW 
        EXECUTE FUNCTION notify_on_like();
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_likes' AND table_schema = 'public') THEN
        CREATE TRIGGER create_like_notification 
        AFTER INSERT ON post_likes
        FOR EACH ROW 
        EXECUTE FUNCTION notify_on_like();
    END IF;
END $$;

-- Verify triggers are created
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%notification%'
ORDER BY event_object_table;