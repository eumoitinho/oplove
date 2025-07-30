-- Fix post interactions RPC functions

-- 1. Drop existing functions if they exist
DROP FUNCTION IF EXISTS increment_post_likes(UUID);
DROP FUNCTION IF EXISTS decrement_post_likes(UUID);
DROP FUNCTION IF EXISTS increment_post_comments(UUID);
DROP FUNCTION IF EXISTS decrement_post_comments(UUID);
DROP FUNCTION IF EXISTS increment_post_shares(UUID);
DROP FUNCTION IF EXISTS decrement_post_shares(UUID);
DROP FUNCTION IF EXISTS increment_post_saves(UUID);
DROP FUNCTION IF EXISTS decrement_post_saves(UUID);
DROP FUNCTION IF EXISTS increment_collection_posts(UUID);
DROP FUNCTION IF EXISTS decrement_collection_posts(UUID);

-- 2. Create increment/decrement functions for likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create increment/decrement functions for comments
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create increment/decrement functions for shares
CREATE OR REPLACE FUNCTION increment_post_shares(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET shares_count = COALESCE(shares_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_shares(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create increment/decrement functions for saves
CREATE OR REPLACE FUNCTION increment_post_saves(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET saves_count = COALESCE(saves_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_saves(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET saves_count = GREATEST(COALESCE(saves_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create increment/decrement functions for collections
CREATE OR REPLACE FUNCTION increment_collection_posts(collection_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.saved_collections
  SET posts_count = COALESCE(posts_count, 0) + 1
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_collection_posts(collection_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.saved_collections
  SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0)
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_shares(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_shares(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_saves(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_saves(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_collection_posts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_collection_posts(UUID) TO authenticated;