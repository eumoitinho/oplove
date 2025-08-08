-- Add missing columns to posts table for polls and audio features

-- Add poll-related columns
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS poll_question TEXT,
ADD COLUMN IF NOT EXISTS poll_options TEXT[],
ADD COLUMN IF NOT EXISTS poll_expires_at TIMESTAMP WITH TIME ZONE;

-- Add audio-related column
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS audio_duration INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN posts.poll_question IS 'Question text for poll posts';
COMMENT ON COLUMN posts.poll_options IS 'Array of poll option texts';
COMMENT ON COLUMN posts.poll_expires_at IS 'When the poll expires and voting closes';
COMMENT ON COLUMN posts.audio_duration IS 'Duration of audio in seconds for audio posts';

-- Update RLS policies to include new columns (if needed)
-- The existing RLS policies should already cover these columns since they use SELECT *

-- Verification query to check columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('poll_question', 'poll_options', 'poll_expires_at', 'audio_duration')
ORDER BY column_name;