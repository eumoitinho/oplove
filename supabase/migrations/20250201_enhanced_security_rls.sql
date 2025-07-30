-- Enhanced Security RLS Policies for OpenLove
-- This migration adds additional security checks and restrictions

-- 1. Enhanced user table policies
DROP POLICY IF EXISTS "Users can view basic profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Allow viewing basic user info, but hide sensitive data
CREATE POLICY "Users can view limited profiles"
  ON public.users
  FOR SELECT
  USING (
    -- Can see own full profile
    auth.uid() = id
    OR
    -- Can see others' basic info only
    (
      auth.uid() IS NOT NULL 
      AND id != auth.uid()
      -- Block viewing if user blocked the viewer
      AND NOT EXISTS (
        SELECT 1 FROM user_blocks 
        WHERE blocker_id = users.id 
        AND blocked_id = auth.uid()
      )
    )
  );

-- Restrict profile updates with validation
CREATE POLICY "Users can update own profile with restrictions"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent changing certain fields
    AND (
      -- Cannot change email directly (must use auth flow)
      email = OLD.email
      -- Cannot change verification status
      AND is_verified = OLD.is_verified
      -- Cannot change role
      AND role = OLD.role
      -- Cannot change created_at
      AND created_at = OLD.created_at
      -- Cannot upgrade premium without payment
      AND (
        premium_type = OLD.premium_type
        OR EXISTS (
          SELECT 1 FROM subscriptions
          WHERE user_id = auth.uid()
          AND status = 'active'
          AND plan_type = NEW.premium_type
        )
      )
    )
  );

-- 2. Enhanced messaging security
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can send messages in conversations" ON public.messages;

-- Conversation access with blocking check
CREATE POLICY "Users can view unblocked conversations"
  ON public.conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
    -- Check if conversation is not with blocked user
    AND NOT EXISTS (
      SELECT 1 FROM conversation_participants cp1
      JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
      JOIN user_blocks ub ON (
        (ub.blocker_id = cp1.user_id AND ub.blocked_id = cp2.user_id)
        OR (ub.blocker_id = cp2.user_id AND ub.blocked_id = cp1.user_id)
      )
      WHERE cp1.conversation_id = conversations.id
      AND cp1.user_id = auth.uid()
      AND cp2.user_id != auth.uid()
    )
  );

-- Message sending with plan restrictions
CREATE POLICY "Users can send messages based on plan"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    -- Must be participant
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
    -- Check messaging permissions
    AND (
      -- Premium users can always send
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND premium_type IN ('gold', 'diamond', 'couple')
      )
      -- Free users can only reply if conversation was initiated by premium
      OR EXISTS (
        SELECT 1 FROM conversations c
        JOIN users u ON u.id = c.initiated_by
        WHERE c.id = messages.conversation_id
        AND c.initiated_by != auth.uid()
        AND u.premium_type IN ('gold', 'diamond', 'couple')
      )
    )
    -- Rate limiting check (messages per day)
    AND (
      SELECT COUNT(*) FROM messages
      WHERE sender_id = auth.uid()
      AND created_at >= CURRENT_DATE
    ) < CASE
      WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND premium_type = 'diamond') THEN 1000
      WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND premium_type = 'gold' AND is_verified = true) THEN 200
      WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND premium_type = 'gold') THEN 10
      ELSE 0
    END
  );

-- 3. Enhanced post security
DROP POLICY IF EXISTS "Anyone can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;

-- Post viewing with multiple checks
CREATE POLICY "View posts with security checks"
  ON public.posts
  FOR SELECT
  USING (
    -- Public posts visible to all
    (visibility = 'public' AND NOT is_paid_content)
    -- Own posts always visible
    OR user_id = auth.uid()
    -- Followers can see follower-only posts
    OR (
      visibility = 'followers'
      AND EXISTS (
        SELECT 1 FROM user_follows
        WHERE follower_id = auth.uid()
        AND following_id = posts.user_id
      )
    )
    -- Paid content requires purchase
    OR (
      is_paid_content = true
      AND EXISTS (
        SELECT 1 FROM paid_content_purchases
        WHERE user_id = auth.uid()
        AND post_id = posts.id
        AND (expires_at IS NULL OR expires_at > NOW())
      )
    )
    -- Not from blocked users
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks
      WHERE blocker_id = auth.uid()
      AND blocked_id = posts.user_id
    )
  );

