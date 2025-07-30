const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyStoriesMigration() {
  console.log('🚀 Applying stories migration...')
  
  try {
    // Test if stories table already exists
    const { data: existCheck } = await supabase
      .from('stories')
      .select('count')
      .limit(1)
    
    if (existCheck !== null) {
      console.log('✅ Stories tables already exist!')
      return
    }
  } catch (error) {
    if (error.code !== 'PGRST116') {
      console.error('❌ Unexpected error:', error)
      return
    }
    // Table doesn't exist, continue with migration
  }
  
  console.log('📦 Tables missing, please apply migration manually:')
  console.log('1. Go to https://supabase.com/dashboard')
  console.log('2. Navigate to your project SQL Editor')
  console.log('3. Copy and run the migration from: supabase/migrations/20250131_create_stories_system.sql')
  console.log('')
  console.log('After running the migration, restart your Next.js server.')
}

applyStoriesMigration()