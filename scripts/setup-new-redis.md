# Setup Nova Instância Redis - OpenLove

## Problema Identificado
A instância Redis atual `exact-cheetah-45946.upstash.io` não existe mais, causando falha no sistema de cache.

## Passos para Correção

### 1. Criar Nova Instância Redis no Upstash

1. Acesse [console.upstash.com](https://console.upstash.com/)
2. Faça login na conta
3. Clique em "Create Database"
4. Configure:
   - **Name**: `openlove-cache-prod`
   - **Type**: Global (para menor latência)
   - **Region**: Primary: US East (Virginia) 
   - **Plan**: Pay-as-you-go (começa grátis)

### 2. Obter Novas Credenciais

1. Após criar o banco, vá em **Details**
2. Clique na aba **REST API**
3. Clique em **.env** 
4. Copie as duas variáveis:
   ```bash
   UPSTASH_REDIS_REST_URL=https://nova-instancia.upstash.io
   UPSTASH_REDIS_REST_TOKEN=novo-token-aqui
   ```

### 3. Atualizar Arquivo .env.local

Substitua as linhas 25-26 no arquivo `.env.local`:

**Antes:**
```bash
UPSTASH_REDIS_REST_URL="https://exact-cheetah-45946.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AbN6AAIjcDFiN2UyYzczMjhkYTg0MjFmODRlYTAzODJmYjI5ODEwZHAxMA"
```

**Depois:**
```bash
UPSTASH_REDIS_REST_URL="https://nova-instancia.upstash.io"
UPSTASH_REDIS_REST_TOKEN="novo-token-aqui"
```

### 4. Testar Nova Conexão

Execute o script de teste:
```bash
# Testar via API de debug
curl http://localhost:3001/api/debug/cache

# Ou rodar o script de teste
node scripts/test-redis-connection.js
```

### 5. Verificar Cache Funcionando

1. Acesse o feed da aplicação
2. Verifique logs no console do browser/servidor
3. Confirme que cache hits estão acontecendo
4. Monitore performance

## Configurações Recomendadas

### Variáveis de Ambiente Adicionais
```bash
# Cache settings (opcionais)
CACHE_COMPRESSION_ENABLED=true
CACHE_PREWARMING_ENABLED=true
CACHE_ANALYTICS_ENABLED=true
```

### TTL Padrões Otimizados
- Timeline feeds: 5-15 minutos
- Perfis de usuário: 30 minutos
- Dados de algoritmo: 12 horas
- Trending content: 5 minutos

## Monitoramento

### APIs de Debug
- `GET /api/debug/cache` - Diagnóstico completo
- `POST /api/debug/cache {"action": "clear_all"}` - Limpar cache
- `POST /api/debug/cache {"action": "test_pipeline"}` - Teste pipeline

### Logs para Monitorar
```
✅ Cache Health Report: Health Score: 85/100
✅ Redis ping: PASS
✅ Basic cache: PASS
📊 Hit Rate: 75.2%
```

## Próximos Passos

1. ✅ Identificar problema (CONCLUÍDO)
2. 🔄 Criar nova instância Redis (EM ANDAMENTO)
3. ⏳ Atualizar credenciais
4. ⏳ Testar conectividade
5. ⏳ Verificar performance
6. ⏳ Monitorar por 24h

## Notas Importantes

- A aplicação continuará funcionando durante a troca (modo fallback)
- Performance melhorará significativamente após o cache voltar
- Sem impacto nos usuários finais
- Dados não são perdidos (cache é temporário)