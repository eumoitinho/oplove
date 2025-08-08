# Changelog - Sistema de Autenticação

## v0.3.3 - 2025-08-07

### ✨ Adicionado
- Sistema completo de verificação de identidade
- Face Scan 3D com MediaPipe
- Liveness Detection com múltiplos desafios
- Processamento automático de verificações
- Dashboard de verificações para admins
- Integração com planos premium (benefícios por verificação)

### 🔧 Melhorado
- Performance do login com cache de sessões
- Validação de documentos com AI/OCR
- UX do fluxo de verificação
- Handling de erros com mensagens mais claras
- Segurança com rate limiting

### 🐛 Corrigido
- Problema de logout em Safari iOS
- Redirect após login em algumas situações
- Cache inconsistente de dados de usuário

## v0.3.2 - 2025-01-31

### ✨ Adicionado
- Sistema de verificação por documentos
- Upload de RG, CNH e Passaporte
- Análise facial básica
- Badge de verificação azul

### 🔧 Melhorado
- Formulários de login/registro responsivos
- Validação client-side mais robusta
- Mensagens de erro mais específicas

### 🐛 Corrigido
- Email de confirmação não chegando
- Problema com caracteres especiais na senha

## v0.3.1 - 2025-01-15

### 🔧 Melhorado
- Performance do Supabase Auth
- Handling de sessões expiradas
- UI/UX dos formulários

### 🐛 Corrigido
- Logout automático após 24h
- Problemas de refresh token

## v0.3.0 - 2025-01-01

### ✨ Adicionado
- Autenticação base com Supabase
- Login/registro com email/senha
- Verificação de email obrigatória
- Perfil básico do usuário
- Row Level Security (RLS)

### 🎯 Baseline
- Primeiro sistema funcional de auth
- Integração com planos premium
- Políticas de segurança implementadas