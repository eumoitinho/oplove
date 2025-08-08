-- Quick fix for post_likes table
-- Run this if likes are not working

-- 1. Drop the existing constraint if it exists
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_pkey CASCADE;
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_unique_user_post CASCADE;

-- 2. Ensure all columns exist
ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS post_id UUID;

ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Set NOT NULL constraints
ALTER TABLE post_likes ALTER COLUMN post_id SET NOT NULL;
ALTER TABLE post_likes ALTER COLUMN user_id SET NOT NULL;

-- 4. Add primary key
ALTER TABLE post_likes ADD PRIMARY KEY (id);

-- 5. Add unique constraint to prevent duplicate likes
ALTER TABLE post_likes 
ADD CONSTRAINT post_likes_unique_user_post UNIQUE (post_id, user_id);

-- 6. Add foreign keys if missing
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;
ALTER TABLE post_likes 
ADD CONSTRAINT post_likes_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
ALTER TABLE post_likes 
ADD CONSTRAINT post_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- 8. Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- 9. Create policies
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
CREATE POLICY "Users can view all likes" ON post_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own likes" ON post_likes;
CREATE POLICY "Users can create own likes" ON post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON post_likes;
CREATE POLICY "Users can delete own likes" ON post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 10. Test the structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'post_likes' 
AND table_schema = 'public'
ORDER BY ordinal_position;