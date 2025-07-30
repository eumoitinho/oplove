/**
 * Script para criar produtos e preços na Stripe
 * Execute: node scripts/setup-stripe.mjs
 */

import { readFileSync } from 'fs';

// Carrega variáveis do .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key] = valueParts.join('=');
  }
});

const STRIPE_SECRET_KEY = envVars.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada no .env.local');
  process.exit(1);
}

console.log('🚀 Criando produtos e preços na Stripe...\n');

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

async function createProduct(name, description) {
  const formData = new URLSearchParams();
  formData.append('name', name);
  formData.append('description', description);

  const response = await fetch('https://api.stripe.com/v1/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  return await response.json();
}

async function createPrice(productId, amount, interval, intervalCount) {
  const formData = new URLSearchParams();
  formData.append('product', productId);
  formData.append('unit_amount', amount.toString());
  formData.append('currency', 'brl');
  formData.append('recurring[interval]', interval);
  formData.append('recurring[interval_count]', intervalCount.toString());

  const response = await fetch('https://api.stripe.com/v1/prices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  return await response.json();
}

async function setupStripe() {
  const envVars = [];

  for (const productData of products) {
    try {
      console.log(`📦 Criando produto: ${productData.name}`);
      
      const product = await createProduct(productData.name, productData.description);
      
      if (product.error) {
        console.error(`❌ Erro ao criar produto: ${product.error.message}`);
        continue;
      }
      
      console.log(`✅ Produto criado: ${product.id}`);
      envVars.push(`STRIPE_PRODUCT_${productData.id.toUpperCase()}=${product.id}`);

      for (const priceData of productData.prices) {
        console.log(`  💰 Criando preço ${priceData.suffix}: R$ ${(priceData.amount / 100).toFixed(2)}`);
        
        const price = await createPrice(
          product.id,
          priceData.amount,
          priceData.interval,
          priceData.interval_count
        );

        if (price.error) {
          console.error(`  ❌ Erro ao criar preço: ${price.error.message}`);
          continue;
        }

        console.log(`  ✅ Preço criado: ${price.id}`);
        envVars.push(`STRIPE_PRICE_${productData.id.toUpperCase()}_${priceData.suffix.toUpperCase()}=${price.id}`);
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Erro ao criar produto ${productData.name}:`, error.message);
    }
  }

  console.log('🎉 Criação concluída!\n');
  console.log('📝 Copie e cole estas variáveis no seu .env.local:\n');
  
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
}

setupStripe().catch(console.error);