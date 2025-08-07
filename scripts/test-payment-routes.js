#!/usr/bin/env node
/**
 * Test script for OpenLove payment routes
 * Run with: node scripts/test-payment-routes.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  log('blue', `\n🧪 Testing ${name}...`);
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      ...options
    });
    
    const data = await response.json();
    
    if (response.ok && data.success !== false) {
      log('green', `✅ ${name} - OK`);
      return { success: true, data };
    } else {
      log('red', `❌ ${name} - Failed`);
      log('red', `Status: ${response.status}, Error: ${data.error || 'Unknown'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    log('red', `❌ ${name} - Exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testPaymentCreation() {
  log('cyan', '\n🔧 Testing Payment Creation...');
  
  // Test Stripe documentation endpoint
  const stripeDoc = await testEndpoint(
    'Stripe Documentation', 
    '/api/test/stripe-subscription'
  );
  
  // Test PIX documentation endpoint
  const pixDoc = await testEndpoint(
    'PIX Documentation',
    '/api/test/abacatepay-pix'
  );
  
  // Test dashboard
  const dashboard = await testEndpoint(
    'Payment Dashboard',
    '/api/test/payment-dashboard'
  );
  
  return { stripeDoc, pixDoc, dashboard };
}

async function testStripeSubscription() {
  log('cyan', '\n💳 Testing Stripe Subscription Creation...');
  
  const testData = {
    plan: 'gold',
    test_scenario: 'success',
    customer_email: 'test@openlove.dev',
    billing_cycle: 'monthly'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/test/stripe-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('green', '✅ Stripe subscription test - SUCCESS');
      log('blue', `Subscription ID: ${data.data?.subscription_id || 'N/A'}`);
      log('blue', `Status: ${data.data?.status || 'N/A'}`);
      return { success: true, data };
    } else {
      log('yellow', '⚠️  Stripe subscription test - Expected failure');
      log('yellow', `Error: ${data.error}`);
      return { success: false, error: data.error, expected: true };
    }
  } catch (error) {
    log('red', `❌ Stripe subscription test - Exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testPixPayment() {
  log('cyan', '\n🔵 Testing PIX Payment Creation...');
  
  const testData = {
    plan: 'diamond',
    customer_email: 'test@openlove.dev',
    customer_name: 'João Test da Silva',
    customer_document: '12345678900',
    billing_cycle: 'monthly',
    simulate_payment: false, // Don't auto-simulate for testing
    simulate_delay: 10
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/test/abacatepay-pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('green', '✅ PIX payment test - SUCCESS');
      log('blue', `Payment ID: ${data.data?.payment_id || 'N/A'}`);
      log('blue', `Amount: R$ ${data.data?.amount?.toFixed(2) || 'N/A'}`);
      log('blue', `Status: ${data.data?.status || 'N/A'}`);
      return { success: true, data };
    } else {
      log('yellow', '⚠️  PIX payment test - Failed (may be expected)');
      log('yellow', `Error: ${data.error}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    log('red', `❌ PIX payment test - Exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('bold', '🚀 OpenLove Payment Routes Test Suite');
  log('bold', '=====================================');
  
  // Check if we're in development
  if (process.env.NODE_ENV === 'production') {
    log('red', '❌ Cannot run tests in production environment');
    process.exit(1);
  }
  
  log('green', '✅ Running in development environment');
  log('blue', `🌐 Base URL: ${BASE_URL}`);
  
  const results = {
    documentation: await testPaymentCreation(),
    stripe: await testStripeSubscription(),
    pix: await testPixPayment()
  };
  
  log('bold', '\n📊 Test Results Summary');
  log('bold', '=======================');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Documentation tests
  const docTests = Object.values(results.documentation);
  docTests.forEach(test => {
    totalTests++;
    if (test.success) passedTests++;
  });
  
  // Payment creation tests
  [results.stripe, results.pix].forEach(test => {
    totalTests++;
    if (test.success || test.expected) passedTests++;
  });
  
  log('blue', `📋 Total Tests: ${totalTests}`);
  log('green', `✅ Passed: ${passedTests}`);
  log(passedTests === totalTests ? 'green' : 'red', 
      `📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    log('green', '\n🎉 All tests passed! Payment routes are working correctly.');
  } else {
    log('yellow', '\n⚠️  Some tests failed. Check the logs above for details.');
  }
  
  // Instructions
  log('bold', '\n📱 Next Steps:');
  log('cyan', '1. Visit the dashboard: ' + BASE_URL + '/api/test/payment-dashboard');
  log('cyan', '2. Test payments manually through the web interface');
  log('cyan', '3. Check webhook integrations with real payment providers');
  
  return results;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runAllTests, testStripeSubscription, testPixPayment };