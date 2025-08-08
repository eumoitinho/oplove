# Sistema de Pagamentos - OpenLove

## Visão Geral

Sistema completo de pagamentos com múltiplos métodos (Stripe, PIX), gestão de assinaturas, monetização de conteúdo, sistema de créditos e comissionamento para criadores de conteúdo.

## Componentes Principais

### Frontend Components
- `SubscriptionPlans` - Exibição dos planos disponíveis
- `PaymentModal` - Modal de pagamento unificado
- `CreditsPurchase` - Compra de créditos
- `PaymentMethods` - Gestão de métodos de pagamento
- `EarningsDashboard` - Dashboard de ganhos (Diamond+)
- `PayoutSettings` - Configurações de saque
- `InvoiceHistory` - Histórico de faturas

### Backend Components
- `/api/payments/stripe/*` - Integração Stripe
- `/api/payments/pix/*` - Integração PIX (AbacatePay)
- `/api/subscriptions/*` - Gestão de assinaturas
- `/api/credits/*` - Sistema de créditos
- `/api/payouts/*` - Saques para criadores
- Webhook Handlers - Processamento de eventos
- Commission Service - Cálculo de comissões

## Planos de Assinatura

### Planos Disponíveis
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;           // em centavos
  currency: 'BRL';
  interval: 'month';
  features: string[];
  popular?: boolean;
  couple?: boolean;        // Plano para 2 pessoas
}

const plans = [
  {
    id: 'gold',
    name: 'Gold',
    price: 2500,           // R$ 25,00
    features: [
      '10 mensagens/dia (ilimitado se verificado)',
      'Upload de até 5 imagens por post',
      'Criação de eventos',
      'Participar de até 5 comunidades',
      'Anúncios reduzidos'
    ]
  },
  {
    id: 'diamond',
    name: 'Diamond',
    price: 4500,           // R$ 45,00
    popular: true,
    features: [
      'Mensagens ilimitadas',
      'Upload ilimitado de mídia',
      'Calls de voz e vídeo',
      'Criar grupos',
      'Monetizar conteúdo',
      'Analytics',
      'Sem anúncios'
    ]
  },
  {
    id: 'couple',
    name: 'Dupla Hot',
    price: 6990,           // R$ 69,90
    couple: true,
    features: [
      'Todos os recursos Diamond para 2 contas',
      'Perfis sincronizados',
      'Posts compartilhados',
      'Lives conjuntas',
      'Badge "Dupla Verificada"'
    ]
  }
];
```

### Benefícios por Plano
- **Free**: Acesso básico, limitações em tudo
- **Gold**: Recursos intermediários, ideal para usuários ativos
- **Diamond**: Acesso completo, monetização habilitada
- **Couple**: Diamond para 2 contas com recursos exclusivos

## Métodos de Pagamento

### 1. Stripe (Cartões Internacionais)
```typescript
interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  
  // Produtos configurados
  products: {
    gold: 'price_1234567890',
    diamond: 'price_0987654321', 
    couple: 'price_1122334455'
  };
}
```

### 2. PIX via AbacatePay (Brasil)
```typescript
interface PixPayment {
  amount: number;
  payer: {
    name: string;
    email: string;
    cpf: string;
  };
  qrCode: string;
  qrCodeText: string;
  expiresAt: Date;
}
```

### Fluxo de Pagamento
1. **Seleção do plano** na interface
2. **Escolha do método** (cartão ou PIX)
3. **Processamento** via Stripe ou AbacatePay
4. **Confirmação** via webhook
5. **Ativação** automática do plano
6. **Email** de confirmação

## Sistema de Créditos

### Usos dos Créditos
1. **Story Boosts** - Aumentar visibilidade (50-150 créditos)
2. **Profile Seals** - Presentes virtuais (15-100 créditos)
3. **Profile Boosts** - Destaque no explore (200+ créditos)
4. **Premium Reactions** - Reações especiais (5-10 créditos)
5. **Super Likes** - Likes com destaque (25 créditos)

### Pacotes de Créditos
```typescript
const creditPackages = [
  { credits: 100, price: 1000, bonus: 0 },      // R$ 10,00
  { credits: 500, price: 4500, bonus: 10 },     // R$ 45,00 (10% bônus)
  { credits: 1000, price: 8000, bonus: 25 },    // R$ 80,00 (25% bônus)
  { credits: 2500, price: 18000, bonus: 30 },   // R$ 180,00 (30% bônus)
  { credits: 5000, price: 32000, bonus: 40 }    // R$ 320,00 (40% bônus)
];
```

### Gestão de Saldo
```sql
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  last_purchase_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_credit_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type credit_transaction_type NOT NULL, -- 'purchase', 'spend', 'refund'
  amount INTEGER NOT NULL,               -- Positivo para ganho, negativo para gasto
  description TEXT,
  reference_id UUID,                     -- ID do boost, seal, etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Monetização de Conteúdo

### Quem Pode Monetizar
- Apenas usuários **Diamond+**
- **Verificação obrigatória** para saques
- **Business verification** para comissões reduzidas

