# 📚 Documentação da API OpenLove

## Visão Geral

A API OpenLove fornece acesso programático completo à plataforma. Esta documentação descreve todos os endpoints disponíveis, seus parâmetros e respostas.

## 🔑 Autenticação

A API usa autenticação JWT (JSON Web Tokens). Existem duas formas de autenticar:

### 1. Bearer Token
```bash
Authorization: Bearer <seu-token-jwt>
```

### 2. Cookie de Sessão
O cookie `sb-access-token` é automaticamente enviado após login bem-sucedido.

## 📋 Versionamento

A API segue versionamento semântico. A versão atual é `v1`.

- **URL Base Produção**: `https://openlove.com.br/api/v1`
- **URL Base Desenvolvimento**: `http://localhost:3000/api/v1`

### Política de Versionamento

- **Versões Maiores** (`v1`, `v2`): Breaking changes
- **Versões Menores**: Novas features retrocompatíveis
- **Patches**: Correções de bugs

## 🏷️ Categorias de Endpoints

### 🔐 Auth (`/auth/*`)
- Registro, login, logout
- Recuperação de senha
- Renovação de tokens
- Verificação de username

### 👥 Users (`/users/*`)
- Perfis de usuário
- Seguir/deixar de seguir
- Bloquear/desbloquear
- Relatórios

### 📝 Posts (`/posts/*`)
- CRUD de posts
- Curtidas e reações
- Comentários
- Compartilhamentos

### 📸 Stories (`/stories/*`)
- Stories de 24h
- Visualizações e reações
- Boosts com créditos
- Respostas diretas

### 💬 Messages (`/messages/*`)
- Conversas e mensagens
- Grupos (Diamond+)
- Status de leitura
- Notificações

### 💳 Payments (`/payments/*`)
- Planos e assinaturas
- Processamento PIX/Stripe
- Histórico de pagamentos
- Webhooks

### 💰 Credits (`/credits/*`)
- Saldo de créditos
- Compra de créditos
- Histórico de transações
- Presentes e selos

### ✅ Verification (`/verification/*`)
- Verificação de identidade
- Upload de documentos
- Status de verificação

### 💼 Business (`/business/*`)
- Contas business
- Campanhas publicitárias
- Analytics
- Faturamento

## 📊 Limites de Taxa (Rate Limiting)

| Plano | Requisições/hora |
|-------|------------------|
| Free | 100 |
| Gold | 500 |
| Diamond | 2000 |
| Business | 5000 |

## 🔄 Respostas Padrão

### Sucesso
```json
{
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "error": "Mensagem de erro",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Paginação
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🚀 Como Usar

### 1. Obter Token de Acesso
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senhaSegura123!"
}
```

### 2. Fazer Requisições Autenticadas
```bash
GET /api/v1/posts
Authorization: Bearer <seu-token>
```

## 🧪 Ambiente de Testes

Use nosso playground interativo em `/docs/api` para testar os endpoints diretamente no navegador.

## 📞 Suporte

- **Email**: api@openlove.com.br
- **Discord**: [OpenLove Developers](https://discord.gg/openlove)
- **GitHub**: [Issues](https://github.com/openlove/api/issues)

## 🔐 Segurança

- Sempre use HTTPS em produção
- Não compartilhe tokens de acesso
- Implemente renovação automática de tokens
- Use rate limiting em sua aplicação

## 📝 Changelog

### v1.0.0 (Current)
- Lançamento inicial da API
- Todos os endpoints principais
- Sistema de autenticação JWT
- Documentação OpenAPI/Swagger