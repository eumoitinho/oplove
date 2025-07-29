import { supabase } from "@/lib/supabase"
import type { User } from "@/types/common"

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return data as User
  } catch (error) {
    console.error("Error in getUserByUsername:", error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

    if (error) throw error

    return { data: data as User, error: null }
  } catch (error) {
    return { data: null, error: (error as Error).message }
  }
}
