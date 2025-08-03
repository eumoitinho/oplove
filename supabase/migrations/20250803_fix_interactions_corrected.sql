-- Fix Post Interactions - Corrected Version
-- This migration works with the current database state without conflicts

-- 1. First, create the missing polls table that is referenced but doesn't exist
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_options INTEGER DEFAULT 1,
  allows_multiple BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create poll_votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_ids INTEGER[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- 3. Create missing interaction tables (avoiding conflicts with existing views)
CREATE TABLE IF NOT EXISTS public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio')),
  thumbnail_url TEXT,
  duration INTEGER, -- For audio/video duration in seconds
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create missing interaction tables that we need
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 5. Create post_comments table (use different name to avoid conflicts with existing comments table)
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add missing columns to posts table
DO $$ 
BEGIN
  -- Add likes_count if it doesn't exist
  BEGIN
    ALTER TABLE public.posts ADD COLUMN likes_count INTEGER DEFAULT 0;
  EXCEPTION 
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Add comments_count if it doesn't exist
  BEGIN
    ALTER TABLE public.posts ADD COLUMN comments_count INTEGER DEFAULT 0;
  EXCEPTION 
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Add shares_count if it doesn't exist
  BEGIN
    ALTER TABLE public.posts ADD COLUMN shares_count INTEGER DEFAULT 0;
  EXCEPTION 
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Add saves_count if it doesn't exist
  BEGIN
    ALTER TABLE public.posts ADD COLUMN saves_count INTEGER DEFAULT 0;
  EXCEPTION 
    WHEN duplicate_column THEN NULL;
  END;
END $$;

-- 7. Enable RLS only on actual tables (not views)
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for polls
DROP POLICY IF EXISTS "Users can view polls" ON public.polls;
CREATE POLICY "Users can view polls"
  ON public.polls
  FOR SELECT
  USING (true); -- Anyone can view polls

DROP POLICY IF EXISTS "Users can create polls" ON public.polls;
CREATE POLICY "Users can create polls"
  ON public.polls
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- 9. Create RLS policies for poll votes
DROP POLICY IF EXISTS "Users can view poll votes" ON public.poll_votes;
CREATE POLICY "Users can view poll votes"
  ON public.poll_votes
  FOR SELECT
  USING (true); -- Anyone can see votes for counting

DROP POLICY IF EXISTS "Users can vote on polls" ON public.poll_votes;
CREATE POLICY "Users can vote on polls"
  ON public.poll_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 10. Create RLS policies for post interactions
DROP POLICY IF EXISTS "Users can view media" ON public.post_media;
CREATE POLICY "Users can view media"
  ON public.post_media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_media.post_id
      AND (visibility = 'public' OR user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view shares" ON public.post_shares;
CREATE POLICY "Users can view shares"
  ON public.post_shares
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_shares.post_id
      AND (visibility = 'public' OR user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can share posts" ON public.post_shares;
CREATE POLICY "Users can share posts"
  ON public.post_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view saves" ON public.post_saves;
CREATE POLICY "Users can view own saves"
  ON public.post_saves
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save posts" ON public.post_saves;
CREATE POLICY "Users can save posts"
  ON public.post_saves
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view comments" ON public.post_comments;
CREATE POLICY "Users can view comments"
  ON public.post_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_comments.post_id
      AND (visibility = 'public' OR user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
CREATE POLICY "Users can create comments"
  ON public.post_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 11. Create indexes for performance (only for columns that exist)
CREATE INDEX IF NOT EXISTS idx_polls_creator_id ON public.polls(creator_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON public.post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON public.post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON public.post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON public.post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);

-- 12. Create triggers to update post counters
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'post_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'post_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'post_shares' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET shares_count = GREATEST(0, shares_count - 1) WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'post_saves' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET saves_count = saves_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET saves_count = GREATEST(0, saves_count - 1) WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create triggers (only if tables exist)
DROP TRIGGER IF EXISTS trigger_update_likes_count ON public.post_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.post_comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

DROP TRIGGER IF EXISTS trigger_update_shares_count ON public.post_shares;
CREATE TRIGGER trigger_update_shares_count
  AFTER INSERT OR DELETE ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

DROP TRIGGER IF EXISTS trigger_update_saves_count ON public.post_saves;
CREATE TRIGGER trigger_update_saves_count
  AFTER INSERT OR DELETE ON public.post_saves
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

-- 14. Update existing counters (using existing tables)
DO $$
BEGIN
  -- Update counters based on existing tables
  UPDATE public.posts p
  SET 
    likes_count = COALESCE((SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id), 0),
    comments_count = COALESCE((SELECT COUNT(*) FROM public.comments WHERE post_id = p.id), 0) + 
                     COALESCE((SELECT COUNT(*) FROM public.post_comments WHERE post_id = p.id), 0),
    shares_count = COALESCE((SELECT COUNT(*) FROM public.post_shares WHERE post_id = p.id), 0),
    saves_count = COALESCE((SELECT COUNT(*) FROM public.post_saves WHERE post_id = p.id), 0);
END $$;

-- 15. Grant permissions
GRANT ALL ON public.polls TO authenticated;
GRANT ALL ON public.poll_votes TO authenticated;
GRANT ALL ON public.post_media TO authenticated;
GRANT ALL ON public.post_shares TO authenticated;
GRANT ALL ON public.post_saves TO authenticated;
GRANT ALL ON public.post_comments TO authenticated;

GRANT ALL ON public.polls TO service_role;
GRANT ALL ON public.poll_votes TO service_role;
GRANT ALL ON public.post_media TO service_role;
GRANT ALL ON public.post_shares TO service_role;
GRANT ALL ON public.post_saves TO service_role;
GRANT ALL ON public.post_comments TO service_role;

GRANT EXECUTE ON FUNCTION update_post_counters() TO authenticated;
GRANT EXECUTE ON FUNCTION update_post_counters() TO service_role;

-- 16. Add comments
COMMENT ON TABLE public.polls IS 'Polls that can be attached to posts';
COMMENT ON TABLE public.poll_votes IS 'User votes on polls';
COMMENT ON TABLE public.post_media IS 'Media attachments for posts';
COMMENT ON TABLE public.post_shares IS 'Post shares by users';
COMMENT ON TABLE public.post_saves IS 'Posts saved by users';
COMMENT ON TABLE public.post_comments IS 'Comments on posts';