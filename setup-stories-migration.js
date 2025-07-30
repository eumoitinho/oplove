const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTablesExist() {
  console.log('Checking if stories tables exist...');
  
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', [
      'stories', 
      'story_views', 
      'story_replies', 
      'story_daily_limits',
      'story_boosts',
      'profile_seals',
      'user_profile_seals',
      'user_credits',
      'user_credit_transactions',
      'trending_boosts'
    ]);

  if (error) {
    console.error('Error checking tables:', error);
    return false;
  }

  const existingTables = data?.map(row => row.table_name) || [];
  console.log('Existing stories tables:', existingTables);
  
  return existingTables.length >= 10; // All 10 tables should exist
}

async function applyMigration() {
  console.log('Applying stories system migration...');
  
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250131_create_stories_system.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('Migration file not found:', migrationPath);
    return false;
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  try {
    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error applying migration:', error);
      return false;
    }
    
    console.log('Migration applied successfully!');
    return true;
  } catch (err) {
    console.error('Error executing migration:', err);
    return false;
  }
}

async function main() {
  try {
    const tablesExist = await checkTablesExist();
    
    if (tablesExist) {
      console.log('✅ Stories tables already exist');
      return;
    }
    
    console.log('📦 Stories tables missing, applying migration...');
    const success = await applyMigration();
    
    if (success) {
      console.log('✅ Stories system setup complete!');
    } else {
      console.log('❌ Failed to setup stories system');
      console.log('\n🔧 Manual setup required:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the contents of: supabase/migrations/20250131_create_stories_system.sql');
    }
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();