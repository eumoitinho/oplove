-- =====================================================
-- FIX NOTIFICATIONS TABLE RLS POLICIES
-- Created: 2025-08-08
-- Description: Add proper RLS policies for notifications table
-- =====================================================

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Policy 1: Users can view notifications where they are the recipient
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (recipient_id = auth.uid());

-- Policy 2: Allow inserting notifications (for system/other users)
-- This allows the system to create notifications for users
CREATE POLICY "Allow notification creation" ON notifications
    FOR INSERT WITH CHECK (true);

-- Policy 3: Users can update their own notifications (mark as read, etc)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- Policy 4: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (recipient_id = auth.uid());

-- Grant necessary permissions to authenticated users
GRANT SELECT ON notifications TO authenticated;
GRANT INSERT ON notifications TO authenticated;  
GRANT UPDATE ON notifications TO authenticated;
GRANT DELETE ON notifications TO authenticated;

-- Grant permissions on the sequence if it exists
GRANT USAGE ON SEQUENCE notifications_id_seq TO authenticated;

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notifications';

-- Test query to verify access (this should work now)
-- SELECT COUNT(*) FROM notifications WHERE recipient_id = auth.uid();

RAISE NOTICE 'Notifications RLS policies have been created successfully!';
RAISE NOTICE 'Users should now be able to access their own notifications.';