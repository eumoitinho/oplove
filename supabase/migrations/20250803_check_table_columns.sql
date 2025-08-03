-- Check columns for each table to identify the correct column names

-- Check notifications table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Check follows table  
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'follows'
ORDER BY ordinal_position;

-- Check users table
SELECT column_name, data_type
FROM information_schema.columns  
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;