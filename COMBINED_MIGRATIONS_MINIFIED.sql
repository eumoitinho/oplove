BEGIN;
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  media_urls TEXT[],
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'followers')),
  is_public BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  initiated_by UUID REFERENCES auth.users(id),
  initiated_by_premium BOOLEAN DEFAULT false,
  group_type VARCHAR(50) CHECK (group_type IN ('user_created', 'event', 'community')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'file')),
  media_urls TEXT[],
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  website TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'gold', 'diamond', 'couple')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
CREATE TABLE IF NOT EXISTS public.paid_content_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_content_purchases ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE user_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('rg', 'cnh', 'passport')),
  document_number TEXT NOT NULL,
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT NOT NULL,
  face_scan_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'manual_review')),
  verification_score DECIMAL(5,2) DEFAULT 0.00,
  reviewed_by UUID REFERENCES users(id),
  reviewer_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_user_verifications_user_id ON user_verifications(user_id);
CREATE INDEX idx_user_verifications_status ON user_verifications(status);
CREATE INDEX idx_user_verifications_submitted_at ON user_verifications(submitted_at);
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verifications" ON user_verifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own verifications" ON user_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending verifications" ON user_verifications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can manage all verifications" ON user_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
CREATE OR REPLACE FUNCTION update_user_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_user_verifications_updated_at
  BEFORE UPDATE ON user_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_user_verifications_updated_at();
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Users can upload their own verification documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
CREATE POLICY "Users can view their own verification documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
CREATE POLICY "Admins can view all verification documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
DROP FUNCTION IF EXISTS increment_post_likes(UUID);
DROP FUNCTION IF EXISTS decrement_post_likes(UUID);
DROP FUNCTION IF EXISTS increment_post_comments(UUID);
DROP FUNCTION IF EXISTS decrement_post_comments(UUID);
DROP FUNCTION IF EXISTS increment_post_shares(UUID);
DROP FUNCTION IF EXISTS decrement_post_shares(UUID);
DROP FUNCTION IF EXISTS increment_post_saves(UUID);
DROP FUNCTION IF EXISTS decrement_post_saves(UUID);
DROP FUNCTION IF EXISTS increment_collection_posts(UUID);
DROP FUNCTION IF EXISTS decrement_collection_posts(UUID);
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION increment_post_shares(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET shares_count = COALESCE(shares_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_shares(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION increment_post_saves(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET saves_count = COALESCE(saves_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_saves(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET saves_count = GREATEST(COALESCE(saves_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION increment_collection_posts(collection_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.saved_collections
  SET posts_count = COALESCE(posts_count, 0) + 1
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_collection_posts(collection_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.saved_collections
  SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0)
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_shares(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_shares(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_saves(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_saves(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_collection_posts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_collection_posts(UUID) TO authenticated;
CREATE POLICY "Users can view own story limits" ON story_daily_limits
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own story limits" ON story_daily_limits
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert story limits" ON story_daily_limits
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "System can insert user credits" ON user_credits
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert credit transactions" ON user_credit_transactions
    FOR INSERT WITH CHECK (user_id = auth.uid() OR other_user_id = auth.uid());
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    auth_id,
    email,
    username,
    name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    auth_id = EXCLUDED.auth_id,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    updated_at = NOW()
  WHERE auth_id = NEW.id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.users WHERE auth_id = OLD.id;
  RETURN OLD;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();
INSERT INTO public.users (id, auth_id, email, username, name, created_at, updated_at)
SELECT 
  au.id,
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  COALESCE(au.created_at, NOW()),
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON pu.auth_id = au.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  auth_id = EXCLUDED.auth_id,
  email = EXCLUDED.email,
  updated_at = NOW();
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;
UPDATE public.users
SET auth_id = id
WHERE auth_id IS NULL;
UPDATE public.users
SET auth_id = id
WHERE auth_id != id;
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN 
    SELECT au.* 
    FROM auth.users au
    LEFT JOIN public.users pu ON pu.id = au.id OR pu.auth_id = au.id
    WHERE pu.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.users (
        id,
        auth_id,
        email,
        username,
        name,
        created_at,
        updated_at
      ) VALUES (
        auth_user.id,
        auth_user.id,
        auth_user.email,
        COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1)),
        COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.raw_user_meta_data->>'name', split_part(auth_user.email, '@', 1)),
        COALESCE(auth_user.created_at, NOW()),
        NOW()
      );
    EXCEPTION
      WHEN unique_violation THEN
        UPDATE public.users
        SET 
          auth_id = auth_user.id,
          email = auth_user.email,
          updated_at = NOW()
        WHERE id = auth_user.id;
    END;
  END LOOP;
END $$;
DROP POLICY IF EXISTS "Users can create own stories" ON stories;
DROP POLICY IF EXISTS "Users can view active stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
DROP POLICY IF EXISTS "Everyone can view boosted stories" ON stories;
CREATE POLICY "Users can create own stories" ON stories
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can view stories" ON stories
    FOR SELECT USING (auth.uid() IS NOT NULL AND (status = 'active' OR user_id = auth.uid()));
CREATE POLICY "Users can update own stories" ON stories
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own stories" ON stories
    FOR DELETE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can view own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can update own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can insert story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can manage own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can view story limits for triggers" ON story_daily_limits;
CREATE POLICY "Authenticated users can manage story limits" ON story_daily_limits
    FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "System can access story limits" ON story_daily_limits
    FOR ALL USING (true)
    WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "System can insert user credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can manage own credits" ON user_credits;
DROP POLICY IF EXISTS "System can initialize user credits" ON user_credits;
CREATE POLICY "Users can manage own credits" ON user_credits
    FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "System can initialize credits" ON user_credits
    FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view own transactions" ON user_credit_transactions;
DROP POLICY IF EXISTS "System can insert credit transactions" ON user_credit_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON user_credit_transactions;
CREATE POLICY "Users can view own transactions" ON user_credit_transactions
    FOR SELECT USING (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR other_user_id = auth.uid()));
CREATE POLICY "Users can create transactions" ON user_credit_transactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "System can create transactions" ON user_credit_transactions
    FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view stories" ON story_views;
DROP POLICY IF EXISTS "Story owners can see who viewed" ON story_views;
CREATE POLICY "Users can create story views" ON story_views
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND viewer_id = auth.uid());
CREATE POLICY "Story owners and viewers can see views" ON story_views
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            viewer_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM stories 
                WHERE stories.id = story_views.story_id 
                AND stories.user_id = auth.uid()
            )
        )
    );
DROP POLICY IF EXISTS "Everyone can view available seals" ON profile_seals;
CREATE POLICY "Everyone can view available seals" ON profile_seals
    FOR SELECT USING (auth.uid() IS NOT NULL AND is_available = true);
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_at ON user_blocks(blocked_at DESC);
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own blocks" ON user_blocks
  FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can create blocks" ON user_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can delete own blocks" ON user_blocks
  FOR DELETE USING (auth.uid() = blocker_id);
CREATE OR REPLACE FUNCTION is_user_blocked(blocker_user_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_blocks 
    WHERE blocker_id = blocker_user_id 
    AND blocked_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION are_users_blocked(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_blocks 
    WHERE (blocker_id = user1_id AND blocked_id = user2_id)
    OR (blocker_id = user2_id AND blocked_id = user1_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP POLICY IF EXISTS "Users can view public posts" ON posts;
CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (
    is_public = true 
    AND NOT are_users_blocked(auth.uid(), user_id)
  );
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON comments;
CREATE POLICY "Users can view comments on visible posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (p.is_public = true OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), user_id)
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );
DROP POLICY IF EXISTS "Users can view follows" ON follows;
CREATE POLICY "Users can view follows" ON follows
  FOR SELECT USING (
    NOT are_users_blocked(auth.uid(), follower_id)
    AND NOT are_users_blocked(auth.uid(), following_id)
  );
DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (
    auth.uid() = follower_id
    AND NOT are_users_blocked(follower_id, following_id)
  );
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    (user1_id = auth.uid() OR user2_id = auth.uid())
    AND NOT are_users_blocked(user1_id, user2_id)
  );
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    (user1_id = auth.uid() OR user2_id = auth.uid())
    AND NOT are_users_blocked(user1_id, user2_id)
  );
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = conversation_id 
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
      AND NOT are_users_blocked(c.user1_id, c.user2_id)
    )
  );
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = conversation_id 
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
      AND NOT are_users_blocked(c.user1_id, c.user2_id)
    )
  );
CREATE TYPE story_status AS ENUM ('active', 'expired', 'deleted');
CREATE TYPE story_viewer_type AS ENUM ('regular', 'anonymous');
CREATE TYPE story_reaction AS ENUM ('like', 'love', 'fire', 'wow', 'sad', 'angry');
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
    thumbnail_url TEXT,
    caption TEXT,
    duration INTEGER DEFAULT 5, -- Duration in seconds (5 for images, up to 15 for videos)
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    is_public BOOLEAN DEFAULT true,
    is_highlighted BOOLEAN DEFAULT false,
    highlight_color VARCHAR(7), -- Hex color for highlight ring
    is_boosted BOOLEAN DEFAULT false,
    boost_expires_at TIMESTAMP WITH TIME ZONE,
    boost_credits_spent INTEGER DEFAULT 0,
    boost_impressions INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    unique_view_count INTEGER DEFAULT 0,
    reaction_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    status story_status DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_stories_user_active ON stories(user_id, status, expires_at);
CREATE INDEX idx_stories_boosted ON stories(is_boosted, boost_expires_at) WHERE is_boosted = true;
CREATE INDEX idx_stories_created ON stories(created_at DESC);
CREATE TABLE story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewer_type story_viewer_type DEFAULT 'regular',
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_duration INTEGER, -- How long they watched (in seconds)
    completion_rate DECIMAL(5,2), -- Percentage of story watched
    reaction story_reaction,
    reacted_at TIMESTAMP WITH TIME ZONE,
    device_type VARCHAR(20),
    ip_address INET,
    CONSTRAINT unique_story_view UNIQUE (story_id, viewer_id)
);
CREATE INDEX idx_story_views_story ON story_views(story_id, viewed_at);
CREATE INDEX idx_story_views_viewer ON story_views(viewer_id, viewed_at);
CREATE TABLE story_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'gif')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_story_replies_story ON story_replies(story_id, created_at);
CREATE INDEX idx_story_replies_sender ON story_replies(sender_id, created_at);
CREATE TABLE story_daily_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    daily_limit INTEGER NOT NULL,
    stories_posted_today INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE story_boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credits_spent INTEGER NOT NULL,
    boost_duration_hours INTEGER NOT NULL DEFAULT 24,
    impressions_gained INTEGER DEFAULT 0,
    clicks_gained INTEGER DEFAULT 0,
    profile_visits_gained INTEGER DEFAULT 0,
    priority_score INTEGER DEFAULT 100, -- Higher score = shown first
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_story_boosts_active ON story_boosts(is_active, expires_at, priority_score DESC) WHERE is_active = true;
CREATE TABLE profile_seals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icon_url TEXT NOT NULL,
    description TEXT,
    credit_cost INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    available_until TIMESTAMP WITH TIME ZONE,
    display_order INTEGER DEFAULT 0,
    category VARCHAR(50), -- 'romantic', 'fun', 'premium', 'special'
    times_gifted INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE user_profile_seals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seal_id UUID REFERENCES profile_seals(id) ON DELETE CASCADE,
    message TEXT,
    is_displayed BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- For temporary seals
);
CREATE INDEX idx_user_seals_recipient ON user_profile_seals(recipient_id, is_displayed, display_order);
CREATE TABLE user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    credit_balance INTEGER DEFAULT 0 CHECK (credit_balance >= 0),
    total_purchased INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    total_gifted INTEGER DEFAULT 0,
    total_received INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE user_credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'spend', 'gift_sent', 'gift_received', 'refund', 'bonus')),
    amount INTEGER NOT NULL, -- Positive for credits added, negative for spent
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'story_boost', 'profile_seal', 'trending_boost', etc.
    reference_id UUID,
    other_user_id UUID REFERENCES users(id),
    payment_method payment_method,
    payment_amount DECIMAL(10,2),
    payment_reference VARCHAR(255),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_credit_transactions_user ON user_credit_transactions(user_id, created_at DESC);
