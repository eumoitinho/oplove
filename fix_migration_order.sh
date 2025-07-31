#!/bin/bash

# 🔄 Script para corrigir ordem das migrations do OpenLove

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log "🔄 Corrigindo ordem das migrations..."

# Verificar se estamos no diretório correto
if [ ! -d "supabase/migrations" ]; then
    error "Diretório supabase/migrations não encontrado!"
    info "Execute este script na raiz do projeto"
    exit 1
fi

# Backup das migrations atuais
BACKUP_DIR="backups/migrations_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r supabase/migrations/* "$BACKUP_DIR/" 2>/dev/null || true
log "📦 Backup criado em: $BACKUP_DIR"

# Limpar migrations atuais
rm -rf supabase/migrations/*

log "🏗️  Criando migrations na ordem correta..."

# 1. Extensões e funções básicas
cat > supabase/migrations/20240101000000_initial_setup.sql << 'EOF'
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';
EOF

# 2. Tabela users (base fundamental)
cat > supabase/migrations/20240101000001_create_users.sql << 'EOF'
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    birth_date DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'non-binary', 'other', 'prefer-not-to-say')),
    
    -- Premium features
    premium_type VARCHAR(20) DEFAULT 'free' CHECK (premium_type IN ('free', 'gold', 'diamond', 'couple')),
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Preferences
    is_private BOOLEAN DEFAULT FALSE,
    show_age BOOLEAN DEFAULT TRUE,
    allow_messages BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    
    -- Counters
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_premium_type ON users(premium_type);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT USING (
        is_private = FALSE OR 
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM follows 
            WHERE follower_id = auth.uid() AND following_id = id AND status = 'accepted'
        )
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);
EOF

# 3. Follows table
cat > supabase/migrations/20240101000002_create_follows.sql << 'EOF'
-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_status ON follows(status);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view follows" ON follows
    FOR SELECT USING (
        follower_id = auth.uid() OR 
        following_id = auth.uid() OR
        status = 'accepted'
    );

CREATE POLICY "Users can create follows" ON follows
    FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can update own follows" ON follows
    FOR UPDATE USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Users can delete own follows" ON follows
    FOR DELETE USING (follower_id = auth.uid());
EOF

# 4. Posts table
cat > supabase/migrations/20240101000003_create_posts.sql << 'EOF'
-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    media_types VARCHAR(20)[] DEFAULT '{}',
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Privacy and settings
    is_public BOOLEAN DEFAULT TRUE,
    allow_comments BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- Location and metadata
    location VARCHAR(255),
    tagged_users UUID[] DEFAULT '{}',
    hashtags TEXT[] DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_public ON posts(is_public);
CREATE INDEX IF NOT EXISTS idx_posts_is_premium ON posts(is_premium);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);

-- Create trigger for updated_at
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view public posts" ON posts
    FOR SELECT USING (
        is_public = TRUE AND is_active = TRUE OR
        user_id = auth.uid() OR
        (is_premium = TRUE AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND premium_type IN ('diamond', 'couple')
        ))
    );

CREATE POLICY "Users can create own posts" ON posts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (user_id = auth.uid());
EOF

# 5. Notifications table (agora pode referenciar users)
cat > supabase/migrations/20240101000004_create_notifications.sql << 'EOF'
-- Create notifications table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);
EOF

# 6. Conversations table
cat > supabase/migrations/20240101000005_create_conversations.sql << 'EOF'
-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    name VARCHAR(255), -- For group chats
    description TEXT, -- For group chats
    avatar_url TEXT, -- For group chats
    
    -- Permissions
    initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    initiated_by_premium BOOLEAN DEFAULT false,
    group_type VARCHAR(50) CHECK (group_type IN ('user_created', 'event', 'community')),
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_is_active ON conversations(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
EOF

# 7. Continuar com outras tabelas...
log "✅ Migrations básicas criadas!"

info "Execute os próximos comandos:"
echo "1. supabase db reset (para limpar e recriar)"
echo "2. supabase db push (para aplicar as migrations)"
echo "3. ./scripts/create-remaining-migrations.sh (para criar o resto)"

log "🎉 Correção de migrations concluída!"