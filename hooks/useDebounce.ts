"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"

/**
 * Debounce hook for delaying value updates and function calls
 *
 * Provides debounced values and callback functions to improve performance
 * by reducing the frequency of expensive operations like API calls or searches.
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [query, setQuery] = useState('')
 *   const debouncedQuery = useDebounce(query, 500)
 *
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       // Perform search with debounced query
 *       searchAPI(debouncedQuery)
 *     }
 *   }, [debouncedQuery])
 *
 *   return (
 *     <input
 *       value={query}
 *       onChange={(e) => setQuery(e.target.value)}
 *       placeholder="Buscar..."
 *     />
 *   )
 * }
 * ```
 *
 * @param value Value to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup on unmount or value change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedValue
}

/**
 * Debounced callback hook
 *
 * Creates a debounced version of a callback function that delays execution
 * until after the specified delay has passed since the last invocation.
 *
 * @example
 * ```tsx
 * function AutoSaveForm() {
 *   const [formData, setFormData] = useState({})
 *
 *   const debouncedSave = useDebouncedCallback(
 *     async (data) => {
 *       await saveToAPI(data)
 *       console.log('Form auto-saved!')
 *     },
 *     1000
 *   )
 *
 *   useEffect(() => {
 *     debouncedSave(formData)
 *   }, [formData, debouncedSave])
 *
 *   return (
 *     <form>
 *       <input
 *         onChange={(e) => setFormData({...formData, name: e.target.value})}
 *       />
 *     </form>
 *   )
 * }
 * ```
 *
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 * @param deps Dependency array for callback
 * @returns Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = [],
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback
  }, [callback, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Debounced state hook
 *
 * Combines useState with debouncing for state values that should be
 * updated with a delay, useful for search inputs or auto-save functionality.
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const [searchQuery, debouncedQuery, setSearchQuery] = useDebouncedState('', 300)
 *
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       performSearch(debouncedQuery)
 *     }
 *   }, [debouncedQuery])
 *
 *   return (
 *     <div>
 *       <input
 *         value={searchQuery}
 *         onChange={(e) => setSearchQuery(e.target.value)}
 *         placeholder="Digite para buscar..."
 *       />
 *       <p>Buscando por: {debouncedQuery}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * @param initialValue Initial state value
 * @param delay Delay in milliseconds
 * @returns [currentValue, debouncedValue, setValue]
 */
export function useDebouncedState<T>(initialValue: T, delay: number): [T, T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue)
  const debouncedValue = useDebounce(value, delay)

  return [value, debouncedValue, setValue]
}

/**
 * Advanced debounce hook with leading and trailing options
 *
 * Provides more control over debouncing behavior with leading and trailing
 * execution options, similar to Lodash's debounce function.
 *
 * @example
 * ```tsx
 * function ButtonWithDebounce() {
 *   const debouncedClick = useAdvancedDebounce(
 *     () => console.log('Button clicked!'),
 *     1000,
 *     { leading: true, trailing: false }
 *   )
 *
 *   return (
 *     <button onClick={debouncedClick}>
 *       Click me (debounced)
 *     </button>
 *   )
 * }
 * ```
 *
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 * @param options Debounce options
 * @returns Debounced function with cancel and flush methods
 */
export function useAdvancedDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: {
    leading?: boolean
    trailing?: boolean
    maxWait?: number
  } = {},
) {
  const { leading = false, trailing = true, maxWait } = options

  const timeoutRef = useRef<NodeJS.Timeout>()
  const maxTimeoutRef = useRef<NodeJS.Timeout>()
  const lastCallTimeRef = useRef<number>()
  const lastInvokeTimeRef = useRef<number>(0)
  const callbackRef = useRef(callback)

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const invokeFunc = useCallback((args: Parameters<T>) => {
    const time = Date.now()
    lastInvokeTimeRef.current = time
    return callbackRef.current(...args)
  }, [])

  const leadingEdge = useCallback(
    (args: Parameters<T>) => {
      lastInvokeTimeRef.current = Date.now()
      timeoutRef.current = setTimeout(() => trailingEdge(args), delay)
      return leading ? invokeFunc(args) : undefined
    },
    [delay, leading, invokeFunc],
  )

  const trailingEdge = useCallback(
    (args: Parameters<T>) => {
      timeoutRef.current = undefined
      if (trailing && lastCallTimeRef.current) {
        return invokeFunc(args)
      }
      lastCallTimeRef.current = undefined
      return undefined
    },
    [trailing, invokeFunc],
  )

  const timerExpired = useCallback(
    (args: Parameters<T>) => {
      const time = Date.now()
      if (shouldInvoke(time)) {
        return trailingEdge(args)
      }
      timeoutRef.current = setTimeout(() => timerExpired(args), remainingWait(time))
    },
    [trailingEdge],
  )

  const shouldInvoke = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - (lastCallTimeRef.current || 0)
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current

      return (
        lastCallTimeRef.current === undefined ||
        timeSinceLastCall >= delay ||
        timeSinceLastCall < 0 ||
        (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
      )
    },
    [delay, maxWait],
  )

  const remainingWait = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - (lastCallTimeRef.current || 0)
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current
      const timeWaiting = delay - timeSinceLastCall

      return maxWait !== undefined ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting
    },
    [delay, maxWait],
  )

  const debouncedFunc = useCallback(
    ((...args: Parameters<T>) => {
      const time = Date.now()
      const isInvoking = shouldInvoke(time)

      lastCallTimeRef.current = time

      if (isInvoking) {
        if (timeoutRef.current === undefined) {
          return leadingEdge(args)
        }
        if (maxWait !== undefined) {
          timeoutRef.current = setTimeout(() => timerExpired(args), delay)
          maxTimeoutRef.current = setTimeout(() => trailingEdge(args), maxWait)
          return leading ? invokeFunc(args) : undefined
        }
      }

      if (timeoutRef.current === undefined) {
        timeoutRef.current = setTimeout(() => timerExpired(args), delay)
      }

      return undefined
    }) as T,
    [delay, shouldInvoke, leadingEdge, timerExpired, maxWait, leading, invokeFunc, trailingEdge],
  )

  const cancel = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current)
    }
    if (maxTimeoutRef.current !== undefined) {
      clearTimeout(maxTimeoutRef.current)
    }
    lastInvokeTimeRef.current = 0
    lastCallTimeRef.current = undefined
    timeoutRef.current = undefined
    maxTimeoutRef.current = undefined
  }, [])

  const flush = useCallback(() => {
    if (timeoutRef.current === undefined) {
      return undefined
    }
    const args = lastCallTimeRef.current ? [] : []
    cancel()
    return invokeFunc(args as Parameters<T>)
  }, [cancel, invokeFunc])

  // Cleanup on unmount
  useEffect(() => {
    return cancel
  }, [cancel])

  return Object.assign(debouncedFunc, { cancel, flush })
}