CREATE TABLE trending_boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    boost_type VARCHAR(50) NOT NULL CHECK (boost_type IN ('trending_feed', 'explore_page', 'open_date')),
    credits_spent INTEGER NOT NULL,
    duration_hours INTEGER NOT NULL,
    impressions_gained INTEGER DEFAULT 0,
    interactions_gained INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    priority_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_trending_boosts_active ON trending_boosts(boost_type, is_active, expires_at, priority_score DESC);
CREATE OR REPLACE FUNCTION check_story_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_plan RECORD;
    daily_limit INTEGER;
    current_count INTEGER;
BEGIN
    SELECT premium_type, is_verified 
    INTO user_plan
    FROM users 
    WHERE id = NEW.user_id;
    CASE user_plan.premium_type
        WHEN 'free' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 3 ELSE 0 END;
        WHEN 'gold' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 10 ELSE 5 END;
        WHEN 'diamond' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 999 ELSE 10 END; -- 999 = unlimited
        WHEN 'couple' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 999 ELSE 10 END;
        ELSE
            daily_limit := 0;
    END CASE;
    INSERT INTO story_daily_limits (user_id, daily_limit, stories_posted_today)
    VALUES (NEW.user_id, daily_limit, 0)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        daily_limit = daily_limit,
        stories_posted_today = CASE 
            WHEN story_daily_limits.last_reset_date < CURRENT_DATE THEN 0
            ELSE story_daily_limits.stories_posted_today
        END,
        last_reset_date = CASE 
            WHEN story_daily_limits.last_reset_date < CURRENT_DATE THEN CURRENT_DATE
            ELSE story_daily_limits.last_reset_date
        END;
    SELECT stories_posted_today INTO current_count
    FROM story_daily_limits
    WHERE user_id = NEW.user_id;
    IF current_count >= daily_limit THEN
        RAISE EXCEPTION 'Daily story limit reached';
    END IF;
    UPDATE story_daily_limits
    SET stories_posted_today = stories_posted_today + 1
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER check_story_limit_trigger
BEFORE INSERT ON stories
FOR EACH ROW EXECUTE FUNCTION check_story_limit();
CREATE OR REPLACE FUNCTION update_story_view_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stories
    SET 
        view_count = view_count + 1,
        unique_view_count = (
            SELECT COUNT(DISTINCT viewer_id) 
            FROM story_views 
            WHERE story_id = NEW.story_id
        )
    WHERE id = NEW.story_id;
    IF NEW.reaction IS NOT NULL THEN
        UPDATE stories
        SET reaction_count = (
            SELECT COUNT(*) 
            FROM story_views 
            WHERE story_id = NEW.story_id 
            AND reaction IS NOT NULL
        )
        WHERE id = NEW.story_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_story_stats_trigger
AFTER INSERT OR UPDATE OF reaction ON story_views
FOR EACH ROW EXECUTE FUNCTION update_story_view_stats();
CREATE OR REPLACE FUNCTION process_credit_transaction()
RETURNS TRIGGER AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    SELECT credit_balance INTO current_balance
    FROM user_credits
    WHERE user_id = NEW.user_id
    FOR UPDATE;
    IF NEW.amount < 0 AND current_balance + NEW.amount < 0 THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;
    NEW.balance_before := current_balance;
    NEW.balance_after := current_balance + NEW.amount;
    UPDATE user_credits
    SET 
        credit_balance = credit_balance + NEW.amount,
        total_purchased = CASE 
            WHEN NEW.type = 'purchase' THEN total_purchased + NEW.amount 
            ELSE total_purchased 
        END,
        total_spent = CASE 
            WHEN NEW.type = 'spend' THEN total_spent + ABS(NEW.amount)
            ELSE total_spent 
        END,
        total_gifted = CASE 
            WHEN NEW.type = 'gift_sent' THEN total_gifted + ABS(NEW.amount)
            ELSE total_gifted 
        END,
        total_received = CASE 
            WHEN NEW.type = 'gift_received' THEN total_received + NEW.amount
            ELSE total_received 
        END,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    IF NEW.type = 'gift_received' AND NEW.other_user_id IS NOT NULL THEN
        UPDATE user_credits
        SET 
            credit_balance = credit_balance + NEW.amount,
            total_received = total_received + NEW.amount,
            updated_at = NOW()
        WHERE user_id = NEW.other_user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER process_credit_transaction_trigger
