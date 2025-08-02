"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function TestProfilePage() {
  const [loading, setLoading] = useState(true)
  const [authUser, setAuthUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any[]>([])
  
  const supabase = createClient()
  
  useEffect(() => {
    checkProfile()
  }, [])
  
  async function checkProfile() {
    setLoading(true)
    setError(null)
    const results = []
    
    try {
      // Test 1: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      results.push({
        test: "Authentication Check",
        success: !authError && !!user,
        details: user ? `Logged in as: ${user.email}` : "Not authenticated",
        error: authError?.message
      })
      
      if (user) {
        setAuthUser(user)
        
        // Test 2: Direct profile query
        const { data: directProfile, error: directError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single()
        
        results.push({
          test: "Direct Profile Query (by id)",
          success: !directError && !!directProfile,
          details: directProfile ? `Found profile: ${directProfile.username || directProfile.email}` : "No profile found",
          error: directError?.message
        })
        
        if (directProfile) {
          setProfile(directProfile)
        }
        
        // Test 3: Query by auth_id
        const { data: authIdProfile, error: authIdError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", user.id)
          .single()
        
        results.push({
          test: "Profile Query by auth_id",
          success: !authIdError && !!authIdProfile,
          details: authIdProfile ? `Found profile by auth_id` : "No profile found by auth_id",
          error: authIdError?.message
        })
        
        // Test 4: Create post test
        const testPost = {
          content: "Test post from profile verification",
          visibility: "public"
        }
        
        const formData = new FormData()
        formData.append("content", testPost.content)
        formData.append("visibility", testPost.visibility)
        
        const response = await fetch("/api/v1/posts", {
          method: "POST",
          body: formData
        })
        
        const postResult = await response.json()
        
        results.push({
          test: "Create Post Test",
          success: response.ok && postResult.success,
          details: postResult.success ? "Post created successfully" : "Failed to create post",
          error: postResult.error || postResult.message
        })
        
        // Clean up test post if created
        if (postResult.success && postResult.data?.id) {
          await supabase
            .from("posts")
            .delete()
            .eq("id", postResult.data.id)
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setTestResults(results)
      setLoading(false)
    }
  }
  
  async function createProfile() {
    if (!authUser) return
    
    setLoading(true)
    try {
      const newProfile = {
        id: authUser.id,
        auth_id: authUser.id,
        email: authUser.email,
        username: authUser.email?.split('@')[0] + Math.floor(Math.random() * 9999),
        name: authUser.user_metadata?.name || "Test User",
        premium_type: "free",
        account_type: "personal",
        is_verified: false
      }
      
      const { data, error } = await supabase
        .from("users")
        .insert(newProfile)
        .select()
        .single()
      
      if (error) {
        setError(`Failed to create profile: ${error.message}`)
      } else {
        setProfile(data)
        await checkProfile() // Rerun tests
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile & RLS Test</CardTitle>
          <CardDescription>
            Testing profile access and RLS policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Running tests...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Test Results */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Test Results</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{result.test}</p>
                    <p className="text-sm text-gray-600">{result.details}</p>
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">
                        Error: {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Profile Info */}
          {profile && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Profile Data</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="font-medium">ID:</dt>
                  <dd className="text-gray-600">{profile.id}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium">Username:</dt>
                  <dd className="text-gray-600">{profile.username}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium">Email:</dt>
                  <dd className="text-gray-600">{profile.email}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium">Plan:</dt>
                  <dd className="text-gray-600">{profile.premium_type}</dd>
                </div>
              </dl>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={checkProfile} disabled={loading}>
              Rerun Tests
            </Button>
            
            {authUser && !profile && (
              <Button onClick={createProfile} disabled={loading} variant="outline">
                Create Profile
              </Button>
            )}
          </div>
          
          {/* Instructions */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Next Steps</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Go to your Supabase Dashboard</li>
              <li>Navigate to SQL Editor</li>
              <li>Copy and run the contents of: <code className="bg-gray-100 px-1 rounded">/supabase/migrations/20250802_simple_rls_fix.sql</code></li>
              <li>Return here and click "Rerun Tests"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}