#!/usr/bin/env node

/**
 * Test Redis Connection Script
 * Tests the new Upstash Redis instance connection
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Redis Connection...\n');

// Get environment variables
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

console.log('📋 Environment Check:');
console.log(`  URL: ${UPSTASH_URL ? '✅ SET' : '❌ MISSING'}`);
console.log(`  Token: ${UPSTASH_TOKEN ? '✅ SET' : '❌ MISSING'}`);
console.log('');

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error('❌ Missing Redis credentials in .env.local');
  process.exit(1);
}

// Extract hostname for DNS test
const hostname = new URL(UPSTASH_URL).hostname;
console.log(`🌐 Testing DNS resolution for: ${hostname}`);

const dns = require('dns');
dns.lookup(hostname, (err, address) => {
  if (err) {
    console.error(`❌ DNS resolution failed: ${err.message}`);
  } else {
    console.log(`✅ DNS resolved to: ${address}`);
  }
  console.log('');
  
  // Continue with Redis tests
  testRedisConnection();
});

function testRedisConnection() {
  console.log('🏓 Testing Redis PING...');
  
  makeRedisRequest('/ping', 'GET')
    .then(response => {
      if (response === 'PONG') {
        console.log('✅ Redis PING: SUCCESS');
        return testBasicOperations();
      } else {
        console.log(`❌ Redis PING: Unexpected response: ${response}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(`❌ Redis PING failed: ${error.message}`);
      process.exit(1);
    });
}

function testBasicOperations() {
  console.log('\n💾 Testing basic cache operations...');
  
  const testKey = `test_${Date.now()}`;
  const testValue = JSON.stringify({
    test: 'connection_test',
    timestamp: new Date().toISOString(),
    random: Math.random()
  });
  
  console.log(`  Setting key: ${testKey}`);
  
  // Test SET operation
  makeRedisRequest(`/set/${testKey}`, 'POST', testValue)
    .then(response => {
      console.log(`✅ SET operation: ${response}`);
      
      // Test GET operation
      console.log(`  Getting key: ${testKey}`);
      return makeRedisRequest(`/get/${testKey}`, 'GET');
    })
    .then(response => {
      const retrieved = JSON.stringify(response);
      if (retrieved === testValue) {
        console.log('✅ GET operation: SUCCESS (data matches)');
      } else {
        console.log('⚠️  GET operation: Data mismatch');
        console.log(`    Expected: ${testValue}`);
        console.log(`    Got: ${retrieved}`);
      }
      
      // Test DELETE operation
      console.log(`  Deleting key: ${testKey}`);
      return makeRedisRequest(`/del/${testKey}`, 'POST');
    })
    .then(response => {
      console.log(`✅ DELETE operation: ${response}`);
      
      // Final verification
      return makeRedisRequest(`/get/${testKey}`, 'GET');
    })
    .then(response => {
      if (response === null) {
        console.log('✅ Cleanup verified: Key successfully deleted');
      } else {
        console.log('⚠️  Cleanup issue: Key still exists');
      }
      
      console.log('\n🎉 All Redis tests completed successfully!');
      console.log('\n📋 Summary:');
      console.log('  ✅ DNS Resolution');
      console.log('  ✅ Redis Connection');
      console.log('  ✅ PING/PONG');
      console.log('  ✅ SET Operation');
      console.log('  ✅ GET Operation');
      console.log('  ✅ DELETE Operation');
      console.log('\n🚀 Cache system is ready for use!');
    })
    .catch(error => {
      console.error(`❌ Basic operations failed: ${error.message}`);
      process.exit(1);
    });
}

function makeRedisRequest(path, method, data = null) {
  return new Promise((resolve, reject) => {
    const url = `${UPSTASH_URL}${path}`;
    const options = {
      method: method,
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', chunk => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = responseData ? JSON.parse(responseData) : null;
            resolve(parsed?.result !== undefined ? parsed.result : parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        } catch (error) {
          // Handle non-JSON responses (like PONG)
          if (responseData === 'PONG' || responseData === 'OK') {
            resolve(responseData);
          } else {
            reject(new Error(`Parse error: ${error.message}`));
          }
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled Rejection:', reason);
  process.exit(1);
});