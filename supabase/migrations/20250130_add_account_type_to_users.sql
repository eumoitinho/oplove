-- Add account type to users table for distinguishing personal and business accounts
DO $$ 
BEGIN
  -- Create enum type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
    CREATE TYPE account_type AS ENUM ('personal', 'business');
  END IF;
END $$;

-- Add columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_type account_type DEFAULT 'personal',
ADD COLUMN IF NOT EXISTS business_id UUID,
ADD COLUMN IF NOT EXISTS admin_id UUID;

-- Add foreign key constraint for business_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_users_business' 
    AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT fk_users_business
    FOREIGN KEY (business_id) 
    REFERENCES businesses(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);

-- Add auth_id column if it doesn't exist (to link with Supabase auth)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Create index for auth_id
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Update RLS policies to allow users to read their own account type
CREATE POLICY "Users can view their own account type" ON users
  FOR SELECT
  USING (auth.uid()::text = auth_id::text OR auth.uid()::text = id::text);