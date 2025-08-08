import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"
import type { SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient<Database> | undefined

/**
 * Creates a singleton Supabase client for browser use
 * This prevents multiple GoTrueClient instances
 */
export function createSingletonClient() {
  if (browserClient) {
    return browserClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        if (typeof window === 'undefined') return null
        
        const cookies = document.cookie.split('; ')
        const cookie = cookies.find(c => c.startsWith(`${name}=`))
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : null
      },
      set(name: string, value: string, options?: any) {
        if (typeof window === 'undefined') return
        
        let cookieString = `${name}=${encodeURIComponent(value)}`
        
        if (options?.maxAge) {
          cookieString += `; max-age=${options.maxAge}`
        }
        if (options?.path) {
          cookieString += `; path=${options.path}`
        }
        if (options?.domain) {
          cookieString += `; domain=${options.domain}`
        }
        if (options?.sameSite) {
          cookieString += `; samesite=${options.sameSite}`
        }
        if (options?.secure) {
          cookieString += `; secure`
        }
        
        document.cookie = cookieString
      },
      remove(name: string, options?: any) {
        if (typeof window === 'undefined') return
        
        let cookieString = `${name}=; max-age=0`
        
        if (options?.path) {
          cookieString += `; path=${options.path}`
        }
        if (options?.domain) {
          cookieString += `; domain=${options.domain}`
        }
        
        document.cookie = cookieString
      }
    }
  })

  return browserClient
}

/**
 * Clear the singleton instance (useful for testing or logout)
 */
export function clearSingletonClient() {
  browserClient = undefined
}