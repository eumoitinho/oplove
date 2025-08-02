-- Fix storage policies to allow FREE verified users to upload media

-- First, drop existing storage policies for media bucket
DROP POLICY IF EXISTS "storage_posts_upload_premium_only" ON storage.objects;
DROP POLICY IF EXISTS "storage_posts_view" ON storage.objects;
DROP POLICY IF EXISTS "storage_posts_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_posts_delete" ON storage.objects;

-- Create new policy that allows FREE verified users to upload
CREATE POLICY "storage_posts_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'posts'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND (
            -- Premium users can always upload
            premium_type IN ('gold', 'diamond', 'couple')
            OR 
            -- Free users can upload if verified
            (premium_type = 'free' AND is_verified = true)
        )
    )
);

-- View policy - users can view their own uploads
CREATE POLICY "storage_posts_view" ON storage.objects
FOR SELECT USING (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'posts'
    AND (
        -- Owner can view
        auth.uid()::text = (storage.foldername(name))[2]
        OR
        -- Public posts can be viewed by anyone
        EXISTS (
            SELECT 1 FROM posts p
            WHERE p.visibility = 'public'
            AND p.media_urls::text LIKE '%' || storage.objects.name || '%'
        )
    )
);

-- Update policy - only owner can update
CREATE POLICY "storage_posts_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'posts'
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Delete policy - only owner can delete
CREATE POLICY "storage_posts_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'posts'
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Also fix for profile pictures (avatars)
DROP POLICY IF EXISTS "storage_avatars_upload" ON storage.objects;
DROP POLICY IF EXISTS "storage_avatars_view" ON storage.objects;
DROP POLICY IF EXISTS "storage_avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_avatars_delete" ON storage.objects;

-- Allow all authenticated users to upload avatars
CREATE POLICY "storage_avatars_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Anyone can view avatars
CREATE POLICY "storage_avatars_view" ON storage.objects
FOR SELECT USING (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'avatars'
);

-- Only owner can update their avatar
CREATE POLICY "storage_avatars_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Only owner can delete their avatar
CREATE POLICY "storage_avatars_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Verification query
SELECT 
    'Storage policies updated for FREE verified users!' as status,
    'FREE verified users can now upload images' as change,
    'Remember: FREE verified = 1 image per post, 3 photos/month limit' as note;