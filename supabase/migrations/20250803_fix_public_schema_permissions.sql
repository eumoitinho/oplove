-- Fix permissions for public schema and tables

-- Grant usage on public schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant basic permissions on all tables to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Specific permissions for comments table
GRANT ALL ON TABLE comments TO authenticated;
GRANT ALL ON TABLE posts TO authenticated;
GRANT ALL ON TABLE users TO authenticated;
GRANT ALL ON TABLE post_likes TO authenticated;
GRANT ALL ON TABLE notifications TO authenticated;
GRANT ALL ON TABLE follows TO authenticated;
GRANT ALL ON TABLE likes TO authenticated;

-- Ensure RLS is enabled on sensitive tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Fix any missing permissions for anon role (read-only)
GRANT SELECT ON TABLE posts TO anon;
GRANT SELECT ON TABLE users TO anon;
GRANT SELECT ON TABLE comments TO anon;

-- Verification
SELECT 'Public schema permissions fixed!' as status;