-- Post creation with content restrictions
CREATE POLICY "Create posts with plan limits"
  ON public.posts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    -- Check daily post limit
    AND (
      SELECT COUNT(*) FROM posts
      WHERE user_id = auth.uid()
      AND created_at >= CURRENT_DATE
    ) < CASE
      WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND premium_type IN ('diamond', 'couple')) THEN 50
      WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND premium_type = 'gold') THEN 10
      ELSE 3
    END
    -- Free users cannot post images/videos
    AND (
      (media_urls IS NULL OR array_length(media_urls, 1) = 0)
      OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND premium_type IN ('gold', 'diamond', 'couple')
      )
    )
    -- Only diamond users can create paid content
    AND (
      is_paid_content = false
      OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND premium_type IN ('diamond', 'couple')
      )
    )
  );

-- 4. Enhanced verification security
DROP POLICY IF EXISTS "Users can create own verifications" ON public.user_verifications;

-- Verification submission with fraud prevention
CREATE POLICY "Submit verification with limits"
  ON public.user_verifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    -- Only one pending verification at a time
    AND NOT EXISTS (
      SELECT 1 FROM user_verifications
      WHERE user_id = auth.uid()
      AND status = 'pending'
    )
    -- Maximum 3 attempts per month
    AND (
      SELECT COUNT(*) FROM user_verifications
      WHERE user_id = auth.uid()
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    ) < 3
    -- Must be at least 18 years old
    AND (
      EXTRACT(YEAR FROM AGE(birth_date)) >= 18
    )
  );

-- 5. Story security policies
DROP POLICY IF EXISTS "Users can create stories" ON public.stories;

-- Story creation with daily limits
CREATE POLICY "Create stories based on plan"
  ON public.stories
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    -- Check daily story limit
    AND (
      SELECT COUNT(*) FROM stories
      WHERE user_id = auth.uid()
      AND created_at >= CURRENT_DATE
    ) < CASE
      -- Free users need verification
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type = 'free' 
        AND is_verified = true
      ) THEN 3
      -- Gold users
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type = 'gold' 
        AND is_verified = false
      ) THEN 5
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type = 'gold' 
        AND is_verified = true
      ) THEN 10
      -- Diamond/Couple verified users
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type IN ('diamond', 'couple') 
        AND is_verified = true
      ) THEN 999 -- Effectively unlimited
      -- Diamond/Couple unverified
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND premium_type IN ('diamond', 'couple')
      ) THEN 10
      -- Default (free unverified)
      ELSE 0
    END
  );

-- 6. Financial transaction security
CREATE POLICY "View own transactions only"
  ON public.user_credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "View own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 7. Admin access policies
-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can view all verifications
CREATE POLICY "Admins can view all verifications"
  ON public.user_verifications
  FOR SELECT
  USING (is_admin());

-- Admin can update verification status
CREATE POLICY "Admins can update verifications"
  ON public.user_verifications
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- 8. Add audit log table for security events
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  event_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_security_audit_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_security_audit_event_type ON security_audit_logs(event_type);
CREATE INDEX idx_security_audit_created_at ON security_audit_logs(created_at);

-- RLS for audit logs
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON security_audit_logs
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- Only system can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs"
  ON security_audit_logs
  FOR INSERT
  WITH CHECK (false); -- Prevents client-side inserts

-- 9. Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_details JSONB DEFAULT '{}'::JSONB,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO security_audit_logs (
    user_id,
    event_type,
    event_details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;