# 🚀 Como Executar as Migrations - OpenLove

## ✅ Preparação Concluída!

Todas as migrations foram combinadas em um único arquivo SQL na ordem correta de dependências.

## 📋 Arquivos Gerados

1. **`COMBINED_MIGRATIONS.sql`** (172.33 KB)
   - Contém todas as 24 migrations
   - Inclui comentários explicativos
   - Ordem correta de dependências

2. **`COMBINED_MIGRATIONS_MINIFIED.sql`**
   - Versão sem comentários
   - Mais leve para execução

## 🔧 Como Executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Abra o Supabase Dashboard**
   - Acesse seu projeto no [Supabase](https://app.supabase.com)

2. **Vá para o SQL Editor**
   - No menu lateral, clique em "SQL Editor"

3. **Crie uma Nova Query**
   - Clique em "New query"

4. **Cole o Conteúdo**
   - Abra o arquivo `COMBINED_MIGRATIONS.sql`
   - Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
   - Cole no SQL Editor

5. **Execute**
   - Clique no botão "Run" ou pressione Ctrl+Enter
   - Aguarde a execução completar

### Opção 2: Via Supabase CLI

```bash
# Na raiz do projeto
cd "D:\MSYNC PESSOAL\oplove"

# Execute o arquivo combinado
supabase db push < COMBINED_MIGRATIONS.sql
```

### Opção 3: Execução por Partes (Se houver erros)

Se o arquivo completo for muito grande ou houver erros:

1. Abra `COMBINED_MIGRATIONS.sql`
2. Execute cada seção entre os comentários:
   ```
   -- ================================================================
   -- Migration X: filename.sql
   -- ================================================================
   ```
3. Execute uma seção por vez no SQL Editor

## ⚠️ Importante

### Antes de Executar:
- ✅ Faça backup do banco de dados
- ✅ Teste primeiro em ambiente de desenvolvimento
- ✅ Verifique se tem permissões de admin

### Durante a Execução:
- O script usa transações (BEGIN/COMMIT)
- Se houver erro, tudo será revertido
- Monitore o console para mensagens de erro

### Após Executar:
1. Verifique se todas as tabelas foram criadas:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

2. Confirme que RLS está ativo:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. Teste as funcionalidades principais

## 🐛 Troubleshooting

### Erro: "relation already exists"
- A tabela já foi criada anteriormente
- Safe to ignore ou remova CREATE TABLE dessa tabela

### Erro: "permission denied"
- Verifique suas permissões no Supabase
- Use uma conexão com privilégios de admin

### Erro: "syntax error"
- Use `COMBINED_MIGRATIONS_MINIFIED.sql`
- Execute seção por seção

### Erro: "violates foreign key constraint"
- Ordem de execução incorreta
- Use o arquivo combinado que já está na ordem certa

## 📞 Suporte

Se encontrar problemas:
1. Verifique o log de erros do Supabase
2. Execute `node scripts/check-migrations.js` para diagnóstico
3. Entre em contato com o suporte técnico

## ✅ Checklist Final

- [ ] Backup realizado
- [ ] Arquivo COMBINED_MIGRATIONS.sql aberto
- [ ] Supabase SQL Editor acessado
- [ ] Migrations executadas
- [ ] Tabelas verificadas
- [ ] RLS confirmado
- [ ] Testes básicos realizados

Boa sorte! 🚀