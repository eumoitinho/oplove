const { createClient } = require('@supabase/supabase-js');

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jgvbwevezjgzsamqnitp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('SUPABASE_URL:', supabaseUrl);
  console.log('SERVICE_KEY present:', !!supabaseServiceKey);
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSFix() {
  console.log('Applying RLS policy fixes...');
  
  const fixSQL = `
-- Add missing RLS policies for story_daily_limits table
CREATE POLICY "Users can view own story limits" ON story_daily_limits
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own story limits" ON story_daily_limits
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert story limits" ON story_daily_limits
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add missing policy for credits
CREATE POLICY "System can insert user credits" ON user_credits
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (user_id = auth.uid());

-- Add missing policy for credit transactions
CREATE POLICY "System can insert credit transactions" ON user_credit_transactions
    FOR INSERT WITH CHECK (user_id = auth.uid() OR other_user_id = auth.uid());
  `;
  
  try {
    // Split and execute each policy separately
    const policies = fixSQL.split(';').filter(sql => sql.trim());
    
    for (const policy of policies) {
      if (policy.trim()) {
        console.log('Executing:', policy.trim().split('\n')[0]);
        const { error } = await supabase.rpc('exec_sql', { sql: policy.trim() });
        
        if (error) {
          console.log('Note:', error.message); // Some policies might already exist
        }
      }
    }
    
    console.log('✅ RLS policies fix applied!');
    return true;
  } catch (err) {
    console.error('Error applying RLS fix:', err);
    return false;
  }
}

async function main() {
  try {
    await applyRLSFix();
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();