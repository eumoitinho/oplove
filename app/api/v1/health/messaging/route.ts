import { NextRequest, NextResponse } from 'next/server'
import { MessagingMonitor } from '@/lib/monitoring/messaging-monitor'

const monitor = new MessagingMonitor()

export async function GET(request: NextRequest) {
  try {
    // Check for API key in production
    if (process.env.NODE_ENV === 'production') {
      const apiKey = request.headers.get('x-api-key')
      if (apiKey !== process.env.MONITORING_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Perform health check
    const healthCheck = await monitor.performHealthCheck()
    
    // Get performance summary
    const performance = monitor.getPerformanceSummary()

    // Determine HTTP status based on health
    let status = 200
    if (healthCheck.status === 'unhealthy') {
      status = 503 // Service Unavailable
    } else if (healthCheck.status === 'degraded') {
      status = 207 // Multi-Status (partial success)
    }

    return NextResponse.json({
      ...healthCheck,
      performance
    }, { status })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
        cache: false,
        webrtc: false,
        storage: false
      },
      error: 'Health check failed'
    }, { status: 503 })
  }
}