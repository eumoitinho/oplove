export function PostSkeleton() {
  return (
    <article className="p-6 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm">
      <div className="flex gap-4">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 animate-skeleton-pulse" />

        <div className="flex-grow space-y-3">
          {/* Header skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-skeleton-pulse" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-skeleton-pulse" />
            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-skeleton-pulse" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-skeleton-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-skeleton-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-skeleton-pulse" />
          </div>

          {/* Media skeleton */}
          <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl animate-skeleton-pulse" />

          {/* Actions skeleton */}
          <div className="flex justify-between items-center pt-3">
            <div className="flex gap-6">
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-skeleton-pulse" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-skeleton-pulse" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-skeleton-pulse" />
            </div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-skeleton-pulse" />
          </div>
        </div>
      </div>
    </article>
  )
}
