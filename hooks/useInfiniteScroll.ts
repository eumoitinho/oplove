"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useDebounce } from "./useDebounce"

/**
 * Infinite scroll hook with pagination support
 *
 * Provides infinite scrolling functionality with automatic loading,
 * error handling, and performance optimizations for large datasets.
 *
 * @example
 * ```tsx
 * function PostsFeed() {
 *   const {
 *     data: posts,
 *     loading,
 *     error,
 *     hasMore,
 *     loadMore,
 *     refresh,
 *     containerRef
 *   } = useInfiniteScroll({
 *     fetchFn: async (page, limit) => {
 *       const response = await fetch(`/api/posts?page=${page}&limit=${limit}`)
 *       return response.json()
 *     },
 *     limit: 20,
 *     threshold: 0.8
 *   })
 *
 *   return (
 *     <div ref={containerRef}>
 *       {posts.map(post => (
 *         <PostCard key={post.id} post={post} />
 *       ))}
 *       {loading && <LoadingSpinner />}
 *       {error && <ErrorMessage error={error} onRetry={loadMore} />}
 *       {!hasMore && <div>Fim dos posts</div>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @param options Configuration options
 * @returns Infinite scroll state and controls
 */
export function useInfiniteScroll<T>({
  fetchFn,
  limit = 20,
  threshold = 0.8,
  enabled = true,
  dependencies = [],
}: {
  fetchFn: (
    page: number,
    limit: number,
  ) => Promise<{
    data: T[]
    hasMore: boolean
    total?: number
  }>
  limit?: number
  threshold?: number
  enabled?: boolean
  dependencies?: any[]
}) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState<number | undefined>()

  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>()
  const loadingRef = useRef(false)
  const initialLoadRef = useRef(false)

  // Debounce scroll events to improve performance
  const debouncedThreshold = useDebounce(threshold, 100)

  /**
   * Load more data
   */
  const loadMore = useCallback(
    async (resetData = false) => {
      if (loadingRef.current || (!hasMore && !resetData)) return

      loadingRef.current = true
      setLoading(true)
      setError(null)

      try {
        const currentPage = resetData ? 1 : page
        const result = await fetchFn(currentPage, limit)

        setData((prevData) => (resetData ? result.data : [...prevData, ...result.data]))
        setHasMore(result.hasMore)
        setTotal(result.total)
        setPage(currentPage + 1)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dados"
        setError(errorMessage)
        console.error("Infinite scroll error:", err)
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    },
    [fetchFn, limit, page, hasMore],
  )

  /**
   * Refresh data (reset and reload)
   */
  const refresh = useCallback(() => {
    setPage(1)
    setHasMore(true)
    setError(null)
    loadMore(true)
  }, [loadMore])

  /**
   * Setup intersection observer for automatic loading
   */
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      {
        root: container,
        rootMargin: "100px",
        threshold: debouncedThreshold,
      },
    )

    // Create sentinel element for intersection observation
    const sentinel = document.createElement("div")
    sentinel.style.height = "1px"
    sentinel.style.position = "absolute"
    sentinel.style.bottom = "200px"
    sentinel.style.width = "100%"
    sentinel.setAttribute("data-infinite-scroll-sentinel", "true")

    container.appendChild(sentinel)
    observerRef.current.observe(sentinel)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      const existingSentinel = container.querySelector("[data-infinite-scroll-sentinel]")
      if (existingSentinel) {
        container.removeChild(existingSentinel)
      }
    }
  }, [enabled, hasMore, loading, loadMore, debouncedThreshold])

  /**
   * Initial load and dependency changes
   */
  useEffect(() => {
    if (!enabled) return

    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      loadMore(true)
    } else if (dependencies.length > 0) {
      // Refresh when dependencies change
      refresh()
    }
  }, [enabled, ...dependencies]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Manual scroll to load more
   */
  const scrollToLoadMore = useCallback(() => {
    if (containerRef.current && hasMore && !loading) {
      const container = containerRef.current
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const scrollTop = scrollHeight - clientHeight - 200

      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      })

      // Trigger load more after scroll
      setTimeout(() => {
        if (!loading && hasMore) {
          loadMore()
        }
      }, 500)
    }
  }, [hasMore, loading, loadMore])

  /**
   * Get loading state information
   */
  const loadingState = {
    isInitialLoading: loading && data.length === 0,
    isLoadingMore: loading && data.length > 0,
    isEmpty: !loading && data.length === 0 && !error,
    hasError: !!error,
  }

  /**
   * Get pagination information
   */
  const paginationInfo = {
    currentPage: page - 1,
    totalItems: total,
    loadedItems: data.length,
    hasMore,
    progress: total ? (data.length / total) * 100 : undefined,
  }

  return {
    // Data
    data,

    // State
    loading,
    error,
    hasMore,
    loadingState,
    paginationInfo,

    // Refs
    containerRef,

    // Methods
    loadMore: () => loadMore(),
    refresh,
    scrollToLoadMore,
  }
}
