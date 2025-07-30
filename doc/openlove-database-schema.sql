-- =====================================================
-- OPENLOVE DATABASE SCHEMA v0.3.1
-- Supabase PostgreSQL Database
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User types
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned', 'deactivated', 'pending_verification');
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE profile_type AS ENUM ('single', 'couple', 'trans', 'other');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'non_binary', 'other', 'prefer_not_say');
CREATE TYPE premium_type AS ENUM ('free', 'gold', 'diamond', 'couple');
CREATE TYPE premium_status AS ENUM ('active', 'inactive', 'cancelled', 'pending', 'trial');

-- Content types
CREATE TYPE post_type AS ENUM ('regular', 'story', 'event');
CREATE TYPE visibility_type AS ENUM ('public', 'friends', 'private');
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio');
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'system');

-- Payment types
CREATE TYPE payment_method AS ENUM ('credit_card', 'pix');
CREATE TYPE payment_provider AS ENUM ('stripe', 'abacatepay');
CREATE TYPE billing_period AS ENUM ('monthly', 'quarterly', 'semiannual', 'annual', 'trial');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial', 'pending');

-- Other types
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE call_type AS ENUM ('voice', 'video');
CREATE TYPE call_status AS ENUM ('ringing', 'connected', 'ended', 'missed', 'declined');
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'blocked', 'declined');
CREATE TYPE event_type AS ENUM ('social', 'cultural', 'sports', 'educational', 'online');
CREATE TYPE ad_status AS ENUM ('pending', 'active', 'paused', 'completed', 'rejected');

-- =====================================================
-- TABLES
-- =====================================================

-- 1. Couples table (referenced by users)
CREATE TABLE couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_name VARCHAR(100),
    couple_avatar_url TEXT,
    couple_cover_url TEXT,
    anniversary_date DATE,
    bio TEXT,
    
    -- Shared resources
    shared_album_id UUID,
    shared_diary_id UUID,
    shared_playlist_url TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users table (main table)
