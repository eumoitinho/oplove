-- Add poll_id column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS poll_id UUID REFERENCES polls(id) ON DELETE SET NULL;

-- Create index for poll lookups
CREATE INDEX IF NOT EXISTS idx_posts_poll_id ON posts(poll_id);

-- Create poll_options view to match the expected structure
CREATE OR REPLACE VIEW poll_options AS
SELECT 
    polls.id AS poll_id,
    option->>'id' AS id,
    option->>'text' AS text,
    (option->>'votes')::integer AS votes_count
FROM polls,
LATERAL jsonb_array_elements(options) AS option;

-- Create post_polls view for easier querying
CREATE OR REPLACE VIEW post_polls AS
SELECT 
    p.id AS post_id,
    poll.id,
    poll.question,
    poll.expires_at,
    poll.options,
    poll.max_options,
    poll.allows_multiple,
    poll.created_at,
    (
        SELECT COUNT(DISTINCT user_id) 
        FROM poll_votes 
        WHERE poll_id = poll.id
    ) AS total_votes,
    (
        SELECT ARRAY_AGG(option_ids)
        FROM poll_votes
        WHERE poll_id = poll.id AND user_id = auth.uid()
    ) AS user_votes
FROM posts p
INNER JOIN polls poll ON p.poll_id = poll.id
WHERE poll.id IS NOT NULL;

-- Grant permissions
GRANT SELECT ON post_polls TO anon, authenticated;
GRANT SELECT ON poll_options TO anon, authenticated;

-- Add RLS policies for polls
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Anyone can view polls
CREATE POLICY "Polls are viewable by everyone" ON polls
    FOR SELECT USING (true);

-- Only authenticated users can create polls
CREATE POLICY "Authenticated users can create polls" ON polls
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Only poll creator can update their polls
CREATE POLICY "Users can update own polls" ON polls
    FOR UPDATE USING (auth.uid() = creator_id);

-- Only poll creator can delete their polls
CREATE POLICY "Users can delete own polls" ON polls
    FOR DELETE USING (auth.uid() = creator_id);

-- Add RLS policies for poll_votes
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can view poll votes (for counting)
CREATE POLICY "Poll votes are viewable by everyone" ON poll_votes
    FOR SELECT USING (true);

-- Authenticated users can create votes
CREATE POLICY "Authenticated users can vote" ON poll_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete votes
-- (No UPDATE or DELETE policies = operations denied)

-- Function to get poll with computed fields
CREATE OR REPLACE FUNCTION get_poll_with_stats(poll_id_param UUID)
RETURNS TABLE (
    id UUID,
    question TEXT,
    options JSONB,
    total_votes BIGINT,
    expires_at TIMESTAMP WITH TIME ZONE,
    multiple_choice BOOLEAN,
    user_has_voted BOOLEAN,
    user_votes INTEGER[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.question,
        p.options,
        COALESCE(COUNT(DISTINCT pv.user_id), 0) AS total_votes,
        p.expires_at,
        p.allows_multiple AS multiple_choice,
        EXISTS(
            SELECT 1 FROM poll_votes 
            WHERE poll_id = p.id AND user_id = auth.uid()
        ) AS user_has_voted,
        (
            SELECT option_ids 
            FROM poll_votes 
            WHERE poll_id = p.id AND user_id = auth.uid()
            LIMIT 1
        ) AS user_votes
    FROM polls p
    LEFT JOIN poll_votes pv ON p.id = pv.poll_id
    WHERE p.id = poll_id_param
    GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;