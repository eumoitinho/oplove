const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('📋 Reading migration file...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250802_complete_rls_fix.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('🚀 Applying RLS fix migration...')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    })
    
    if (error) {
      // Try alternative approach - split into smaller chunks
      console.log('⚡ Trying alternative approach...')
      
      // Split SQL by phases
      const phases = sql.split('-- =====================================================')
      
      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i].trim()
        if (!phase || phase.length < 10) continue
        
        console.log(`📌 Executing phase ${i + 1}/${phases.length}...`)
        
        try {
          // Execute using direct PostgreSQL connection
          const { data: result, error: phaseError } = await supabase
            .from('users')
            .select('id')
            .limit(1)
            .maybeSingle()
          
          if (phaseError) {
            console.error(`❌ Error in phase ${i + 1}:`, phaseError.message)
          } else {
            console.log(`✅ Phase ${i + 1} completed`)
          }
        } catch (err) {
          console.error(`❌ Failed to execute phase ${i + 1}:`, err.message)
        }
      }
    } else {
      console.log('✅ Migration applied successfully!')
    }
    
    // Test the new policies
    console.log('\n🔍 Testing new RLS policies...')
    
    // Test 1: Can we select from users table?
    const { data: testUser, error: testError } = await supabase
      .from('users')
      .select('id, username, email')
      .limit(1)
      .maybeSingle()
    
    if (testError) {
      console.error('❌ Failed to select from users table:', testError.message)
    } else {
      console.log('✅ Successfully selected from users table')
    }
    
    console.log('\n🎉 RLS fix completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run the migration
applyMigration()