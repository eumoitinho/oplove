# Changelog - Sistema de Pagamentos

## v0.3.3 - 2025-08-07

### ✨ Adicionado
- Sistema completo de créditos com 5 pacotes
- Profile Seals como produtos de créditos
- Story Boosts monetização
- Dashboard de ganhos para criadores
- Sistema de comissionamento (10-20% based on verification)
- Pagamentos PIX via AbacatePay
- Webhook handling robusto para ambos providers
- Analytics de receita em tempo real
- Sistema de saques semanais para criadores

### 🔧 Melhorado
- Performance do checkout com cache
- UX do modal de pagamento unificado
- Handling de falhas de pagamento
- Sistema de retry automático para webhooks
- Validações de segurança aprimoradas
- Dashboard administrativo de pagamentos

### 🐛 Corrigido
- Race conditions em transações de créditos
- Problema com PIX não confirmando automaticamente
- Double-charge ocasional via webhook duplicado
- Inconsistências em cálculos de comissão

## v0.3.2 - 2025-01-31

### ✨ Adicionado
- Integração completa com Stripe
- Três planos de assinatura (Gold, Diamond, Couple)
- Sistema de cobrança recorrente mensal
- Cancelamento e alteração de planos
- Histórico de pagamentos
- Primeira versão de monetização de conteúdo
- Sistema básico de comissões

### 🔧 Melhorado
- Fluxo de checkout mais intuitivo
- Handling de cartões declinados
- Interface de gestão de assinatura
- Validações de plano em tempo real

### 🐛 Corrigido
- Problema com 3D Secure em alguns cartões
- Cobrança não parando após cancelamento
- Status de assinatura inconsistente

## v0.3.1 - 2025-01-15

### ✨ Adicionado
- Payment intents básicos com Stripe
- Validação de cartões
- Upgrade/downgrade de planos
- Webhooks básicos

### 🔧 Melhorado
- Segurança do processamento de pagamentos
- UX dos formulários de pagamento

### 🐛 Corrigido
- Timeouts em pagamentos lentos
- Problemas de redirect após pagamento

## v0.3.0 - 2025-01-01

### ✨ Adicionado
- Estrutura básica de planos
- Integração inicial com Stripe
- Sistema de assinatura simples
- Controle de acesso baseado em plano

### 🎯 Baseline
- Primeiro sistema de pagamentos funcional
- Suporte apenas para cartão de crédito
- Três planos básicos configurados