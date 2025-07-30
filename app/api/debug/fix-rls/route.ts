import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // First, let's check what RLS policies already exist
    const { data: existingPolicies, error: policyError } = await supabase
      .from('pg_policies')
      .select('schemaname, tablename, policyname')
      .in('tablename', ['story_daily_limits', 'user_credits', 'user_credit_transactions'])

    // Check if tables exist and have RLS enabled
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['story_daily_limits', 'user_credits', 'user_credit_transactions'])

    const results = {
      tables: tables || [],
      existingPolicies: existingPolicies || [],
      errors: {
        policyError: policyError?.message,
        tableError: tableError?.message
      }
    }

    return NextResponse.json({
      message: 'Database analysis complete',
      results
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to apply RLS fix',
      details: error.message
    }, { status: 500 })
  }
}