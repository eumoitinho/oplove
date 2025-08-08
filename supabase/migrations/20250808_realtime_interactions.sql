-- Create post_reposts table if not exists
CREATE TABLE IF NOT EXISTS post_reposts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_reposts_post_id ON post_reposts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reposts_user_id ON post_reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reposts_created_at ON post_reposts(created_at DESC);

-- Enable RLS
ALTER TABLE post_reposts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_reposts
CREATE POLICY "Users can view all reposts" ON post_reposts
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reposts" ON post_reposts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reposts" ON post_reposts
  FOR DELETE USING (user_id = auth.uid());

-- Add shares_count column to posts if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'shares_count') THEN
    ALTER TABLE posts ADD COLUMN shares_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create functions for updating share counts
CREATE OR REPLACE FUNCTION increment_post_shares(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET shares_count = COALESCE(shares_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_shares(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update share count on repost
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET shares_count = COALESCE(shares_count, 0) + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_shares_count_trigger ON post_reposts;
CREATE TRIGGER update_post_shares_count_trigger
AFTER INSERT OR DELETE ON post_reposts
FOR EACH ROW
EXECUTE FUNCTION update_post_shares_count();

-- Add type column to notifications if not exists (for mutual_like)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'notifications' AND column_name = 'type') THEN
    ALTER TABLE notifications ADD COLUMN type VARCHAR(50);
  END IF;
END $$;

-- Add content column to notifications if not exists (for new format)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'notifications' AND column_name = 'content') THEN
    ALTER TABLE notifications ADD COLUMN content TEXT;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_post ON post_likes(user_id, post_id);

-- Create function to check mutual likes
CREATE OR REPLACE FUNCTION check_mutual_likes(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  mutual_exists BOOLEAN;
BEGIN
  -- Check if user1 likes any of user2's posts AND user2 likes any of user1's posts
  SELECT EXISTS (
    SELECT 1 FROM post_likes pl1
    JOIN posts p1 ON pl1.post_id = p1.id
    WHERE pl1.user_id = user1_id AND p1.user_id = user2_id
  ) AND EXISTS (
    SELECT 1 FROM post_likes pl2
    JOIN posts p2 ON pl2.post_id = p2.id
    WHERE pl2.user_id = user2_id AND p2.user_id = user1_id
  ) INTO mutual_exists;
  
  RETURN mutual_exists;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_post_shares TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_shares TO authenticated;
GRANT EXECUTE ON FUNCTION check_mutual_likes TO authenticated;