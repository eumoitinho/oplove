/**
 * Script para criar automaticamente todos os produtos e preços na Stripe
 * Execute com: node scripts/setup-stripe-products.js
 */

// Para funcionar com o projeto Next.js, vamos usar uma abordagem diferente
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const products = [
  {
    id: 'gold',
    name: 'OpenLove Gold',
    description: 'Plano Gold - Recursos premium básicos',
    prices: [
      { interval: 'month', interval_count: 1, amount: 2500, suffix: 'monthly' },
      { interval: 'month', interval_count: 3, amount: 6750, suffix: 'quarterly' },
      { interval: 'month', interval_count: 6, amount: 12750, suffix: 'semiannual' },
      { interval: 'year', interval_count: 1, amount: 24000, suffix: 'annual' }
    ]
  },
  {
    id: 'diamond',
    name: 'OpenLove Diamond', 
    description: 'Plano Diamond - Recursos premium completos',
    prices: [
      { interval: 'month', interval_count: 1, amount: 4500, suffix: 'monthly' },
      { interval: 'month', interval_count: 3, amount: 12150, suffix: 'quarterly' },
      { interval: 'month', interval_count: 6, amount: 22950, suffix: 'semiannual' },
      { interval: 'year', interval_count: 1, amount: 43200, suffix: 'annual' }
    ]
  },
  {
    id: 'couple',
    name: 'OpenLove Dupla Hot',
    description: 'Plano Dupla Hot - Para duas contas',
    prices: [
      { interval: 'month', interval_count: 1, amount: 6990, suffix: 'monthly' },
      { interval: 'month', interval_count: 3, amount: 18873, suffix: 'quarterly' },
      { interval: 'month', interval_count: 6, amount: 35649, suffix: 'semiannual' },
      { interval: 'year', interval_count: 1, amount: 67104, suffix: 'annual' }
    ]
  }
];

async function createStripeProducts() {
  console.log('🚀 Criando produtos e preços na Stripe...\n');
  
  const envVars = [];
  
  for (const productData of products) {
    try {
      console.log(`📦 Criando produto: ${productData.name}`);
      
      // Criar produto
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          plan_type: productData.id,
          created_by: 'openlove_setup'
        }
      });
      
      console.log(`✅ Produto criado: ${product.id}`);
      envVars.push(`STRIPE_PRODUCT_${productData.id.toUpperCase()}=${product.id}`);
      
      // Criar preços para este produto
      for (const priceData of productData.prices) {
        console.log(`  💰 Criando preço ${priceData.suffix}: R$ ${(priceData.amount / 100).toFixed(2)}`);
        
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: priceData.amount,
          currency: 'brl',
          recurring: {
            interval: priceData.interval,
            interval_count: priceData.interval_count
          },
          metadata: {
            plan_type: productData.id,
            billing_period: priceData.suffix
          }
        });
        
        console.log(`  ✅ Preço criado: ${price.id}`);
        envVars.push(`STRIPE_PRICE_${productData.id.toUpperCase()}_${priceData.suffix.toUpperCase()}=${price.id}`);
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Erro ao criar produto ${productData.name}:`, error.message);
    }
  }
  
  console.log('\n🎉 Criação concluída!\n');
  console.log('📝 Adicione estas variáveis ao seu .env.local:\n');
  console.log('# Stripe Products');
  envVars.forEach(varLine => {
    if (varLine.includes('PRODUCT')) {
      console.log(varLine);
    }
  });
  
  console.log('\n# Stripe Price IDs');
  envVars.forEach(varLine => {
    if (varLine.includes('PRICE')) {
      console.log(varLine);
    }
  });
  
  console.log('\n💡 Copie e cole essas variáveis no seu arquivo .env.local');
}

// Verificar se a chave da Stripe está configurada
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada no .env.local');
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  console.error('❌ STRIPE_SECRET_KEY inválida (deve começar com sk_)');
  process.exit(1);
}

console.log(`🔑 Usando Stripe ${process.env.STRIPE_SECRET_KEY.startsWith('sk_test') ? 'TEST' : 'LIVE'} mode\n`);

createStripeProducts().catch(console.error);