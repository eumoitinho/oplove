-- Create all notification functions before triggers

-- Ensure notifications table exists
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'message', 'post')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    entity_id UUID,
    entity_type VARCHAR(50),
    action_taken BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON notifications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_id, entity_type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Recreate policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT
    WITH CHECK (true);

-- Create or replace the create_notification function
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_from_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS notifications AS $$
DECLARE
    v_notification notifications;
BEGIN
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
        p_user_id,
        p_from_user_id,
        p_type,
        p_title,
        p_message,
        p_entity_id,
        p_entity_type,
        p_metadata
    ) RETURNING * INTO v_notification;
    
    RETURN v_notification;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notify_on_like function for post_likes table
CREATE OR REPLACE FUNCTION notify_on_like() RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_liker_name TEXT;
BEGIN
    -- Get post owner
    SELECT user_id INTO v_post_owner_id FROM posts WHERE id = NEW.post_id;
    
    -- Don't notify if user liked their own post
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Get liker's name
    SELECT COALESCE(name, username, email) INTO v_liker_name FROM users WHERE id = NEW.user_id;
    
    -- Create notification
    PERFORM create_notification(
        v_post_owner_id,
        NEW.user_id,
        'like',
        'Nova curtida',
        COALESCE(v_liker_name, 'Alguém') || ' curtiu seu post',
        NEW.post_id,
        'post'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notify_on_comment function
CREATE OR REPLACE FUNCTION notify_on_comment() RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_commenter_name TEXT;
BEGIN
    -- Get post owner
    SELECT user_id INTO v_post_owner_id FROM posts WHERE id = NEW.post_id;
    
    -- Don't notify if user commented on their own post
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Get commenter's name
    SELECT COALESCE(name, username, email) INTO v_commenter_name FROM users WHERE id = NEW.user_id;
    
    -- Create notification
    PERFORM create_notification(
        v_post_owner_id,
        NEW.user_id,
        'comment',
        'Novo comentário',
        COALESCE(v_commenter_name, 'Alguém') || ' comentou em seu post',
        NEW.post_id,
        'post'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notify_on_follow function
CREATE OR REPLACE FUNCTION notify_on_follow() RETURNS TRIGGER AS $$
DECLARE
    v_follower_name TEXT;
BEGIN
    -- Get follower's name
    SELECT COALESCE(name, username, email) INTO v_follower_name FROM users WHERE id = NEW.follower_id;
    
    -- Create notification
    PERFORM create_notification(
        NEW.following_id,
        NEW.follower_id,
        'follow',
        'Novo seguidor',
        COALESCE(v_follower_name, 'Alguém') || ' começou a seguir você',
        NEW.follower_id,
        'follow'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notify_on_message function
CREATE OR REPLACE FUNCTION notify_on_message() RETURNS TRIGGER AS $$
DECLARE
    v_sender_name TEXT;
    v_conversation_participant UUID;
BEGIN
    -- Get sender's name
    SELECT COALESCE(name, username, email) INTO v_sender_name FROM users WHERE id = NEW.sender_id;
    
    -- Get the other participant in the conversation
    SELECT user_id INTO v_conversation_participant 
    FROM conversation_participants 
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id
    LIMIT 1;
    
    -- Create notification
    IF v_conversation_participant IS NOT NULL THEN
        PERFORM create_notification(
            v_conversation_participant,
            NEW.sender_id,
            'message',
            'Nova mensagem',
            COALESCE(v_sender_name, 'Alguém') || ' enviou uma mensagem',
            NEW.conversation_id,
            'message'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION notify_on_like TO authenticated;
GRANT EXECUTE ON FUNCTION notify_on_comment TO authenticated;
GRANT EXECUTE ON FUNCTION notify_on_follow TO authenticated;
GRANT EXECUTE ON FUNCTION notify_on_message TO authenticated;

-- Verification
SELECT 'Notification functions created successfully!' as status;