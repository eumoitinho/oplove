import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"
import type { SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient<Database> | undefined
let authListenerUnsubscribe: (() => void) | undefined

/**
 * Creates a singleton Supabase client for browser use
 * This prevents multiple GoTrueClient instances and ensures consistent auth state
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

  console.log('[SupabaseSingleton] Creating new client instance')

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
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
        
        // Dispatch event for auth store sync
        window.dispatchEvent(new CustomEvent('supabase:cookie-updated', { 
          detail: { name, value, options } 
        }))
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
        
        // Dispatch event for auth store sync
        window.dispatchEvent(new CustomEvent('supabase:cookie-removed', { 
          detail: { name, options } 
        }))
      }
    },
    global: {
      headers: {
        'x-application-name': 'openlove-web'
      }
    }
  })

  // Set up auth state listener once
  const { data: { subscription } } = browserClient.auth.onAuthStateChange((event, session) => {
    console.log(`[SupabaseSingleton] Auth event: ${event}`, {
      userId: session?.user?.id,
      hasToken: !!session?.access_token
    })

    // Dispatch custom event for auth store to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supabase:auth-changed', {
        detail: { event, session }
      }))
    }
  })

  authListenerUnsubscribe = subscription.unsubscribe

  return browserClient
}

/**
 * Get the current client if it exists
 */
export function getExistingClient(): SupabaseClient<Database> | undefined {
  return browserClient
}

/**
 * Clear the singleton instance (useful for testing or logout)
 */
export function clearSingletonClient() {
  console.log('[SupabaseSingleton] Clearing client instance')
  
  // Unsubscribe from auth listener
  if (authListenerUnsubscribe) {
    authListenerUnsubscribe()
    authListenerUnsubscribe = undefined
  }
  
  // Clear the client
  browserClient = undefined
}