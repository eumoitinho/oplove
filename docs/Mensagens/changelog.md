# Changelog - Sistema de Mensagens

## v0.3.3 - 2025-08-07

### ✨ Adicionado
- Integração com Stories (replies diretas)
- Mensagens de áudio para Diamond+ users
- Sistema de menções (@username)
- Indicadores de typing em tempo real
- Status online/offline dos usuários
- Sistema de notificações push aprimorado
- Cache de conversas com Redis
- Rate limiting para prevenir spam

### 🔧 Melhorado
- Performance do real-time com WebSocket otimizado
- UI das mensagens mais responsiva
- Sistema de paginação de mensagens históricas
- UX de criação de grupos
- Validação de permissões server-side
- Handling de mensagens offline

### 🐛 Corrigido
- Mensagens chegando fora de ordem ocasionalmente
- Problema de sincronização em grupos grandes
- Notificações duplicadas
- Memory leak no WebSocket

## v0.3.2 - 2025-01-31

### ✨ Adicionado
- **BREAKING CHANGE**: Novas regras de iniciação de conversas
  - Free users não podem iniciar conversas
  - Free users podem responder se premium user iniciar primeiro
  - Campos `initiated_by` e `initiated_by_premium` em conversas
- Grupos personalizados (Diamond+ apenas)
- Grupos automáticos para eventos/comunidades
- Limite diário de 10 mensagens para Gold não-verificados
- Sistema de permissões baseado em plano
- Validação server-side de todas as regras

### 🔧 Melhorado
- Arquitetura de permissões completamente reescrita
- Performance das queries de conversas
- UX da lista de conversas
- Sistema de notificações

### 🐛 Corrigido
- Free users conseguindo burlar restrições
- Contadores de mensagens não-lidas incorretos
- Problemas de RLS em grupos

### ⚠️ Impacto
- Mudança significativa nas regras de negócio
- Requer migração de dados existentes
- Alguns usuários podem perder acesso a conversas

## v0.3.1 - 2025-01-15

### ✨ Adicionado
- Compartilhamento de mídia (imagens/vídeos)
- Sistema básico de grupos
- Mensagens com reply/quote
- Read receipts (confirmações de leitura)

### 🔧 Melhorado
- Interface de chat mais intuitiva
- Performance do carregamento de mensagens
- Responsividade em mobile

### 🐛 Corrigido
- Mensagens não enviando ocasionalmente
- Problema com caracteres especiais
- Scroll automático não funcionando

## v0.3.0 - 2025-01-01

### ✨ Adicionado
- Sistema básico de mensagens 1-on-1
- Real-time com Supabase WebSocket
- Conversas privadas simples
- Envio de texto básico

### 🎯 Baseline
- Primeiro sistema de chat funcional
- Estrutura base de conversas
- Integração com sistema de usuários