CREATE TABLE users (
    -- Identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Personal Information
    name VARCHAR(100),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    birth_date DATE,
    gender gender_type,
    profile_type profile_type DEFAULT 'single',
    
    -- Location
    location VARCHAR(255),
    city VARCHAR(100),
    uf VARCHAR(2),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Brazil',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Media
    avatar_url TEXT,
    cover_url TEXT,
    
    -- Interests and Preferences
    interests TEXT[] DEFAULT '{}',
    seeking TEXT[] DEFAULT '{}',
    looking_for TEXT[] DEFAULT '{}',
    relationship_goals TEXT[] DEFAULT '{}',
    
    -- Premium and Payments
    is_premium BOOLEAN DEFAULT false,
    premium_type premium_type DEFAULT 'free',
    premium_status premium_status DEFAULT 'inactive',
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255),
    abacatepay_customer_id VARCHAR(255),
    
    -- Verification and Status
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    status user_status DEFAULT 'active',
    role user_role DEFAULT 'user',
    
    -- Couple
    couple_id UUID REFERENCES couples(id),
    is_in_couple BOOLEAN DEFAULT false,
    
    -- Usage Limits (for non-verified users)
    daily_message_limit INTEGER DEFAULT 0,
    daily_messages_sent INTEGER DEFAULT 0,
    monthly_photo_limit INTEGER DEFAULT 3,
    monthly_photos_uploaded INTEGER DEFAULT 0,
    monthly_video_limit INTEGER DEFAULT 0,
    monthly_videos_uploaded INTEGER DEFAULT 0,
    monthly_events_created INTEGER DEFAULT 0,
    
    -- Settings
    privacy_settings JSONB DEFAULT '{"show_ads": true, "show_age": true, "show_location": true, "allow_messages": "everyone", "show_last_active": true, "profile_visibility": "public", "show_online_status": true}'::jsonb,
    notification_settings JSONB DEFAULT '{"like_notifications": true, "push_notifications": true, "email_notifications": true, "event_notifications": true, "follow_notifications": true, "comment_notifications": true, "message_notifications": true}'::jsonb,
    stats JSONB DEFAULT '{"posts": 0, "friends": 0, "followers": 0, "following": 0, "profile_views": 0, "likes_received": 0}'::jsonb,
    
    -- Social links
    website VARCHAR(255),
    social_links JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verification Requests
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Documents
    document_type VARCHAR(50),
    document_front_url TEXT,
    document_back_url TEXT,
    selfie_url TEXT,
    verification_code VARCHAR(20),
    
    -- Status
    status verification_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    notes TEXT,
    
    -- Attempts
    attempt_number INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Polls table (referenced by posts)
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- [{id: 1, text: "Option 1", votes: 0}]
    max_options INTEGER DEFAULT 2 CHECK (max_options BETWEEN 2 AND 4),
    allows_multiple BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Events table (referenced by posts)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic info
    title VARCHAR(200) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    event_type event_type NOT NULL,
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    
    -- Date and time
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Location
    is_online BOOLEAN DEFAULT false,
    location_name VARCHAR(200),
    location_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    online_link TEXT,
    
    -- Participation
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    requires_approval BOOLEAN DEFAULT false,
    allows_guests BOOLEAN DEFAULT true,
    
    -- Pricing
    is_paid BOOLEAN DEFAULT false,
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Settings
    visibility visibility_type DEFAULT 'public',
    min_age INTEGER,
    max_age INTEGER,
    gender_restriction gender_type,
    
    -- Stats
    stats JSONB DEFAULT '{"going": 0, "interested": 0, "maybe": 0}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    couple_id UUID REFERENCES couples(id),
    
    -- Content
    content TEXT,
    media_urls TEXT[] DEFAULT '{}',
    media_types TEXT[] DEFAULT '{}',
    media_thumbnails TEXT[] DEFAULT '{}',
    
    -- Settings
    visibility visibility_type DEFAULT 'public',
    is_premium_content BOOLEAN DEFAULT false,
    price DECIMAL(10, 2),
    
    -- Special features
    poll_id UUID REFERENCES polls(id),
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    hashtags TEXT[] DEFAULT '{}',
    mentions TEXT[] DEFAULT '{}',
    
    -- Post type
    post_type post_type DEFAULT 'regular',
    story_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Events
    is_event BOOLEAN DEFAULT false,
    event_id UUID REFERENCES events(id),
    
    -- Statistics
    stats JSONB DEFAULT '{"likes_count": 0, "comments_count": 0, "shares_count": 0, "views_count": 0}'::jsonb,
    
    -- Moderation
    is_reported BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    report_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Stories table
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    media_url TEXT NOT NULL,
    media_type media_type NOT NULL,
    caption TEXT,
    
    -- Settings
    is_highlight BOOLEAN DEFAULT false,
    highlight_name VARCHAR(50),
    
    -- Views
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 8. Story Views
CREATE TABLE story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_story_view UNIQUE (story_id, viewer_id)
);

-- 9. Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id),
    
    -- Content
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    
    -- Stats
    stats JSONB DEFAULT '{"likes": 0, "replies": 0}'::jsonb,
    
    -- Moderation
    is_reported BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    
    -- Edit tracking
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Likes/Reactions
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL, -- Can be post_id or comment_id
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
    reaction_type VARCHAR(20) DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_like UNIQUE (user_id, target_id, target_type)
);

-- 11. Follows
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 12. Friends
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status friend_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
    CONSTRAINT no_self_friend CHECK (user_id != friend_id)
);

-- 13. Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
    name VARCHAR(100),
    description TEXT,
    avatar_url TEXT,
    
    -- Creator
    created_by UUID REFERENCES users(id),
    
    -- Settings
    max_participants INTEGER DEFAULT 50,
    is_archived BOOLEAN DEFAULT false,
    
    -- Last message reference
    last_message_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Conversation Participants
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role and status
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
    
    -- Settings
    notifications_enabled BOOLEAN DEFAULT true,
    is_pinned BOOLEAN DEFAULT false,
    
    -- Read status
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_participant UNIQUE (conversation_id, user_id)
);

-- 15. Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT,
    type message_type DEFAULT 'text',
    media_urls TEXT[] DEFAULT '{}',
    
    -- Metadata
    reply_to_id UUID REFERENCES messages(id),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    delivered_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT false,
    read_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Message Reactions
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reaction VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_message_reaction UNIQUE (message_id, user_id, reaction)
);

