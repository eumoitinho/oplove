-- FIX NOTIFICATIONS TABLE RLS POLICIES (VERSION 2)
-- Execute this in Supabase Dashboard SQL Editor

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications; 
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow notification creation" ON notifications;

-- Policy 1: Users can view notifications where they are the recipient
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (recipient_id = auth.uid());

-- Policy 2: Allow inserting notifications (for system/other users)
CREATE POLICY "Allow notification creation" ON notifications
    FOR INSERT WITH CHECK (true);

-- Policy 3: Users can update their own notifications 
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- Policy 4: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (recipient_id = auth.uid());

-- Grant permissions (without sequence since it's UUID)
GRANT SELECT ON notifications TO authenticated;
GRANT INSERT ON notifications TO authenticated;  
GRANT UPDATE ON notifications TO authenticated;
GRANT DELETE ON notifications TO authenticated;

-- Verify policies were created
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'notifications';

-- Test the access
SELECT 'RLS policies applied successfully!' as status;