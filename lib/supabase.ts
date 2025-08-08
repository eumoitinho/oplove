import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { createSingletonClient } from "./supabase-singleton"

// For client-side: use singleton to prevent multiple instances
// For server-side: create new instance
export const supabase = typeof window !== 'undefined' 
  ? createSingletonClient() 
  : (() => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      return createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    })()

// Server-side client for API routes
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return createClient<Database>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