BEFORE INSERT ON user_credit_transactions
FOR EACH ROW EXECUTE FUNCTION process_credit_transaction();
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
    UPDATE stories
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at < NOW();
    UPDATE story_boosts
    SET is_active = false
    WHERE is_active = true
    AND expires_at < NOW();
    UPDATE trending_boosts
    SET is_active = false
    WHERE is_active = true
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
INSERT INTO profile_seals (name, icon_url, description, credit_cost, category, display_order) VALUES
('Coração de Ouro', '/seals/golden-heart.svg', 'Para alguém especial com coração de ouro', 50, 'romantic', 1),
('Estrela Brilhante', '/seals/shining-star.svg', 'Você é uma estrela que ilumina meu dia', 30, 'romantic', 2),
('Fogo', '/seals/fire.svg', 'Você é puro fogo!', 20, 'fun', 3),
('Anjo', '/seals/angel.svg', 'Meu anjo da guarda', 40, 'romantic', 4),
('Diamante', '/seals/diamond.svg', 'Raro e precioso como um diamante', 100, 'premium', 5),
('Coroa', '/seals/crown.svg', 'Realeza total', 80, 'premium', 6),
('Arco-íris', '/seals/rainbow.svg', 'Você colore minha vida', 25, 'fun', 7),
('Foguete', '/seals/rocket.svg', 'Até o infinito e além!', 35, 'fun', 8),
('Rosa', '/seals/rose.svg', 'Uma rosa para você', 15, 'romantic', 9),
('Troféu', '/seals/trophy.svg', 'Você é um vencedor!', 45, 'fun', 10);
CREATE INDEX idx_stories_feed ON stories(created_at DESC, status) WHERE status = 'active';
CREATE INDEX idx_stories_user_feed ON stories(user_id, created_at DESC) WHERE status = 'active';
CREATE INDEX idx_story_replies_unread ON story_replies(story_id, is_read) WHERE is_read = false;
CREATE INDEX idx_user_credits_balance ON user_credits(user_id, credit_balance);
CREATE INDEX idx_profile_seals_displayed ON user_profile_seals(recipient_id, is_displayed, display_order);
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_seals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_seals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_boosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create own stories" ON stories
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view active stories" ON stories
    FOR SELECT USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "Users can update own stories" ON stories
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own stories" ON stories
    FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Users can view stories" ON story_views
    FOR INSERT WITH CHECK (viewer_id = auth.uid());
CREATE POLICY "Story owners can see who viewed" ON story_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_views.story_id 
            AND stories.user_id = auth.uid()
        )
        OR viewer_id = auth.uid()
    );
CREATE POLICY "Users can send replies" ON story_replies
    FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can view own conversations" ON story_replies
    FOR SELECT USING (
        sender_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_replies.story_id 
            AND stories.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own transactions" ON user_credit_transactions
    FOR SELECT USING (user_id = auth.uid() OR other_user_id = auth.uid());
CREATE POLICY "Everyone can view available seals" ON profile_seals
    FOR SELECT USING (is_available = true);
CREATE POLICY "Users can view profile seals" ON user_profile_seals
    FOR SELECT USING (is_displayed = true OR recipient_id = auth.uid() OR sender_id = auth.uid());
CREATE POLICY "Users can gift seals" ON user_profile_seals
    FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can create own boosts" ON story_boosts
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view active boosts" ON story_boosts
    FOR SELECT USING (is_active = true OR user_id = auth.uid());
CREATE POLICY "Users can create own trending boosts" ON trending_boosts
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own trending boosts" ON trending_boosts
    FOR SELECT USING (user_id = auth.uid());
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  share_type VARCHAR(50) DEFAULT 'public',
  message TEXT,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.post_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.saved_collections(id) ON DELETE SET NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.saved_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT true,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes_count') THEN
    ALTER TABLE public.posts ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comments_count') THEN
    ALTER TABLE public.posts ADD COLUMN comments_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'shares_count') THEN
    ALTER TABLE public.posts ADD COLUMN shares_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'saves_count') THEN
    ALTER TABLE public.posts ADD COLUMN saves_count INTEGER DEFAULT 0;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON public.post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON public.post_saves(user_id);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON public.post_likes;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can view shares" ON public.post_shares;
DROP POLICY IF EXISTS "Users can share posts" ON public.post_shares;
DROP POLICY IF EXISTS "Users can unshare posts" ON public.post_shares;
DROP POLICY IF EXISTS "Users can view own saves" ON public.post_saves;
DROP POLICY IF EXISTS "Users can save posts" ON public.post_saves;
DROP POLICY IF EXISTS "Users can unsave posts" ON public.post_saves;
DROP POLICY IF EXISTS "Users can view own collections" ON public.saved_collections;
DROP POLICY IF EXISTS "Users can create collections" ON public.saved_collections;
DROP POLICY IF EXISTS "Users can update own collections" ON public.saved_collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON public.saved_collections;
CREATE POLICY "Users can view likes"
  ON public.post_likes
  FOR SELECT
  USING (true);
CREATE POLICY "Users can like posts"
  ON public.post_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts"
  ON public.post_likes
  FOR DELETE
  USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view comments"
  ON public.post_comments
  FOR SELECT
  USING (true);
CREATE POLICY "Users can create comments"
  ON public.post_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments"
  ON public.post_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments"
  ON public.post_comments
  FOR DELETE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can view shares"
  ON public.post_shares
  FOR SELECT
  USING (share_type = 'public' OR auth.uid() = user_id);
CREATE POLICY "Users can share posts"
  ON public.post_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unshare posts"
  ON public.post_shares
  FOR DELETE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can view own saves"
  ON public.post_saves
  FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can save posts"
  ON public.post_saves
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave posts"
  ON public.post_saves
  FOR DELETE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can view own collections"
  ON public.saved_collections
  FOR SELECT
  USING (auth.uid() = user_id OR is_private = false);
CREATE POLICY "Users can create collections"
  ON public.saved_collections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections"
  ON public.saved_collections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections"
  ON public.saved_collections
  FOR DELETE
  USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET likes_count = likes_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET likes_count = GREATEST(0, likes_count - 1) 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET comments_count = comments_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET comments_count = GREATEST(0, comments_count - 1) 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION increment_post_shares(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET shares_count = shares_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_shares(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET shares_count = GREATEST(0, shares_count - 1) 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION increment_post_saves(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET saves_count = saves_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_saves(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET saves_count = GREATEST(0, saves_count - 1) 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION increment_collection_posts(collection_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.saved_collections 
  SET posts_count = posts_count + 1 
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_collection_posts(collection_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.saved_collections 
  SET posts_count = GREATEST(0, posts_count - 1) 
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET shares_count = GREATEST(0, shares_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET saves_count = saves_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET saves_count = GREATEST(0, saves_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON public.post_likes;
DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON public.post_comments;
DROP TRIGGER IF EXISTS update_post_shares_count_trigger ON public.post_shares;
DROP TRIGGER IF EXISTS update_post_saves_count_trigger ON public.post_saves;
CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
CREATE TRIGGER update_post_shares_count_trigger
AFTER INSERT OR DELETE ON public.post_shares
FOR EACH ROW EXECUTE FUNCTION update_post_shares_count();
CREATE TRIGGER update_post_saves_count_trigger
AFTER INSERT OR DELETE ON public.post_saves
FOR EACH ROW EXECUTE FUNCTION update_post_saves_count();
UPDATE public.posts p
SET 
  likes_count = COALESCE((SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id), 0),
  comments_count = COALESCE((SELECT COUNT(*) FROM public.post_comments WHERE post_id = p.id), 0),
  shares_count = COALESCE((SELECT COUNT(*) FROM public.post_shares WHERE post_id = p.id), 0),
  saves_count = COALESCE((SELECT COUNT(*) FROM public.post_saves WHERE post_id = p.id), 0);
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (
    reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS love_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS laugh_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wow_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sad_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS angry_count INTEGER DEFAULT 0;
INSERT INTO post_reactions (post_id, user_id, reaction_type, created_at)
SELECT post_id, user_id, 'like', created_at
FROM post_likes
ON CONFLICT (post_id, user_id) DO NOTHING;
CREATE OR REPLACE FUNCTION update_post_reaction_counts(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET
    like_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'like'),
    love_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'love'),
    laugh_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'laugh'),
    wow_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'wow'),
    sad_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'sad'),
    angry_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = p_post_id AND reaction_type = 'angry'),
    updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION handle_post_reaction_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_post_reaction_counts(NEW.post_id);
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    PERFORM update_post_reaction_counts(OLD.post_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER post_reactions_change
  AFTER INSERT OR UPDATE OR DELETE ON post_reactions
  FOR EACH ROW EXECUTE FUNCTION handle_post_reaction_change();
DO $$
DECLARE
  post_record RECORD;
BEGIN
  FOR post_record IN SELECT DISTINCT post_id FROM post_reactions LOOP
    PERFORM update_post_reaction_counts(post_record.post_id);
  END LOOP;
END $$;
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_type ON post_reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_post_reactions_created_at ON post_reactions(created_at DESC);
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view reactions on visible posts" ON post_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (p.is_public = true OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );
CREATE POLICY "Users can create own reactions" ON post_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id 
      AND (p.is_public = true OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );
CREATE POLICY "Users can update own reactions" ON post_reactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON post_reactions
  FOR DELETE USING (auth.uid() = user_id);
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (
    reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS love_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS laugh_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wow_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sad_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS angry_count INTEGER DEFAULT 0;
INSERT INTO comment_reactions (comment_id, user_id, reaction_type, created_at)
SELECT comment_id, user_id, 'like', created_at
FROM comment_likes
ON CONFLICT (comment_id, user_id) DO NOTHING;
CREATE OR REPLACE FUNCTION update_comment_reaction_counts(c_comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE comments SET
    like_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'like'),
    love_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'love'),
    laugh_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'laugh'),
    wow_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'wow'),
    sad_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'sad'),
    angry_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c_comment_id AND reaction_type = 'angry'),
    updated_at = NOW()
  WHERE id = c_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION handle_comment_reaction_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_comment_reaction_counts(NEW.comment_id);
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    PERFORM update_comment_reaction_counts(OLD.comment_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER comment_reactions_change
  AFTER INSERT OR UPDATE OR DELETE ON comment_reactions
  FOR EACH ROW EXECUTE FUNCTION handle_comment_reaction_change();
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_type ON comment_reactions(reaction_type);
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view comment reactions" ON comment_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM comments c
      JOIN posts p ON p.id = c.post_id
      WHERE c.id = comment_id 
      AND (p.is_public = true OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), c.user_id)
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );
CREATE POLICY "Users can create comment reactions" ON comment_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM comments c
      JOIN posts p ON p.id = c.post_id
      WHERE c.id = comment_id 
      AND (p.is_public = true OR p.user_id = auth.uid())
      AND NOT are_users_blocked(auth.uid(), c.user_id)
      AND NOT are_users_blocked(auth.uid(), p.user_id)
    )
  );
