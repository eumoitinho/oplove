import { createSingletonClient } from "@/lib/supabase-singleton"

// Use singleton client to prevent multiple GoTrueClient instances
export function createClient() {
  return createSingletonClient()
}
