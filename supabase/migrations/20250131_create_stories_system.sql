-- =====================================================
-- STORIES SYSTEM FOR OPENLOVE
-- =====================================================

-- Story status enum
CREATE TYPE story_status AS ENUM ('active', 'expired', 'deleted');

-- Story viewer type
CREATE TYPE story_viewer_type AS ENUM ('regular', 'anonymous');

-- Story reaction type
CREATE TYPE story_reaction AS ENUM ('like', 'love', 'fire', 'wow', 'sad', 'angry');

-- =====================================================
-- STORIES TABLE
-- =====================================================
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
    thumbnail_url TEXT,
    caption TEXT,
    
    -- Media details
    duration INTEGER DEFAULT 5, -- Duration in seconds (5 for images, up to 15 for videos)
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    
    -- Visibility and features
    is_public BOOLEAN DEFAULT true,
    is_highlighted BOOLEAN DEFAULT false,
    highlight_color VARCHAR(7), -- Hex color for highlight ring
    
    -- Boost feature
    is_boosted BOOLEAN DEFAULT false,
    boost_expires_at TIMESTAMP WITH TIME ZONE,
    boost_credits_spent INTEGER DEFAULT 0,
    boost_impressions INTEGER DEFAULT 0,
    
    -- Statistics
    view_count INTEGER DEFAULT 0,
    unique_view_count INTEGER DEFAULT 0,
    reaction_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Status
    status story_status DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for stories table
CREATE INDEX idx_stories_user_active ON stories(user_id, status, expires_at);
CREATE INDEX idx_stories_boosted ON stories(is_boosted, boost_expires_at) WHERE is_boosted = true;
CREATE INDEX idx_stories_created ON stories(created_at DESC);

-- =====================================================
-- STORY VIEWS TABLE
-- =====================================================
CREATE TABLE story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- View details
    viewer_type story_viewer_type DEFAULT 'regular',
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_duration INTEGER, -- How long they watched (in seconds)
    completion_rate DECIMAL(5,2), -- Percentage of story watched
    
    -- Interaction
    reaction story_reaction,
    reacted_at TIMESTAMP WITH TIME ZONE,
    
    -- Device info
    device_type VARCHAR(20),
    ip_address INET,
    
    -- Constraints
    CONSTRAINT unique_story_view UNIQUE (story_id, viewer_id)
);

-- Create indexes for story_views table
CREATE INDEX idx_story_views_story ON story_views(story_id, viewed_at);
CREATE INDEX idx_story_views_viewer ON story_views(viewer_id, viewed_at);

-- =====================================================
-- STORY REPLIES TABLE
-- =====================================================
CREATE TABLE story_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Reply content
    message TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'gif')),
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for story_replies table
CREATE INDEX idx_story_replies_story ON story_replies(story_id, created_at);
CREATE INDEX idx_story_replies_sender ON story_replies(sender_id, created_at);

-- =====================================================
-- DAILY STORY LIMITS TABLE
-- =====================================================
CREATE TABLE story_daily_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Limits based on plan
    daily_limit INTEGER NOT NULL,
    stories_posted_today INTEGER DEFAULT 0,
    
    -- Reset tracking
    last_reset_date DATE DEFAULT CURRENT_DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STORY BOOSTS TABLE
-- =====================================================
CREATE TABLE story_boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Boost details
    credits_spent INTEGER NOT NULL,
    boost_duration_hours INTEGER NOT NULL DEFAULT 24,
    
    -- Performance metrics
    impressions_gained INTEGER DEFAULT 0,
    clicks_gained INTEGER DEFAULT 0,
    profile_visits_gained INTEGER DEFAULT 0,
    
    -- Placement priority
    priority_score INTEGER DEFAULT 100, -- Higher score = shown first
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for story_boosts table
CREATE INDEX idx_story_boosts_active ON story_boosts(is_active, expires_at, priority_score DESC) WHERE is_active = true;

-- =====================================================
-- PROFILE SEALS/BADGES (GIFT SYSTEM)
-- =====================================================
CREATE TABLE profile_seals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Seal details
    name VARCHAR(100) NOT NULL,
    icon_url TEXT NOT NULL,
    description TEXT,
    
    -- Cost and availability
    credit_cost INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    available_until TIMESTAMP WITH TIME ZONE,
    
    -- Display
    display_order INTEGER DEFAULT 0,
    category VARCHAR(50), -- 'romantic', 'fun', 'premium', 'special'
    
    -- Statistics
    times_gifted INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER PROFILE SEALS (GIFTS RECEIVED)
-- =====================================================
CREATE TABLE user_profile_seals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seal_id UUID REFERENCES profile_seals(id) ON DELETE CASCADE,
    
    -- Gift message
    message TEXT,
    
    -- Display settings
    is_displayed BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- For temporary seals
);

-- Create index for user_profile_seals table
CREATE INDEX idx_user_seals_recipient ON user_profile_seals(recipient_id, is_displayed, display_order);

