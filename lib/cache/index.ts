// Core cache services
export { CacheService, redis, CACHE_KEYS, CACHE_TTL } from './redis'

// Timeline specific caching
export { 
  TimelineCacheService,
  type TimelineFeedResult 
} from './timeline-cache'

// Profile and user caching
export { 
  ProfileCacheService 
} from './profile-cache'

// Cache invalidation
export { 
  cacheInvalidationService,
  invalidateUser,
  invalidatePost,
  invalidateFollow,
  type InvalidationEvent,
  type InvalidationPayload
} from './cache-invalidation'

// Fallback and circuit breaker
export { 
  cacheFallbackService,
  cacheWithFallback,
  parallelCacheWithFallback,
  type FallbackConfig,
  type CacheOperation as FallbackOperation,
  type FallbackResult
} from './cache-fallback'

// Stale-while-revalidate
export { 
  swrService,
  useSWR,
  mutateSWR,
  preloadSWR,
  type SWRConfig,
  type SWRResult,
  type SWROperation
} from './stale-while-revalidate'

// Compression
export { 
  cacheCompressionService,
  setCompressed,
  getCompressed,
  type CompressionConfig,
  type CompressionMetrics
} from './cache-compression'

// Pre-warming
export { 
  cachePrewarmingService,
  prewarmNewUser,
  prewarmBatch,
  type PrewarmingJob,
  type PrewarmingConfig
} from './cache-prewarming'

// Analytics and monitoring
export { 
  cacheAnalyticsService,
  trackCacheOperation,
  type CacheMetrics,
  type CacheOperation,
  type CacheKeyMetrics,
  type CacheAnalytics
} from './cache-analytics'

// Convenience functions for common operations
export const cache = {
  // Basic operations
  get: CacheService.get,
  set: CacheService.set,
  delete: CacheService.delete,
  exists: CacheService.exists,
  
  // Pattern operations
  deletePattern: CacheService.deletePattern,
  flushAll: CacheService.flushAll,
  
  // Batch operations
  mget: CacheService.mget,
  mset: CacheService.mset,
  
  // Advanced operations
  getOrSet: CacheService.getOrSet,
  checkRateLimit: CacheService.checkRateLimit,
  
  // Stats and health
  ping: CacheService.ping,
  getStats: CacheService.getStats,
}

// Service instances for direct access
export const services = {
  cache: CacheService,
  timeline: TimelineCacheService,
  profile: ProfileCacheService,
  invalidation: cacheInvalidationService,
  fallback: cacheFallbackService,
  swr: swrService,
  compression: cacheCompressionService,
  prewarming: cachePrewarmingService,
  analytics: cacheAnalyticsService,
}

// Initialize services and monitoring
export const initializeCacheServices = () => {
  console.log('🚀 Initializing cache services...')
  
  // Start analytics reporting
  cacheAnalyticsService.startPeriodicReporting(300000) // 5 minutes
  
  console.log('✅ Cache services initialized')
}