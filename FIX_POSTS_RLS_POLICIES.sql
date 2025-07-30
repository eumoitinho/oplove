-- =====================================================
-- POLÍTICAS RLS CORRETAS PARA SISTEMA DE POSTS
-- =====================================================

-- POSTS - Políticas para ver posts públicos
DROP POLICY IF EXISTS "posts_select_public" ON posts;
CREATE POLICY "posts_select_public" 
ON posts FOR SELECT 
USING (visibility = 'public' OR user_id = auth.uid());

-- USERS - Política para ver perfis públicos  
DROP POLICY IF EXISTS "users_select_public" ON users;
CREATE POLICY "users_select_public" 
ON users FOR SELECT 
USING (true); -- Perfis são públicos

-- POST_MEDIA - Política para ver mídia de posts visíveis
DROP POLICY IF EXISTS "post_media_select" ON post_media;
CREATE POLICY "post_media_select" 
ON post_media FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = post_media.post_id 
    AND (posts.visibility = 'public' OR posts.user_id = auth.uid())
  )
);

-- POST_INTERACTIONS - Política para ver interações
DROP POLICY IF EXISTS "post_interactions_select" ON post_interactions;
CREATE POLICY "post_interactions_select" 
ON post_interactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = post_interactions.post_id 
    AND (posts.visibility = 'public' OR posts.user_id = auth.uid())
  )
);

-- COMMENTS - Política para ver comentários  
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

-- FOLLOWS - Política para ver seguindo/seguidores
DROP POLICY IF EXISTS "follows_select" ON follows;
CREATE POLICY "follows_select" 
ON follows FOR SELECT 
USING (follower_id = auth.uid() OR following_id = auth.uid());

-- Verificar políticas criadas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('posts', 'users', 'post_media', 'post_interactions', 'comments', 'follows')
ORDER BY tablename, cmd;