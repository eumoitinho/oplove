-- Fix story daily limit trigger that has ambiguous column reference

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS check_story_limit_trigger ON stories;
DROP FUNCTION IF EXISTS check_story_limit();

-- Recreate the function with fixed ambiguous column reference
CREATE OR REPLACE FUNCTION check_story_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_plan RECORD;
    calculated_daily_limit INTEGER;
    current_count INTEGER;
BEGIN
    -- Get user plan and verification status
    SELECT premium_type, is_verified 
    INTO user_plan
    FROM users 
    WHERE id = NEW.user_id;
    
    -- Determine daily limit based on plan
    CASE user_plan.premium_type
        WHEN 'free' THEN
            calculated_daily_limit := CASE WHEN user_plan.is_verified THEN 3 ELSE 0 END;
        WHEN 'gold' THEN
            calculated_daily_limit := CASE WHEN user_plan.is_verified THEN 10 ELSE 5 END;
        WHEN 'diamond' THEN
            calculated_daily_limit := CASE WHEN user_plan.is_verified THEN 999 ELSE 10 END; -- 999 = unlimited
        WHEN 'couple' THEN
            calculated_daily_limit := CASE WHEN user_plan.is_verified THEN 999 ELSE 10 END;
        ELSE
            calculated_daily_limit := 0;
    END CASE;
    
    -- Check if limit record exists and reset if needed
    INSERT INTO story_daily_limits (user_id, daily_limit, stories_posted_today)
    VALUES (NEW.user_id, calculated_daily_limit, 0)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        daily_limit = EXCLUDED.daily_limit,
        stories_posted_today = CASE 
            WHEN story_daily_limits.last_reset_date < CURRENT_DATE THEN 0
            ELSE story_daily_limits.stories_posted_today
        END,
        last_reset_date = CASE 
            WHEN story_daily_limits.last_reset_date < CURRENT_DATE THEN CURRENT_DATE
            ELSE story_daily_limits.last_reset_date
        END;
    
    -- Get current count
    SELECT stories_posted_today INTO current_count
    FROM story_daily_limits
    WHERE user_id = NEW.user_id;
    
    -- Check limit
    IF current_count >= calculated_daily_limit THEN
        RAISE EXCEPTION 'Daily story limit reached';
    END IF;
    
    -- Increment counter
    UPDATE story_daily_limits
    SET stories_posted_today = stories_posted_today + 1
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER check_story_limit_trigger
BEFORE INSERT ON stories
FOR EACH ROW EXECUTE FUNCTION check_story_limit();