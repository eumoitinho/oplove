-- Fix permissions for post_likes and comments tables

-- Enable RLS on post_likes if not already enabled
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on post_likes
DROP POLICY IF EXISTS "Users can view likes" ON post_likes;
DROP POLICY IF EXISTS "Users can create likes" ON post_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON post_likes;

-- Create new policies for post_likes
CREATE POLICY "Users can view likes" ON post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create likes" ON post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on comments if not already enabled
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on comments
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Create new policies for comments
CREATE POLICY "Users can view comments" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- Also check if likes table exists and has proper permissions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes' AND table_schema = 'public') THEN
        ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view likes" ON likes;
        DROP POLICY IF EXISTS "Users can create likes" ON likes;
        DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
        
        CREATE POLICY "Users can view likes" ON likes
            FOR SELECT USING (true);
        
        CREATE POLICY "Users can create likes" ON likes
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete own likes" ON likes
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename IN ('post_likes', 'comments', 'likes')
ORDER BY tablename, cmd;