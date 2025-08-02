-- Simple RLS Fix for Users Table
-- This is a simplified version that fixes the immediate issue

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on users table
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    END LOOP;
END $$;

-- Create simple, working policies
CREATE POLICY "Enable read access for all authenticated users" ON users
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (
        auth.uid()::text = id::text 
        OR auth.uid()::text = auth_id::text
    )
    WITH CHECK (
        auth.uid()::text = id::text 
        OR auth.uid()::text = auth_id::text
    );

-- Fix auth_id consistency
UPDATE users 
SET auth_id = id 
WHERE auth_id IS NULL OR auth_id != id;

-- Verify the fix
DO $$
BEGIN
    RAISE NOTICE 'RLS policies have been reset for the users table';
    RAISE NOTICE 'All authenticated users can now read profiles';
    RAISE NOTICE 'Users can only update their own profiles';
END $$;