# 💳 Guia de Teste do Checkout - OpenLove

## 🎯 Visão Geral

A página de checkout foi configurada para suportar testes completos de pagamento tanto com **Stripe (cartão)** quanto com **AbacatePay (PIX)** em modo de desenvolvimento.

## 🔧 Configuração

### Verificar Modo de Desenvolvimento
```bash
# No seu .env.local
NODE_ENV=development
```

## 💳 Teste com Cartão de Crédito (Stripe)

### Como Testar:

1. **Acesse a página de checkout:**
   ```
   http://localhost:3000/checkout?plan=diamond&period=monthly
   ```

2. **Selecione "Cartão de Crédito/Débito"**

3. **Use um dos cartões de teste:**

   | Cenário | Número do Cartão | CVV | Validade |
   |---------|------------------|-----|-----------|
   | ✅ **Sucesso** | 4242 4242 4242 4242 | Qualquer (ex: 123) | Qualquer data futura (ex: 12/25) |
   | ❌ **Recusado** | 4000 0000 0000 0002 | Qualquer | Qualquer data futura |
   | 🔐 **3D Secure** | 4000 0025 0000 3155 | Qualquer | Qualquer data futura |

4. **Preencha os dados:**
   - Nome: Qualquer nome (ex: "João Teste")
   - CVV: Qualquer 3 dígitos (ex: "123")
   - Validade: Qualquer data futura (ex: "12/25")

5. **Clique em "Finalizar Pagamento"**

### Resultados Esperados:

- **Cartão de Sucesso (4242...)**: 
  - Toast: "✅ Pagamento de teste realizado com sucesso!"
  - Redirecionamento para `/feed`
  - Plano ativado

- **Cartão Recusado (4000...0002)**:
  - Toast: "❌ Cartão recusado (teste)"
  - Permanece na página
  - Sugestão para usar cartão de sucesso

- **Cartão 3D Secure (4000...3155)**:
  - Toast: "🔐 Autenticação necessária"
  - Simula fluxo 3D Secure (3 segundos)
  - Toast: "✅ Autenticação concluída"
  - Redirecionamento para `/feed`

## 💸 Teste com PIX (AbacatePay)

### Como Testar:

1. **Acesse a página de checkout:**
   ```
   http://localhost:3000/checkout?plan=gold&period=monthly
   ```

2. **Selecione "PIX"**

3. **Clique em "Gerar PIX"**

4. **Resultado:**
   - PIX real será gerado
   - QR Code funcional
   - **Simulação automática em 10 segundos**

### Fluxo do PIX:

1. **Geração:**
   - Toast: "Gerando PIX de teste..."
   - API cria pagamento real no AbacatePay

2. **Redirecionamento:**
   - Vai para `/payment/pix` com QR Code
   - Mostra código PIX copiável
   - Timer de expiração

3. **Simulação Automática:**
   - Após 10 segundos, pagamento é marcado como pago
   - Webhook é chamado
   - Usuário recebe o plano

## 🧪 URLs de Teste Rápido

### Plano Gold
```
# Mensal
http://localhost:3000/checkout?plan=gold&period=monthly

# Anual (20% desconto)
http://localhost:3000/checkout?plan=gold&period=annual
```

### Plano Diamond
```
# Mensal
http://localhost:3000/checkout?plan=diamond&period=monthly

# Semestral (15% desconto)
http://localhost:3000/checkout?plan=diamond&period=semiannual
```

### Plano Casal
```
# Mensal
http://localhost:3000/checkout?plan=couple&period=monthly

# Trimestral (10% desconto)
http://localhost:3000/checkout?plan=couple&period=quarterly
```

## 🔍 Verificar Resultado

### Após pagamento bem-sucedido:

1. **Verificar no banco de dados:**
```sql
-- Ver última assinatura criada
SELECT * FROM subscriptions 
ORDER BY created_at DESC 
LIMIT 1;

-- Ver status do usuário
SELECT id, email, premium_type, premium_expires_at 
FROM users 
WHERE id = 'seu-user-id';
```

2. **Verificar via API:**
```javascript
// No console do navegador
fetch('/api/v1/users/me')
  .then(r => r.json())
  .then(data => console.log('Premium:', data.premium_type))
```

## 🐛 Troubleshooting

### Erro: "Use um cartão de teste"
- Você está usando um número de cartão não reconhecido
- Use um dos cartões de teste listados acima

### Erro: "Test routes are only available in development"
- Certifique-se que `NODE_ENV=development`
- Reinicie o servidor após mudar variáveis de ambiente

### PIX não está simulando
- Verifique os logs do servidor
- Certifique-se que a API `/api/test/abacatepay-pix` está acessível
- Verifique se `simulate_payment: true` está sendo enviado

### Página não carrega
- Verifique se os parâmetros da URL estão corretos
- `plan` deve ser: gold, diamond, ou couple
- `period` deve ser: monthly, quarterly, semiannual, ou annual

## 📊 Preços por Plano

| Plano | Mensal | Trimestral (-10%) | Semestral (-15%) | Anual (-20%) |
|-------|--------|-------------------|------------------|--------------|
| Gold | R$ 25,00 | R$ 67,50 | R$ 127,50 | R$ 240,00 |
| Diamond | R$ 45,00 | R$ 121,50 | R$ 229,50 | R$ 432,00 |
| Casal | R$ 69,90 | R$ 188,73 | R$ 356,49 | R$ 670,08 |

## 🎨 Indicadores Visuais

### Modo de Teste Ativado:

- **Cartão**: Banner amarelo com cartões de teste
- **PIX**: Banner verde indicando simulação automática
- **Toasts**: Mensagens claras indicando que é teste

## 🚀 Testar Agora

1. **Teste Rápido com Cartão:**
   - Acesse: http://localhost:3000/checkout?plan=diamond&period=monthly
   - Use cartão: 4242 4242 4242 4242
   - CVV: 123, Validade: 12/25
   - Nome: Teste

2. **Teste Rápido com PIX:**
   - Acesse: http://localhost:3000/checkout?plan=gold&period=monthly
   - Selecione PIX
   - Clique em "Gerar PIX"
   - Aguarde 10 segundos

## 📝 Notas Importantes

- Todos os pagamentos em desenvolvimento são **simulados**
- Nenhuma cobrança real é feita
- O banco de dados pode ser resetado a qualquer momento
- Use emails de teste (ex: teste@example.com)
- Os QR Codes PIX gerados são reais mas em ambiente de teste