CREATE POLICY "Users can update own comment reactions" ON comment_reactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment reactions" ON comment_reactions
  FOR DELETE USING (auth.uid() = user_id);
DO $$
DECLARE
  comment_record RECORD;
BEGIN
  FOR comment_record IN SELECT DISTINCT comment_id FROM comment_reactions LOOP
    PERFORM update_comment_reaction_counts(comment_record.comment_id);
  END LOOP;
END $$;
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (
    reason IN ('spam', 'harassment', 'inappropriate_content', 'copyright', 'misinformation', 'other')
  ),
  description TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'reviewed', 'resolved', 'dismissed')
  ),
  reviewer_id UUID REFERENCES users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, reporter_id)
);
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (
    reason IN ('spam', 'harassment', 'inappropriate_content', 'fake_profile', 'copyright', 'misinformation', 'other')
  ),
  description TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'reviewed', 'resolved', 'dismissed')
  ),
  reviewer_id UUID REFERENCES users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reported_id, reporter_id)
);
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(20) NOT NULL CHECK (
    content_type IN ('post', 'comment', 'user', 'story')
  ),
  content_id UUID NOT NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_review', 'resolved', 'dismissed')
  ),
  assigned_to UUID REFERENCES users(id),
  resolution VARCHAR(50),
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS reports_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hidden_reason TEXT,
ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS strikes_count INTEGER DEFAULT 0;
CREATE OR REPLACE FUNCTION increment_post_reports(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET reports_count = COALESCE(reports_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_reports(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET reports_count = GREATEST(COALESCE(reports_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reporter_id ON post_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reported_id ON post_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);
CREATE INDEX IF NOT EXISTS idx_post_reports_created_at ON post_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_id ON user_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON moderation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_content_type ON moderation_queue(content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_assigned_to ON moderation_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON moderation_queue(created_at DESC);
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reports" ON post_reports
  FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON post_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Moderators can view all reports" ON post_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );
CREATE POLICY "Moderators can update reports" ON post_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own user reports" ON user_reports
  FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create user reports" ON user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Moderators can view all user reports" ON user_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );
CREATE POLICY "Moderators can update user reports" ON user_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only moderators can access moderation queue" ON moderation_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER post_reports_updated_at
  BEFORE UPDATE ON post_reports
  FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();
CREATE TRIGGER user_reports_updated_at
  BEFORE UPDATE ON user_reports
  FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();
CREATE TRIGGER moderation_queue_updated_at
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();
DROP POLICY IF EXISTS "Users can view public posts" ON posts;
CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (
    is_public = true 
    AND NOT are_users_blocked(auth.uid(), user_id)
    AND is_hidden = false
  );
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Moderators can view all posts" ON posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'moderator' OR role = 'admin' OR role = 'super_admin')
    )
  );
CREATE OR REPLACE FUNCTION auto_moderate_post(p_post_id UUID)
RETURNS void AS $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM post_reports 
  WHERE post_id = p_post_id AND status = 'pending';
  IF report_count >= 10 THEN
    UPDATE posts 
    SET is_hidden = true,
        hidden_reason = 'Multiple reports - automatic moderation',
        hidden_at = NOW(),
        needs_review = true,
        updated_at = NOW()
    WHERE id = p_post_id;
    INSERT INTO moderation_queue (
      content_type, content_id, reason, priority, status, metadata
    ) VALUES (
      'post', p_post_id, 'multiple_reports', 'urgent', 'pending',
      jsonb_build_object('report_count', report_count, 'auto_hidden', true)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION handle_new_post_report()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM auto_moderate_post(NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER new_post_report_trigger
  AFTER INSERT ON post_reports
  FOR EACH ROW EXECUTE FUNCTION handle_new_post_report();
CREATE TABLE IF NOT EXISTS saved_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT true,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);
CREATE TABLE IF NOT EXISTS post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES saved_collections(id) ON DELETE SET NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS saves_count INTEGER DEFAULT 0;
CREATE OR REPLACE FUNCTION increment_post_saves(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET saves_count = COALESCE(saves_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_saves(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET saves_count = GREATEST(COALESCE(saves_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION increment_collection_posts(collection_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE saved_collections 
  SET posts_count = COALESCE(posts_count, 0) + 1,
      updated_at = NOW()
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_collection_posts(collection_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE saved_collections 
  SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE INDEX IF NOT EXISTS idx_saved_collections_user_id ON saved_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_collections_updated_at ON saved_collections(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_collection_id ON post_saves(collection_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_saved_at ON post_saves(saved_at DESC);
ALTER TABLE saved_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own collections" ON saved_collections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own collections" ON saved_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON saved_collections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON saved_collections
  FOR DELETE USING (auth.uid() = user_id);
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saves" ON post_saves
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own saves" ON post_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saves" ON post_saves
  FOR DELETE USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION update_saved_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER saved_collections_updated_at
  BEFORE UPDATE ON saved_collections
  FOR EACH ROW EXECUTE FUNCTION update_saved_collections_updated_at();
CREATE OR REPLACE FUNCTION handle_post_saves_collection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.collection_id IS NOT NULL THEN
    PERFORM increment_collection_posts(NEW.collection_id);
  END IF;
  IF TG_OP = 'DELETE' AND OLD.collection_id IS NOT NULL THEN
    PERFORM decrement_collection_posts(OLD.collection_id);
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.collection_id IS NOT NULL AND NEW.collection_id IS NULL THEN
      PERFORM decrement_collection_posts(OLD.collection_id);
    END IF;
    IF OLD.collection_id IS NULL AND NEW.collection_id IS NOT NULL THEN
      PERFORM increment_collection_posts(NEW.collection_id);
    END IF;
    IF OLD.collection_id IS NOT NULL AND NEW.collection_id IS NOT NULL AND OLD.collection_id != NEW.collection_id THEN
      PERFORM decrement_collection_posts(OLD.collection_id);
      PERFORM increment_collection_posts(NEW.collection_id);
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER post_saves_collection_count
  AFTER INSERT OR UPDATE OR DELETE ON post_saves
  FOR EACH ROW EXECUTE FUNCTION handle_post_saves_collection_count();
CREATE OR REPLACE FUNCTION increment_post_shares(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET shares_count = COALESCE(shares_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION decrement_post_shares(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TABLE IF NOT EXISTS post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  share_type VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (share_type IN ('public', 'private', 'story')),
  message TEXT,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_shared_at ON post_shares(shared_at DESC);
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view public shares" ON post_shares
  FOR SELECT USING (share_type = 'public');
CREATE POLICY "Users can view own shares" ON post_shares
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create shares" ON post_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own shares" ON post_shares
  FOR DELETE USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION update_post_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER post_shares_updated_at
  BEFORE UPDATE ON post_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_shares_updated_at();
CREATE TABLE IF NOT EXISTS couple_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    to_email VARCHAR(255),
    to_phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_invitation_target CHECK (
        to_user_id IS NOT NULL OR to_email IS NOT NULL OR to_phone IS NOT NULL
    ),
    CONSTRAINT unique_pending_invitation UNIQUE (from_user_id, to_user_id, status) DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS couple_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'secondary' CHECK (role IN ('primary', 'secondary')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_couple_user UNIQUE (couple_id, user_id),
    CONSTRAINT unique_primary_role_per_couple UNIQUE (couple_id, role) DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS couple_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    payer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    amount DECIMAL(10, 2) NOT NULL DEFAULT 69.90,
    currency VARCHAR(3) DEFAULT 'BRL',
    payment_method payment_method NOT NULL,
    provider payment_provider NOT NULL,
    provider_subscription_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS couple_shared_albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'Nosso Álbum',
    description TEXT,
    cover_image_url TEXT,
    is_private BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS couple_album_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID NOT NULL REFERENCES couple_shared_albums(id) ON DELETE CASCADE,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    file_size INTEGER,
    file_type VARCHAR(20),
    width INTEGER,
    height INTEGER,
    taken_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS couple_diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    mood VARCHAR(50),
    date DATE NOT NULL,
    is_private BOOLEAN DEFAULT false,
    visible_to VARCHAR(20) DEFAULT 'both' CHECK (visible_to IN ('both', 'author_only', 'partner_only')),
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS couple_games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    min_duration_minutes INTEGER,
    max_duration_minutes INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS couple_game_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES couple_games(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    score_user1 INTEGER DEFAULT 0,
    score_user2 INTEGER DEFAULT 0,
    current_round INTEGER DEFAULT 1,
    total_rounds INTEGER DEFAULT 1,
    game_data JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS couple_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    shared_profile BOOLEAN DEFAULT true,
    shared_stats BOOLEAN DEFAULT true,
    allow_partner_posting BOOLEAN DEFAULT false,
    auto_tag_partner BOOLEAN DEFAULT false,
    shared_calendar BOOLEAN DEFAULT true,
    notifications JSONB DEFAULT '{
        "partner_posts": true,
        "anniversary_reminders": true,
        "couple_games": true,
        "shared_memories": true
    }'::jsonb,
    privacy JSONB DEFAULT '{
        "album_visibility": "couple_only",
        "diary_access": "both",
        "stats_sharing": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_couple_settings UNIQUE (couple_id)
);
CREATE INDEX idx_couple_invitations_from_user ON couple_invitations(from_user_id);
CREATE INDEX idx_couple_invitations_to_user ON couple_invitations(to_user_id);
CREATE INDEX idx_couple_invitations_status ON couple_invitations(status);
CREATE INDEX idx_couple_invitations_expires ON couple_invitations(expires_at) WHERE status = 'pending';
CREATE INDEX idx_couple_users_couple ON couple_users(couple_id);
CREATE INDEX idx_couple_users_user ON couple_users(user_id);
CREATE INDEX idx_couple_payments_couple ON couple_payments(couple_id);
CREATE INDEX idx_couple_payments_payer ON couple_payments(payer_user_id);
CREATE INDEX idx_couple_payments_status ON couple_payments(status);
CREATE INDEX idx_couple_albums_couple ON couple_shared_albums(couple_id);
CREATE INDEX idx_couple_album_photos_album ON couple_album_photos(album_id);
CREATE INDEX idx_couple_album_photos_couple ON couple_album_photos(couple_id);
CREATE INDEX idx_couple_diary_couple ON couple_diary_entries(couple_id);
CREATE INDEX idx_couple_diary_author ON couple_diary_entries(author_id);
CREATE INDEX idx_couple_diary_date ON couple_diary_entries(date DESC);
CREATE INDEX idx_couple_game_sessions_couple ON couple_game_sessions(couple_id);
CREATE INDEX idx_couple_game_sessions_game ON couple_game_sessions(game_id);
CREATE INDEX idx_couple_game_sessions_status ON couple_game_sessions(status);
CREATE TRIGGER update_couple_invitations_updated_at 
    BEFORE UPDATE ON couple_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_couple_payments_updated_at 
    BEFORE UPDATE ON couple_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_couple_shared_albums_updated_at 
    BEFORE UPDATE ON couple_shared_albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_couple_diary_entries_updated_at 
    BEFORE UPDATE ON couple_diary_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_couple_settings_updated_at 
    BEFORE UPDATE ON couple_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE FUNCTION create_couple_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO couple_settings (couple_id)
    VALUES (NEW.id);
    INSERT INTO couple_shared_albums (couple_id, created_by)
    SELECT NEW.id, cu.user_id
    FROM couple_users cu
    WHERE cu.couple_id = NEW.id AND cu.role = 'primary'
    LIMIT 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_create_couple_settings
    AFTER INSERT ON couples
    FOR EACH ROW EXECUTE FUNCTION create_couple_settings();
CREATE OR REPLACE FUNCTION sync_couple_premium_status()
RETURNS TRIGGER AS $$
DECLARE
    couple_users_record RECORD;
BEGIN
    IF NEW.premium_type = 'couple' AND NEW.couple_id IS NOT NULL THEN
        UPDATE users 
        SET 
            premium_type = 'couple',
            premium_status = NEW.premium_status,
            premium_expires_at = NEW.premium_expires_at,
            is_premium = true
        WHERE couple_id = NEW.couple_id 
        AND id != NEW.id;
    ELSIF OLD.premium_type = 'couple' AND NEW.premium_type != 'couple' AND NEW.couple_id IS NOT NULL THEN
        SELECT * INTO couple_users_record
        FROM couple_users
        WHERE couple_id = NEW.couple_id AND user_id = NEW.id AND role = 'primary';
        IF couple_users_record IS NOT NULL THEN
            UPDATE users
            SET 
                premium_type = 'free',
                premium_status = 'inactive',
                premium_expires_at = NULL,
                is_premium = false
            WHERE couple_id = NEW.couple_id 
            AND id != NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_sync_couple_premium_status
    AFTER UPDATE OF premium_type, premium_status, premium_expires_at ON users
    FOR EACH ROW 
    WHEN (NEW.couple_id IS NOT NULL)
    EXECUTE FUNCTION sync_couple_premium_status();
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    UPDATE couple_invitations
    SET status = 'expired'
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION handle_couple_dissolution()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET 
        couple_id = NULL,
        is_in_couple = false,
        premium_type = CASE 
            WHEN premium_type = 'couple' THEN 'free'
            ELSE premium_type
        END,
        premium_status = CASE 
            WHEN premium_type = 'couple' THEN 'inactive'  
            ELSE premium_status
        END,
        premium_expires_at = CASE 
            WHEN premium_type = 'couple' THEN NULL
            ELSE premium_expires_at
        END,
        is_premium = CASE 
            WHEN premium_type = 'couple' THEN false
            ELSE is_premium
        END
    WHERE couple_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_handle_couple_dissolution
    BEFORE DELETE ON couples
    FOR EACH ROW EXECUTE FUNCTION handle_couple_dissolution();
ALTER TABLE couple_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_shared_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view invitations they sent or received" ON couple_invitations
    FOR SELECT USING (
        from_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        OR to_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        OR to_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );
CREATE POLICY "Users can create invitations" ON couple_invitations
    FOR INSERT WITH CHECK (
        from_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );
CREATE POLICY "Users can update their received invitations" ON couple_invitations
    FOR UPDATE USING (
        to_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        OR from_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );
CREATE POLICY "Couple members can view couple users" ON couple_users
    FOR SELECT USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
    );
CREATE POLICY "Couple members can view payments" ON couple_payments
    FOR SELECT USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
    );
CREATE POLICY "Couple members can manage shared albums" ON couple_shared_albums
    FOR ALL USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
    );
CREATE POLICY "Couple members can manage album photos" ON couple_album_photos
    FOR ALL USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
    );
CREATE POLICY "Couple members can view diary entries" ON couple_diary_entries
    FOR SELECT USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
        AND (
            visible_to = 'both'
            OR (visible_to = 'author_only' AND author_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
            OR (visible_to = 'partner_only' AND author_id != (SELECT id FROM users WHERE auth_id = auth.uid()))
        )
    );
CREATE POLICY "Couple members can create diary entries" ON couple_diary_entries
    FOR INSERT WITH CHECK (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
        AND author_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );
CREATE POLICY "Authors can update their diary entries" ON couple_diary_entries
    FOR UPDATE USING (
        author_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );
CREATE POLICY "Couple members can manage game sessions" ON couple_game_sessions
    FOR ALL USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
    );
CREATE POLICY "Couple members can manage settings" ON couple_settings
    FOR ALL USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
    );
INSERT INTO couple_games (name, description, category, min_duration_minutes, max_duration_minutes, difficulty_level) VALUES
('Perguntas Íntimas', 'Descubram mais um sobre o outro com perguntas profundas', 'Conhecimento', 15, 30, 2),
('Desafio da Memória', 'Testem a memória sobre momentos especiais do relacionamento', 'Memória', 10, 20, 3),
('Jogo da Sinceridade', 'Verdade ou consequência para casais', 'Diversão', 20, 45, 2),
('Quiz do Amor', 'Perguntas sobre preferências e sonhos', 'Conhecimento', 15, 25, 1),
('Caça ao Tesouro Romântico', 'Encontrem pistas escondidas pela casa', 'Aventura', 30, 60, 4),
('Planos Futuros', 'Conversem sobre objetivos e sonhos compartilhados', 'Planejamento', 25, 40, 3);
GRANT ALL ON couple_invitations TO authenticated;
GRANT ALL ON couple_users TO authenticated;
GRANT ALL ON couple_payments TO authenticated;
GRANT ALL ON couple_shared_albums TO authenticated;
GRANT ALL ON couple_album_photos TO authenticated;
GRANT ALL ON couple_diary_entries TO authenticated;
GRANT ALL ON couple_games TO authenticated, anon;
GRANT ALL ON couple_game_sessions TO authenticated;
GRANT ALL ON couple_settings TO authenticated;
GRANT ALL ON couple_invitations TO service_role;
GRANT ALL ON couple_users TO service_role;
GRANT ALL ON couple_payments TO service_role;
GRANT ALL ON couple_shared_albums TO service_role;
GRANT ALL ON couple_album_photos TO service_role;
GRANT ALL ON couple_diary_entries TO service_role;
GRANT ALL ON couple_games TO service_role;
GRANT ALL ON couple_game_sessions TO service_role;
GRANT ALL ON couple_settings TO service_role;
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'message', 'post')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    entity_id UUID, -- ID of related entity (post, comment, etc)
    entity_type VARCHAR(50), -- Type of entity (post, comment, message, follow)
    action_taken BOOLEAN DEFAULT FALSE, -- For follow notifications - if user followed back
    metadata JSONB DEFAULT '{}', -- Additional data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_from_user_id ON notifications(from_user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_entity ON notifications(entity_id, entity_type);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE
    USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT
    WITH CHECK (true);
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_from_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS notifications AS $$
DECLARE
    v_notification notifications;
BEGIN
    INSERT INTO notifications (
        user_id,
        from_user_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        metadata
    ) VALUES (
        p_user_id,
        p_from_user_id,
        p_type,
        p_title,
        p_message,
        p_entity_id,
        p_entity_type,
        p_metadata
    ) RETURNING * INTO v_notification;
    RETURN v_notification;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION notify_on_like() RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_liker_name TEXT;
BEGIN
    SELECT user_id INTO v_post_owner_id FROM posts WHERE id = NEW.post_id;
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    SELECT COALESCE(name, username) INTO v_liker_name FROM users WHERE id = NEW.user_id;
    PERFORM create_notification(
        v_post_owner_id,
        NEW.user_id,
        'like',
        'Nova curtida',
        v_liker_name || ' curtiu seu post',
        NEW.post_id,
        'post'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION notify_on_comment() RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_commenter_name TEXT;
BEGIN
    SELECT user_id INTO v_post_owner_id FROM posts WHERE id = NEW.post_id;
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    SELECT COALESCE(name, username) INTO v_commenter_name FROM users WHERE id = NEW.user_id;
    PERFORM create_notification(
        v_post_owner_id,
        NEW.user_id,
        'comment',
        'Novo comentário',
        v_commenter_name || ' comentou em seu post',
        NEW.post_id,
        'post'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION notify_on_follow() RETURNS TRIGGER AS $$
DECLARE
    v_follower_name TEXT;
BEGIN
    SELECT COALESCE(name, username) INTO v_follower_name FROM users WHERE id = NEW.follower_id;
    PERFORM create_notification(
        NEW.following_id,
        NEW.follower_id,
        'follow',
        'Novo seguidor',
        v_follower_name || ' começou a seguir você',
        NEW.follower_id,
        'follow'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION notify_on_message() RETURNS TRIGGER AS $$
DECLARE
    v_sender_name TEXT;
    v_conversation_participant UUID;
BEGIN
    SELECT COALESCE(name, username) INTO v_sender_name FROM users WHERE id = NEW.sender_id;
    SELECT user_id INTO v_conversation_participant 
    FROM conversation_participants 
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id
    LIMIT 1;
    IF v_conversation_participant IS NOT NULL THEN
        PERFORM create_notification(
            v_conversation_participant,
            NEW.sender_id,
            'message',
            'Nova mensagem',
            v_sender_name || ' enviou uma mensagem',
            NEW.conversation_id,
            'message'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
    CREATE TYPE account_type AS ENUM ('personal', 'business');
  END IF;
END $$;
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_type account_type DEFAULT 'personal',
ADD COLUMN IF NOT EXISTS business_id UUID,
ADD COLUMN IF NOT EXISTS admin_id UUID;
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_users_business' 
    AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT fk_users_business
    FOREIGN KEY (business_id) 
    REFERENCES businesses(id) 
    ON DELETE SET NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE POLICY "Users can view their own account type" ON users
  FOR SELECT
  USING (auth.uid()::text = auth_id::text OR auth.uid()::text = id::text);
DROP POLICY IF EXISTS "View posts based on visibility" ON public.posts;
DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "posts_select_public" ON public.posts;
CREATE POLICY "Anyone can view public posts"
  ON public.posts
  FOR SELECT
  USING (visibility = 'public');
CREATE POLICY "Users can view own posts"
  ON public.posts
  FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view public posts" ON posts;
DROP POLICY IF EXISTS "Users can create own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "posts_select_all" ON posts
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "posts_insert_own" ON posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON posts
    FOR DELETE
    USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "stories_all_authenticated" ON stories;
DROP POLICY IF EXISTS "story_limits_all_authenticated" ON story_daily_limits;
CREATE POLICY "stories_insert_own" ON stories
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_select_active" ON stories
    FOR SELECT
    USING (
        expires_at > NOW()
        AND auth.uid() IS NOT NULL
    );
CREATE POLICY "stories_update_own" ON stories
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_delete_own" ON stories
    FOR DELETE
    USING (auth.uid() = user_id);
CREATE POLICY "story_limits_insert_own" ON story_daily_limits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "story_limits_select_own" ON story_daily_limits
    FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "story_limits_update_own" ON story_daily_limits
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create story views" ON story_views;
DROP POLICY IF EXISTS "Users can view own story views" ON story_views;
CREATE POLICY "story_views_insert_authenticated" ON story_views
    FOR INSERT
    WITH CHECK (auth.uid() = viewer_id);
CREATE POLICY "story_views_select_related" ON story_views
    FOR SELECT
    USING (
        auth.uid() = viewer_id
        OR auth.uid() IN (SELECT user_id FROM stories WHERE id = story_views.story_id)
    );
DROP POLICY IF EXISTS "Users can send story replies" ON story_replies;
DROP POLICY IF EXISTS "Users can view story replies" ON story_replies;
CREATE POLICY "story_replies_insert_authenticated" ON story_replies
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "story_replies_select_related" ON story_replies
    FOR SELECT
    USING (
        auth.uid() = sender_id
        OR auth.uid() = receiver_id
    );
DROP POLICY IF EXISTS "Users can create story boosts" ON story_boosts;
DROP POLICY IF EXISTS "Users can view story boosts" ON story_boosts;
CREATE POLICY "story_boosts_insert_own" ON story_boosts
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (SELECT user_id FROM stories WHERE id = story_id)
    );
CREATE POLICY "story_boosts_select_all" ON story_boosts
    FOR SELECT
    USING (true);
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
CREATE POLICY "user_credits_all_own" ON user_credits
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own transactions" ON user_credit_transactions;
CREATE POLICY "credit_transactions_select_own" ON user_credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Everyone can view seals" ON profile_seals;
CREATE POLICY "profile_seals_select_all" ON profile_seals
    FOR SELECT
    USING (true);
DROP POLICY IF EXISTS "Users can view profile seals" ON user_profile_seals;
CREATE POLICY "user_profile_seals_select_all" ON user_profile_seals
    FOR SELECT
    USING (true);
CREATE POLICY "user_profile_seals_insert_authenticated" ON user_profile_seals
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
CREATE OR REPLACE FUNCTION can_user_post_story(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_plan TEXT;
    v_is_verified BOOLEAN;
    v_today_count INTEGER;
    v_daily_limit INTEGER;
BEGIN
    SELECT premium_type, is_verified
    INTO v_user_plan, v_is_verified
    FROM users
    WHERE id = p_user_id;
    IF v_user_plan = 'free' AND NOT v_is_verified THEN
        RETURN FALSE;
    END IF;
    SELECT stories_posted_today
    INTO v_today_count
    FROM story_daily_limits
    WHERE user_id = p_user_id
    AND date = CURRENT_DATE;
    IF v_today_count IS NULL THEN
        v_today_count := 0;
    END IF;
    CASE v_user_plan
        WHEN 'free' THEN
            v_daily_limit := CASE WHEN v_is_verified THEN 3 ELSE 0 END;
        WHEN 'gold' THEN
            v_daily_limit := CASE WHEN v_is_verified THEN 10 ELSE 5 END;
        WHEN 'diamond', 'couple' THEN
            v_daily_limit := CASE WHEN v_is_verified THEN 999 ELSE 10 END;
        ELSE
            v_daily_limit := 0;
    END CASE;
    RETURN v_today_count < v_daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION check_story_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT can_user_post_story(NEW.user_id) THEN
        RAISE EXCEPTION 'Daily story limit reached';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS check_story_limit_trigger ON stories;
CREATE TRIGGER check_story_limit_trigger
    BEFORE INSERT ON stories
    FOR EACH ROW
    EXECUTE FUNCTION check_story_limit();
GRANT ALL ON posts TO authenticated;
GRANT ALL ON stories TO authenticated;
GRANT ALL ON story_daily_limits TO authenticated;
GRANT ALL ON story_views TO authenticated;
GRANT ALL ON story_replies TO authenticated;
GRANT ALL ON story_boosts TO authenticated;
GRANT ALL ON user_credits TO authenticated;
GRANT ALL ON user_credit_transactions TO authenticated;
GRANT ALL ON profile_seals TO authenticated;
GRANT ALL ON user_profile_seals TO authenticated;
GRANT ALL ON trending_boosts TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_post_story(UUID) TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
DROP POLICY IF EXISTS "Users can create own stories" ON stories;
DROP POLICY IF EXISTS "Users can view active stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can view stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
DROP POLICY IF EXISTS "Everyone can view boosted stories" ON stories;
CREATE POLICY "stories_insert_own" ON stories
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_select_all" ON stories
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "stories_update_own" ON stories
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_delete_own" ON stories
    FOR DELETE 
    USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can update own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can insert story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can manage own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Authenticated users can manage story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can access story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can view story limits for triggers" ON story_daily_limits;
CREATE POLICY "story_limits_all_own" ON story_daily_limits
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view stories" ON story_views;
DROP POLICY IF EXISTS "Story owners can see who viewed" ON story_views;
DROP POLICY IF EXISTS "Users can create story views" ON story_views;
DROP POLICY IF EXISTS "Story owners and viewers can see views" ON story_views;
CREATE POLICY "story_views_insert_own" ON story_views
    FOR INSERT 
    WITH CHECK (auth.uid() = viewer_id);
CREATE POLICY "story_views_select_own_or_owner" ON story_views
    FOR SELECT 
    USING (
        auth.uid() = viewer_id 
        OR EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_views.story_id 
            AND stories.user_id = auth.uid()
        )
    );
CREATE POLICY "story_views_update_own" ON story_views
    FOR UPDATE 
    USING (auth.uid() = viewer_id)
    WITH CHECK (auth.uid() = viewer_id);
DROP POLICY IF EXISTS "Users can send replies" ON story_replies;
DROP POLICY IF EXISTS "Users can view own conversations" ON story_replies;
CREATE POLICY "story_replies_insert_own" ON story_replies
    FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "story_replies_select_own_or_owner" ON story_replies
    FOR SELECT 
    USING (
        auth.uid() = sender_id 
        OR EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_replies.story_id 
            AND stories.user_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can create own boosts" ON story_boosts;
DROP POLICY IF EXISTS "Users can view active boosts" ON story_boosts;
CREATE POLICY "story_boosts_insert_own" ON story_boosts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "story_boosts_select_all" ON story_boosts
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "System can insert user credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can manage own credits" ON user_credits;
DROP POLICY IF EXISTS "System can initialize credits" ON user_credits;
CREATE POLICY "user_credits_all_own" ON user_credits
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own transactions" ON user_credit_transactions;
DROP POLICY IF EXISTS "System can insert credit transactions" ON user_credit_transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON user_credit_transactions;
DROP POLICY IF EXISTS "System can create transactions" ON user_credit_transactions;
CREATE POLICY "credit_transactions_insert_own" ON user_credit_transactions
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "credit_transactions_select_own" ON user_credit_transactions
    FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() = other_user_id);
DROP POLICY IF EXISTS "Everyone can view available seals" ON profile_seals;
CREATE POLICY "profile_seals_select_available" ON profile_seals
    FOR SELECT 
    USING (auth.uid() IS NOT NULL AND is_available = true);
DROP POLICY IF EXISTS "Users can view profile seals" ON user_profile_seals;
DROP POLICY IF EXISTS "Users can gift seals" ON user_profile_seals;
CREATE POLICY "user_seals_insert_as_sender" ON user_profile_seals
    FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "user_seals_select_visible_or_own" ON user_profile_seals
    FOR SELECT 
    USING (
        is_displayed = true 
        OR auth.uid() = recipient_id 
        OR auth.uid() = sender_id
    );
DROP POLICY IF EXISTS "Users can create own trending boosts" ON trending_boosts;
DROP POLICY IF EXISTS "Users can view own trending boosts" ON trending_boosts;
CREATE POLICY "trending_boosts_insert_own" ON trending_boosts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trending_boosts_select_own" ON trending_boosts
    FOR SELECT 
    USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION check_story_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_plan RECORD;
    daily_limit INTEGER;
    current_count INTEGER;
BEGIN
    SELECT premium_type, is_verified 
    INTO user_plan
    FROM users 
    WHERE id = NEW.user_id;
    CASE user_plan.premium_type
        WHEN 'free' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 3 ELSE 0 END;
        WHEN 'gold' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 10 ELSE 5 END;
        WHEN 'diamond' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 999 ELSE 10 END;
        WHEN 'couple' THEN
            daily_limit := CASE WHEN user_plan.is_verified THEN 999 ELSE 10 END;
        ELSE
            daily_limit := 0;
    END CASE;
    INSERT INTO story_daily_limits (user_id, daily_limit, stories_posted_today)
    VALUES (NEW.user_id, daily_limit, 0)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        daily_limit = daily_limit,
        stories_posted_today = CASE 
            WHEN story_daily_limits.last_reset_date < CURRENT_DATE THEN 0
            ELSE story_daily_limits.stories_posted_today
        END,
        last_reset_date = CASE 
            WHEN story_daily_limits.last_reset_date < CURRENT_DATE THEN CURRENT_DATE
            ELSE story_daily_limits.last_reset_date
        END,
        updated_at = NOW();
    SELECT stories_posted_today INTO current_count
    FROM story_daily_limits
    WHERE user_id = NEW.user_id;
    IF current_count >= daily_limit THEN
        RAISE EXCEPTION 'Daily story limit reached';
    END IF;
    UPDATE story_daily_limits
    SET 
        stories_posted_today = stories_posted_today + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS check_story_limit_trigger ON stories;
CREATE TRIGGER check_story_limit_trigger
BEFORE INSERT ON stories
FOR EACH ROW EXECUTE FUNCTION check_story_limit();
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON posts', r.policyname);
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON stories', r.policyname);
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_daily_limits')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_daily_limits', r.policyname);
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_views')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_views', r.policyname);
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_replies')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_replies', r.policyname);
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_boosts')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_boosts', r.policyname);
    END LOOP;
END $$;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_boosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_select" ON posts
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "posts_insert" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON posts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON posts
    FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "stories_select" ON stories
    FOR SELECT USING (
        expires_at > NOW() 
        AND auth.uid() IS NOT NULL
    );
CREATE POLICY "stories_insert" ON stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_update" ON stories
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "stories_delete" ON stories
    FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "story_limits_all" ON story_daily_limits
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "story_views_insert" ON story_views
    FOR INSERT WITH CHECK (auth.uid() = viewer_id);
CREATE POLICY "story_views_select" ON story_views
    FOR SELECT USING (
        auth.uid() = viewer_id
        OR auth.uid() IN (
            SELECT user_id FROM stories WHERE id = story_views.story_id
        )
    );
CREATE POLICY "story_replies_insert" ON story_replies
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "story_replies_select" ON story_replies
    FOR SELECT USING (
        auth.uid() = sender_id
        OR auth.uid() IN (
            SELECT user_id FROM stories WHERE id = story_replies.story_id
        )
    );
CREATE POLICY "story_boosts_insert" ON story_boosts
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM stories WHERE id = story_id
        )
    );
CREATE POLICY "story_boosts_select" ON story_boosts
    FOR SELECT USING (auth.uid() IS NOT NULL);
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('posts', 'stories', 'story_daily_limits', 'story_views', 'story_replies', 'story_boosts')
ORDER BY tablename;
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON posts', r.policyname);
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON stories', r.policyname);
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_daily_limits')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON story_daily_limits', r.policyname);
    END LOOP;
END $$;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_boosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_all" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "stories_all" ON stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "story_limits_all" ON story_daily_limits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "story_views_all" ON story_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "story_replies_all" ON story_replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "story_boosts_all" ON story_boosts FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('posts', 'stories', 'story_daily_limits');
DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON public.post_likes;
DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON public.post_comments;
DROP TRIGGER IF EXISTS update_post_shares_count_trigger ON public.post_shares;
DROP TRIGGER IF EXISTS update_post_saves_count_trigger ON public.post_saves;
DROP FUNCTION IF EXISTS update_post_likes_count();
DROP FUNCTION IF EXISTS update_post_comments_count();
DROP FUNCTION IF EXISTS update_post_shares_count();
DROP FUNCTION IF EXISTS update_post_saves_count();
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET shares_count = COALESCE(shares_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET saves_count = COALESCE(saves_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET saves_count = GREATEST(COALESCE(saves_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
CREATE TRIGGER update_post_shares_count_trigger
AFTER INSERT OR DELETE ON public.post_shares
FOR EACH ROW EXECUTE FUNCTION update_post_shares_count();
CREATE TRIGGER update_post_saves_count_trigger
AFTER INSERT OR DELETE ON public.post_saves
FOR EACH ROW EXECUTE FUNCTION update_post_saves_count();
UPDATE public.posts p
SET 
  likes_count = COALESCE((SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id), 0),
  comments_count = COALESCE((SELECT COUNT(*) FROM public.post_comments WHERE post_id = p.id), 0),
  shares_count = COALESCE((SELECT COUNT(*) FROM public.post_shares WHERE post_id = p.id), 0),
  saves_count = COALESCE((SELECT COUNT(*) FROM public.post_saves WHERE post_id = p.id), 0);
CREATE OR REPLACE FUNCTION update_collection_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.collection_id IS NOT NULL THEN
      UPDATE public.saved_collections
      SET posts_count = COALESCE(posts_count, 0) + 1
      WHERE id = NEW.collection_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.collection_id IS NOT NULL THEN
      UPDATE public.saved_collections
      SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0)
      WHERE id = OLD.collection_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.collection_id IS DISTINCT FROM NEW.collection_id THEN
      IF OLD.collection_id IS NOT NULL THEN
        UPDATE public.saved_collections
        SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0)
        WHERE id = OLD.collection_id;
      END IF;
      IF NEW.collection_id IS NOT NULL THEN
        UPDATE public.saved_collections
        SET posts_count = COALESCE(posts_count, 0) + 1
        WHERE id = NEW.collection_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS update_collection_posts_count_trigger ON public.post_saves;
CREATE TRIGGER update_collection_posts_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.post_saves
FOR EACH ROW EXECUTE FUNCTION update_collection_posts_count();
DROP POLICY IF EXISTS "Users can view basic profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can view limited profiles"
  ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR
    (
      auth.uid() IS NOT NULL 
      AND id != auth.uid()
      AND NOT EXISTS (
        SELECT 1 FROM user_blocks 
        WHERE blocker_id = users.id 
        AND blocked_id = auth.uid()
      )
    )
  );
CREATE POLICY "Users can update own profile with restrictions"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      email = OLD.email
      AND is_verified = OLD.is_verified
      AND role = OLD.role
      AND created_at = OLD.created_at
      AND (
        premium_type = OLD.premium_type
        OR EXISTS (
          SELECT 1 FROM subscriptions
          WHERE user_id = auth.uid()
          AND status = 'active'
          AND plan_type = NEW.premium_type
        )
      )
    )
  );
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can send messages in conversations" ON public.messages;
CREATE POLICY "Users can view unblocked conversations"
  ON public.conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1 FROM conversation_participants cp1
      JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
      JOIN user_blocks ub ON (
        (ub.blocker_id = cp1.user_id AND ub.blocked_id = cp2.user_id)
        OR (ub.blocker_id = cp2.user_id AND ub.blocked_id = cp1.user_id)
      )
      WHERE cp1.conversation_id = conversations.id
      AND cp1.user_id = auth.uid()
      AND cp2.user_id != auth.uid()
    )
  );
CREATE POLICY "Users can send messages based on plan"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
    AND (
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND premium_type IN ('gold', 'diamond', 'couple')
      )
      OR EXISTS (
        SELECT 1 FROM conversations c
        JOIN users u ON u.id = c.initiated_by
        WHERE c.id = messages.conversation_id
        AND c.initiated_by != auth.uid()
        AND u.premium_type IN ('gold', 'diamond', 'couple')
      )
    )
    AND (
      SELECT COUNT(*) FROM messages
      WHERE sender_id = auth.uid()
      AND created_at >= CURRENT_DATE
    ) < CASE
      WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND premium_type = 'diamond') THEN 1000
      WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND premium_type = 'gold' AND is_verified = true) THEN 200
      WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND premium_type = 'gold') THEN 10
      ELSE 0
    END
  );
