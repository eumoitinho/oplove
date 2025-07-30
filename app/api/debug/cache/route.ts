import { NextRequest, NextResponse } from 'next/server'
import { CacheService } from '@/lib/cache/redis'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Cache Debug - Starting diagnostic...')
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        upstashUrl: process.env.UPSTASH_REDIS_REST_URL ? 'SET' : 'MISSING',
        upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'SET' : 'MISSING',
        nodeEnv: process.env.NODE_ENV,
      },
      tests: []
    }

    // Test 1: Basic ping
    try {
      console.log('🏓 Testing Redis ping...')
      const pingResult = await CacheService.ping()
      diagnostics.tests.push({
        test: 'Redis Ping',
        status: pingResult ? 'PASS' : 'FAIL',
        result: pingResult,
        error: null
      })
      console.log(`🏓 Redis ping: ${pingResult ? '✅ PASS' : '❌ FAIL'}`)
    } catch (error) {
      console.error('🏓 Redis ping error:', error)
      diagnostics.tests.push({
        test: 'Redis Ping',
        status: 'ERROR',
        result: null,
        error: (error as Error).message
      })
    }

    // Test 2: Basic set/get
    try {
      console.log('💾 Testing basic cache operations...')
      const testKey = 'debug_test_' + Date.now()
      const testValue = { test: 'cache_debug', timestamp: Date.now() }
      
      const setResult = await CacheService.set(testKey, testValue, 60)
      const getValue = await CacheService.get(testKey)
      const cleanupResult = await CacheService.delete(testKey)
      
      const success = setResult && getValue && JSON.stringify(getValue) === JSON.stringify(testValue)
      
      diagnostics.tests.push({
        test: 'Basic Cache Operations',
        status: success ? 'PASS' : 'FAIL',
        result: {
          set: setResult,
          get: getValue,
          cleanup: cleanupResult,
          match: JSON.stringify(getValue) === JSON.stringify(testValue)
        },
        error: null
      })
      console.log(`💾 Basic cache: ${success ? '✅ PASS' : '❌ FAIL'}`)
    } catch (error) {
      console.error('💾 Cache operations error:', error)
      diagnostics.tests.push({
        test: 'Basic Cache Operations',
        status: 'ERROR',
        result: null,
        error: (error as Error).message
      })
    }

    // Test 3: Get cache stats
    try {
      console.log('📊 Getting cache stats...')
      const stats = await CacheService.getStats()
      diagnostics.tests.push({
        test: 'Cache Stats',
        status: stats.connected ? 'PASS' : 'FAIL',
        result: stats,
        error: null
      })
      console.log(`📊 Cache stats: ${stats.connected ? '✅ PASS' : '❌ FAIL'}`)
    } catch (error) {
      console.error('📊 Cache stats error:', error)
      diagnostics.tests.push({
        test: 'Cache Stats',
        status: 'ERROR',
        result: null,
        error: (error as Error).message
      })
    }

    // Test 4: Rate limiting
    try {
      console.log('⏱️ Testing rate limiting...')
      const rateLimitResult = await CacheService.checkRateLimit('debug_test', 10, 60)
      diagnostics.tests.push({
        test: 'Rate Limiting',
        status: 'PASS',
        result: rateLimitResult,
        error: null
      })
      console.log('⏱️ Rate limiting: ✅ PASS')
    } catch (error) {
      console.error('⏱️ Rate limiting error:', error)
      diagnostics.tests.push({
        test: 'Rate Limiting',
        status: 'ERROR',
        result: null,
        error: (error as Error).message
      })
    }

    console.log('🔍 Cache Debug - Completed!')
    
    return NextResponse.json({
      success: true,
      diagnostics,
      summary: {
        total: diagnostics.tests.length,
        passed: diagnostics.tests.filter(t => t.status === 'PASS').length,
        failed: diagnostics.tests.filter(t => t.status === 'FAIL').length,
        errors: diagnostics.tests.filter(t => t.status === 'ERROR').length
      }
    })

  } catch (error) {
    console.error('🚨 Cache debug error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      diagnostics: null
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'clear_all':
        console.log('🧹 Clearing all cache...')
        await CacheService.flushAll()
        return NextResponse.json({ success: true, message: 'All cache cleared' })

      case 'test_pipeline':
        console.log('🔧 Testing Redis pipeline...')
        // Test multiple operations
        const testKeys = [`test_1_${Date.now()}`, `test_2_${Date.now()}`, `test_3_${Date.now()}`]
        const testData = { test: 'pipeline', timestamp: Date.now() }
        
        // Set multiple keys
        const setPromises = testKeys.map(key => CacheService.set(key, testData, 60))
        await Promise.all(setPromises)
        
        // Get multiple keys
        const getPromises = testKeys.map(key => CacheService.get(key))
        const results = await Promise.all(getPromises)
        
        // Cleanup
        await CacheService.delete(testKeys)
        
        return NextResponse.json({
          success: true,
          message: 'Pipeline test completed',
          results: {
            keys: testKeys,
            data: results,
            allSuccess: results.every(r => r !== null)
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: ['clear_all', 'test_pipeline']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('🚨 Cache debug POST error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}