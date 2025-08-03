-- Activate notification triggers for the correct table names
-- NOTE: Run 20250803_create_notification_functions.sql first to create the functions

-- Drop old triggers if they exist
DROP TRIGGER IF EXISTS create_like_notification ON likes;
DROP TRIGGER IF EXISTS create_comment_notification ON comments;
DROP TRIGGER IF EXISTS create_follow_notification ON follows;
DROP TRIGGER IF EXISTS create_message_notification ON messages;
DROP TRIGGER IF EXISTS create_like_notification ON post_likes;
DROP TRIGGER IF EXISTS create_comment_notification ON post_comments;

-- Create triggers for the correct tables
CREATE TRIGGER create_like_notification AFTER INSERT ON post_likes
FOR EACH ROW EXECUTE FUNCTION notify_on_like();

-- Check which comment table exists and create appropriate trigger
DO $$
BEGIN
    -- Try to create trigger on 'comments' table first
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS create_comment_notification ON comments;
        CREATE TRIGGER create_comment_notification AFTER INSERT ON comments
        FOR EACH ROW EXECUTE FUNCTION notify_on_comment();
        RAISE NOTICE 'Created trigger on comments table';
    -- Otherwise try 'post_comments'
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_comments' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS create_comment_notification ON post_comments;
        CREATE TRIGGER create_comment_notification AFTER INSERT ON post_comments
        FOR EACH ROW EXECUTE FUNCTION notify_on_comment();
        RAISE NOTICE 'Created trigger on post_comments table';
    END IF;
END $$;

-- For follows table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS create_follow_notification ON follows;
        CREATE TRIGGER create_follow_notification AFTER INSERT ON follows
        FOR EACH ROW EXECUTE FUNCTION notify_on_follow();
        RAISE NOTICE 'Created trigger on follows table';
    END IF;
END $$;

-- For messages table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS create_message_notification ON messages;
        CREATE TRIGGER create_message_notification AFTER INSERT ON messages
        FOR EACH ROW EXECUTE FUNCTION notify_on_message();
        RAISE NOTICE 'Created trigger on messages table';
    END IF;
END $$;

-- Verification query
SELECT 'Notification triggers activated!' as status;