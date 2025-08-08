# Sistema de Autenticação - OpenLove

## Visão Geral

O sistema de autenticação do OpenLove é baseado em Supabase Auth com funcionalidades customizadas para verificação de identidade, planos premium e políticas de acesso.

## Componentes Principais

### Frontend Components
- `AuthForm` - Formulário principal de login/registro
- `VerificationForm` - Verificação de identidade com documentos
- `FaceScanCapture` - Captura facial 3D
- `LivenessDetection` - Detecção de vida real
- `LoginForm` - Formulário específico de login
- `RegisterForm` - Formulário específico de registro

### Backend Components
- `/api/auth/*` - Endpoints de autenticação
- `/api/v1/verification/*` - API de verificação
- Supabase Auth - Gerenciamento de sessões
- Row Level Security - Políticas de acesso

## Fluxo de Autenticação

### 1. Registro
```
Usuário → Dados básicos → Email confirmação → Perfil criado → Login automático
```

### 2. Login
```
Usuário → Credenciais → Validação → Token JWT → Sessão ativa
```

### 3. Verificação (Opcional)
```
Upload documento → Selfie → Liveness detection → Análise AI → Aprovação
```

## Verificação de Identidade

### Tecnologias
- MediaPipe Face Detection
- Browser FaceDetector API
- AWS Textract (OCR)
- Liveness challenges (piscar, sorrir, virar cabeça)

### Processo
1. **Dados pessoais** - Nome, CPF, data nascimento
2. **Upload documento** - RG, CNH ou passaporte (frente/verso)
3. **Selfie** - Foto atual do usuário
4. **Face Scan 3D** - Múltiplos ângulos faciais
5. **Liveness Detection** - 4 desafios anti-spoofing
6. **Processamento** - Análise automática em 30s
7. **Resultado** - Aprovado/rejeitado/revisão manual

### Scoring
- Score 0-100 baseado em múltiplos fatores
- Aprovação automática acima de 80
- Revisão manual entre 40-79
- Rejeição automática abaixo de 40

## Políticas de Segurança

### Row Level Security (RLS)
```sql
-- Usuários só acessam próprios dados
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Verificações são privadas
CREATE POLICY "Users can manage own verifications" ON user_verifications
  FOR ALL USING (auth.uid() = user_id);
```

### Proteção Anti-Fraude
- Rate limiting por IP
- Detecção de múltiplos cadastros
- Validação de documentos duplicados
- Análise comportamental

## Integração com Planos

### Restrições por Plano
- **Free**: Verificação disponível mas não obrigatória
- **Gold**: Recursos completos após verificação
- **Diamond**: Prioridade na fila de verificação
- **Business**: ⚠️ **DESATIVADO TEMPORARIAMENTE** - Funcionalidade removida do registro
- **Couple**: ⚠️ **DESATIVADO TEMPORARIAMENTE** - Funcionalidade removida do registro

### Benefícios da Verificação
- Badge azul de verificado
- Limites aumentados (mensagens, stories, uploads)
- Acesso a recursos premium
- Maior visibilidade no algoritmo

## APIs Principais

### Endpoints
```typescript
POST /api/auth/login          // Login com email/senha
POST /api/auth/register       // Registro de novo usuário
POST /api/auth/logout         // Logout e limpeza de sessão
GET  /api/auth/session        // Verificar sessão ativa

POST /api/v1/verification/submit    // Enviar verificação
GET  /api/v1/verification/status    // Status da verificação
```

### Payloads Exemplo
```typescript
// Login
{
  email: "user@example.com",
  password: "password123"
}

// Verificação
{
  fullName: "João Silva",
  cpf: "123.456.789-00",
  birthDate: "1990-01-01",
  documentType: "rg",
  documentNumber: "12.345.678-9",
  documentFront: File,
  documentBack: File,
  selfiePhoto: File,
  faceScanData: "{...}"
}
```

## Database Schema

### Tabelas Principais
- `auth.users` - Usuários base (Supabase)
- `public.users` - Perfil estendido
- `user_verifications` - Processos de verificação
- `verification_documents` - Documentos upload

### Storage Buckets
- `verification-documents` - Documentos de identidade
- `avatars` - Fotos de perfil
- `profile-media` - Mídia adicional do perfil

## Estados e Transições

### Estados do Usuário
- `unregistered` - Não cadastrado
- `registered` - Cadastrado mas não verificado
- `pending_verification` - Verificação em andamento
- `verified` - Verificado com sucesso
- `verification_failed` - Verificação rejeitada

### Estados da Verificação
- `pending` - Aguardando processamento
- `processing` - Em análise
- `approved` - Aprovada
- `rejected` - Rejeitada
- `manual_review` - Requer revisão manual

## Configurações

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Verification
VERIFICATION_ENABLED=true
VERIFICATION_AUTO_APPROVAL_THRESHOLD=80
VERIFICATION_PROCESSING_DELAY=30000

# Security
AUTH_SESSION_TIMEOUT=86400
MAX_LOGIN_ATTEMPTS=5
PASSWORD_MIN_LENGTH=8
```

## Monitoramento

### Métricas Importantes
- Taxa de conversão registro → login
- Taxa de verificação iniciada → completada
- Tempo médio de processamento
- Taxa de aprovação automática vs manual
- Tentativas de fraude detectadas

### Logs de Auditoria
- Todas tentativas de login (sucesso/falha)
- Processos de verificação iniciados
- Mudanças de dados sensíveis
- Acessos administrativos

## Problemas Conhecidos

1. **Safari iOS** - Problemas com MediaPipe, fallback para seleção manual
2. **Rate Limiting** - Pode bloquear usuários legítimos em redes compartilhadas
3. **OCR Accuracy** - Documentos com qualidade ruim podem falhar
4. **Liveness False Positives** - Usuários com deficiências podem ter dificuldades
5. **Geolocalização** - Correções implementadas para melhor precisão
6. **Enums de Gênero** - Sistema atualizado com novas opções de identidade

## TODOs / Melhorias

- [ ] Implementar 2FA opcional
- [ ] Adicionar login social (Google, Apple)
- [ ] Melhorar detecção de documentos adulterados
- [ ] Dashboard de análise de verificações
- [ ] API para verificação em lote
- [ ] Suporte a passaportes internacionais
- [ ] Integração com bureaus de crédito

## Dependências Externas

- Supabase Auth
- MediaPipe
- AWS Textract
- IBGE API (validação de endereços)
- Receita Federal API (validação de CPF)

## Última Atualização

**Data**: 2025-08-07  
**Versão**: v0.3.5-alpha  
**Responsável**: Sistema de autenticação com correções e melhorias

## Mudanças Recentes (v0.3.5)

### ✨ Melhorias
- Correções no sistema de geolocalização para melhor precisão
- Atualização dos enums de gênero com 9 opções abrangentes
- Melhorias na experiência do usuário no registro e login
- Otimizações de performance nos formulários

### ⚠️ Mudanças Importantes
- **Contas Business**: Temporariamente removidas do fluxo de registro
- **Planos Couple**: Temporariamente removidos do fluxo de registro
- **Enums de Gênero**: Atualizados para incluir identidades de casal e transgênero

### 🐛 Correções
- Validação de campos melhorada nos formulários
- Tratamento de erros mais robusto
- Correções na integração com APIs de geolocalização