const fs = require('fs');
const path = require('path');

// Lista de arquivos para corrigir
const filesToFix = [
  'app/api/v1/posts/[id]/report/route.ts',
  'app/api/v1/comments/[id]/reactions/route.ts',
  'app/api/v1/posts/[id]/reactions/route.ts',
  'app/api/v1/saved/posts/route.ts',
  'app/api/v1/saved/collections/[id]/route.ts',
  'app/api/v1/saved/collections/route.ts',
  'app/api/v1/posts/[id]/save/route.ts',
  'app/api/v1/posts/[id]/share/route.ts',
  'app/api/v1/business/credits/create-pix/route.ts',
  'app/api/v1/business/credits/purchase/route.ts',
  'app/api/v1/payments/status/[payment_id]/route.ts',
  'app/api/v1/posts/create/route.ts'
];

function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Fix import statement
    if (content.includes('import { createClient } from \'@/lib/supabase/server\'')) {
      content = content.replace(
        'import { createClient } from \'@/lib/supabase/server\'',
        'import { createServerClient } from \'@/lib/supabase/server\''
      );
      modified = true;
    }

    // Fix createClient() calls
    if (content.includes('const supabase = createClient()')) {
      content = content.replace(
        /const supabase = createClient\(\)/g,
        'const supabase = await createServerClient()'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing Supabase imports in API routes...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Fixed ${fixedCount} files!`);
console.log('✅ All API routes should now use await createServerClient() correctly.');