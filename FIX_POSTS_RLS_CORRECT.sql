-- =====================================================
-- POLÍTICAS RLS CORRETAS BASEADAS NO SCHEMA REAL
-- =====================================================

-- POSTS - Posts públicos visíveis para todos
DROP POLICY IF EXISTS "posts_select_public" ON posts;
CREATE POLICY "posts_select_public" 
ON posts FOR SELECT 
USING (visibility = 'public' OR user_id = auth.uid());

-- USERS - Perfis públicos  
DROP POLICY IF EXISTS "users_select_public" ON users;
CREATE POLICY "users_select_public" 
ON users FOR SELECT 
USING (true); -- Perfis são públicos

-- COMMENTS - Comentários de posts públicos
DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select" 
ON comments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = comments.post_id 
    AND (posts.visibility = 'public' OR posts.user_id = auth.uid())
  )
);

-- LIKES - Likes de posts públicos
DROP POLICY IF EXISTS "likes_select" ON likes;
CREATE POLICY "likes_select" 
ON likes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = likes.post_id 
    AND (posts.visibility = 'public' OR posts.user_id = auth.uid())
  )
);

-- FOLLOWS - Seguindo/seguidores visíveis
DROP POLICY IF EXISTS "follows_select" ON follows;
CREATE POLICY "follows_select" 
ON follows FOR SELECT 
USING (follower_id = auth.uid() OR following_id = auth.uid() OR true); -- Temporariamente público

-- Verificar se as tabelas têm RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('posts', 'users', 'comments', 'likes', 'follows');

-- Verificar políticas criadas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('posts', 'users', 'comments', 'likes', 'follows')
ORDER BY tablename, cmd;