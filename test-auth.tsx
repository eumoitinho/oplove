"use client"

import { createClient } from "@/app/lib/supabase-browser"

export function TestAuth() {
  const supabase = createClient()

  const testAuth = async () => {
    console.log("=== TESTE DE AUTH ===")
    
    // 1. Testar sessão
    const { data: { session } } = await supabase.auth.getSession()
    console.log("Session:", session?.user?.id)
    
    // 2. Testar query na tabela users
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", session?.user?.id)
      .single()
    
    console.log("Profile:", profile)
    console.log("Error:", error)
    
    // 3. Testar query sem auth (se RLS estiver causando problema)
    const { data: allUsers, error: allError } = await supabase
      .from("users")
      .select("auth_id, username")
      .limit(5)
    
    console.log("All users:", allUsers)
    console.log("All users error:", allError)
  }

  return (
    <button 
      onClick={testAuth}
      className="fixed top-4 right-4 bg-red-500 text-white p-2 rounded z-50"
    >
      TESTE AUTH
    </button>
  )
}