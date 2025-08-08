-- =====================================================
-- PERFORMANCE INDEXES FOR OPENLOVE DATABASE - SIMPLIFIED
-- Created: 2025-08-08
-- Description: Essential indexes for optimal query performance
-- Database: PostgreSQL 17.4 + Supabase
-- =====================================================

-- =====================================================
-- 1. POSTS TABLE - CORE CONTENT INDEXES
-- =====================================================

-- Posts timeline feed - Most critical query pattern
CREATE INDEX IF NOT EXISTS idx_posts_timeline_feed 
ON posts(user_id, created_at DESC, visibility) 
WHERE is_hidden = false AND is_reported = false;

-- Posts global feed with visibility filter
CREATE INDEX IF NOT EXISTS idx_posts_global_feed 
ON posts(created_at DESC, visibility) 
WHERE visibility = 'public' AND is_hidden = false;

-- Posts hashtag search - GIN index for array operations
CREATE INDEX IF NOT EXISTS idx_posts_hashtags_gin 
ON posts USING GIN(hashtags);

-- Posts mentions - GIN index for user mentions
CREATE INDEX IF NOT EXISTS idx_posts_mentions_gin 
ON posts USING GIN(mentions);

-- Posts location-based queries
CREATE INDEX IF NOT EXISTS idx_posts_location 
ON posts(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Posts engagement optimization
CREATE INDEX IF NOT EXISTS idx_posts_engagement 
ON posts(likes_count DESC, comments_count DESC, created_at DESC) 
WHERE likes_count > 0 OR comments_count > 0;

-- Posts premium content filtering
CREATE INDEX IF NOT EXISTS idx_posts_premium 
ON posts(is_premium_content, user_id, created_at DESC) 
WHERE is_premium_content = true;

-- Posts with media
CREATE INDEX IF NOT EXISTS idx_posts_with_media 
ON posts(created_at DESC) 
WHERE array_length(media_urls, 1) > 0;

-- =====================================================
-- 2. POST INTERACTIONS - OPTIMIZED FOR SOCIAL FEATURES
-- =====================================================

-- Post likes - compound index for user interactions
CREATE INDEX IF NOT EXISTS idx_post_likes_user_post 
ON post_likes(user_id, post_id, created_at DESC);

-- Post likes aggregation - for counter updates
CREATE INDEX IF NOT EXISTS idx_post_likes_aggregation 
ON post_likes(post_id, created_at DESC);

-- Post comments - chronological by post
CREATE INDEX IF NOT EXISTS idx_post_comments_threaded 
ON post_comments(post_id, created_at ASC);

-- Post comments by user
CREATE INDEX IF NOT EXISTS idx_post_comments_user_activity 
ON post_comments(user_id, created_at DESC);

-- Post saves - user collections
CREATE INDEX IF NOT EXISTS idx_post_saves_user_collection 
ON post_saves(user_id, created_at DESC);

-- Post saves popularity
CREATE INDEX IF NOT EXISTS idx_post_saves_popularity 
ON post_saves(post_id, created_at DESC);

-- Post shares - viral content tracking
CREATE INDEX IF NOT EXISTS idx_post_shares_viral 
ON post_shares(post_id, created_at DESC, user_id);

-- =====================================================
-- 3. STORIES SYSTEM - EPHEMERAL CONTENT PERFORMANCE
-- =====================================================

-- Stories active feed
CREATE INDEX IF NOT EXISTS idx_stories_active_feed 
ON stories(status, expires_at DESC, created_at DESC) 
WHERE status = 'active';

-- Stories user timeline
CREATE INDEX IF NOT EXISTS idx_stories_user_timeline 
ON stories(user_id, created_at DESC, status);

-- Story views - interaction tracking
CREATE INDEX IF NOT EXISTS idx_story_views_analytics 
ON story_views(story_id, viewed_at DESC);

-- Story views user activity
CREATE INDEX IF NOT EXISTS idx_story_views_user_activity 
ON story_views(viewer_id, viewed_at DESC);

-- Story replies
CREATE INDEX IF NOT EXISTS idx_story_replies_conversation 
ON story_replies(story_id, created_at ASC);

-- =====================================================
-- 4. MESSAGING SYSTEM - REAL-TIME CHAT OPTIMIZATION
-- =====================================================

-- Conversations participants
CREATE INDEX IF NOT EXISTS idx_conversation_participants_access 
ON conversation_participants(user_id, conversation_id);

-- Conversations active list
CREATE INDEX IF NOT EXISTS idx_conversations_active_list 
ON conversations(updated_at DESC, created_at DESC);

-- Messages chronological
CREATE INDEX IF NOT EXISTS idx_messages_chronological 
ON messages(conversation_id, created_at ASC);

-- Messages unread
CREATE INDEX IF NOT EXISTS idx_messages_unread_status 
ON messages(conversation_id, is_read, created_at DESC) 
WHERE is_read = false;

-- Messages by sender
CREATE INDEX IF NOT EXISTS idx_messages_sender_activity 
ON messages(sender_id, created_at DESC);

-- =====================================================
-- 5. USER SYSTEM - PROFILE AND RELATIONSHIP INDEXES
-- =====================================================

-- Users search and discovery
CREATE INDEX IF NOT EXISTS idx_users_discovery 
ON users(username, is_verified DESC, premium_type);

-- Users location-based matching
CREATE INDEX IF NOT EXISTS idx_users_location_matching 
ON users(city, uf) 
WHERE city IS NOT NULL;

-- Users relationship preferences - GIN index
CREATE INDEX IF NOT EXISTS idx_users_relationship_goals_gin 
ON users USING GIN(relationship_goals);

-- Users interests matching - GIN index
CREATE INDEX IF NOT EXISTS idx_users_interests_gin 
ON users USING GIN(interests);

-- Users premium and verification status
CREATE INDEX IF NOT EXISTS idx_users_premium_status 
ON users(premium_type, is_verified, premium_status);

-- User follows - relationship mapping
CREATE INDEX IF NOT EXISTS idx_follows_relationships 
ON follows(follower_id, following_id, created_at DESC);

-- User follows reverse lookup
CREATE INDEX IF NOT EXISTS idx_follows_reverse_lookup 
ON follows(following_id, follower_id, created_at DESC);

-- =====================================================
-- 6. CREDITS AND MONETIZATION - BUSINESS LOGIC INDEXES
-- =====================================================

-- User credits balance
CREATE INDEX IF NOT EXISTS idx_user_credits_balance 
ON user_credits(user_id, credit_balance DESC);

-- Credit transactions history
CREATE INDEX IF NOT EXISTS idx_credit_transactions_history 
ON user_credit_transactions(user_id, created_at DESC);

-- Profile seals availability
CREATE INDEX IF NOT EXISTS idx_profile_seals_availability 
ON profile_seals(is_available, credit_cost ASC) 
WHERE is_available = true;

-- User profile seals display
CREATE INDEX IF NOT EXISTS idx_user_profile_seals_display 
ON user_profile_seals(recipient_id, created_at DESC);

-- =====================================================
-- 7. NOTIFICATIONS SYSTEM - REAL-TIME UPDATES
-- =====================================================

-- Notifications primary lookup (using correct column name: recipient_id)
CREATE INDEX IF NOT EXISTS idx_notifications_user_feed 
ON notifications(recipient_id, is_read, created_at DESC);

-- Notifications unread
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(recipient_id, created_at DESC) 
WHERE is_read = false;

-- =====================================================
-- VALIDATION AND COMPLETION
-- =====================================================

-- Verify critical indexes exist
DO $$
DECLARE
    index_count INTEGER;
    critical_indexes TEXT[] := ARRAY[
        'idx_posts_timeline_feed',
        'idx_posts_hashtags_gin', 
        'idx_stories_active_feed',
        'idx_messages_chronological',
        'idx_user_credits_balance'
    ];
    idx TEXT;
BEGIN
    FOREACH idx IN ARRAY critical_indexes LOOP
        SELECT COUNT(*) INTO index_count 
        FROM pg_indexes 
        WHERE indexname = idx;
        
        IF index_count = 0 THEN
            RAISE WARNING 'Critical index % was not created successfully', idx;
        ELSE
            RAISE NOTICE 'Critical index % verified', idx;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'OpenLove Performance Indexes Migration Completed Successfully';
END $$;

-- =====================================================
-- Migration Complete
-- =====================================================