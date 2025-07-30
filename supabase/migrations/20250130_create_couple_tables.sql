-- =====================================================
-- COUPLE SYSTEM TABLES
-- =====================================================

-- Create couple_invitations table
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
    
    -- Ensure at least one target is specified
    CONSTRAINT check_invitation_target CHECK (
        to_user_id IS NOT NULL OR to_email IS NOT NULL OR to_phone IS NOT NULL
    ),
    
    -- Prevent duplicate pending invitations
    CONSTRAINT unique_pending_invitation UNIQUE (from_user_id, to_user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create couple_users junction table
CREATE TABLE IF NOT EXISTS couple_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'secondary' CHECK (role IN ('primary', 'secondary')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_couple_user UNIQUE (couple_id, user_id),
    CONSTRAINT unique_primary_role_per_couple UNIQUE (couple_id, role) DEFERRABLE INITIALLY DEFERRED
);

-- Create couple_payments table for subscription tracking
CREATE TABLE IF NOT EXISTS couple_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    payer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    
    -- Payment details
    amount DECIMAL(10, 2) NOT NULL DEFAULT 69.90,
    currency VARCHAR(3) DEFAULT 'BRL',
    payment_method payment_method NOT NULL,
    provider payment_provider NOT NULL,
    provider_subscription_id VARCHAR(255),
    
    -- Status and periods
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create couple_shared_albums table
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

-- Create couple_album_photos table
CREATE TABLE IF NOT EXISTS couple_album_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID NOT NULL REFERENCES couple_shared_albums(id) ON DELETE CASCADE,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Photo details
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Metadata
    file_size INTEGER,
    file_type VARCHAR(20),
    width INTEGER,
    height INTEGER,
    
    -- Timestamps
    taken_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create couple_diary_entries table
CREATE TABLE IF NOT EXISTS couple_diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Entry details
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    mood VARCHAR(50),
    date DATE NOT NULL,
    
    -- Privacy
    is_private BOOLEAN DEFAULT false,
    visible_to VARCHAR(20) DEFAULT 'both' CHECK (visible_to IN ('both', 'author_only', 'partner_only')),
    
    -- Media
    photos TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create couple_games table
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

-- Create couple_game_sessions table
CREATE TABLE IF NOT EXISTS couple_game_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES couple_games(id) ON DELETE CASCADE,
    
    -- Session details
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    score_user1 INTEGER DEFAULT 0,
    score_user2 INTEGER DEFAULT 0,
    current_round INTEGER DEFAULT 1,
    total_rounds INTEGER DEFAULT 1,
    
    -- Game data
    game_data JSONB DEFAULT '{}',
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create couple_settings table
CREATE TABLE IF NOT EXISTS couple_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    
    -- Sharing settings
    shared_profile BOOLEAN DEFAULT true,
    shared_stats BOOLEAN DEFAULT true,
    allow_partner_posting BOOLEAN DEFAULT false,
    auto_tag_partner BOOLEAN DEFAULT false,
    shared_calendar BOOLEAN DEFAULT true,
    
    -- Notification settings
    notifications JSONB DEFAULT '{
        "partner_posts": true,
        "anniversary_reminders": true,
        "couple_games": true,
        "shared_memories": true
    }'::jsonb,
    
    -- Privacy settings
    privacy JSONB DEFAULT '{
        "album_visibility": "couple_only",
        "diary_access": "both",
        "stats_sharing": true
    }'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_couple_settings UNIQUE (couple_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Couple invitations indexes
CREATE INDEX idx_couple_invitations_from_user ON couple_invitations(from_user_id);
CREATE INDEX idx_couple_invitations_to_user ON couple_invitations(to_user_id);
CREATE INDEX idx_couple_invitations_status ON couple_invitations(status);
CREATE INDEX idx_couple_invitations_expires ON couple_invitations(expires_at) WHERE status = 'pending';

-- Couple users indexes
CREATE INDEX idx_couple_users_couple ON couple_users(couple_id);
CREATE INDEX idx_couple_users_user ON couple_users(user_id);

-- Couple payments indexes
CREATE INDEX idx_couple_payments_couple ON couple_payments(couple_id);
CREATE INDEX idx_couple_payments_payer ON couple_payments(payer_user_id);
CREATE INDEX idx_couple_payments_status ON couple_payments(status);

