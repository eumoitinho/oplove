-- RPC function to increment community post likes
CREATE OR REPLACE FUNCTION increment_community_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to decrement community post likes
CREATE OR REPLACE FUNCTION decrement_community_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to increment community post comments
CREATE OR REPLACE FUNCTION increment_community_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET comments_count = comments_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to decrement community post comments
CREATE OR REPLACE FUNCTION decrement_community_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET comments_count = GREATEST(0, comments_count - 1)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;