#!/usr/bin/env node

/**
 * Test Script for OpenLove Checkout
 * Tests both Stripe and PIX payment methods
 */

const BASE_URL = 'http://localhost:3000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

async function testStripePayment() {
  logSection('💳 TESTE DE PAGAMENTO COM CARTÃO (STRIPE)');
  
  log('\n📋 Instruções para teste manual:', 'yellow');
  log('1. Abra o navegador em:', 'blue');
  log(`   ${BASE_URL}/checkout?plan=diamond&period=monthly`, 'magenta');
  
  log('\n2. Selecione "Cartão de Crédito/Débito"', 'blue');
  
  log('\n3. Use um dos seguintes cartões de teste:', 'blue');
  log('   ✅ Sucesso: 4242 4242 4242 4242', 'green');
  log('   ❌ Recusado: 4000 0000 0000 0002', 'red');
  log('   🔐 3D Secure: 4000 0025 0000 3155', 'yellow');
  
  log('\n4. Preencha os campos:', 'blue');
  log('   - Nome: Qualquer nome (ex: "Teste")', 'cyan');
  log('   - CVV: Qualquer 3 dígitos (ex: "123")', 'cyan');
  log('   - Validade: Qualquer data futura (ex: "12/25")', 'cyan');
  
  log('\n5. Clique em "Finalizar Pagamento"', 'blue');
  
  log('\n✨ Resultado esperado:', 'green');
  log('   - Toast de sucesso aparecerá');
  log('   - Redirecionamento para /feed');
  log('   - Plano Diamond ativado (modo teste)');
}

async function testPixPayment() {
  logSection('💸 TESTE DE PAGAMENTO COM PIX');
  
  log('\n📋 Teste automático via API:', 'yellow');
  
  try {
    log('\nCriando pagamento PIX de teste...', 'blue');
    
    const response = await fetch(`${BASE_URL}/api/test/abacatepay-pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: 'gold',
        customer_email: 'teste@example.com',
        customer_name: 'João Teste',
        billing_cycle: 'monthly',
        simulate_payment: true,
        simulate_delay: 10
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('\n✅ PIX criado com sucesso!', 'green');
      log(`   Payment ID: ${data.data.payment_id}`, 'cyan');
      log(`   Valor: R$ ${data.data.amount.toFixed(2)}`, 'cyan');
      log(`   Status: ${data.data.status}`, 'cyan');
      
      log('\n📱 QR Code gerado:', 'blue');
      log('   ' + data.data.pix_code.substring(0, 50) + '...', 'magenta');
      
      log('\n⏱️  Simulação automática:', 'yellow');
      log(`   Pagamento será simulado em ${data.data.simulation.simulate_after_seconds} segundos`, 'cyan');
      
      log('\n📋 Para testar via interface:', 'yellow');
      log('1. Abra o navegador em:', 'blue');
      log(`   ${BASE_URL}/checkout?plan=gold&period=monthly`, 'magenta');
      log('2. Selecione "PIX"', 'blue');
      log('3. Clique em "Gerar PIX"', 'blue');
      log('4. Aguarde 10 segundos para simulação automática', 'yellow');
      
    } else {
      log('\n❌ Erro ao criar PIX:', 'red');
      log(`   ${data.error}`, 'red');
      if (data.logs) {
        log('\n📝 Logs:', 'yellow');
        data.logs.forEach(l => log(`   ${l}`, 'cyan'));
      }
    }
  } catch (error) {
    log('\n❌ Erro na requisição:', 'red');
    log(`   ${error.message}`, 'red');
    log('\n💡 Certifique-se que o servidor está rodando em localhost:3000', 'yellow');
  }
}

async function quickTestLinks() {
  logSection('🔗 LINKS RÁPIDOS PARA TESTE');
  
  const testUrls = [
    {
      name: 'Plano Gold - Mensal',
      url: `${BASE_URL}/checkout?plan=gold&period=monthly`,
      price: 'R$ 25,00'
    },
    {
      name: 'Plano Diamond - Mensal',
      url: `${BASE_URL}/checkout?plan=diamond&period=monthly`,
      price: 'R$ 45,00'
    },
    {
      name: 'Plano Diamond - Anual (20% desc)',
      url: `${BASE_URL}/checkout?plan=diamond&period=annual`,
      price: 'R$ 432,00'
    },
    {
      name: 'Plano Casal - Mensal',
      url: `${BASE_URL}/checkout?plan=couple&period=monthly`,
      price: 'R$ 69,90'
    }
  ];
  
  log('\nClique em qualquer link abaixo para testar:', 'yellow');
  
  testUrls.forEach(test => {
    log(`\n📌 ${test.name} (${test.price})`, 'blue');
    log(`   ${test.url}`, 'magenta');
  });
}

async function main() {
  console.clear();
  
  log('🚀 OpenLove - Teste do Sistema de Checkout', 'bright');
  log('==========================================\n', 'bright');
  
  log('Este script ajuda a testar os pagamentos em modo desenvolvimento.', 'cyan');
  log('Certifique-se que NODE_ENV=development está configurado.\n', 'yellow');
  
  // Show quick test links
  await quickTestLinks();
  
  // Test Stripe instructions
  await testStripePayment();
  
  // Test PIX payment
  await testPixPayment();
  
  logSection('📊 VERIFICAÇÃO DE RESULTADOS');
  
  log('\nPara verificar se o pagamento foi processado:', 'yellow');
  
  log('\n1. Via Console do Navegador:', 'blue');
  log("   fetch('/api/v1/users/me')", 'magenta');
  log("     .then(r => r.json())", 'magenta');
  log("     .then(data => console.log('Premium:', data.premium_type))", 'magenta');
  
  log('\n2. Via Banco de Dados (Supabase):', 'blue');
  log('   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;', 'magenta');
  log('   SELECT * FROM pix_payments WHERE is_test = true ORDER BY created_at DESC;', 'magenta');
  
  log('\n✨ Teste concluído!', 'green');
  log('Verifique os resultados no navegador e no console.\n', 'cyan');
}

// Run the test
main().catch(error => {
  log('\n❌ Erro fatal:', 'red');
  log(error.message, 'red');
  process.exit(1);
});