### Tipos de Conteúdo Monetizável
1. **Posts Premium** - Paywall em posts específicos
2. **Assinaturas de Perfil** - Acesso ao conteúdo do criador
3. **Mensagens Pagas** - Cobra para responder mensagens
4. **Lives Privadas** - Transmissões exclusivas para pagantes
5. **Conteúdo Personalizado** - Sob demanda

### Sistema de Comissões
```typescript
interface CommissionRates {
  unverified: 0.20;      // 20% de comissão
  verified: 0.15;        // 15% de comissão  
  business: 0.10;        // 10% de comissão
}

// Exemplo de cálculo
function calculateEarnings(amount: number, userType: string): number {
  const rate = getCommissionRate(userType);
  const commission = amount * rate;
  const earning = amount - commission;
  return earning;
}
```

### Saques (Payouts)
- **Mínimo**: R$ 50,00
- **Frequência**: Semanal (toda quinta-feira)
- **Método**: PIX apenas (Brasil)
- **Prazo**: 2-3 dias úteis
- **Taxa**: Gratuito para valores acima de R$ 100

## Database Schema

### Assinaturas
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  plan_type subscription_plan_type NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  
  -- Stripe
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  -- PIX
  pix_payment_id TEXT,
  
  -- Datas
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de pagamentos
CREATE TABLE payment_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  
  amount INTEGER NOT NULL,              -- Em centavos
  currency TEXT DEFAULT 'BRL',
  method payment_method NOT NULL,       -- 'stripe', 'pix'
  status payment_status NOT NULL,       -- 'pending', 'completed', 'failed'
  
  -- IDs externos
  stripe_payment_intent_id TEXT,
  pix_transaction_id TEXT,
  
  -- Dados do PIX
  pix_qr_code TEXT,
  pix_expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Monetização
```sql
-- Conteúdo pago
CREATE TABLE paid_content (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  post_id UUID REFERENCES posts(id),
  
  price INTEGER NOT NULL,               -- Em centavos
  currency TEXT DEFAULT 'BRL',
  
  -- Estatísticas
  views_count INTEGER DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,           -- Total arrecadado
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compras de conteúdo
CREATE TABLE content_purchases (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES users(id),
  content_id UUID REFERENCES paid_content(id),
  
  amount_paid INTEGER NOT NULL,
  creator_earnings INTEGER NOT NULL,    -- Após comissão
  platform_commission INTEGER NOT NULL,
  
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saques dos criadores
CREATE TABLE payouts (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  
  amount INTEGER NOT NULL,              -- Valor solicitado
  commission INTEGER NOT NULL,          -- Comissão retida
  net_amount INTEGER NOT NULL,          -- Valor líquido
  
  status payout_status DEFAULT 'pending',
  
  -- Dados PIX
  pix_key TEXT NOT NULL,
  pix_key_type pix_key_type NOT NULL,
  
  -- Processamento
  processed_at TIMESTAMP WITH TIME ZONE,
  transaction_id TEXT,                  -- ID do banco
  
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## APIs Principais

### Assinaturas
```typescript
GET    /api/subscriptions/plans        // Listar planos disponíveis
POST   /api/subscriptions/subscribe    // Iniciar assinatura
PUT    /api/subscriptions/update       // Alterar plano
DELETE /api/subscriptions/cancel       // Cancelar assinatura
GET    /api/subscriptions/status       // Status atual

// Pagamentos
POST   /api/payments/stripe/intent     // Criar Payment Intent
POST   /api/payments/pix/create        // Gerar QR Code PIX
GET    /api/payments/history           // Histórico de pagamentos

// Webhooks
POST   /api/webhooks/stripe            // Eventos do Stripe
POST   /api/webhooks/abacate          // Eventos do AbacatePay
```

### Créditos
```typescript
GET    /api/credits/balance            // Saldo atual
POST   /api/credits/purchase           // Comprar créditos
GET    /api/credits/packages           // Pacotes disponíveis
GET    /api/credits/history            // Histórico de transações
```

### Monetização
```typescript
// Conteúdo pago
POST   /api/content/monetize           // Tornar conteúdo pago
GET    /api/content/earnings           // Ganhos por conteúdo
POST   /api/content/purchase           // Comprar acesso

