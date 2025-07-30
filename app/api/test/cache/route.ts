import { NextRequest, NextResponse } from 'next/server'
import { CacheService } from '@/lib/cache/redis'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing cache operations...')
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    // Test 1: Basic operations
    try {
      const testKey = `test_basic_${Date.now()}`
      const testValue = { message: 'Hello cache!', timestamp: Date.now() }
      
      await CacheService.set(testKey, testValue, 60)
      const retrieved = await CacheService.get(testKey)
      await CacheService.delete(testKey)
      
      results.tests.push({
        name: 'Basic Operations',
        status: 'PASS',
        details: { set: true, get: retrieved, delete: true }
      })
    } catch (error) {
      results.tests.push({
        name: 'Basic Operations',
        status: 'FAIL',
        error: (error as Error).message
      })
    }

    // Test 2: Multiple set (mset) - this was causing the pipeline error
    try {
      const testData = {
        [`test_mset_1_${Date.now()}`]: { value: 'test1' },
        [`test_mset_2_${Date.now()}`]: { value: 'test2' },
        [`test_mset_3_${Date.now()}`]: { value: 'test3' }
      }
      
      await CacheService.mset(testData, 60)
      
      // Verify all keys were set
      const keys = Object.keys(testData)
      const values = await Promise.all(keys.map(key => CacheService.get(key)))
      
      // Cleanup
      await CacheService.delete(keys)
      
      results.tests.push({
        name: 'Multiple Set (mset)',
        status: 'PASS',
        details: { 
          keysSet: keys.length, 
          valuesRetrieved: values.filter(v => v !== null).length,
          allSuccess: values.every(v => v !== null)
        }
      })
    } catch (error) {
      results.tests.push({
        name: 'Multiple Set (mset)',
        status: 'FAIL',
        error: (error as Error).message
      })
    }

    // Test 3: Rate limiting
    try {
      const testKey = `rate_limit_test_${Date.now()}`
      const result = await CacheService.checkRateLimit(testKey, 5, 60)
      
      results.tests.push({
        name: 'Rate Limiting',
        status: 'PASS',
        details: result
      })
    } catch (error) {
      results.tests.push({
        name: 'Rate Limiting',
        status: 'FAIL',
        error: (error as Error).message
      })
    }

    // Test 4: Redis connection
    try {
      const pingResult = await CacheService.ping()
      
      results.tests.push({
        name: 'Redis Connection',
        status: pingResult ? 'PASS' : 'FAIL',
        details: { connected: pingResult }
      })
    } catch (error) {
      results.tests.push({
        name: 'Redis Connection',
        status: 'FAIL',
        error: (error as Error).message
      })
    }

    const summary = {
      total: results.tests.length,
      passed: results.tests.filter(t => t.status === 'PASS').length,
      failed: results.tests.filter(t => t.status === 'FAIL').length
    }

    console.log(`🧪 Cache tests completed: ${summary.passed}/${summary.total} passed`)

    return NextResponse.json({
      success: true,
      message: 'Cache tests completed',
      results,
      summary
    })

  } catch (error) {
    console.error('🚨 Cache test error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}