-- Album indexes
CREATE INDEX idx_couple_albums_couple ON couple_shared_albums(couple_id);
CREATE INDEX idx_couple_album_photos_album ON couple_album_photos(album_id);
CREATE INDEX idx_couple_album_photos_couple ON couple_album_photos(couple_id);

-- Diary indexes
CREATE INDEX idx_couple_diary_couple ON couple_diary_entries(couple_id);
CREATE INDEX idx_couple_diary_author ON couple_diary_entries(author_id);
CREATE INDEX idx_couple_diary_date ON couple_diary_entries(date DESC);

-- Game indexes
CREATE INDEX idx_couple_game_sessions_couple ON couple_game_sessions(couple_id);
CREATE INDEX idx_couple_game_sessions_game ON couple_game_sessions(game_id);
CREATE INDEX idx_couple_game_sessions_status ON couple_game_sessions(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp triggers
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

-- Function to automatically create couple settings when couple is created
CREATE OR REPLACE FUNCTION create_couple_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO couple_settings (couple_id)
    VALUES (NEW.id);
    
    -- Also create default shared album
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

-- Function to sync couple premium status
CREATE OR REPLACE FUNCTION sync_couple_premium_status()
RETURNS TRIGGER AS $$
DECLARE
    couple_users_record RECORD;
BEGIN
    -- If user's premium_type changed to 'couple', sync with partner
    IF NEW.premium_type = 'couple' AND NEW.couple_id IS NOT NULL THEN
        -- Update all other users in the same couple
        UPDATE users 
        SET 
            premium_type = 'couple',
            premium_status = NEW.premium_status,
            premium_expires_at = NEW.premium_expires_at,
            is_premium = true
        WHERE couple_id = NEW.couple_id 
        AND id != NEW.id;
        
    -- If user's premium expired or downgraded, check if they were the payer
    ELSIF OLD.premium_type = 'couple' AND NEW.premium_type != 'couple' AND NEW.couple_id IS NOT NULL THEN
        -- Check if this user was the primary payer
        SELECT * INTO couple_users_record
        FROM couple_users
        WHERE couple_id = NEW.couple_id AND user_id = NEW.id AND role = 'primary';
        
        -- If primary user downgraded, downgrade partner too
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

-- Function to cleanup expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    UPDATE couple_invitations
    SET status = 'expired'
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to handle couple dissolution
CREATE OR REPLACE FUNCTION handle_couple_dissolution()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all users who were in this couple
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

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on couple tables
ALTER TABLE couple_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_shared_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_settings ENABLE ROW LEVEL SECURITY;

-- Couple invitations policies
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

-- Couple users policies
CREATE POLICY "Couple members can view couple users" ON couple_users
    FOR SELECT USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Couple payments policies (only payer and partner can see)
CREATE POLICY "Couple members can view payments" ON couple_payments
    FOR SELECT USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Shared albums policies
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

-- Diary entries policies
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

-- Game sessions policies
CREATE POLICY "Couple members can manage game sessions" ON couple_game_sessions
    FOR ALL USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Settings policies
CREATE POLICY "Couple members can manage settings" ON couple_settings
    FOR ALL USING (
        couple_id IN (
            SELECT couple_id FROM users WHERE auth_id = auth.uid()
        )
    );

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert some default couple games
INSERT INTO couple_games (name, description, category, min_duration_minutes, max_duration_minutes, difficulty_level) VALUES
('Perguntas Íntimas', 'Descubram mais um sobre o outro com perguntas profundas', 'Conhecimento', 15, 30, 2),
('Desafio da Memória', 'Testem a memória sobre momentos especiais do relacionamento', 'Memória', 10, 20, 3),
('Jogo da Sinceridade', 'Verdade ou consequência para casais', 'Diversão', 20, 45, 2),
('Quiz do Amor', 'Perguntas sobre preferências e sonhos', 'Conhecimento', 15, 25, 1),
('Caça ao Tesouro Romântico', 'Encontrem pistas escondidas pela casa', 'Aventura', 30, 60, 4),
('Planos Futuros', 'Conversem sobre objetivos e sonhos compartilhados', 'Planejamento', 25, 40, 3);

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Grant permissions for couple tables
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