-- 17. Calls
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    caller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Type and status
    call_type call_type NOT NULL,
    status call_status DEFAULT 'ringing',
    
    -- Participants
    participants UUID[] DEFAULT '{}',
    
    -- Duration
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Communities
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    
    -- Settings
    is_private BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    
    -- Categories
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    
    -- Location
    location VARCHAR(255),
    city VARCHAR(100),
    uf VARCHAR(2),
    
    -- Stats
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Community Members
CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role and permissions
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    can_post BOOLEAN DEFAULT true,
    can_comment BOOLEAN DEFAULT true,
    can_invite BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'banned', 'left')),
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_member UNIQUE (community_id, user_id)
);

-- 20. Event Participants
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'interested' CHECK (status IN ('interested', 'going', 'maybe')),
    
    -- Guest info
    guest_count INTEGER DEFAULT 0,
    guest_names TEXT[] DEFAULT '{}',
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_participant UNIQUE (event_id, user_id)
);

-- 21. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    
    -- Type and content
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    icon VARCHAR(50),
    
    -- Related data
    related_data JSONB DEFAULT '{}'::jsonb,
    action_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Plan
    plan_type premium_type NOT NULL,
    billing_period billing_period NOT NULL,
    
    -- Payment
    payment_method payment_method NOT NULL,
    provider payment_provider NOT NULL,
    provider_subscription_id VARCHAR(255),
    
    -- Values
    amount DECIMAL(10, 2) NOT NULL,
    discount_percentage INTEGER DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    
    -- Status
    status subscription_status DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Periods
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. Payment History
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    
    -- Payment info
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    payment_method payment_method NOT NULL,
    provider payment_provider NOT NULL,
    provider_payment_id VARCHAR(255),
    
    -- Status
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. Advertisements
CREATE TABLE advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID REFERENCES users(id),
    
    -- Content
    title VARCHAR(200) NOT NULL,
    content TEXT,
    media_url TEXT,
    cta_text VARCHAR(50),
    cta_url TEXT,
    
    -- Targeting
    target_age_min INTEGER,
    target_age_max INTEGER,
    target_genders gender_type[],
    target_locations TEXT[] DEFAULT '{}',
    target_interests TEXT[] DEFAULT '{}',
    
    -- Budget
    budget DECIMAL(10, 2),
    cost_per_impression DECIMAL(10, 4),
    cost_per_click DECIMAL(10, 2),
    
    -- Stats
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    -- Status
    status ad_status DEFAULT 'pending',
    
    -- Dates
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. Ad Impressions
CREATE TABLE ad_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    -- Interaction
    was_clicked BOOLEAN DEFAULT false,
    click_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Context
    placement VARCHAR(50),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 26. Poll Votes
CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    option_ids INTEGER[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_poll_vote UNIQUE (poll_id, user_id)
);

-- 27. Saved Posts
CREATE TABLE saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    folder_name VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_saved_post UNIQUE (user_id, post_id)
);

-- 28. Blocked Users
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- 29. Post Reports
CREATE TABLE post_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 30. Profile Views
CREATE TABLE profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id UUID REFERENCES users(id),
    viewed_id UUID REFERENCES users(id) ON DELETE CASCADE,
    view_source VARCHAR(50),
    anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- User indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(city, uf) WHERE city IS NOT NULL;
CREATE INDEX idx_users_premium ON users(premium_type) WHERE premium_type != 'free';
CREATE INDEX idx_users_verified ON users(is_verified) WHERE is_verified = true;
CREATE INDEX idx_users_active ON users(last_active_at DESC) WHERE is_active = true;
CREATE INDEX idx_users_couple ON users(couple_id) WHERE couple_id IS NOT NULL;

