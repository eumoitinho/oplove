-- Create communities table for adult communities system
CREATE TABLE communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar_url TEXT,
  cover_url TEXT,
  
  -- Theme and category
  theme TEXT NOT NULL CHECK (theme IN ('cuckold', 'bdsm', 'swinger', 'fetish')),
  is_official BOOLEAN DEFAULT false,
  is_adult BOOLEAN DEFAULT true,
  requires_verification BOOLEAN DEFAULT true,
  
  -- Rules and guidelines
  rules JSONB DEFAULT '[]'::jsonb,
  welcome_message TEXT,
  
  -- Stats
  members_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  
  -- Settings
  is_private BOOLEAN DEFAULT false,
  auto_approve_members BOOLEAN DEFAULT true,
  allow_member_posts BOOLEAN DEFAULT true,
  
  -- Creator
  created_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community members table
CREATE TABLE community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Member role
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  
  -- Member status
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'banned')),
  
  -- Activity
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  posts_count INTEGER DEFAULT 0,
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(community_id, user_id)
);

-- Create community posts table
CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Post content
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]'::jsonb,
  
  -- Stats
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Visibility
  is_pinned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community post interactions table
CREATE TABLE community_post_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Interaction type
  type TEXT NOT NULL CHECK (type IN ('like', 'view')),
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(post_id, user_id, type)
);

-- Create community post comments table
CREATE TABLE community_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_post_comments(id) ON DELETE CASCADE,
  
  -- Comment content
  content TEXT NOT NULL,
  
  -- Stats
  likes_count INTEGER DEFAULT 0,
  
  -- Visibility
  is_hidden BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_theme ON communities(theme);
CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_posts_community ON community_posts(community_id);
CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities
CREATE POLICY "Anyone can view public communities" ON communities
  FOR SELECT USING (true);

CREATE POLICY "Only admins can create communities" ON communities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update communities" ON communities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- RLS Policies for community_members
CREATE POLICY "Users can view community members" ON community_members
  FOR SELECT USING (
    -- User is a member of the community
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Verified users can join communities" ON community_members
  FOR INSERT WITH CHECK (
    -- User must be verified to join adult communities
    EXISTS (
      SELECT 1 FROM users u
      JOIN communities c ON c.id = community_members.community_id
      WHERE u.id = auth.uid()
      AND (NOT c.requires_verification OR u.is_verified = true)
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can leave communities" ON community_members
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_posts
CREATE POLICY "Community members can view posts" ON community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_posts.community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Active members can create posts" ON community_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members cm
      JOIN communities c ON c.id = cm.community_id
      WHERE cm.community_id = community_posts.community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND c.allow_member_posts = true
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can update own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for interactions
CREATE POLICY "Members can view interactions" ON community_post_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN community_members cm ON cm.community_id = cp.community_id
      WHERE cp.id = community_post_interactions.post_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Members can interact with posts" ON community_post_interactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN community_members cm ON cm.community_id = cp.community_id
      WHERE cp.id = community_post_interactions.post_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can remove own interactions" ON community_post_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Members can view comments" ON community_post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN community_members cm ON cm.community_id = cp.community_id
      WHERE cp.id = community_post_comments.post_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Members can create comments" ON community_post_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN community_members cm ON cm.community_id = cp.community_id
      WHERE cp.id = community_post_comments.post_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can update own comments" ON community_post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON community_post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Functions for stats updates
CREATE OR REPLACE FUNCTION update_community_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities 
    SET members_count = members_count + 1 
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities 
    SET members_count = GREATEST(0, members_count - 1) 
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_members_count_trigger
AFTER INSERT OR DELETE ON community_members
FOR EACH ROW
EXECUTE FUNCTION update_community_members_count();

CREATE OR REPLACE FUNCTION update_community_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities 
    SET posts_count = posts_count + 1 
    WHERE id = NEW.community_id;
    
    UPDATE community_members
    SET posts_count = posts_count + 1
    WHERE community_id = NEW.community_id AND user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities 
    SET posts_count = GREATEST(0, posts_count - 1) 
    WHERE id = OLD.community_id;
    
    UPDATE community_members
    SET posts_count = GREATEST(0, posts_count - 1)
    WHERE community_id = OLD.community_id AND user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_posts_count_trigger
AFTER INSERT OR DELETE ON community_posts
FOR EACH ROW
EXECUTE FUNCTION update_community_posts_count();

-- Insert the 4 official adult communities
INSERT INTO communities (slug, name, description, theme, is_official, requires_verification, rules, avatar_url) VALUES
  (
    'cuckold-brasil',
    'Cuckold Brasil',
    'Comunidade oficial para casais e indivíduos interessados no estilo de vida cuckold. Um espaço seguro para compartilhar experiências, fantasias e conhecer pessoas com interesses similares.',
    'cuckold',
    true,
    true,
    '[
      "Respeito é fundamental - Sem julgamentos ou ofensas",
      "Apenas maiores de 18 anos verificados",
      "Conteúdo deve ser relacionado ao tema cuckold",
      "Proibido compartilhar conteúdo sem consentimento",
      "Seja discreto - Proteja a privacidade de todos"
    ]'::jsonb,
    'https://openlove.com.br/avatars/cuckold-brasil.jpg'
  ),
  (
    'bdsm-brasil',
    'BDSM Brasil',
    'Comunidade oficial para praticantes e interessados em BDSM. Explore com segurança o mundo da dominação, submissão, disciplina, sadismo e masoquismo.',
    'bdsm',
    true,
    true,
    '[
      "SSC - São, Seguro e Consensual sempre",
      "Respeite os limites de todos",
      "Apenas maiores de 18 anos verificados",
      "Educação e segurança em primeiro lugar",
      "Proibido conteúdo não consensual ou ilegal"
    ]'::jsonb,
    'https://openlove.com.br/avatars/bdsm-brasil.jpg'
  ),
  (
    'swing-brasil',
    'Swing Brasil',
    'Comunidade oficial para casais e solteiros(as) adeptos do swing. Conecte-se com outros casais liberais e explore novas experiências.',
    'swinger',
    true,
    true,
    '[
      "Respeito aos casais e suas regras",
      "Apenas maiores de 18 anos verificados",
      "Seja discreto e preserve a privacidade",
      "Não significa não - Respeite sempre",
      "Higiene e saúde são prioridades"
    ]'::jsonb,
    'https://openlove.com.br/avatars/swing-brasil.jpg'
  ),
  (
    'fetiches-brasil',
    'Fetiches Brasil',
    'Comunidade oficial para explorar e compartilhar diversos fetiches. Um ambiente aberto e sem julgamentos para todas as preferências.',
    'fetish',
    true,
    true,
    '[
      "Sem kink shaming - Respeite todos os fetiches",
      "Apenas maiores de 18 anos verificados",
      "Conteúdo deve ser legal e consensual",
      "Use tags apropriadas em seus posts",
      "Mantenha discussões respeitosas"
    ]'::jsonb,
    'https://openlove.com.br/avatars/fetiches-brasil.jpg'
  );

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_community_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamp updates
CREATE TRIGGER update_communities_timestamp
BEFORE UPDATE ON communities
FOR EACH ROW
EXECUTE FUNCTION update_community_timestamp();

CREATE TRIGGER update_community_posts_timestamp
BEFORE UPDATE ON community_posts
FOR EACH ROW
EXECUTE FUNCTION update_community_timestamp();

CREATE TRIGGER update_community_post_comments_timestamp
BEFORE UPDATE ON community_post_comments
FOR EACH ROW
EXECUTE FUNCTION update_community_timestamp();