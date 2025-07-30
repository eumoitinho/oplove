# Stories System Setup Instructions

## Problem Summary
The stories system is showing "permission denied" errors because:
1. The stories tables may not exist in the database
2. RLS policies need to be properly configured
3. Service role permissions need verification

## Solution Steps

### Step 1: Verify Database Tables Exist
Go to your Supabase dashboard → SQL Editor and run:

```sql
-- Check if stories tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'stories', 
  'story_views', 
  'story_replies', 
  'story_daily_limits',
  'story_boosts',
  'profile_seals',
  'user_profile_seals',
  'user_credits',
  'user_credit_transactions',
  'trending_boosts'
);
```

### Step 2: Create Stories Tables (if they don't exist)
If the tables are missing, run the complete migration:

```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/20250131_create_stories_system.sql
```

### Step 3: Fix RLS Policies
Run these SQL commands in Supabase SQL Editor:

```sql
-- Fix story_daily_limits policies
DROP POLICY IF EXISTS "Users can view own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "Users can update own story limits" ON story_daily_limits;
DROP POLICY IF EXISTS "System can insert story limits" ON story_daily_limits;

CREATE POLICY "Users can view own story limits" 
ON story_daily_limits FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update own story limits" 
ON story_daily_limits FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can insert story limits" 
ON story_daily_limits FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Fix user_credits policies
DROP POLICY IF EXISTS "System can insert user credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;

CREATE POLICY "System can insert user credits" 
ON user_credits FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own credits" 
ON user_credits FOR UPDATE 
USING (user_id = auth.uid());

-- Fix user_credit_transactions policies
DROP POLICY IF EXISTS "System can insert credit transactions" ON user_credit_transactions;

CREATE POLICY "System can insert credit transactions" 
ON user_credit_transactions FOR INSERT 
WITH CHECK (user_id = auth.uid() OR other_user_id = auth.uid());
```

### Step 4: Enable Required Extensions
Make sure these extensions are enabled:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Step 5: Create Required Functions
Add these functions if they don't exist:

```sql
-- Function to get table information
CREATE OR REPLACE FUNCTION get_table_info()
RETURNS TABLE(table_name text) 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT t.table_name::text
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_name LIKE 'stor%';
$$;
```

### Step 6: Test the Fix
After applying the SQL commands:

1. Refresh your browser
2. Check the browser console for any remaining errors
3. Try accessing the stories section of the app

### Step 7: Verify Environment Variables
Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Expected Results
After following these steps:
- ✅ Stories carousel should load without errors
- ✅ API endpoints should return data instead of permission errors
- ✅ Users should be able to create and view stories based on their plan

## Troubleshooting

### If you still see permission errors:
1. Check that your user account has proper permissions
2. Verify that the Supabase project is properly linked
3. Check the browser network tab for specific error messages

### If tables are missing:
1. Run the complete migration file manually
2. Check for syntax errors in the SQL
3. Verify the user has CREATE TABLE permissions

### Common Issues:
- **"relation does not exist"** = Tables not created
- **"permission denied for table"** = RLS policies missing
- **"permission denied for schema"** = Service role key issue