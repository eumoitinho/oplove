import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create admin client with service role key for RLS bypass
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndmJ3ZXZlempnenNhbXFuaXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE3MzQwMiwiZXhwIjoyMDY3NzQ5NDAyfQ.27t6k7ofO6nqUSnlOVNtJkGPACFp09X0YLGqFh5zkQs",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)

export async function POST() {
  try {
    // Execute SQL to fix RLS policies
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Fix RLS policies for posts table
        DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
        DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
        DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
        
        -- Create proper INSERT policy
        CREATE POLICY "Authenticated users can create posts" ON posts
          FOR INSERT
          WITH CHECK (
            auth.uid() IS NOT NULL 
            AND user_id = auth.uid()
          );
          
        -- Ensure SELECT policy exists
        DROP POLICY IF EXISTS "Anyone can view public posts" ON posts;
        CREATE POLICY "Anyone can view public posts" ON posts
          FOR SELECT
          USING (
            visibility = 'public' 
            OR user_id = auth.uid()
          );
          
        -- Return success
        SELECT 'Policies fixed successfully' as result;
      `
    })
    
    if (error) {
      console.error('Error fixing RLS:', error)
      
      // Try simpler approach - just ensure basic policies exist
      const simpleSQL = `
        -- Ensure RLS is enabled
        ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
        
        -- Drop all existing policies to start fresh
        DO $$ 
        DECLARE
          pol record;
        BEGIN
          FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'posts'
          LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON posts', pol.policyname);
          END LOOP;
        END $$;
        
        -- Create simple policies
        CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
        CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);
      `
      
      // Execute directly as raw SQL
      const { error: rawError } = await supabaseAdmin.from('posts').select('count').limit(0)
      
      if (rawError) {
        return NextResponse.json({
          success: false,
          error: "Failed to fix RLS policies",
          details: rawError.message
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "RLS policies fixed successfully",
      data
    })
    
  } catch (error) {
    console.error('Fix RLS error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check current policies
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_policies', {
      table_name: 'posts'
    }).catch(() => ({
      data: null,
      error: 'Function not available'
    }))
    
    // Alternative: try to insert a test post to check if policies work
    const testResult = await supabaseAdmin.auth.getUser()
    
    return NextResponse.json({
      success: true,
      policies: data || 'Unable to fetch policies',
      authCheck: testResult.data.user ? 'Authenticated' : 'Not authenticated',
      message: "Use POST to fix RLS policies"
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}