-- Post indexes
CREATE INDEX idx_posts_user ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_timeline ON posts(created_at DESC) WHERE visibility = 'public' AND post_type = 'regular';
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX idx_posts_location ON posts(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX idx_posts_type ON posts(post_type);

-- Story indexes
CREATE INDEX idx_stories_active ON stories(user_id, expires_at) WHERE expires_at > NOW();
CREATE INDEX idx_stories_highlights ON stories(user_id) WHERE is_highlight = true;

-- Message indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(conversation_id) WHERE is_read = false;

-- Notification indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

-- Social indexes
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_friends_user ON friends(user_id) WHERE status = 'accepted';
CREATE INDEX idx_friends_friend ON friends(friend_id) WHERE status = 'accepted';

-- Community indexes
CREATE INDEX idx_community_members_user ON community_members(user_id) WHERE status = 'active';
CREATE INDEX idx_community_members_community ON community_members(community_id) WHERE status = 'active';

-- Event indexes
CREATE INDEX idx_events_date ON events(start_date) WHERE start_date > NOW();
CREATE INDEX idx_events_location ON events(latitude, longitude) WHERE is_online = false;
CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_user ON event_participants(user_id);

-- Ad indexes
CREATE INDEX idx_ads_active ON advertisements(status, starts_at, ends_at) 
    WHERE status = 'active' AND starts_at <= NOW() AND ends_at > NOW();
CREATE INDEX idx_ad_impressions_ad ON ad_impressions(ad_id);
CREATE INDEX idx_ad_impressions_user ON ad_impressions(user_id);

-- Full text search indexes
CREATE INDEX idx_posts_search ON posts USING GIN(to_tsvector('portuguese', content));
CREATE INDEX idx_users_search ON users USING GIN(to_tsvector('portuguese', name || ' ' || bio));
CREATE INDEX idx_communities_search ON communities USING GIN(to_tsvector('portuguese', name || ' ' || description));

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON couples
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $
BEGIN
    UPDATE conversations
    SET 
        last_message_id = NEW.id,
        last_message_at = NEW.created_at,
        last_message_preview = CASE 
            WHEN NEW.type = 'text' THEN LEFT(NEW.content, 100)
            ELSE NEW.type::text
        END
    WHERE id = NEW.conversation_id;
    
    -- Update unread count for all participants except sender
    UPDATE conversation_participants
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Function to handle mutual follows (auto friendship)
CREATE OR REPLACE FUNCTION check_mutual_follow()
RETURNS TRIGGER AS $
BEGIN
    -- Check if the other user already follows back
    IF EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = NEW.following_id 
        AND following_id = NEW.follower_id
    ) THEN
        -- Create friendship if not exists
        INSERT INTO friends (user_id, friend_id, status, accepted_at)
        VALUES (NEW.follower_id, NEW.following_id, 'accepted', NOW())
        ON CONFLICT (user_id, friend_id) DO NOTHING;
        
        INSERT INTO friends (user_id, friend_id, status, accepted_at)
        VALUES (NEW.following_id, NEW.follower_id, 'accepted', NOW())
        ON CONFLICT (user_id, friend_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_mutual_follow
AFTER INSERT ON follows
FOR EACH ROW EXECUTE FUNCTION check_mutual_follow();

-- Function to update post stats
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $
BEGIN
    IF TG_TABLE_NAME = 'likes' THEN
        IF TG_OP = 'INSERT' AND NEW.target_type = 'post' THEN
            UPDATE posts 
            SET stats = jsonb_set(stats, '{likes_count}', 
                (COALESCE((stats->>'likes_count')::int, 0) + 1)::text::jsonb)
            WHERE id = NEW.target_id;
        ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'post' THEN
            UPDATE posts 
            SET stats = jsonb_set(stats, '{likes_count}', 
                GREATEST(0, COALESCE((stats->>'likes_count')::int, 0) - 1)::text::jsonb)
            WHERE id = OLD.target_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts 
            SET stats = jsonb_set(stats, '{comments_count}', 
                (COALESCE((stats->>'comments_count')::int, 0) + 1)::text::jsonb)
            WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE posts 
            SET stats = jsonb_set(stats, '{comments_count}', 
                GREATEST(0, COALESCE((stats->>'comments_count')::int, 0) - 1)::text::jsonb)
            WHERE id = OLD.post_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_post_stats();

CREATE TRIGGER trigger_update_post_comments
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_stats();

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $
BEGIN
    IF TG_TABLE_NAME = 'follows' THEN
        IF TG_OP = 'INSERT' THEN
            -- Update follower's following count
            UPDATE users 
            SET stats = jsonb_set(stats, '{following}', 
                (COALESCE((stats->>'following')::int, 0) + 1)::text::jsonb)
            WHERE id = NEW.follower_id;
            
            -- Update following's follower count
            UPDATE users 
            SET stats = jsonb_set(stats, '{followers}', 
                (COALESCE((stats->>'followers')::int, 0) + 1)::text::jsonb)
            WHERE id = NEW.following_id;
        ELSIF TG_OP = 'DELETE' THEN
            -- Update follower's following count
            UPDATE users 
            SET stats = jsonb_set(stats, '{following}', 
                GREATEST(0, COALESCE((stats->>'following')::int, 0) - 1)::text::jsonb)
            WHERE id = OLD.follower_id;
            
            -- Update following's follower count
            UPDATE users 
            SET stats = jsonb_set(stats, '{followers}', 
                GREATEST(0, COALESCE((stats->>'followers')::int, 0) - 1)::text::jsonb)
            WHERE id = OLD.following_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_follow_stats
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Function to check upload limits
CREATE OR REPLACE FUNCTION check_upload_limits()
RETURNS TRIGGER AS $
DECLARE
    user_record RECORD;
    photo_count INTEGER;
    video_count INTEGER;
BEGIN
    SELECT * INTO user_record FROM users WHERE id = NEW.user_id;
    
    -- Count media types
    photo_count := 0;
    video_count := 0;
    
    FOR i IN 1..array_length(NEW.media_types, 1) LOOP
        IF NEW.media_types[i] = 'image' THEN
            photo_count := photo_count + 1;
        ELSIF NEW.media_types[i] = 'video' THEN
            video_count := video_count + 1;
        END IF;
    END LOOP;
    
    -- Check limits based on plan
    IF user_record.premium_type = 'free' THEN
        IF user_record.monthly_photos_uploaded + photo_count > user_record.monthly_photo_limit THEN
            RAISE EXCEPTION 'Monthly photo limit exceeded';
        END IF;
        IF video_count > 0 THEN
            RAISE EXCEPTION 'Video upload not available for free plan';
        END IF;
    ELSIF user_record.premium_type = 'gold' AND NOT user_record.is_verified THEN
        IF user_record.monthly_photos_uploaded + photo_count > 20 THEN
            RAISE EXCEPTION 'Monthly photo limit exceeded (verification required for more)';
        END IF;
        IF user_record.monthly_videos_uploaded + video_count > 5 THEN
            RAISE EXCEPTION 'Monthly video limit exceeded (verification required for more)';
        END IF;
    END IF;
    
    -- Update counters
    UPDATE users 
    SET 
        monthly_photos_uploaded = monthly_photos_uploaded + photo_count,
        monthly_videos_uploaded = monthly_videos_uploaded + video_count
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_upload_limits
BEFORE INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION check_upload_limits();

-- Function to check message limits
CREATE OR REPLACE FUNCTION check_message_limits()
RETURNS TRIGGER AS $
DECLARE
    user_record RECORD;
BEGIN
    SELECT * INTO user_record FROM users WHERE id = NEW.sender_id;
    
    -- Check limits for non-verified Gold users
    IF user_record.premium_type = 'gold' AND NOT user_record.is_verified THEN
        IF user_record.daily_messages_sent >= user_record.daily_message_limit THEN
            RAISE EXCEPTION 'Daily message limit exceeded';
        END IF;
        
        -- Increment counter
        UPDATE users 
        SET daily_messages_sent = daily_messages_sent + 1
        WHERE id = NEW.sender_id;
    ELSIF user_record.premium_type = 'free' THEN
        RAISE EXCEPTION 'Messages not available for free plan';
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_message_limits
BEFORE INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION check_message_limits();

-- Function to cleanup expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $
BEGIN
    DELETE FROM stories 
    WHERE expires_at < NOW() 
    AND is_highlight = false;
END;
$ LANGUAGE plpgsql;

-- Function to reset daily limits (run daily at midnight)
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void AS $
BEGIN
    UPDATE users 
    SET daily_messages_sent = 0
    WHERE premium_type = 'gold' AND is_verified = false;
END;
$ LANGUAGE plpgsql;

-- Function to reset monthly limits (run monthly)
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void AS $
BEGIN
    UPDATE users 
    SET 
        monthly_photos_uploaded = 0,
        monthly_videos_uploaded = 0,
        monthly_events_created = 0;
END;
$ LANGUAGE plpgsql;

-- Function to update couple profiles
CREATE OR REPLACE FUNCTION sync_couple_premium()
RETURNS TRIGGER AS $
BEGIN
    IF NEW.premium_type = 'couple' THEN
        -- Ensure both users in a couple have the same premium status
        UPDATE users 
        SET 
            premium_type = 'couple',
            premium_status = NEW.premium_status,
            premium_expires_at = NEW.premium_expires_at
        WHERE couple_id = NEW.couple_id 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_couple_premium
AFTER UPDATE OF premium_type ON users
FOR EACH ROW 
WHEN (NEW.couple_id IS NOT NULL)
EXECUTE FUNCTION sync_couple_premium();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

-- Posts policies
CREATE POLICY "View posts based on visibility" ON posts
    FOR SELECT USING (
        visibility = 'public' 
        OR user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        OR (
            visibility = 'friends' 
            AND EXISTS (
                SELECT 1 FROM friends 
                WHERE status = 'accepted'
                AND (
                    (user_id = posts.user_id AND friend_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
                    OR (friend_id = posts.user_id AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
                )
            )
        )
    );

CREATE POLICY "Users can create own posts" ON posts
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Stories policies (Diamond+ only)
CREATE POLICY "View stories from followed users" ON stories
    FOR SELECT USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM follows 
            WHERE follower_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND following_id = stories.user_id
        )
    );

CREATE POLICY "Diamond users can create stories" ON stories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = stories.user_id 
            AND auth_id = auth.uid()
            AND premium_type IN ('diamond', 'couple')
        )
    );

