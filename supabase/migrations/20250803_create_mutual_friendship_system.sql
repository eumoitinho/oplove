-- Create Mutual Friendship System for OpenLove
-- This migration implements a mutual friendship system where users become friends
-- when both users like each other (mutual follows)

-- 1. Create friends table to track mutual relationships
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure unique friendship and no self-friendship
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  CONSTRAINT no_self_friend CHECK (user_id != friend_id)
);

-- 2. Enable RLS on friends table
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for friends table
CREATE POLICY "Users can view own friendships"
  ON public.friends
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests"
  ON public.friends
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendship status"
  ON public.friends
  FOR UPDATE
  USING (auth.uid() = friend_id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = friend_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete own friendships"
  ON public.friends
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id) WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id) WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);

-- 5. Create function to check for mutual follows and create friendship
CREATE OR REPLACE FUNCTION public.check_mutual_follow()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the other user already follows back
  IF EXISTS (
    SELECT 1 FROM public.follows 
    WHERE follower_id = NEW.following_id 
    AND following_id = NEW.follower_id
  ) THEN
    -- Create mutual friendship if not exists
    INSERT INTO public.friends (user_id, friend_id, status, accepted_at)
    VALUES (NEW.follower_id, NEW.following_id, 'accepted', NOW())
    ON CONFLICT (user_id, friend_id) DO NOTHING;
    
    INSERT INTO public.friends (user_id, friend_id, status, accepted_at)
    VALUES (NEW.following_id, NEW.follower_id, 'accepted', NOW())
    ON CONFLICT (user_id, friend_id) DO NOTHING;
    
    -- Create notifications for both users
    INSERT INTO public.notifications (
      recipient_id, sender_id, type, title, content, created_at
    ) VALUES 
    (NEW.following_id, NEW.follower_id, 'friend_request_accepted', 
     'Vocês agora são amigos!', 'Vocês se seguem mutuamente e agora são amigos no OpenLove.', NOW()),
    (NEW.follower_id, NEW.following_id, 'friend_request_accepted', 
     'Vocês agora são amigos!', 'Vocês se seguem mutuamente e agora são amigos no OpenLove.', NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to automatically create friendships on mutual follows
DROP TRIGGER IF EXISTS trigger_check_mutual_follow ON public.follows;
CREATE TRIGGER trigger_check_mutual_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW 
  EXECUTE FUNCTION public.check_mutual_follow();

-- 7. Create function to handle unfriending when unfollowing
CREATE OR REPLACE FUNCTION public.handle_unfollow()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove friendship when either user unfollows
  DELETE FROM public.friends 
  WHERE (user_id = OLD.follower_id AND friend_id = OLD.following_id)
     OR (user_id = OLD.following_id AND friend_id = OLD.follower_id);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger to handle unfriending
DROP TRIGGER IF EXISTS trigger_handle_unfollow ON public.follows;
CREATE TRIGGER trigger_handle_unfollow
  AFTER DELETE ON public.follows
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_unfollow();

-- 9. Create helper functions for friendship operations

-- Get user's friends list
CREATE OR REPLACE FUNCTION public.get_user_friends(target_user_id UUID)
RETURNS TABLE (
  friend_id UUID,
  username TEXT,
  name TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN,
  premium_type TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as friend_id,
    u.username,
    u.name,
    u.avatar_url,
    u.is_verified,
    u.premium_type,
    f.accepted_at
  FROM public.friends f
  JOIN public.users u ON u.id = f.friend_id
  WHERE f.user_id = target_user_id 
    AND f.status = 'accepted'
  ORDER BY f.accepted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if two users are friends
CREATE OR REPLACE FUNCTION public.are_users_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.friends 
    WHERE user_id = user1_id 
      AND friend_id = user2_id 
      AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get friendship status between two users
CREATE OR REPLACE FUNCTION public.get_friendship_status(user1_id UUID, user2_id UUID)
RETURNS TEXT AS $$
DECLARE
  follow_status TEXT;
  mutual_follow BOOLEAN;
BEGIN
  -- Check if user1 follows user2
  SELECT CASE 
    WHEN EXISTS (SELECT 1 FROM public.follows WHERE follower_id = user1_id AND following_id = user2_id) 
    THEN 'following'
    ELSE 'not_following'
  END INTO follow_status;
  
  -- Check if they are mutual friends
  SELECT public.are_users_friends(user1_id, user2_id) INTO mutual_follow;
  
  IF mutual_follow THEN
    RETURN 'friends';
  ELSE
    RETURN follow_status;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Update users stats to include friends count
-- First add friends column to stats JSONB if it doesn't exist
DO $$ 
BEGIN
  -- Update existing users to have friends count in stats
  UPDATE public.users 
  SET stats = COALESCE(stats, '{}'::jsonb) || '{"friends": 0}'::jsonb
  WHERE stats IS NULL OR NOT (stats ? 'friends');
END $$;

-- 11. Create function to update user friend stats
CREATE OR REPLACE FUNCTION public.update_friend_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    -- Increment friends count for both users
    UPDATE public.users 
    SET stats = jsonb_set(
      COALESCE(stats, '{}'::jsonb), 
      '{friends}', 
      (COALESCE((stats->>'friends')::int, 0) + 1)::text::jsonb
    )
    WHERE id IN (NEW.user_id, NEW.friend_id);
    
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    -- Decrement friends count for both users
    UPDATE public.users 
    SET stats = jsonb_set(
      COALESCE(stats, '{}'::jsonb), 
      '{friends}', 
      GREATEST(0, COALESCE((stats->>'friends')::int, 0) - 1)::text::jsonb
    )
    WHERE id IN (OLD.user_id, OLD.friend_id);
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
      -- Friendship accepted - increment
      UPDATE public.users 
      SET stats = jsonb_set(
        COALESCE(stats, '{}'::jsonb), 
        '{friends}', 
        (COALESCE((stats->>'friends')::int, 0) + 1)::text::jsonb
      )
      WHERE id IN (NEW.user_id, NEW.friend_id);
      
    ELSIF OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
      -- Friendship ended - decrement
      UPDATE public.users 
      SET stats = jsonb_set(
        COALESCE(stats, '{}'::jsonb), 
        '{friends}', 
        GREATEST(0, COALESCE((stats->>'friends')::int, 0) - 1)::text::jsonb
      )
      WHERE id IN (OLD.user_id, OLD.friend_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create trigger to update friend stats
DROP TRIGGER IF EXISTS trigger_update_friend_stats ON public.friends;
CREATE TRIGGER trigger_update_friend_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.friends
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_friend_stats();

-- 13. Grant permissions
GRANT ALL ON public.friends TO authenticated;
GRANT ALL ON public.friends TO service_role;
GRANT EXECUTE ON FUNCTION public.check_mutual_follow() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_unfollow() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_friends(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.are_users_friends(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_friendship_status(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_friend_stats() TO authenticated;

-- 14. Backfill existing mutual follows as friendships
DO $$
DECLARE
  follow_rec RECORD;
BEGIN
  -- Find all existing mutual follows and create friendships
  FOR follow_rec IN
    SELECT DISTINCT 
      f1.follower_id as user1,
      f1.following_id as user2
    FROM public.follows f1
    INNER JOIN public.follows f2 
      ON f1.follower_id = f2.following_id 
      AND f1.following_id = f2.follower_id
    WHERE f1.follower_id < f1.following_id -- Avoid duplicates
  LOOP
    -- Create friendship for both users
    INSERT INTO public.friends (user_id, friend_id, status, accepted_at)
    VALUES 
      (follow_rec.user1, follow_rec.user2, 'accepted', NOW()),
      (follow_rec.user2, follow_rec.user1, 'accepted', NOW())
    ON CONFLICT (user_id, friend_id) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Backfilled mutual follows as friendships';
END $$;

-- 15. Update posts RLS policies to work with friends
-- Drop existing posts policies that reference friends
DROP POLICY IF EXISTS "View posts based on visibility" ON public.posts;

-- Create new posts policy that works with the friends table
CREATE POLICY "View posts based on visibility and friendship"
  ON public.posts
  FOR SELECT 
  USING (
    visibility = 'public' 
    OR user_id = auth.uid()
    OR (
      visibility = 'friends' 
      AND EXISTS (
        SELECT 1 FROM public.friends 
        WHERE status = 'accepted'
        AND (
          (user_id = posts.user_id AND friend_id = auth.uid())
          OR (friend_id = posts.user_id AND user_id = auth.uid())
        )
      )
    )
  );

COMMENT ON TABLE public.friends IS 'Stores mutual friendship relationships between users';
COMMENT ON FUNCTION public.check_mutual_follow() IS 'Automatically creates friendship when users mutually follow each other';
COMMENT ON FUNCTION public.get_user_friends(UUID) IS 'Returns a list of accepted friends for a user';
COMMENT ON FUNCTION public.are_users_friends(UUID, UUID) IS 'Checks if two users are friends';