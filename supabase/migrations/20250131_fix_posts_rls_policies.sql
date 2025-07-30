-- Drop existing RLS policies for posts that might be causing issues
DROP POLICY IF EXISTS "View posts based on visibility" ON public.posts;
DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "posts_select_public" ON public.posts;

-- Create simpler RLS policies for posts

-- 1. Anyone can view public posts
CREATE POLICY "Anyone can view public posts"
  ON public.posts
  FOR SELECT
  USING (visibility = 'public');

-- 2. Authenticated users can view their own posts regardless of visibility
CREATE POLICY "Users can view own posts"
  ON public.posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Also ensure RLS is enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;