-- =====================================================
-- PLATFORM CREDITS TABLE
-- =====================================================
CREATE TABLE user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Balance
    credit_balance INTEGER DEFAULT 0 CHECK (credit_balance >= 0),
    total_purchased INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    total_gifted INTEGER DEFAULT 0,
    total_received INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREDIT TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE user_credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction details
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'spend', 'gift_sent', 'gift_received', 'refund', 'bonus')),
    amount INTEGER NOT NULL, -- Positive for credits added, negative for spent
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    
    -- Reference
    reference_type VARCHAR(50), -- 'story_boost', 'profile_seal', 'trending_boost', etc.
    reference_id UUID,
    
    -- For gifts
    other_user_id UUID REFERENCES users(id),
    
    -- Payment info (for purchases)
    payment_method payment_method,
    payment_amount DECIMAL(10,2),
    payment_reference VARCHAR(255),
    
    -- Description
    description TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_credit_transactions table
CREATE INDEX idx_credit_transactions_user ON user_credit_transactions(user_id, created_at DESC);

-- =====================================================
-- TRENDING BOOSTS TABLE
-- =====================================================
CREATE TABLE trending_boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Boost type
    boost_type VARCHAR(50) NOT NULL CHECK (boost_type IN ('trending_feed', 'explore_page', 'open_date')),
    
    -- Cost and duration
    credits_spent INTEGER NOT NULL,
    duration_hours INTEGER NOT NULL,
    
    -- Performance
    impressions_gained INTEGER DEFAULT 0,
    interactions_gained INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Priority (higher = better placement)
    priority_score INTEGER DEFAULT 100,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for trending_boosts table
CREATE INDEX idx_trending_boosts_active ON trending_boosts(boost_type, is_active, expires_at, priority_score DESC);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to check story posting limits
CREATE OR REPLACE FUNCTION check_story_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_plan RECORD;
    daily_limit INTEGER;
    current_count INTEGER;
BEGIN
    -- Get user plan and verification status
    SELECT premium_type, is_verified 
    INTO user_plan
    FROM users 
    WHERE id = NEW.user_id;
    
    -- Determine daily limit based on plan
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
    
    -- Check if limit record exists and reset if needed
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
    
    -- Get current count
    SELECT stories_posted_today INTO current_count
    FROM story_daily_limits
    WHERE user_id = NEW.user_id;
    
    -- Check limit
    IF current_count >= daily_limit THEN
        RAISE EXCEPTION 'Daily story limit reached';
    END IF;
    
    -- Increment counter
    UPDATE story_daily_limits
    SET stories_posted_today = stories_posted_today + 1
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_story_limit_trigger
BEFORE INSERT ON stories
FOR EACH ROW EXECUTE FUNCTION check_story_limit();

-- Function to update story statistics
CREATE OR REPLACE FUNCTION update_story_view_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update view count
    UPDATE stories
    SET 
        view_count = view_count + 1,
        unique_view_count = (
            SELECT COUNT(DISTINCT viewer_id) 
            FROM story_views 
            WHERE story_id = NEW.story_id
        )
    WHERE id = NEW.story_id;
    
    -- Update reaction count if applicable
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

-- Function to handle credit transactions
CREATE OR REPLACE FUNCTION process_credit_transaction()
RETURNS TRIGGER AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT credit_balance INTO current_balance
    FROM user_credits
    WHERE user_id = NEW.user_id
    FOR UPDATE;
    
    -- Verify balance for spending
    IF NEW.amount < 0 AND current_balance + NEW.amount < 0 THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;
    
    -- Set balance before/after
    NEW.balance_before := current_balance;
    NEW.balance_after := current_balance + NEW.amount;
    
    -- Update user credits
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
    
    -- Handle gift received
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

-- Function to cleanup expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
    UPDATE stories
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at < NOW();
    
    -- Also expire boosts
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

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default profile seals
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

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_stories_feed ON stories(created_at DESC, status) WHERE status = 'active';
CREATE INDEX idx_stories_user_feed ON stories(user_id, created_at DESC) WHERE status = 'active';
CREATE INDEX idx_story_replies_unread ON story_replies(story_id, is_read) WHERE is_read = false;
CREATE INDEX idx_user_credits_balance ON user_credits(user_id, credit_balance);
CREATE INDEX idx_profile_seals_displayed ON user_profile_seals(recipient_id, is_displayed, display_order);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
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

-- Stories policies
CREATE POLICY "Users can create own stories" ON stories
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view active stories" ON stories
    FOR SELECT USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can update own stories" ON stories
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own stories" ON stories
    FOR DELETE USING (user_id = auth.uid());

-- Story views policies
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

-- Story replies policies
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

-- Credits policies
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own transactions" ON user_credit_transactions
    FOR SELECT USING (user_id = auth.uid() OR other_user_id = auth.uid());

-- Profile seals policies
CREATE POLICY "Everyone can view available seals" ON profile_seals
    FOR SELECT USING (is_available = true);

CREATE POLICY "Users can view profile seals" ON user_profile_seals
    FOR SELECT USING (is_displayed = true OR recipient_id = auth.uid() OR sender_id = auth.uid());

CREATE POLICY "Users can gift seals" ON user_profile_seals
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Boosts policies
CREATE POLICY "Users can create own boosts" ON story_boosts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view active boosts" ON story_boosts
    FOR SELECT USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "Users can create own trending boosts" ON trending_boosts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own trending boosts" ON trending_boosts
    FOR SELECT USING (user_id = auth.uid());