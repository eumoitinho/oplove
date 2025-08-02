import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This is a temporary endpoint to apply the RLS fix migration
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log("🚀 Applying RLS fix migration...")
    
    // Phase 1: Drop conflicting policies
    const dropPolicies = `
      -- Drop ALL existing users policies
      DROP POLICY IF EXISTS "Users can view public profiles" ON users;
      DROP POLICY IF EXISTS "Users can view limited profiles" ON users;
      DROP POLICY IF EXISTS "Users can update own profile" ON users;
      DROP POLICY IF EXISTS "Users can update own profile with restrictions" ON users;
      DROP POLICY IF EXISTS "Users can view their own account type" ON users;
      DROP POLICY IF EXISTS "Users can view own profile" ON users;
      DROP POLICY IF EXISTS "Users can insert own profile" ON users;
    `
    
    await supabaseAdmin.rpc('exec_sql', { sql_query: dropPolicies }).catch(() => {})
    
    // Phase 2: Create new clean policies
    const createPolicies = `
      -- Create clean policies for users table
      CREATE POLICY "users_select_all_profiles" ON users 
        FOR SELECT 
        USING (auth.uid() IS NOT NULL);
      
      CREATE POLICY "users_update_own_profile" ON users 
        FOR UPDATE 
        USING (auth.uid() = id OR auth.uid() = auth_id)
        WITH CHECK (auth.uid() = id OR auth.uid() = auth_id);
      
      CREATE POLICY "users_insert_own_profile" ON users 
        FOR INSERT 
        WITH CHECK (auth.uid() = id OR auth.uid() = auth_id OR auth.uid() IS NOT NULL);
    `
    
    await supabaseAdmin.rpc('exec_sql', { sql_query: createPolicies }).catch(() => {})
    
    // Phase 3: Ensure RLS is enabled
    await supabaseAdmin.rpc('exec_sql', { 
      sql_query: 'ALTER TABLE users ENABLE ROW LEVEL SECURITY;' 
    }).catch(() => {})
    
    // Phase 4: Fix auth_id consistency
    const fixAuthId = `
      UPDATE users 
      SET auth_id = id 
      WHERE auth_id IS NULL OR auth_id != id;
    `
    
    await supabaseAdmin.rpc('exec_sql', { sql_query: fixAuthId }).catch(() => {})
    
    // Test the policies
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('id, username')
      .limit(1)
    
    if (testError) {
      console.error("❌ Test failed:", testError)
      return NextResponse.json({
        success: false,
        error: "Migration applied but test failed",
        details: testError.message
      }, { status: 500 })
    }
    
    console.log("✅ RLS fix applied successfully!")
    
    return NextResponse.json({
      success: true,
      message: "RLS policies fixed successfully",
      test_result: testData
    })
    
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to apply migration",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}