"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Local storage hook with SSR support and type safety
 *
 * Provides persistent state management using localStorage with automatic
 * serialization/deserialization and SSR compatibility.
 *
 * @example
 * ```tsx
 * function UserPreferences() {
 *   const [theme, setTheme] = useLocalStorage('theme', 'light')
 *   const [settings, setSettings] = useLocalStorage('user-settings', {
 *     notifications: true,
 *     language: 'pt-BR'
 *   })
 *
 *   return (
 *     <div>
 *       <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *         Toggle Theme ({theme})
 *       </button>
 *       <label>
 *         <input
 *           type="checkbox"
 *           checked={settings.notifications}
 *           onChange={(e) => setSettings({
 *             ...settings,
 *             notifications: e.target.checked
 *           })}
 *         />
 *         Notifications
 *       </label>
 *     </div>
 *   )
 * }
 * ```
 *
 * @param key Storage key
 * @param initialValue Initial value if key doesn't exist
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value

        // Save state
        setStoredValue(valueToStore)

        // Save to local storage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))

          // Dispatch custom event for cross-tab synchronization
          window.dispatchEvent(
            new CustomEvent("localStorage", {
              detail: { key, newValue: valueToStore },
            }),
          )
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)

        // Dispatch custom event
        window.dispatchEvent(
          new CustomEvent("localStorage", {
            detail: { key, newValue: null },
          }),
        )
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error)
        }
      }
    }

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.newValue ?? initialValue)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("localStorage", handleCustomStorageChange as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("localStorage", handleCustomStorageChange as EventListener)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Session storage hook with SSR support
 *
 * Similar to useLocalStorage but uses sessionStorage for temporary data
 * that should be cleared when the browser tab is closed.
 *
 * @example
 * ```tsx
 * function FormDraft() {
 *   const [draft, setDraft] = useSessionStorage('form-draft', {
 *     title: '',
 *     content: ''
 *   })
 *
 *   return (
 *     <form>
 *       <input
 *         value={draft.title}
 *         onChange={(e) => setDraft({...draft, title: e.target.value})}
 *         placeholder="Título"
 *       />
 *       <textarea
 *         value={draft.content}
 *         onChange={(e) => setDraft({...draft, content: e.target.value})}
 *         placeholder="Conteúdo"
 *       />
 *     </form>
 *   )
 * }
 * ```
 *
 * @param key Storage key
 * @param initialValue Initial value
 * @returns [value, setValue, removeValue]
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Storage hook with custom storage adapter
 *
 * Generic storage hook that can work with any storage implementation
 * (localStorage, sessionStorage, or custom storage solutions).
 *
 * @example
 * ```tsx
 * // Custom storage adapter
 * const customStorage = {
 *   getItem: (key: string) => {
 *     // Custom get logic
 *     return localStorage.getItem(`custom_${key}`)
 *   },
 *   setItem: (key: string, value: string) => {
 *     // Custom set logic
 *     localStorage.setItem(`custom_${key}`, value)
 *   },
 *   removeItem: (key: string) => {
 *     localStorage.removeItem(`custom_${key}`)
 *   }
 * }
 *
 * function Component() {
 *   const [value, setValue] = useStorage('my-key', 'default', customStorage)
 *   return <div>{value}</div>
 * }
 * ```
 *
 * @param key Storage key
 * @param initialValue Initial value
 * @param storage Storage adapter
 * @returns [value, setValue, removeValue]
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  storage: {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
    removeItem: (key: string) => void
  },
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = storage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading storage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== "undefined") {
          storage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting storage key "${key}":`, error)
      }
    },
    [key, storedValue, storage],
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined") {
        storage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error)
    }
  }, [key, initialValue, storage])

  return [storedValue, setValue, removeValue]
}