DROP POLICY IF EXISTS "Anyone can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "View posts with security checks"
  ON public.posts
  FOR SELECT
  USING (
    (visibility = 'public' AND NOT is_paid_content)
    OR user_id = auth.uid()
    OR (
      visibility = 'followers'
      AND EXISTS (
        SELECT 1 FROM user_follows
        WHERE follower_id = auth.uid()
        AND following_id = posts.user_id
      )
    )
    OR (
      is_paid_content = true
      AND EXISTS (
        SELECT 1 FROM paid_content_purchases
        WHERE user_id = auth.uid()
        AND post_id = posts.id
        AND (expires_at IS NULL OR expires_at > NOW())
      )
    )
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks
      WHERE blocker_id = auth.uid()
      AND blocked_id = posts.user_id
    )
  );
CREATE POLICY "Create posts with plan limits"
  ON public.posts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      SELECT COUNT(*) FROM posts
      WHERE user_id = auth.uid()
      AND created_at >= CURRENT_DATE
    ) < CASE
      WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND premium_type IN ('diamond', 'couple')) THEN 50
      WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND premium_type = 'gold') THEN 10
      ELSE 3
    END
    AND (
      (media_urls IS NULL OR array_length(media_urls, 1) = 0)
      OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND premium_type IN ('gold', 'diamond', 'couple')
      )
    )
    AND (
      is_paid_content = false
      OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND premium_type IN ('diamond', 'couple')
      )
    )
  );
