#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Diretório das migrations
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Função para extrair dependências de uma migration
function extractDependencies(content) {
  const dependencies = [];
  
  // Procura por referências a tabelas
  const tableReferences = content.match(/(?:FROM|JOIN|REFERENCES|EXISTS\s*\(\s*SELECT.*FROM)\s+(\w+)/gi) || [];
  tableReferences.forEach(ref => {
    const match = ref.match(/(?:FROM|JOIN|REFERENCES|EXISTS\s*\(\s*SELECT.*FROM)\s+(\w+)/i);
    if (match && match[1]) {
      dependencies.push(match[1].toLowerCase());
    }
  });
  
  // Procura por ALTER TABLE
  const alterTables = content.match(/ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:public\.)?(\w+)/gi) || [];
  alterTables.forEach(ref => {
    const match = ref.match(/ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:public\.)?(\w+)/i);
    if (match && match[1]) {
      dependencies.push(match[1].toLowerCase());
    }
  });
  
  // Procura por DROP POLICY
  const dropPolicies = content.match(/DROP\s+POLICY\s+(?:IF\s+EXISTS\s+)?.*\s+ON\s+(?:public\.)?(\w+)/gi) || [];
  dropPolicies.forEach(ref => {
    const match = ref.match(/ON\s+(?:public\.)?(\w+)/i);
    if (match && match[1]) {
      dependencies.push(match[1].toLowerCase());
    }
  });
  
  return [...new Set(dependencies)];
}

// Função para extrair tabelas criadas
function extractCreatedTables(content) {
  const created = [];
  const createTables = content.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi) || [];
  createTables.forEach(ref => {
    const match = ref.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/i);
    if (match && match[1]) {
      created.push(match[1].toLowerCase());
    }
  });
  return [...new Set(created)];
}

// Ler todas as migrations
const migrations = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort()
  .map(file => {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const dependencies = extractDependencies(content);
    const creates = extractCreatedTables(content);
    
    return {
      file,
      content,
      dependencies,
      creates,
      date: file.substring(0, 8)
    };
  });

// Verificar dependências
console.log('🔍 Verificando ordem das migrations...\n');

const createdTables = new Set();
const issues = [];

migrations.forEach((migration, index) => {
  console.log(`📄 ${migration.file}`);
  
  // Adicionar tabelas criadas
  migration.creates.forEach(table => {
    createdTables.add(table);
    console.log(`   ✅ Cria tabela: ${table}`);
  });
  
  // Verificar dependências
  const missingDeps = migration.dependencies.filter(dep => {
    // Ignorar tabelas do sistema e funções
    const systemTables = ['users', 'auth', 'storage', 'pg_catalog', 'information_schema'];
    if (systemTables.some(st => dep.includes(st))) return false;
    
    // Verificar se a tabela já foi criada
    return !createdTables.has(dep) && !migration.creates.includes(dep);
  });
  
  if (missingDeps.length > 0) {
    console.log(`   ⚠️  Dependências faltando: ${missingDeps.join(', ')}`);
    issues.push({
      file: migration.file,
      missing: missingDeps
    });
  }
  
  console.log('');
});

// Relatório final
console.log('\n📊 RELATÓRIO FINAL:');
console.log('===================\n');

if (issues.length === 0) {
  console.log('✅ Todas as migrations estão na ordem correta!');
} else {
  console.log(`❌ Encontrados ${issues.length} problemas:\n`);
  issues.forEach(issue => {
    console.log(`   ${issue.file}:`);
    console.log(`   - Tabelas faltando: ${issue.missing.join(', ')}`);
    console.log('');
  });
  
  console.log('\n💡 SOLUÇÕES SUGERIDAS:');
  console.log('====================\n');
  
  // Sugerir ordem correta
  const migrationOrder = [];
  const processed = new Set();
  
  // Primeiro, migrations sem dependências
  migrations.forEach(m => {
    if (m.dependencies.length === 0 || m.dependencies.every(d => ['users', 'auth'].includes(d))) {
      migrationOrder.push(m.file);
      processed.add(m.file);
    }
  });
  
  // Depois, resolver dependências
  let changed = true;
  while (changed) {
    changed = false;
    migrations.forEach(m => {
      if (!processed.has(m.file)) {
        const depsResolved = m.dependencies.every(dep => {
          return migrations.some(other => 
            processed.has(other.file) && other.creates.includes(dep)
          );
        });
        
        if (depsResolved) {
          migrationOrder.push(m.file);
          processed.add(m.file);
          changed = true;
        }
      }
    });
  }
  
  console.log('Ordem sugerida das migrations:');
  migrationOrder.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  // Definir migrationOrder globalmente para o relatório
  global.migrationOrder = migrationOrder;
}

// Gerar arquivo de documentação
const report = {
  timestamp: new Date().toISOString(),
  totalMigrations: migrations.length,
  issues: issues,
  suggestedOrder: global.migrationOrder || migrations.map(m => m.file),
  createdTables: Array.from(createdTables)
};

fs.writeFileSync(
  path.join(__dirname, '..', 'MIGRATION_REPORT.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n📁 Relatório salvo em: MIGRATION_REPORT.json');