// Saques
POST   /api/payouts/request            // Solicitar saque
GET    /api/payouts/history            // Histórico de saques
PUT    /api/payouts/pix-settings       // Configurar chave PIX
```

## Webhooks e Eventos

### Stripe Webhooks
```typescript
const webhookEvents = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed', 
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
];
```

### AbacatePay Webhooks
```typescript
const pixEvents = [
  'pix.received',           // PIX confirmado
  'pix.expired',            // QR Code expirou
  'pix.cancelled'           // Pagamento cancelado
];
```

## Segurança e Compliance

### Validações
- **Webhook signatures** verificadas
- **Idempotency keys** para evitar duplicatas
- **Rate limiting** em endpoints sensíveis
- **PCI DSS** compliance via Stripe
- **LGPD** compliance para dados financeiros

### Auditoria
```typescript
// Log de todas transações financeiras
interface PaymentLog {
  user_id: string;
  action: string;
  amount: number;
  method: string;
  status: string;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
}
```

## Dashboard Financeiro

### Para Usuários
- Histórico de pagamentos
- Próximas cobranças
- Alterar plano
- Cancelar assinatura
- Gerenciar métodos de pagamento

### Para Criadores (Diamond+)
- Receita por período
- Conteúdo mais vendido
- Comissões por tipo
- Solicitações de saque
- Analytics de monetização

### Para Admins
- Receita total da plataforma
- Usuários por plano
- Taxa de conversão
- Saques pendentes
- Relatórios financeiros

## Problemas Conhecidos

1. **PIX delays** - Confirmação pode demorar até 15 minutos
2. **Stripe 3D Secure** - Alguns cartões requerem autenticação adicional
3. **Currency precision** - Arredondamentos em cálculos de comissão
4. **Webhook retries** - Falhas ocasionais requerem retry manual
5. **Payout delays** - Saques podem atrasar em feriados bancários

## TODOs / Melhorias

- [ ] Suporte a múltiplas moedas
- [ ] Planos anuais com desconto
- [ ] Gift subscriptions
- [ ] Assinaturas corporativas
- [ ] Cryptocurrency payments
- [ ] Automatic tax calculations
- [ ] Advanced analytics dashboard
- [ ] Subscription pause/resume
- [ ] Promo codes e cupons
- [ ] Affiliate program
- [ ] Revenue sharing splits
- [ ] Escrow for custom content

## Rotas de Teste (Desenvolvimento)

### AbacatePay PIX Test
**Endpoint**: `/api/test/abacatepay-pix`

#### Funcionalidades
- Criação de pagamentos PIX de teste
- Simulação automática de pagamento (configurável)
- Simulação manual via PUT request
- Geração de QR codes funcionais
- Logs detalhados para debugging

#### Exemplo de uso
```typescript
// POST /api/test/abacatepay-pix
{
  "plan": "gold",
  "customer_email": "test@example.com",
  "customer_name": "João Test",
  "customer_document": "12345678900",
  "billing_cycle": "monthly",
  "simulate_payment": true,
  "simulate_delay": 30
}

// PUT /api/test/abacatepay-pix?payment_id={id}
// Simula conclusão manual do pagamento
```

### Stripe Subscription Test
**Endpoint**: `/api/test/stripe-subscription`

#### Funcionalidades
- Teste de diferentes cenários de cartão
- Simulação de falhas de pagamento
- Teste de autenticação 3D Secure
- Criação de assinaturas de teste

#### Cartões de teste disponíveis
```typescript
const TEST_CARDS = {
  success: "4242424242424242",
  decline_generic: "4000000000000002",
  decline_insufficient_funds: "4000000000009995",
  decline_lost_card: "4000000000009987",
  require_authentication: "4000002500003155",
  charge_dispute: "4000000000000259"
}
```

### Payment Dashboard Test
**Endpoint**: `/api/test/payment-dashboard`

#### Funcionalidades
- Visualização de dados de teste
- Métricas de conversão
- Status de webhooks
- Logs de pagamento

**⚠️ Importante**: Todas as rotas de teste são bloqueadas em produção e só funcionam em ambiente de desenvolvimento.

## Dependências Externas

- **Stripe** - Processamento de cartões
- **AbacatePay** - PIX brasileiro
- **Banco Central** - Validação de chaves PIX
- **Receita Federal** - Validação de CPF/CNPJ
- **AWS Lambda** - Processamento de webhooks

## Configuração

### Environment Variables
```bash
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AbacatePay PIX
ABACATE_API_KEY=your_api_key
ABACATE_WEBHOOK_SECRET=your_secret

# Comissões
COMMISSION_RATE_UNVERIFIED=0.20
COMMISSION_RATE_VERIFIED=0.15
COMMISSION_RATE_BUSINESS=0.10

# Saques
MINIMUM_PAYOUT=5000              # R$ 50,00 em centavos
PAYOUT_SCHEDULE=weekly           # weekly, biweekly, monthly
```

## Última Atualização

**Data**: 2025-08-07  
**Versão**: v0.3.5-alpha  
**Status**: Sistema de pagamentos completo com ferramentas de teste avançadas

## Mudanças Recentes (v0.3.5)

### ✨ Novas Funcionalidades
- **Rotas de Teste Avançadas**: Implementadas rotas completas para teste de PIX e Stripe
- **Simulação Automática**: PIX pode ser simulado automaticamente após delay configurável
- **Logging Detalhado**: Logs estruturados para debugging de pagamentos
- **Dashboard de Testes**: Interface para monitorar pagamentos de teste

### 🛠️ Melhorias Técnicas
- Webhook simulation para AbacatePay
- Cartões de teste padronizados do Stripe
- Armazenamento de pagamentos teste no banco
- Headers especiais para identificar simulações

### 🔒 Segurança
- Rotas de teste completamente bloqueadas em produção
- Validação de ambiente development
- Identificação clara de transações teste no banco