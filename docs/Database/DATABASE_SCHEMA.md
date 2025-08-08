# 📊 OpenLove Database Schema Documentation
**Last Updated:** 2025-08-08  
**Database:** PostgreSQL 17.4 + Supabase  
**Status:** Production

## 📋 Table of Contents
1. [Core Tables](#core-tables)
2. [Enums](#enums)
3. [Functions & RPCs](#functions--rpcs)
4. [Indexes](#indexes)
5. [RLS Policies](#rls-policies)

---

## Core Tables

### 1. **users** Table
Primary user information and profile data.

```sql
CREATE TABLE public.users (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id),
    
    -- Basic Information
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    birth_date DATE,
    
    -- Gender & Identity (Updated 2025-08-07)
    gender gender_type, -- 9 options including couples
    profile_type profile_type, -- single, couple, trans, other
    
    -- Location
    city TEXT,
    uf CHAR(2), -- State abbreviation
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    
    -- Premium & Verification
    premium_type premium_type DEFAULT 'free', -- free, gold, diamond, couple
    premium_status premium_status DEFAULT 'inactive',
    premium_expires_at TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT false,
    is_business BOOLEAN DEFAULT false,
    
    -- Couple Features
    couple_id UUID REFERENCES couples(id),
    is_in_couple BOOLEAN DEFAULT false,
    
    -- Profile Details
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    looking_for TEXT[], -- Array of preferences
    relationship_goals TEXT[],
    interests TEXT[],
    
    -- Settings (JSONB)
    privacy_settings JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    
    -- Statistics
    stats JSONB DEFAULT '{}',
    daily_messages_sent INTEGER DEFAULT 0,
    daily_message_limit INTEGER DEFAULT 10,
    
    -- Status
    status user_status DEFAULT 'active',
    last_seen_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. **posts** Table  
Main content table for user posts.

```sql
CREATE TABLE public.posts (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    couple_id UUID REFERENCES couples(id),
    
    -- Content
    content TEXT,
    
    -- Media Arrays
    media_urls TEXT[] DEFAULT '{}',
    media_types TEXT[] DEFAULT '{}',
    media_thumbnails TEXT[] DEFAULT '{}', -- Thumbnails for images/videos
    
    -- Visibility & Premium
    visibility visibility_type DEFAULT 'public', -- public, friends, private
    is_premium_content BOOLEAN DEFAULT false,
    price NUMERIC(10,2),
    
    -- Location & Tags
    location VARCHAR(255),
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    hashtags TEXT[] DEFAULT '{}',
    mentions TEXT[] DEFAULT '{}',
    
    -- Post Type & Features
    post_type post_type DEFAULT 'regular', -- regular, story, event
    story_expires_at TIMESTAMPTZ,
    is_event BOOLEAN DEFAULT false,
    event_id UUID REFERENCES events(id),
    
    -- Poll Features (Added 2025-08-03)
    poll_id UUID REFERENCES polls(id),
    poll_question TEXT,
    poll_options TEXT[],
    poll_expires_at TIMESTAMPTZ,
    
    -- Audio Features (Added 2025-08-03)
    audio_duration INTEGER, -- Duration in seconds
    
    -- Statistics & Counters
    stats JSONB DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    
    -- Reaction Counters
    like_count INTEGER DEFAULT 0,
    love_count INTEGER DEFAULT 0,
    laugh_count INTEGER DEFAULT 0,
    wow_count INTEGER DEFAULT 0,
    sad_count INTEGER DEFAULT 0,
    angry_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_reported BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    report_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. **post_likes** Table
Tracks user likes on posts.

```sql
CREATE TABLE public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(post_id, user_id)
);
```

### 4. **post_comments** Table
Comments on posts.

```sql
CREATE TABLE public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES post_comments(id),
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. **post_saves** Table
Saved posts by users.

```sql
CREATE TABLE public.post_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES saved_collections(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(post_id, user_id)
);
```

### 6. **post_shares** Table
Post sharing tracking.

```sql
CREATE TABLE public.post_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. **stories** Table
24-hour ephemeral content.

```sql
CREATE TABLE public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    status story_status DEFAULT 'active',
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. **conversations** Table
Chat conversations between users.

```sql
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) DEFAULT 'direct', -- direct, group
    name TEXT,
    initiated_by UUID REFERENCES users(id),
    initiated_by_premium BOOLEAN DEFAULT false,
    group_type VARCHAR(50), -- user_created, event, community
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9. **messages** Table
Chat messages.

```sql
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT,
    type message_type DEFAULT 'text',
    media_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Enums

### User & Account Types
```sql
-- Account type
CREATE TYPE account_type AS ENUM ('personal', 'business');

-- User status
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned', 'deactivated', 'pending_verification');

-- User role
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

-- Premium types
CREATE TYPE premium_type AS ENUM ('free', 'gold', 'diamond', 'couple');

-- Premium status
CREATE TYPE premium_status AS ENUM ('active', 'inactive', 'cancelled', 'pending', 'trial');
```

### Gender & Profile Types (Updated 2025-08-07)
```sql
-- Gender type with 9 options
CREATE TYPE gender_type AS ENUM (
    'couple',           -- General couple
    'couple_female',    -- Female couple
    'couple_male',      -- Male couple
    'male',            -- Cisgender male
    'male_trans',      -- Transgender male
    'female',          -- Cisgender female
    'female_trans',    -- Transgender female
    'travesti',        -- Travesti identity
    'crossdressing'    -- Crossdressing identity
);

-- Profile type
CREATE TYPE profile_type AS ENUM ('single', 'couple', 'trans', 'other');
```

### Content Types
```sql
-- Visibility
CREATE TYPE visibility_type AS ENUM ('public', 'friends', 'private');

-- Post type
CREATE TYPE post_type AS ENUM ('regular', 'story', 'event');

-- Media type
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio');

-- Message type
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'system');

-- Story status
CREATE TYPE story_status AS ENUM ('active', 'expired', 'deleted');

-- Story reactions
CREATE TYPE story_reaction AS ENUM ('like', 'love', 'fire', 'wow', 'sad', 'angry');
```

---

## Functions & RPCs

### Post Interaction Functions
```sql
-- Increment/Decrement counters
increment_post_likes(post_id UUID) RETURNS void
decrement_post_likes(post_id UUID) RETURNS void
increment_post_comments(post_id UUID) RETURNS void
decrement_post_comments(post_id UUID) RETURNS void
increment_post_shares(post_id UUID) RETURNS void
decrement_post_shares(post_id UUID) RETURNS void
increment_post_saves(post_id UUID) RETURNS void
decrement_post_saves(post_id UUID) RETURNS void
```

### User Functions
```sql
-- Check permissions
can_upload_media(user_id UUID, media_type TEXT) RETURNS boolean
check_user_can_upload(p_user_id UUID, p_media_type TEXT) RETURNS boolean
are_users_friends(user1_id UUID, user2_id UUID) RETURNS boolean
get_friendship_status(user1_id UUID, user2_id UUID) RETURNS text
```

### Story Functions
```sql
-- Story management
check_story_limit() RETURNS trigger
cleanup_expired_stories() RETURNS void
```

### Advanced Query Functions
```sql
-- Get posts with all interactions
get_posts_with_interactions(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_following_only BOOLEAN DEFAULT false
) RETURNS TABLE(
    id UUID,
    user_id UUID,
    content TEXT,
    visibility TEXT,
    location TEXT,
    media_urls TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    likes_count INTEGER,
    comments_count INTEGER,
    shares_count INTEGER,
    saves_count INTEGER,
    is_liked BOOLEAN,
    is_saved BOOLEAN,
    user_data JSONB,
    recent_likes JSONB,
    recent_comments JSONB
)
```

---

## Indexes

### Performance Indexes (Existing)
```sql
-- Users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_location ON users(city, uf) WHERE city IS NOT NULL;
CREATE INDEX idx_users_looking_for ON users USING GIN(looking_for);

-- Posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- Likes, Comments, Saves
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_saves_user_id ON post_saves(user_id);
```

### Recommended New Indexes
```sql
-- Posts optimization
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX idx_posts_mentions ON posts USING GIN(mentions);
CREATE INDEX idx_posts_location ON posts(latitude, longitude) WHERE latitude IS NOT NULL;
```

---

## RLS Policies

### Posts RLS
```sql
-- View posts
CREATE POLICY "Public posts are viewable by everyone" ON posts
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Friends posts viewable by friends" ON posts
    FOR SELECT USING (
        visibility = 'friends' AND 
        are_users_friends(auth.uid(), user_id)
    );

CREATE POLICY "Users can view own posts" ON posts
    FOR SELECT USING (user_id = auth.uid());

-- Create posts
CREATE POLICY "Users can create own posts" ON posts
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update posts
CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (user_id = auth.uid());

-- Delete posts
CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (user_id = auth.uid());
```

### Messages RLS
```sql
-- Only participants can view messages
CREATE POLICY "Participants can view messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );

-- Only participants can send messages
CREATE POLICY "Participants can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );
```

---

## Important Notes

### Recent Changes (2025-08-07)
1. **Gender enum expanded** to 9 options including couples
2. **Redundant columns removed**: first_name, last_name, location, state, seeking, is_premium
3. **New columns**: poll_question, poll_options, poll_expires_at, audio_duration

### Critical Relationships
1. **posts.visibility** uses `'friends'` NOT `'followers'`
2. **media storage** uses arrays: media_urls[], media_types[], media_thumbnails[]
3. **Counters** are denormalized for performance (likes_count, comments_count, etc.)

### Performance Considerations
1. Use denormalized counters instead of COUNT queries
2. JSONB stats field for complex statistics
3. Array fields for media and tags (use GIN indexes)
4. Separate reaction counters for granular tracking

---

**Last Migration:** `20250807_update_user_schema_and_enums.sql`  
**Database Size:** ~45GB  
**Tables Count:** 45+  
**Average Query Time:** 180ms