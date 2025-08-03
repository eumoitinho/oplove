-- Function to get posts with all interaction data
CREATE OR REPLACE FUNCTION get_posts_with_interactions(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_following_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  visibility TEXT,
  location TEXT,
  media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  saves_count INTEGER,
  is_liked BOOLEAN,
  is_saved BOOLEAN,
  user_data JSONB,
  recent_likes JSONB,
  recent_comments JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.content,
    p.visibility,
    p.location,
    p.media_urls,
    p.created_at,
    p.updated_at,
    COALESCE(p.likes_count, 0) as likes_count,
    COALESCE(p.comments_count, 0) as comments_count,
    COALESCE(p.shares_count, 0) as shares_count,
    COALESCE(p.saves_count, 0) as saves_count,
    CASE 
      WHEN p_user_id IS NULL THEN false
      ELSE EXISTS (SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = p_user_id)
    END as is_liked,
    CASE 
      WHEN p_user_id IS NULL THEN false
      ELSE EXISTS (SELECT 1 FROM post_saves WHERE post_id = p.id AND user_id = p_user_id)
    END as is_saved,
    jsonb_build_object(
      'id', u.id,
      'username', u.username,
      'name', u.name,
      'avatar_url', u.avatar_url,
      'premium_type', u.premium_type,
      'is_verified', u.is_verified
    ) as user_data,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', lu.id,
          'username', lu.username,
          'name', lu.name,
          'avatar_url', lu.avatar_url
        )
        ORDER BY pl.created_at DESC
      )
      FROM post_likes pl
      JOIN users lu ON lu.id = pl.user_id
      WHERE pl.post_id = p.id
      LIMIT 3
    ) as recent_likes,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', pc.id,
          'content', pc.content,
          'created_at', pc.created_at,
          'user', jsonb_build_object(
            'id', cu.id,
            'username', cu.username,
            'name', cu.name,
            'avatar_url', cu.avatar_url
          )
        )
        ORDER BY pc.created_at DESC
      )
      FROM post_comments pc
      JOIN users cu ON cu.id = pc.user_id
      WHERE pc.post_id = p.id
      LIMIT 2
    ) as recent_comments
  FROM posts p
  JOIN users u ON u.id = p.user_id
  WHERE 
    -- Visibility filter
    (
      p.visibility = 'public' 
      OR p.user_id = p_user_id
      OR (
        p.visibility = 'friends' 
        AND EXISTS (
          SELECT 1 FROM friends 
          WHERE status = 'accepted'
          AND (
            (user_id = p.user_id AND friend_id = p_user_id)
            OR (friend_id = p.user_id AND user_id = p_user_id)
          )
        )
      )
    )
    -- Following filter
    AND (
      NOT p_following_only 
      OR p.user_id = p_user_id
      OR EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = p_user_id 
        AND following_id = p.user_id
      )
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_posts_with_interactions(UUID, INTEGER, INTEGER, BOOLEAN) TO authenticated;