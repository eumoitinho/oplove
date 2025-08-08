# Documentação OpenLove

Esta pasta contém toda a documentação técnica do projeto OpenLove, organizada por sistemas.

## Estrutura de Pastas

### 🔐 Autenticacao/
Sistema de autenticação, login, registro e verificação
- `documentation.md` - Documentação completa
- `changelog.md` - Histórico de mudanças
- `date_log/` - Logs diários de alterações

### 📱 Feed/
Timeline, posts, interações e mídia
- `documentation.md` - Documentação completa
- `changelog.md` - Histórico de mudanças
- `date_log/` - Logs diários de alterações

### 📸 Stories/
Sistema de stories efêmeros com boosts e seals
- `documentation.md` - Documentação completa
- `changelog.md` - Histórico de mudanças
- `date_log/` - Logs diários de alterações

### 💬 Mensagens/
Sistema de mensagens, conversas e chat
- `documentation.md` - Documentação completa
- `changelog.md` - Histórico de mudanças
- `date_log/` - Logs diários de alterações

### 💳 Pagamentos/
Processamento de pagamentos, planos e monetização
- `documentation.md` - Documentação completa
- `changelog.md` - Histórico de mudanças
- `date_log/` - Logs diários de alterações

### 👤 Perfil/
Perfis de usuário, configurações e responsividade
- `documentation.md` - Documentação completa
- `changelog.md` - Histórico de mudanças
- `date_log/` - Logs diários de alterações

### 🗄️ Database/
Esquemas de banco, migrações e políticas RLS
- `documentation.md` - Documentação completa
- `changelog.md` - Histórico de mudanças
- `date_log/` - Logs diários de alterações

## Arquivos Gerais

- `features_correcao.md` - Correções gerais de funcionalidades
- `FRONTEND_CHANGELOG.md` - Changelog geral do frontend
- `PERFORMANCE_ANALYSIS_2025_08_02.md` - Análise de performance
- `SECURITY_AUDIT_REPORT.md` - Relatório de auditoria de segurança
- `PROMPTS.md` - Prompts e templates utilizados
- `RELEASE_NOTES_v0.3.5.md` - 🆕 **Notas da versão v0.3.5** - Breaking changes e melhorias

## Como Usar

1. **Para documentar mudanças diárias**: Use os arquivos `date_log/changelog_YYYY-MM-DD.md`
2. **Para documentação completa**: Use os arquivos `documentation.md` de cada pasta
3. **Para histórico consolidado**: Use os arquivos `changelog.md` de cada pasta
4. **Para contexto do sistema**: Consulte os arquivos `.context` de cada pasta

## Convenções

- Todos os arquivos em português brasileiro
- Data no formato ISO: YYYY-MM-DD
- Logs diários devem ser consolidados nos changelogs semanalmente
- Documentação completa deve ser atualizada a cada versão

## Última Atualização

**Data**: 2025-08-07  
**Versão**: v0.3.5-alpha  
**Estrutura**: Reorganizada por sistemas com documentação completa

## 🆕 Release v0.3.5 Highlights

### ⚠️ Breaking Changes
- **Schema de usuários atualizado** com novo enum de gênero (9 opções)
- **Contas Business e Couple temporariamente desativadas**
- **Migration automática executada** com preservação de dados

### ✨ Novas Funcionalidades
- **Rotas de teste avançadas** para Stripe e AbacatePay
- **Sistema de simulação** de pagamentos PIX
- **Melhorias na geolocalização** e validação
- **Índices otimizados** para melhor performance

### 📈 Performance
- **25% mais rápido** em queries com novos índices
- **15% redução** no tamanho da tabela users
- **30% melhoria** no tempo de registro

📝 **Veja detalhes completos em**: `RELEASE_NOTES_v0.3.5.md`