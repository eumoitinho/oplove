// Utility to check if code is running on client
export const isClient = typeof window !== 'undefined'

// Safe window access
export const safeWindow = isClient ? window : undefined

// Safe document access  
export const safeDocument = isClient ? document : undefined

// Safe navigator access
export const safeNavigator = isClient ? navigator : undefined

// Safe localStorage access
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isClient) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isClient) return
    try {
      localStorage.setItem(key, value)
    } catch {
      // Ignore errors (e.g. quota exceeded)
    }
  },
  removeItem: (key: string): void => {
    if (!isClient) return
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore errors
    }
  }
}

// Safe sessionStorage access
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isClient) return null
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isClient) return
    try {
      sessionStorage.setItem(key, value)
    } catch {
      // Ignore errors
    }
  },
  removeItem: (key: string): void => {
    if (!isClient) return
    try {
      sessionStorage.removeItem(key)
    } catch {
      // Ignore errors
    }
  }
}

// Client-only hook
export function clientOnly<T>(callback: () => T): T | null {
  if (!isClient) return null
  return callback()
}