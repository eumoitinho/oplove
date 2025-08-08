-- =====================================================
-- FIX NOTIFICATIONS TABLE - COMPLETE SOLUTION
-- Created: 2025-01-08
-- Description: Fix RLS policies and check table structure
-- =====================================================

-- First, check what policies already exist
DO $$
BEGIN
    -- Check if table exists and has RLS enabled
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications' AND schemaname = 'public') THEN
        -- Enable RLS if not already enabled
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        
        -- Drop ALL existing policies to start fresh
        DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
        DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
        DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
        DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
        DROP POLICY IF EXISTS "Allow notification creation" ON notifications;
        DROP POLICY IF EXISTS "System can create notifications" ON notifications;
        DROP POLICY IF EXISTS "Service role can manage all notifications" ON notifications;
        
        RAISE NOTICE 'Dropped all existing policies on notifications table';
    ELSE
        RAISE EXCEPTION 'Table notifications does not exist!';
    END IF;
END $$;

-- Now create the correct policies

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT 
USING (recipient_id = auth.uid());

-- Policy 2: System/Service role can create notifications for anyone
CREATE POLICY "System can create notifications" 
ON notifications FOR INSERT 
WITH CHECK (
    -- Allow if sender is the authenticated user creating for someone else
    -- OR if it's a system notification (sender_id is null)
    -- OR if using service role (auth.uid() returns null for service role)
    auth.uid() IS NULL OR sender_id = auth.uid() OR sender_id IS NULL
);

-- Policy 3: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE 
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Policy 4: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" 
ON notifications FOR DELETE 
USING (recipient_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- Check if sequence exists before granting
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'notifications_id_seq') THEN
        GRANT USAGE ON SEQUENCE notifications_id_seq TO authenticated;
        GRANT ALL ON SEQUENCE notifications_id_seq TO service_role;
    END IF;
END $$;

-- Create indexes for performance (non-concurrent for migration)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created 
    ON notifications(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread 
    ON notifications(recipient_id, is_read) 
    WHERE is_read = false;

-- Verify the setup
SELECT 
    'Policy Check' as check_type,
    policyname,
    cmd::text,
    permissive as policy_type
FROM pg_policies 
WHERE tablename = 'notifications'
UNION ALL
SELECT 
    'Table Check' as check_type,
    'RLS Status' as policyname,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as cmd,
    'TABLE' as policy_type
FROM pg_tables 
WHERE tablename = 'notifications' AND schemaname = 'public';