-- Comments policies (need verification for free users)
CREATE POLICY "View comments on visible posts" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE id = comments.post_id
            -- User can see the post
        )
    );

CREATE POLICY "Create comments with verification" ON comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = comments.user_id 
            AND auth_id = auth.uid()
            AND (is_verified = true OR premium_type != 'free')
        )
    );

-- Messages policies (premium only)
CREATE POLICY "View own conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        )
    );

CREATE POLICY "Send messages with limits" ON messages
    FOR INSERT WITH CHECK (
        sender_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = sender_id
            AND premium_type != 'free'
        )
    );

-- Notifications policies
CREATE POLICY "View own notifications" ON notifications
    FOR SELECT USING (recipient_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Update own notifications" ON notifications
    FOR UPDATE USING (recipient_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- =====================================================
-- INITIAL DATA AND CONFIGURATION
-- =====================================================

-- Set default limits based on plans
CREATE OR REPLACE FUNCTION set_user_limits()
RETURNS TRIGGER AS $
BEGIN
    CASE NEW.premium_type
        WHEN 'free' THEN
            NEW.daily_message_limit := 0;
            NEW.monthly_photo_limit := 3;
            NEW.monthly_video_limit := 0;
        WHEN 'gold' THEN
            IF NEW.is_verified THEN
                NEW.daily_message_limit := -1; -- unlimited
                NEW.monthly_photo_limit := 50;
                NEW.monthly_video_limit := 10;
            ELSE
                NEW.daily_message_limit := 10;
                NEW.monthly_photo_limit := 20;
                NEW.monthly_video_limit := 5;
            END IF;
        WHEN 'diamond', 'couple' THEN
            NEW.daily_message_limit := -1;
            NEW.monthly_photo_limit := -1;
            NEW.monthly_video_limit := -1;
    END CASE;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_user_limits
BEFORE INSERT OR UPDATE OF premium_type, is_verified ON users
FOR EACH ROW EXECUTE FUNCTION set_user_limits();

-- =====================================================
-- SCHEDULED JOBS (using pg_cron or external scheduler)
-- =====================================================

-- These should be scheduled externally:
-- 1. reset_daily_limits() - Run daily at midnight
-- 2. reset_monthly_limits() - Run on 1st of each month
-- 3. cleanup_expired_stories() - Run hourly
-- 4. Update premium expirations - Run daily
-- 5. Process scheduled posts - Run every 5 minutes

-- =====================================================
-- PERMISSIONS FOR SUPABASE
-- =====================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to service role
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- END OF SCHEMA
-- =====================================================