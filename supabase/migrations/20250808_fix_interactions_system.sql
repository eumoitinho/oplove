-- =====================================================
-- Fix Interactions System - Complete Overhaul
-- Date: 2025-08-08
-- Description: Standardize tables, columns, and functions for post interactions
-- =====================================================

-- 1. FIX POST_SAVES TABLE
-- =====================================================
-- Rename saved_at to created_at for consistency
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_saves' 
    AND column_name = 'saved_at'
  ) THEN
    ALTER TABLE post_saves RENAME COLUMN saved_at TO created_at;
  END IF;
END $$;

-- Ensure created_at exists with proper default
ALTER TABLE post_saves 
  ALTER COLUMN created_at SET DEFAULT NOW();

-- 2. FIX POST_SHARES TABLE
-- =====================================================
-- Rename shared_at to created_at for consistency
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_shares' 
    AND column_name = 'shared_at'
  ) THEN
    ALTER TABLE post_shares RENAME COLUMN shared_at TO created_at;
  END IF;
END $$;

-- Add share_type column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_shares' 
    AND column_name = 'share_type'
  ) THEN
    ALTER TABLE post_shares ADD COLUMN share_type VARCHAR(20) DEFAULT 'public';
  END IF;
END $$;

-- Ensure created_at exists with proper default
ALTER TABLE post_shares 
  ALTER COLUMN created_at SET DEFAULT NOW();

-- 3. STANDARDIZE NOTIFICATIONS TABLE
-- =====================================================
-- Ensure all required columns exist
DO $$
BEGIN
  -- Add entity_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'entity_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN entity_id UUID;
  END IF;

  -- Add entity_type if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'entity_type'
  ) THEN
    ALTER TABLE notifications ADD COLUMN entity_type VARCHAR(50);
  END IF;

  -- Add title if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE notifications ADD COLUMN title TEXT;
  END IF;

  -- Add message if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'message'
  ) THEN
    ALTER TABLE notifications ADD COLUMN message TEXT;
  END IF;

  -- Rename recipient_id to user_id if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'recipient_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE notifications RENAME COLUMN recipient_id TO user_id;
  END IF;

  -- Rename sender_id to from_user_id if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'sender_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'from_user_id'
  ) THEN
    ALTER TABLE notifications RENAME COLUMN sender_id TO from_user_id;
  END IF;
END $$;

-- 4. CREATE OR REPLACE RPC FUNCTIONS WITH PROPER PERMISSIONS
-- =====================================================

-- Increment post likes
CREATE OR REPLACE FUNCTION increment_post_likes(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET likes_count = COALESCE(likes_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement post likes
CREATE OR REPLACE FUNCTION decrement_post_likes(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment post comments
CREATE OR REPLACE FUNCTION increment_post_comments(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET comments_count = COALESCE(comments_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement post comments
CREATE OR REPLACE FUNCTION decrement_post_comments(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment post shares
CREATE OR REPLACE FUNCTION increment_post_shares(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET shares_count = COALESCE(shares_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement post shares
CREATE OR REPLACE FUNCTION decrement_post_shares(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment post saves
CREATE OR REPLACE FUNCTION increment_post_saves(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET saves_count = COALESCE(saves_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement post saves
CREATE OR REPLACE FUNCTION decrement_post_saves(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET saves_count = GREATEST(COALESCE(saves_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_shares(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_shares(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_saves(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_saves(UUID) TO authenticated;

-- 5. CREATE AUTOMATIC TRIGGERS FOR COUNTER UPDATES
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_post_likes_count ON post_likes;
DROP TRIGGER IF EXISTS update_post_comments_count ON post_comments;
DROP TRIGGER IF EXISTS update_post_shares_count ON post_shares;
DROP TRIGGER IF EXISTS update_post_saves_count ON post_saves;

-- Trigger function for likes
CREATE OR REPLACE FUNCTION update_post_likes_count_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_post_likes(NEW.post_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_post_likes(OLD.post_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for comments
CREATE OR REPLACE FUNCTION update_post_comments_count_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_post_comments(NEW.post_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_post_comments(OLD.post_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for shares
CREATE OR REPLACE FUNCTION update_post_shares_count_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_post_shares(NEW.post_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_post_shares(OLD.post_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for saves
CREATE OR REPLACE FUNCTION update_post_saves_count_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_post_saves(NEW.post_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_post_saves(OLD.post_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_post_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count_trigger();

CREATE TRIGGER update_post_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count_trigger();

CREATE TRIGGER update_post_shares_count
  AFTER INSERT OR DELETE ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_post_shares_count_trigger();

CREATE TRIGGER update_post_saves_count
  AFTER INSERT OR DELETE ON post_saves
  FOR EACH ROW
  EXECUTE FUNCTION update_post_saves_count_trigger();

-- 6. FIX RLS POLICIES
-- =====================================================

-- Drop and recreate policies for post_likes
DROP POLICY IF EXISTS "Users can view likes" ON post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;

CREATE POLICY "Users can view likes" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Drop and recreate policies for post_comments
DROP POLICY IF EXISTS "Users can view comments" ON post_comments;
DROP POLICY IF EXISTS "Users can create comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;

CREATE POLICY "Users can view comments" ON post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Drop and recreate policies for post_shares
DROP POLICY IF EXISTS "Users can view shares" ON post_shares;
DROP POLICY IF EXISTS "Users can share posts" ON post_shares;
DROP POLICY IF EXISTS "Users can unshare posts" ON post_shares;

CREATE POLICY "Users can view shares" ON post_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can share posts" ON post_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unshare posts" ON post_shares
  FOR DELETE USING (auth.uid() = user_id);

-- Drop and recreate policies for post_saves
DROP POLICY IF EXISTS "Users can view own saves" ON post_saves;
DROP POLICY IF EXISTS "Users can save posts" ON post_saves;
DROP POLICY IF EXISTS "Users can unsave posts" ON post_saves;

CREATE POLICY "Users can view own saves" ON post_saves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" ON post_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" ON post_saves
  FOR DELETE USING (auth.uid() = user_id);

-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_post_likes_post_user ON post_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_shares_post_user ON post_shares(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_created_at ON post_shares(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_saves_post_user ON post_saves(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_created_at ON post_saves(created_at DESC);

-- 8. RECALCULATE COUNTERS (ONE-TIME FIX)
-- =====================================================

-- Fix likes_count
UPDATE posts p
SET likes_count = (
  SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id
);

-- Fix comments_count
UPDATE posts p
SET comments_count = (
  SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id
);

-- Fix shares_count
UPDATE posts p
SET shares_count = (
  SELECT COUNT(*) FROM post_shares ps WHERE ps.post_id = p.id
);

-- Fix saves_count
UPDATE posts p
SET saves_count = (
  SELECT COUNT(*) FROM post_saves ps WHERE ps.post_id = p.id
);

-- =====================================================
-- Migration Complete
-- =====================================================