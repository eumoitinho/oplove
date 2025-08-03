-- Fix permissions - Safe version without assuming column names

-- 1. Grant schema permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT CREATE ON SCHEMA public TO authenticated;

-- 2. Grant table permissions for all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 3. Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON FUNCTIONS TO authenticated;

-- 4. Specific grants for critical tables
GRANT ALL ON TABLE follows TO authenticated;
GRANT ALL ON TABLE posts TO authenticated;
GRANT ALL ON TABLE comments TO authenticated;
GRANT ALL ON TABLE users TO authenticated;
GRANT ALL ON TABLE post_likes TO authenticated;
GRANT ALL ON TABLE notifications TO authenticated;

-- 5. Grant permissions to anon role for public data
GRANT SELECT ON TABLE posts TO anon;
GRANT SELECT ON TABLE users TO anon;
GRANT SELECT ON TABLE comments TO anon;
GRANT SELECT ON TABLE follows TO anon;

-- 6. Create only basic RLS policies without assuming column names

-- For follows table (we know it has follower_id and following_id)
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all follows" ON follows;
CREATE POLICY "Users can view all follows" ON follows
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows
    FOR INSERT WITH CHECK (follower_id = auth.uid());

DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow" ON follows
    FOR DELETE USING (follower_id = auth.uid());

-- For comments table (basic read for all)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all comments" ON comments;
CREATE POLICY "Users can view all comments" ON comments
    FOR SELECT USING (true);

-- For posts table (basic read for all)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
CREATE POLICY "Users can view all posts" ON posts
    FOR SELECT USING (true);

-- For users table (basic read for all)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

-- For post_likes table (basic read for all)
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
CREATE POLICY "Users can view all likes" ON post_likes
    FOR SELECT USING (true);

-- Verification
SELECT 'Safe permissions applied!' as status;