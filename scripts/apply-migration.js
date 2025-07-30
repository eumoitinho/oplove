const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('Loading migration file...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250131_fix_missing_stories_rls.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('Applying migration...')
    console.log('SQL Preview:', migrationSQL.substring(0, 200) + '...')
    
    const { data, error } = await supabase.rpc('execute_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('Migration error:', error)
    } else {
      console.log('Migration applied successfully!')
      console.log('Result:', data)
    }
  } catch (error) {
    console.error('Script error:', error)
  }
}

applyMigration()