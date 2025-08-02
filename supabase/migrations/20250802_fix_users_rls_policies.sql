-- Fix RLS policies for users table
-- The current policy is too restrictive and preventing users from being found

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own account type" ON users;
DROP POLICY IF EXISTS "Users can view public profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create comprehensive policies for users table

-- 1. Users can view any profile (public profiles)
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT 
    USING (true);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE 
    USING (auth.uid()::text = id::text OR auth.uid()::text = auth_id::text)
    WITH CHECK (auth.uid()::text = id::text OR auth.uid()::text = auth_id::text);

-- 3. Only system can insert users (handled by auth trigger)
-- No INSERT policy needed as users are created via auth.users trigger

-- 4. Users cannot delete profiles (soft delete via status field)
-- No DELETE policy

-- Verify RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;