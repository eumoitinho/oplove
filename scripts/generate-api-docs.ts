import { promises as fs } from 'fs';
import path from 'path';

/**
 * Script para gerar documentação OpenAPI automaticamente
 * analisando os arquivos route.ts da API
 */

interface RouteInfo {
  path: string;
  methods: string[];
  file: string;
}

// Mapeamento de estrutura de pastas para paths da API
function getFolderToApiPath(folder: string): string {
  return folder
    .replace(/\\/g, '/')
    .replace(/.*\/api\/v1\//, '/api/v1/')
    .replace(/\[([^\]]+)\]/g, '{$1}'); // Converte [id] para {id}
}

// Extrai métodos HTTP do arquivo route.ts
async function extractMethods(filePath: string): Promise<string[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const methods: string[] = [];
    
    // Procura por export async function GET/POST/PUT/DELETE/PATCH
    const methodRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/g;
    let match;
    
    while ((match = methodRegex.exec(content)) !== null) {
      methods.push(match[1].toLowerCase());
    }
    
    return methods;
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error);
    return [];
  }
}

// Varre diretório recursivamente procurando por route.ts
async function scanDirectory(dir: string, baseDir: string): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursivamente escaneia subdiretórios
        const subRoutes = await scanDirectory(fullPath, baseDir);
        routes.push(...subRoutes);
      } else if (entry.name === 'route.ts') {
        // Encontrou um arquivo route.ts
        const methods = await extractMethods(fullPath);
        if (methods.length > 0) {
          const relativePath = path.relative(baseDir, dir);
          const apiPath = getFolderToApiPath(relativePath);
          
          routes.push({
            path: apiPath,
            methods,
            file: fullPath
          });
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao escanear diretório ${dir}:`, error);
  }
  
  return routes;
}

// Gera template de documentação para cada rota
function generateRouteDoc(route: RouteInfo): string {
  const pathParts = route.path.split('/').filter(p => p);
  const tag = pathParts[3] || 'General'; // api/v1/[tag]/...
  
  let doc = `/**\n * ${route.path}\n */\n\n`;
  
  for (const method of route.methods) {
    doc += `/**\n`;
    doc += ` * @swagger\n`;
    doc += ` * ${route.path}:\n`;
    doc += ` *   ${method}:\n`;
    doc += ` *     tags: [${tag.charAt(0).toUpperCase() + tag.slice(1)}]\n`;
    doc += ` *     summary: TODO: Adicionar resumo\n`;
    doc += ` *     description: TODO: Adicionar descrição detalhada\n`;
    
    // Adiciona parâmetros de path se houver
    if (route.path.includes('{')) {
      doc += ` *     parameters:\n`;
      const params = route.path.match(/\{([^}]+)\}/g) || [];
      for (const param of params) {
        const paramName = param.slice(1, -1);
        doc += ` *       - in: path\n`;
        doc += ` *         name: ${paramName}\n`;
        doc += ` *         required: true\n`;
        doc += ` *         schema:\n`;
        doc += ` *           type: string\n`;
        doc += ` *         description: TODO: Descrever ${paramName}\n`;
      }
    }
    
    // Template para request body (POST/PUT/PATCH)
    if (['post', 'put', 'patch'].includes(method)) {
      doc += ` *     requestBody:\n`;
      doc += ` *       required: true\n`;
      doc += ` *       content:\n`;
      doc += ` *         application/json:\n`;
      doc += ` *           schema:\n`;
      doc += ` *             type: object\n`;
      doc += ` *             properties:\n`;
      doc += ` *               # TODO: Adicionar propriedades\n`;
    }
    
    // Template para responses
    doc += ` *     responses:\n`;
    doc += ` *       200:\n`;
    doc += ` *         description: Sucesso\n`;
    doc += ` *         content:\n`;
    doc += ` *           application/json:\n`;
    doc += ` *             schema:\n`;
    doc += ` *               type: object\n`;
    doc += ` *       400:\n`;
    doc += ` *         description: Requisição inválida\n`;
    doc += ` *       401:\n`;
    doc += ` *         description: Não autorizado\n`;
    doc += ` */\n\n`;
  }
  
  return doc;
}

// Função principal
async function generateApiDocs() {
  console.log('🔍 Escaneando APIs...\n');
  
  const apiDir = path.join(process.cwd(), 'app', 'api', 'v1');
  const routes = await scanDirectory(apiDir, apiDir);
  
  console.log(`📋 Encontradas ${routes.length} rotas:\n`);
  
  // Agrupa rotas por categoria
  const routesByCategory: { [key: string]: RouteInfo[] } = {};
  
  for (const route of routes) {
    const category = route.path.split('/')[3] || 'general';
    if (!routesByCategory[category]) {
      routesByCategory[category] = [];
    }
    routesByCategory[category].push(route);
  }
  
  // Gera arquivos de documentação por categoria
  const docsDir = path.join(apiDir, 'docs', 'endpoints');
  await fs.mkdir(docsDir, { recursive: true });
  
  for (const [category, categoryRoutes] of Object.entries(routesByCategory)) {
    console.log(`\n📁 ${category}:`);
    
    let categoryDoc = `/**\n * Documentação dos endpoints: ${category}\n */\n\n`;
    
    for (const route of categoryRoutes) {
      console.log(`  ${route.methods.map(m => m.toUpperCase()).join(', ')} ${route.path}`);
      categoryDoc += generateRouteDoc(route);
    }
    
    const docFile = path.join(docsDir, `${category}.docs.ts`);
    await fs.writeFile(docFile, categoryDoc + 'export {};');
    console.log(`  ✅ Gerado: ${category}.docs.ts`);
  }
  
  // Gera índice com todas as rotas
  let indexContent = '# 🗺️ Mapa de Endpoints da API\n\n';
  indexContent += 'Gerado automaticamente em: ' + new Date().toISOString() + '\n\n';
  
  for (const [category, categoryRoutes] of Object.entries(routesByCategory)) {
    indexContent += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    indexContent += '| Método | Endpoint | Arquivo |\n';
    indexContent += '|--------|----------|----------|\n';
    
    for (const route of categoryRoutes) {
      for (const method of route.methods) {
        const relativeFile = path.relative(process.cwd(), route.file);
        indexContent += `| ${method.toUpperCase()} | \`${route.path}\` | ${relativeFile} |\n`;
      }
    }
    indexContent += '\n';
  }
  
  await fs.writeFile(path.join(apiDir, 'docs', 'endpoints.md'), indexContent);
  
  console.log('\n✨ Documentação gerada com sucesso!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Revise os arquivos gerados em app/api/v1/docs/endpoints/');
  console.log('2. Preencha os TODOs com informações específicas');
  console.log('3. Execute pnpm add -D swagger-ui-react @types/swagger-ui-react');
  console.log('4. Acesse /docs/api para ver a documentação interativa');
}

// Executa o script
generateApiDocs().catch(console.error);