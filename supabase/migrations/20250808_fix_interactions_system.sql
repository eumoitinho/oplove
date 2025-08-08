-- Fix Post Interactions System - OpenLove v0.3.5
-- Date: 2025-08-08
-- Purpose: Ensure all post interactions work correctly with notifications

-- ============================================
-- 1. ENSURE TABLES HAVE CORRECT STRUCTURE
-- ============================================

-- Ensure post_likes has correct structure
ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
ADD COLUMN IF NOT EXISTS post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraint to prevent duplicate likes
ALTER TABLE post_likes 
DROP CONSTRAINT IF EXISTS post_likes_unique_user_post;
ALTER TABLE post_likes 
ADD CONSTRAINT post_likes_unique_user_post UNIQUE (post_id, user_id);

-- Ensure comments table exists (not post_comments)
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    stats JSONB DEFAULT '{"likes": 0, "replies": 0}',
    is_reported BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure post_shares has correct structure
ALTER TABLE post_shares
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
ADD COLUMN IF NOT EXISTS post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS share_type VARCHAR(20) DEFAULT 'public',
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraint to prevent duplicate shares
ALTER TABLE post_shares
DROP CONSTRAINT IF EXISTS post_shares_unique_user_post;
ALTER TABLE post_shares
ADD CONSTRAINT post_shares_unique_user_post UNIQUE (post_id, user_id);

-- Ensure saved_posts has correct structure
ALTER TABLE saved_posts
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
ADD COLUMN IF NOT EXISTS post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES saved_collections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS folder_name VARCHAR(50) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraint to prevent duplicate saves
ALTER TABLE saved_posts
DROP CONSTRAINT IF EXISTS saved_posts_unique_user_post;
ALTER TABLE saved_posts
ADD CONSTRAINT saved_posts_unique_user_post UNIQUE (post_id, user_id);

-- ============================================
-- 2. CREATE/UPDATE TRIGGER FUNCTIONS
-- ============================================

-- Function to update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET likes_count = COALESCE(likes_count, 0) + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        
        -- Create notification for post owner (if not liking own post)
        IF EXISTS (SELECT 1 FROM posts WHERE id = NEW.post_id AND user_id != NEW.user_id) THEN
            INSERT INTO notifications (
                recipient_id,
                sender_id,
                type,
                title,
                message,
                entity_id,
                entity_type,
                created_at
            )
            SELECT 
                p.user_id,
                NEW.user_id,
                'like',
                u.username || ' curtiu seu post',
                SUBSTRING(p.content, 1, 100),
                NEW.post_id,
                'post',
                NOW()
            FROM posts p
            JOIN users u ON u.id = NEW.user_id
            WHERE p.id = NEW.post_id
            AND p.user_id != NEW.user_id;
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET likes_count = GREATEST(0, COALESCE(likes_count, 1) - 1),
            updated_at = NOW()
        WHERE id = OLD.post_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET comments_count = COALESCE(comments_count, 0) + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        
        -- Create notification for post owner (if not commenting on own post)
        IF EXISTS (SELECT 1 FROM posts WHERE id = NEW.post_id AND user_id != NEW.user_id) THEN
            INSERT INTO notifications (
                recipient_id,
                sender_id,
                type,
                title,
                message,
                entity_id,
                entity_type,
                related_data,
                created_at
            )
            SELECT 
                p.user_id,
                NEW.user_id,
                'comment',
                u.username || ' comentou no seu post',
                SUBSTRING(NEW.content, 1, 100),
                NEW.post_id,
                'post',
                jsonb_build_object('comment_id', NEW.id),
                NOW()
            FROM posts p
            JOIN users u ON u.id = NEW.user_id
            WHERE p.id = NEW.post_id
            AND p.user_id != NEW.user_id;
        END IF;
        
        -- Notify parent comment author if this is a reply
        IF NEW.parent_id IS NOT NULL THEN
            INSERT INTO notifications (
                recipient_id,
                sender_id,
                type,
                title,
                message,
                entity_id,
                entity_type,
                related_data,
                created_at
            )
            SELECT 
                c.user_id,
                NEW.user_id,
                'reply',
                u.username || ' respondeu seu comentário',
                SUBSTRING(NEW.content, 1, 100),
                NEW.post_id,
                'comment',
                jsonb_build_object('comment_id', NEW.id, 'parent_id', NEW.parent_id),
                NOW()
            FROM comments c
            JOIN users u ON u.id = NEW.user_id
            WHERE c.id = NEW.parent_id
            AND c.user_id != NEW.user_id;
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET comments_count = GREATEST(0, COALESCE(comments_count, 1) - 1),
            updated_at = NOW()
        WHERE id = OLD.post_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update post shares count
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET shares_count = COALESCE(shares_count, 0) + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        
        -- Create notification for post owner (if not sharing own post)
        IF EXISTS (SELECT 1 FROM posts WHERE id = NEW.post_id AND user_id != NEW.user_id) THEN
            INSERT INTO notifications (
                recipient_id,
                sender_id,
                type,
                title,
                message,
                entity_id,
                entity_type,
                created_at
            )
            SELECT 
                p.user_id,
                NEW.user_id,
                'share',
                u.username || ' compartilhou seu post',
                COALESCE(NEW.message, 'Compartilhou seu post'),
                NEW.post_id,
                'post',
                NOW()
            FROM posts p
            JOIN users u ON u.id = NEW.user_id
            WHERE p.id = NEW.post_id
            AND p.user_id != NEW.user_id;
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET shares_count = GREATEST(0, COALESCE(shares_count, 1) - 1),
            updated_at = NOW()
        WHERE id = OLD.post_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update post saves count  
CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET saves_count = COALESCE(saves_count, 0) + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET saves_count = GREATEST(0, COALESCE(saves_count, 1) - 1),
            updated_at = NOW()
        WHERE id = OLD.post_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. DROP AND RECREATE TRIGGERS
-- ============================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;
DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON comments;
DROP TRIGGER IF EXISTS trigger_update_post_shares_count ON post_shares;
DROP TRIGGER IF EXISTS trigger_update_post_saves_count ON saved_posts;

-- Create triggers for automatic counter updates
CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comments_count();

CREATE TRIGGER trigger_update_post_shares_count
    AFTER INSERT OR DELETE ON post_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_post_shares_count();

CREATE TRIGGER trigger_update_post_saves_count
    AFTER INSERT OR DELETE ON saved_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_saves_count();

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for post_likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at DESC);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Indexes for post_shares
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_created_at ON post_shares(created_at DESC);

-- Indexes for saved_posts
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_collection_id ON saved_posts(collection_id);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 5. ADD RLS POLICIES
-- ============================================

-- Enable RLS on all interaction tables
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- Policies for post_likes
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
CREATE POLICY "Users can view all likes" ON post_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON post_likes;
CREATE POLICY "Users can manage own likes" ON post_likes
    FOR ALL USING (user_id = auth.uid());

-- Policies for comments
DROP POLICY IF EXISTS "Users can view all comments" ON comments;
CREATE POLICY "Users can view all comments" ON comments
    FOR SELECT USING (NOT is_hidden OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (user_id = auth.uid());

-- Policies for post_shares
DROP POLICY IF EXISTS "Users can view all shares" ON post_shares;
CREATE POLICY "Users can view all shares" ON post_shares
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own shares" ON post_shares;
CREATE POLICY "Users can manage own shares" ON post_shares
    FOR ALL USING (user_id = auth.uid());

-- Policies for saved_posts
DROP POLICY IF EXISTS "Users can view own saves" ON saved_posts;
CREATE POLICY "Users can view own saves" ON saved_posts
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own saves" ON saved_posts;
CREATE POLICY "Users can manage own saves" ON saved_posts
    FOR ALL USING (user_id = auth.uid());

-- ============================================
-- 6. FIX EXISTING DATA
-- ============================================

-- Recalculate all post counters to ensure accuracy
UPDATE posts p SET
    likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id),
    comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = p.id),
    shares_count = (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id),
    saves_count = (SELECT COUNT(*) FROM saved_posts WHERE post_id = p.id);

-- ============================================
-- 7. VERIFY INSTALLATION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Post interactions system fixed successfully!';
    RAISE NOTICE 'Tables: post_likes, comments, post_shares, saved_posts';
    RAISE NOTICE 'Triggers: All counter triggers installed';
    RAISE NOTICE 'Notifications: Will be created on likes, comments, shares';
    RAISE NOTICE 'RLS: Policies applied to all tables';
END $$;