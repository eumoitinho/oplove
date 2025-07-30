import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// SQL statements to fix RLS policies
const statements = [
  // Drop existing policies
  `DROP POLICY IF EXISTS "Users can create own stories" ON stories`,
  `DROP POLICY IF EXISTS "Users can view active stories" ON stories`,
  `DROP POLICY IF EXISTS "Users can update own stories" ON stories`,
  `DROP POLICY IF EXISTS "Users can delete own stories" ON stories`,
  
  // Recreate stories policies
  `CREATE POLICY "Users can create own stories" ON stories
    FOR INSERT WITH CHECK (user_id = auth.uid())`,
  
  `CREATE POLICY "Authenticated users can view stories" ON stories
    FOR SELECT USING (auth.uid() IS NOT NULL AND (status = 'active' OR user_id = auth.uid()))`,
  
  `CREATE POLICY "Users can update own stories" ON stories
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid())`,
  
  `CREATE POLICY "Users can delete own stories" ON stories
    FOR DELETE USING (user_id = auth.uid())`,
  
  // Drop story_daily_limits policies
  `DROP POLICY IF EXISTS "Users can view own story limits" ON story_daily_limits`,
  `DROP POLICY IF EXISTS "Users can update own story limits" ON story_daily_limits`,
  `DROP POLICY IF EXISTS "System can insert story limits" ON story_daily_limits`,
  `DROP POLICY IF EXISTS "Users can manage own story limits" ON story_daily_limits`,
  `DROP POLICY IF EXISTS "System can view story limits for triggers" ON story_daily_limits`,
  
  // Recreate story_daily_limits policies
  `CREATE POLICY "Authenticated users can manage story limits" ON story_daily_limits
    FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid())`,
  
  `CREATE POLICY "System can access story limits" ON story_daily_limits
    FOR ALL USING (true)
    WITH CHECK (true)`,
  
  // Drop user_credits policies
  `DROP POLICY IF EXISTS "Users can view own credits" ON user_credits`,
  `DROP POLICY IF EXISTS "System can insert user credits" ON user_credits`,
  `DROP POLICY IF EXISTS "Users can update own credits" ON user_credits`,
  `DROP POLICY IF EXISTS "Users can manage own credits" ON user_credits`,
  
  // Recreate user_credits policies
  `CREATE POLICY "Users can manage own credits" ON user_credits
    FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid())`,
  
  `CREATE POLICY "System can initialize credits" ON user_credits
    FOR INSERT WITH CHECK (true)`,
  
  // Drop credit transactions policies
  `DROP POLICY IF EXISTS "Users can view own transactions" ON user_credit_transactions`,
  `DROP POLICY IF EXISTS "System can insert credit transactions" ON user_credit_transactions`,
  `DROP POLICY IF EXISTS "Users can create own transactions" ON user_credit_transactions`,
  
  // Recreate credit transactions policies
  `CREATE POLICY "Users can view own transactions" ON user_credit_transactions
    FOR SELECT USING (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR other_user_id = auth.uid()))`,
  
  `CREATE POLICY "Users can create transactions" ON user_credit_transactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid())`,
  
  `CREATE POLICY "System can create transactions" ON user_credit_transactions
    FOR INSERT WITH CHECK (true)`,
  
  // Fix story views policies
  `DROP POLICY IF EXISTS "Users can view stories" ON story_views`,
  `DROP POLICY IF EXISTS "Story owners can see who viewed" ON story_views`,
  
  `CREATE POLICY "Users can create story views" ON story_views
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND viewer_id = auth.uid())`,
  
  `CREATE POLICY "Story owners and viewers can see views" ON story_views
    FOR SELECT USING (
      auth.uid() IS NOT NULL AND (
        viewer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM stories 
          WHERE stories.id = story_views.story_id 
          AND stories.user_id = auth.uid()
        )
      )
    )`,
  
  // Fix profile seals policy
  `DROP POLICY IF EXISTS "Everyone can view available seals" ON profile_seals`,
  `CREATE POLICY "Everyone can view available seals" ON profile_seals
    FOR SELECT USING (auth.uid() IS NOT NULL AND is_available = true)`
]

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for stories system...')
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    console.log(`\n${i + 1}/${statements.length}: ${statement.substring(0, 60)}...`)
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`❌ Error:`, error.message)
      } else {
        console.log(`✅ Success`)
      }
    } catch (err) {
      console.error(`❌ Exception:`, err)
    }
  }
  
  console.log('\n🎉 RLS policy fix completed!')
}

// Run if this file is executed directly
if (require.main === module) {
  fixRLSPolicies().catch(console.error)
}

export { fixRLSPolicies }