# 🏦 Guia de Teste do Sistema de Pagamento PIX

## 📋 Visão Geral

O OpenLove tem duas APIs para testar pagamentos PIX:

1. **API de Teste Completa** (`/api/test/abacatepay-pix`) - Cria pagamento de teste
2. **API de Simulação** (`/api/v1/payments/simulate-pix`) - Simula pagamento existente

## 🚀 Como Testar Pagamento PIX

### Método 1: Teste Completo (Recomendado)

#### 1. Ver Documentação da API
```bash
GET http://localhost:3000/api/test/abacatepay-pix
```

#### 2. Criar um Pagamento PIX de Teste

No console do navegador (F12) ou usando cURL:

```javascript
// JavaScript no console
fetch('/api/test/abacatepay-pix', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    plan: 'gold',                          // 'gold', 'diamond', ou 'couple'
    customer_email: 'teste@example.com',
    customer_name: 'João Teste',
    customer_document: '12345678900',      // CPF (opcional)
    billing_cycle: 'monthly',              // 'monthly' ou 'yearly'
    simulate_payment: true,                // Simular pagamento automaticamente
    simulate_delay: 30                     // Aguardar 30 segundos para simular
  })
})
.then(r => r.json())
.then(data => {
  console.log('Resposta:', data);
  if (data.success) {
    console.log('QR Code:', data.data.qr_code_image);
    console.log('PIX Code:', data.data.pix_code);
    console.log('Payment ID:', data.data.payment_id);
  }
});
```

```bash
# cURL
curl -X POST http://localhost:3000/api/test/abacatepay-pix \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "gold",
    "customer_email": "teste@example.com",
    "customer_name": "João Teste",
    "billing_cycle": "monthly",
    "simulate_payment": true,
    "simulate_delay": 30
  }'
```

#### 3. Resposta Esperada
```json
{
  "success": true,
  "data": {
    "payment_id": "pix_abc123...",
    "amount": 25.00,
    "status": "pending",
    "pix_code": "00020126580014BR.GOV.BCB.PIX...",
    "qr_code": "https://api.qrserver.com/v1/create-qr-code/?data=...",
    "qr_code_image": "data:image/png;base64,...",
    "expires_at": "2025-08-08T15:30:00Z",
    "simulation": {
      "will_simulate": true,
      "simulate_after_seconds": 30
    }
  },
  "logs": [
    "INFO: Starting AbacatePay PIX test",
    "SUCCESS: PIX payment created with ID: pix_abc123",
    // ... mais logs
  ]
}
```

### Método 2: Simular Pagamento Manual

Se você tem um `payment_id` e quer simular manualmente:

```javascript
// Simular conclusão de pagamento específico
fetch('/api/test/abacatepay-pix?payment_id=pix_abc123', {
  method: 'PUT'
})
.then(r => r.json())
.then(console.log);
```

### Método 3: API de Simulação (Precisa de pixId)

Se você tem um `pixId` do AbacatePay:

```javascript
fetch('/api/v1/payments/simulate-pix', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    pixId: 'pix_abc123'  // ID do pagamento PIX existente
  })
})
.then(r => r.json())
.then(console.log);
```

## 🔍 Verificar Status do Pagamento

### No Banco de Dados

```sql
-- Ver últimos pagamentos PIX de teste
SELECT 
  external_id,
  abacatepay_id,
  amount,
  status,
  customer_email,
  plan_type,
  created_at
FROM pix_payments
WHERE is_test = true
ORDER BY created_at DESC
LIMIT 10;

-- Ver pagamento específico
SELECT * FROM pix_payments
WHERE abacatepay_id = 'pix_abc123';
```

## 🎯 Fluxo Completo de Teste

1. **Criar Pagamento**
   ```javascript
   const response = await fetch('/api/test/abacatepay-pix', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       plan: 'diamond',
       customer_email: 'vip@test.com',
       customer_name: 'VIP Test',
       simulate_payment: true,
       simulate_delay: 10  // Simula em 10 segundos
     })
   });
   const data = await response.json();
   console.log('Payment ID:', data.data.payment_id);
   ```

2. **Aguardar Simulação Automática**
   - Aguarde 10 segundos
   - O sistema simulará automaticamente o pagamento
   - Webhook será chamado
   - Usuário será atualizado para plano Diamond

3. **Verificar Atualização**
   ```javascript
   // Verificar se usuário foi atualizado
   fetch('/api/v1/users/me')
     .then(r => r.json())
     .then(user => console.log('Premium Type:', user.premium_type));
   ```

## 🐛 Troubleshooting

### Erro 400: "Dados inválidos: pixId é obrigatório"
- Você está usando `/api/v1/payments/simulate-pix` sem fornecer `pixId`
- Use `/api/test/abacatepay-pix` para criar um novo pagamento

### Erro 403: "Test routes are only available in development"
- As rotas de teste só funcionam em desenvolvimento
- Certifique-se que `NODE_ENV=development`

### Erro: "Payment not found"
- O payment_id fornecido não existe
- Verifique no banco de dados ou crie um novo

### Pagamento não está sendo simulado
- Verifique os logs no console do servidor
- Certifique-se que `simulate_payment: true`
- Aguarde o tempo de `simulate_delay`

## 📊 Preços dos Planos

| Plano | Mensal | Anual |
|-------|--------|-------|
| Gold | R$ 25,00 | R$ 270,00 |
| Diamond | R$ 45,00 | R$ 486,00 |
| Couple | R$ 69,90 | R$ 754,92 |

## 🔗 APIs Relacionadas

- **Criar Teste PIX**: `POST /api/test/abacatepay-pix`
- **Simular Manual**: `PUT /api/test/abacatepay-pix?payment_id={id}`
- **Simular por ID**: `POST /api/v1/payments/simulate-pix`
- **Webhook**: `POST /api/v1/payments/webhook/abacatepay`
- **Status do Usuário**: `GET /api/v1/users/me`

## 💡 Dicas

1. **Use simulação automática** para testar o fluxo completo
2. **Defina delay curto** (10-30 segundos) para testes rápidos
3. **Verifique os logs** retornados pela API para debug
4. **Marque como teste** - todos os pagamentos criados pela API de teste são marcados com `is_test: true`
5. **QR Code funcional** - o QR code gerado é real e pode ser escaneado

## 🔒 Segurança

- APIs de teste só funcionam em desenvolvimento
- Pagamentos de teste são marcados no banco
- Não afetam dados de produção
- Headers especiais identificam simulações