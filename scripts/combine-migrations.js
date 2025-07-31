#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Diretório das migrations
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const outputFile = path.join(__dirname, '..', 'COMBINED_MIGRATIONS.sql');

// Ordem correta das migrations (baseada na análise de dependências)
const migrationOrder = [
  '00000000000000_create_base_tables.sql', // Base tables first
  '20250130_create_user_verifications_table.sql',
  '20250130_fix_post_interactions_rpc.sql',
  '20250131_fix_stories_rls_policies.sql',
  '20250131_create_auth_trigger.sql',
  '20250131_fix_existing_users.sql',
  '20250131_fix_missing_stories_rls.sql',
  '20250130_add_user_blocks.sql',
  '20250131_create_stories_system.sql',
  '20250131_fix_post_interactions.sql',
  '20250130_add_advanced_reactions.sql',
  '20250130_add_reports_system.sql',
  '20250130_add_save_system.sql',
  '20250130_add_share_functions.sql',
  '20250130_create_couple_tables.sql',
  '20250129_create_notifications_table.sql',
  '20250130_add_account_type_to_users.sql',
  '20250131_fix_posts_rls_policies.sql',
  '20250131_fix_timeline_and_stories_rls.sql',
  '20250131_complete_stories_rls_fix.sql',
  '20250131_fix_rls_correct.sql',
  '20250131_simple_fix_rls.sql',
  '20250130_fix_post_interaction_triggers.sql',
  '20250201_enhanced_security_rls.sql'
];

console.log('🔨 Combinando migrations na ordem correta...\n');

let combinedSQL = `-- Combined Migrations for OpenLove
-- Generated on: ${new Date().toISOString()}
-- Total migrations: ${migrationOrder.length}
-- 
-- IMPORTANT: Execute this file in your Supabase SQL Editor
-- This combines all migrations in the correct dependency order
--
-- To execute:
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Create a new query
-- 4. Paste this entire file
-- 5. Click "Run"

BEGIN;

`;

let successCount = 0;
let errorCount = 0;
const errors = [];

migrationOrder.forEach((filename, index) => {
  const filepath = path.join(migrationsDir, filename);
  
  console.log(`📄 Processing ${index + 1}/${migrationOrder.length}: ${filename}`);
  
  try {
    if (!fs.existsSync(filepath)) {
      console.log(`   ⚠️  File not found, skipping...`);
      errorCount++;
      errors.push(`File not found: ${filename}`);
      return;
    }
    
    const content = fs.readFileSync(filepath, 'utf8');
    
    combinedSQL += `
-- ================================================================
-- Migration ${index + 1}: ${filename}
-- ================================================================

${content}

-- End of ${filename}
-- ================================================================

`;
    
    successCount++;
    console.log(`   ✅ Added successfully`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    errorCount++;
    errors.push(`Error in ${filename}: ${error.message}`);
  }
});

combinedSQL += `
COMMIT;

-- ================================================================
-- Summary:
-- - Successfully combined: ${successCount} migrations
-- - Errors: ${errorCount}
-- - Total size: ${(Buffer.byteLength(combinedSQL) / 1024).toFixed(2)} KB
-- ================================================================
`;

// Write combined file
fs.writeFileSync(outputFile, combinedSQL);

console.log('\n📊 SUMMARY:');
console.log('===========');
console.log(`✅ Successfully combined: ${successCount} migrations`);
console.log(`❌ Errors: ${errorCount}`);
console.log(`📁 Output file: COMBINED_MIGRATIONS.sql`);
console.log(`📏 File size: ${(Buffer.byteLength(combinedSQL) / 1024).toFixed(2)} KB`);

if (errors.length > 0) {
  console.log('\n⚠️  ERRORS:');
  errors.forEach(err => console.log(`   - ${err}`));
}

console.log('\n💡 NEXT STEPS:');
console.log('1. Open COMBINED_MIGRATIONS.sql');
console.log('2. Review the content');
console.log('3. Copy and paste into Supabase SQL Editor');
console.log('4. Execute the entire script');

// Also create a smaller version without comments for easier execution
const minifiedSQL = combinedSQL
  .split('\n')
  .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
  .join('\n');

fs.writeFileSync(
  path.join(__dirname, '..', 'COMBINED_MIGRATIONS_MINIFIED.sql'),
  minifiedSQL
);

console.log('\n📄 Also created COMBINED_MIGRATIONS_MINIFIED.sql (without comments)');