DROP POLICY IF EXISTS "Users can create own verifications" ON public.user_verifications;
CREATE POLICY "Submit verification with limits"
  ON public.user_verifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM user_verifications
      WHERE user_id = auth.uid()
      AND status = 'pending'
    )
    AND (
      SELECT COUNT(*) FROM user_verifications
      WHERE user_id = auth.uid()
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    ) < 3
    AND (
      EXTRACT(YEAR FROM AGE(birth_date)) >= 18
    )
  );
DROP POLICY IF EXISTS "Users can create stories" ON public.stories;
CREATE POLICY "Create stories based on plan"
  ON public.stories
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      SELECT COUNT(*) FROM stories
      WHERE user_id = auth.uid()
      AND created_at >= CURRENT_DATE
    ) < CASE
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type = 'free' 
        AND is_verified = true
      ) THEN 3
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type = 'gold' 
        AND is_verified = false
      ) THEN 5
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type = 'gold' 
        AND is_verified = true
      ) THEN 10
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type IN ('diamond', 'couple') 
        AND is_verified = true
      ) THEN 999 -- Effectively unlimited
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type IN ('diamond', 'couple')
      ) THEN 10
      ELSE 0
    END
  );
CREATE POLICY "View own transactions only"
  ON public.user_credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "View own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE POLICY "Admins can view all verifications"
  ON public.user_verifications
  FOR SELECT
  USING (is_admin());
CREATE POLICY "Admins can update verifications"
  ON public.user_verifications
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  event_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_security_audit_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_security_audit_event_type ON security_audit_logs(event_type);
CREATE INDEX idx_security_audit_created_at ON security_audit_logs(created_at);
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit logs"
  ON security_audit_logs
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "System can insert audit logs"
  ON security_audit_logs
  FOR INSERT
  WITH CHECK (false); -- Prevents client-side inserts
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_details JSONB DEFAULT '{}'::JSONB,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO security_audit_logs (
    user_id,
    event_type,
    event_details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;
COMMIT;