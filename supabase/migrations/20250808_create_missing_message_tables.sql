-- Migration: Create missing messaging tables
-- Date: 2025-08-08
-- Purpose: Create message_reads and other missing tables for messaging system

-- ============================================
-- CREATE MISSING TABLES
-- ============================================

-- 1. Message read receipts table
CREATE TABLE IF NOT EXISTS message_reads (
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- 2. Daily message counts for rate limiting
CREATE TABLE IF NOT EXISTS daily_message_counts (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

-- 3. Add missing columns to messages table if they don't exist
DO $$ 
BEGIN
  -- Add is_read column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT false;
  END IF;

  -- Add is_edited column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'is_edited'
  ) THEN
    ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT false;
  END IF;

  -- Add is_deleted column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE messages ADD COLUMN is_deleted BOOLEAN DEFAULT false;
  END IF;

  -- Add edited_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'edited_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add deleted_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add media_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE messages ADD COLUMN media_type TEXT;
  END IF;

  -- Add media_size column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'media_size'
  ) THEN
    ALTER TABLE messages ADD COLUMN media_size INTEGER;
  END IF;

  -- Add media_duration column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'media_duration'
  ) THEN
    ALTER TABLE messages ADD COLUMN media_duration INTEGER;
  END IF;

  -- Add reply_to column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'reply_to'
  ) THEN
    ALTER TABLE messages ADD COLUMN reply_to UUID REFERENCES messages(id);
  END IF;
END $$;

-- 4. Add missing columns to conversation_participants table
DO $$ 
BEGIN
  -- Add last_read_message_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_participants' AND column_name = 'last_read_message_id'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN last_read_message_id UUID REFERENCES messages(id);
  END IF;

  -- Add is_muted column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_participants' AND column_name = 'is_muted'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN is_muted BOOLEAN DEFAULT false;
  END IF;

  -- Add left_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_participants' AND column_name = 'left_at'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN left_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_participants' AND column_name = 'role'
  ) THEN
    -- Create enum type if it doesn't exist
    DO $enum$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_role') THEN
        CREATE TYPE participant_role AS ENUM ('admin', 'moderator', 'member');
      END IF;
    END $enum$;
    
    ALTER TABLE conversation_participants ADD COLUMN role participant_role DEFAULT 'member';
  END IF;

  -- Add is_admin column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_participants' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 5. Add missing columns to conversations table
DO $$ 
BEGIN
  -- Add initiated_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'initiated_by'
  ) THEN
    ALTER TABLE conversations ADD COLUMN initiated_by UUID REFERENCES users(id);
  END IF;

  -- Add initiated_by_premium column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'initiated_by_premium'
  ) THEN
    ALTER TABLE conversations ADD COLUMN initiated_by_premium BOOLEAN DEFAULT false;
  END IF;

  -- Add group_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'group_type'
  ) THEN
    ALTER TABLE conversations ADD COLUMN group_type VARCHAR(50) CHECK (group_type IN ('user_created', 'event', 'community'));
  END IF;

  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'description'
  ) THEN
    ALTER TABLE conversations ADD COLUMN description TEXT;
  END IF;

  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE conversations ADD COLUMN avatar_url TEXT;
  END IF;

  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE conversations ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  -- Add message_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'message_count'
  ) THEN
    ALTER TABLE conversations ADD COLUMN message_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- CREATE ENUM TYPES IF THEY DON'T EXIST
-- ============================================

-- Create conversation_type enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_type') THEN
    CREATE TYPE conversation_type AS ENUM ('private', 'group', 'direct');
  END IF;
END $$;

-- Create message_type enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
    CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'file', 'voice', 'location', 'contact', 'system');
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_message_counts ENABLE ROW LEVEL SECURITY;

-- Policies for message_reads
CREATE POLICY "Users can view their own read receipts" ON message_reads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can mark messages as read" ON message_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own read receipts" ON message_reads
  FOR UPDATE USING (user_id = auth.uid());

-- Policies for daily_message_counts
CREATE POLICY "Users can view their own message counts" ON daily_message_counts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage message counts" ON daily_message_counts
  FOR ALL USING (true);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Indexes for message_reads
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id ON message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_read_at ON message_reads(read_at DESC);

-- Indexes for daily_message_counts
CREATE INDEX IF NOT EXISTS idx_daily_message_counts_user_id ON daily_message_counts(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_message_counts_date ON daily_message_counts(date DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for daily_message_counts
CREATE TRIGGER update_daily_message_counts_updated_at
  BEFORE UPDATE ON daily_message_counts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ============================================

-- You can uncomment this section to insert test data
/*
-- Insert test conversation
INSERT INTO conversations (id, type, name, created_by)
VALUES ('00000000-0000-0000-0000-000000000001', 'private', 'Test Conversation', auth.uid())
ON CONFLICT DO NOTHING;

-- Insert test participants
INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
VALUES 
  ('00000000-0000-0000-0000-000000000001', auth.uid(), true)
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_reads') THEN
    RAISE NOTICE 'Table message_reads created successfully';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_message_counts') THEN
    RAISE NOTICE 'Table daily_message_counts created successfully';
  END IF;
END $$;

COMMENT ON MIGRATION IS 'Creates missing tables and columns for messaging system: message_reads, daily_message_counts, and additional columns';