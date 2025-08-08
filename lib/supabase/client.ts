import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

// Export singleton instance for client-side usage
export const supabase = createSupabaseClient()

// Export function for creating new instances
export { createSupabaseClient as createClient }