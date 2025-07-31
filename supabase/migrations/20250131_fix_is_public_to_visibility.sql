-- Fix is_public references to use visibility column instead
-- This migration updates all policies and functions that reference the non-existent is_public column

-- Create a temporary version of are_users_blocked function if it doesn't exist
-- This returns false for now until the user_blocks table is created
CREATE OR REPLACE FUNCTION are_users_blocked(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Return false for now - no blocks implemented yet
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies that reference is_public
DROP POLICY IF EXISTS "Users can view public posts" ON posts;

-- Recreate policy using visibility column
CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (
    visibility = 'public' 
    AND NOT are_users_blocked(auth.uid(), user_id)
    AND is_hidden = false
  );

-- Update post reactions policies
DROP POLICY IF EXISTS "Users can view reactions on visible posts" ON post_reactions;
CREATE POLICY "Users can view reactions on visible posts" ON post_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (p.visibility = 'public' OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), user_id)
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

DROP POLICY IF EXISTS "Users can add reactions to visible posts" ON post_reactions;
CREATE POLICY "Users can add reactions to visible posts" ON post_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (p.visibility = 'public' OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

DROP POLICY IF EXISTS "Users can remove their own reactions" ON post_reactions;
CREATE POLICY "Users can remove their own reactions" ON post_reactions
  FOR DELETE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (p.visibility = 'public' OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

-- Update comment reactions policies
DROP POLICY IF EXISTS "Users can view reactions on visible comments" ON comment_reactions;
CREATE POLICY "Users can view reactions on visible comments" ON comment_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM comments c
      JOIN posts p ON p.id = c.post_id
      WHERE c.id = comment_id 
      AND (p.visibility = 'public' OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), c.user_id)
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

DROP POLICY IF EXISTS "Users can add reactions to visible comments" ON comment_reactions;
CREATE POLICY "Users can add reactions to visible comments" ON comment_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM comments c
      JOIN posts p ON p.id = c.post_id
      WHERE c.id = comment_id 
      AND (p.visibility = 'public' OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), c.user_id)
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

-- Update comments policies
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON comments;
CREATE POLICY "Users can view comments on visible posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (p.visibility = 'public' OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), user_id)
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility) WHERE visibility = 'public';