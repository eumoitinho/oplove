"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Server, 
  Database, 
  Zap, 
  RefreshCw, 
  Trash2, 
  TrendingUp,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { useCache } from '@/hooks/useCache'
import { cn } from '@/lib/utils'

interface CacheMonitorProps {
  className?: string
  showDetails?: boolean
}

export function CacheMonitor({ className, showDetails = false }: CacheMonitorProps) {
  const { 
    stats, 
    loading, 
    error, 
    refreshStats, 
    clearUserCache, 
    warmUpCache,
    cacheHitRate 
  } = useCache()
  
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = async (action: string, fn: () => Promise<boolean | void>) => {
    setActionLoading(action)
    try {
      await fn()
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
  }

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  return (
    <Card className={cn("w-full max-w-4xl", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Cache Monitor
            {error && <AlertCircle className="w-4 h-4 text-red-500" />}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant={stats?.redis.connected ? "default" : "destructive"}>
              {stats?.redis.connected ? "Connected" : "Disconnected"}
            </Badge>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('refresh', refreshStats)}
              disabled={loading || actionLoading === 'refresh'}
            >
              <RefreshCw className={cn(
                "w-4 h-4 mr-1",
                (loading || actionLoading === 'refresh') && "animate-spin"
              )} />
              Refresh
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Redis Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-4 h-4" />
                <span className="font-medium">Redis Status</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span className={getStatusColor(stats?.redis.connected ?? false)}>
                    {stats?.redis.connected ? 'Active' : 'Failed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Keys:</span>
                  <span>{stats?.redis.keyCount ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span>{stats?.redis.memoryUsage ?? 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cache Hit Rate */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Hit Rate</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {cacheHitRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                Bandwidth saved: {stats?.performance.estimatedBandwidthSaved ?? '0KB'}
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" />
                <span className="font-medium">Performance</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Hit Time:</span>
                  <span className="text-green-600">{stats?.performance.averageHitTime ?? '~5ms'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Miss Time:</span>
                  <span className="text-yellow-600">{stats?.performance.averageMissTime ?? '~50ms'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Cache Status */}
        {stats?.user && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="font-medium">User Cache Status</span>
                </div>
                <Badge variant="outline">
                  {stats.user.totalCacheKeys} / 5 cached
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { name: 'Profile', status: stats.user.profileCached },
                  { name: 'Stats', status: stats.user.statsCached },
                  { name: 'Recommendations', status: stats.user.recommendationsCached },
                  { name: 'Followers', status: stats.user.followersCached },
                  { name: 'Following', status: stats.user.followingCached }
                ].map(({ name, status }) => (
                  <div key={name} className="flex items-center gap-2 text-sm">
                    {getStatusIcon(status)}
                    <span className={getStatusColor(status)}>{name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline Cache Status */}
        {stats?.timeline && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Timeline Cache</span>
                </div>
                <Badge variant="outline">
                  {stats.timeline.timelineCacheKeys} pages cached
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {getStatusIcon(stats.timeline.algorithmCached)}
                    <span className={getStatusColor(stats.timeline.algorithmCached)}>
                      Algorithm Data
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Estimated savings: {stats.timeline.estimatedSavings}
                  </div>
                </div>
                
                <div className="text-sm">
                  <div>Cached pages: {stats.timeline.timelineCacheKeys}</div>
                  <div className="text-xs text-gray-500">
                    Across for-you, following, explore tabs
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('warmup', warmUpCache)}
            disabled={actionLoading === 'warmup'}
          >
            <Zap className={cn(
              "w-4 h-4 mr-1",
              actionLoading === 'warmup' && "animate-pulse"
            )} />
            Warm Up Cache
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction('clear', clearUserCache)}
            disabled={actionLoading === 'clear'}
          >
            <Trash2 className={cn(
              "w-4 h-4 mr-1",
              actionLoading === 'clear' && "animate-pulse"
            )} />
            Clear User Cache
          </Button>
        </div>

        {/* Details */}
        {showDetails && stats && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium">Debug Details</span>
                <Badge variant="secondary" className="text-xs">
                  Dev Only
                </Badge>
              </div>
              
              <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto max-h-48">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Last Updated */}
        {stats?.timestamp && (
          <div className="text-xs text-gray-500 text-center">
            Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CacheMonitor