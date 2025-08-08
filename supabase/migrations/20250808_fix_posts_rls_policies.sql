-- Fix RLS policies for posts table to allow authenticated users to create posts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can view public posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies

-- Policy for viewing posts
CREATE POLICY "Anyone can view public posts" ON posts
    FOR SELECT
    USING (
        visibility = 'public' 
        OR user_id = auth.uid()
        OR (
            visibility = 'friends' 
            AND EXISTS (
                SELECT 1 FROM follows 
                WHERE follower_id = auth.uid() 
                AND following_id = posts.user_id
            )
        )
    );

-- Policy for creating posts (CRITICAL - this was missing!)
CREATE POLICY "Authenticated users can create posts" ON posts
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND user_id = auth.uid()
    );

-- Policy for updating own posts
CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policy for deleting own posts
CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE
    USING (user_id = auth.uid());

-- Fix storage policies for media bucket
DROP POLICY IF EXISTS "Users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
DROP POLICY IF EXISTS "Public media access" ON storage.objects;

-- Create storage policies for media bucket
CREATE POLICY "Users can upload media" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'media' 
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view their own media" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'media' 
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR 
            -- Allow public access to media files
            true
        )
    );

CREATE POLICY "Users can update their own media" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'media' 
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own media" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'media' 
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Also fix policies for related tables that might be affected

-- post_likes table
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;
DROP POLICY IF EXISTS "Users can view likes" ON post_likes;

CREATE POLICY "Users can like posts" ON post_likes
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike posts" ON post_likes
    FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "Users can view likes" ON post_likes
    FOR SELECT
    USING (true);

-- post_comments table
DROP POLICY IF EXISTS "Users can comment on posts" ON post_comments;
DROP POLICY IF EXISTS "Users can view comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;

CREATE POLICY "Users can comment on posts" ON post_comments
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view comments" ON post_comments
    FOR SELECT
    USING (true);

CREATE POLICY "Users can update own comments" ON post_comments
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON post_comments
    FOR DELETE
    USING (user_id = auth.uid());

-- Verify the policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('posts', 'post_likes', 'post_comments')
ORDER BY tablename, policyname;