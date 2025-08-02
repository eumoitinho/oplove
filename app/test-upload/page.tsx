"use client"

import { useState } from "react"
import { createClient } from "@/app/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Upload, Loader2, Image, Video, FileAudio } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function TestUploadPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [postContent, setPostContent] = useState("Teste de upload de mídia")
  
  const { user } = useAuth()
  const supabase = createClient()
  
  async function testUpload(file: File) {
    setLoading(true)
    setResults([]) // Clear previous results
    const newResults = []
    
    try {
      console.log("[TEST UPLOAD] Starting test with file:", file.name, file.type, file.size)
      
      // Check if user is logged in
      if (!user?.id) {
        newResults.push({
          test: "Authentication Check",
          success: false,
          details: "User not authenticated",
          error: "Please login first"
        })
        setResults(newResults)
        setLoading(false)
        return
      }
      
      // Quick auth test
      console.log("[TEST UPLOAD] Testing auth...")
      const { data: { user: authUser } } = await supabase.auth.getUser()
      newResults.push({
        test: "Auth Status",
        success: !!authUser,
        details: authUser ? `Authenticated as: ${authUser.email}` : "Not authenticated",
        error: !authUser ? "Auth check failed" : undefined
      })
      
      // 1. Get user data with timeout
      console.log("[TEST UPLOAD] Getting user data for:", user.id)
      
      const userDataPromise = supabase
        .from("users")
        .select("premium_type, is_verified")
        .eq("id", user.id)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout after 5 seconds")), 5000)
      )
      
      try {
        const { data: userData, error: userError } = await Promise.race([
          userDataPromise,
          timeoutPromise
        ]) as any
        
        console.log("[TEST UPLOAD] User data result:", { userData, userError })
        
        newResults.push({
          test: "User Data",
          success: !userError && !!userData,
          details: userData ? `Plan: ${userData.premium_type}, Verified: ${userData.is_verified}` : "No user data",
          error: userError?.message
        })
        
        // If no user data, try to continue anyway
        if (!userData) {
          console.log("[TEST UPLOAD] No user data found, continuing with defaults...")
        }
        
      } catch (timeoutError) {
        console.error("[TEST UPLOAD] User data timeout:", timeoutError)
        newResults.push({
          test: "User Data",
          success: false,
          details: "Request timed out",
          error: "Timeout after 5 seconds - possible RLS issue"
        })
      }
      
      // 2. Test creating post with media
      console.log("[TEST UPLOAD] Creating FormData...")
      const formData = new FormData()
      formData.append("content", postContent)
      formData.append("visibility", "public")
      formData.append("media[]", file)
      
      console.log("[TEST UPLOAD] Sending POST request...")
      const response = await fetch("/api/v1/posts", {
        method: "POST",
        body: formData
      })
      
      console.log("[TEST UPLOAD] Response status:", response.status)
      const result = await response.json()
      console.log("[TEST UPLOAD] Response data:", result)
      
      newResults.push({
        test: "Create Post with Media",
        success: response.ok && result.success,
        details: result.success ? "Post created with media" : "Failed to create post",
        error: result.error || result.message,
        response_code: response.status
      })
      
      if (result.success && result.data) {
        // 3. Check if media URLs were saved
        const hasMedia = result.data.media_urls && result.data.media_urls.length > 0
        newResults.push({
          test: "Media URLs Saved",
          success: hasMedia,
          details: hasMedia ? `${result.data.media_urls.length} media files` : "No media URLs",
          media_urls: result.data.media_urls
        })
        
        // 4. Test direct storage upload (for comparison)
        const directFileName = `test/${user?.id}/${Date.now()}_${file.name}`
        const { error: storageError } = await supabase.storage
          .from("media")
          .upload(directFileName, file)
        
        newResults.push({
          test: "Direct Storage Upload",
          success: !storageError,
          details: !storageError ? "Direct upload successful" : "Direct upload failed",
          error: storageError?.message,
          file_path: directFileName
        })
        
        // Clean up test file
        if (!storageError) {
          await supabase.storage.from("media").remove([directFileName])
        }
        
        // Delete test post
        if (result.data.id) {
          await supabase.from("posts").delete().eq("id", result.data.id)
        }
      }
      
    } catch (error) {
      console.error("[TEST UPLOAD] Error:", error)
      newResults.push({
        test: "General Error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : ""
      })
    } finally {
      setResults(newResults)
      setLoading(false)
    }
  }
  
  function getFileIcon(type: string) {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />
    if (type.startsWith("audio/")) return <FileAudio className="h-4 w-4" />
    return <Upload className="h-4 w-4" />
  }
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Upload de Mídia</CardTitle>
          <CardDescription>
            Verifica se as políticas de upload estão funcionando corretamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          {user && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Usuário Atual</h3>
              <p className="text-sm">Email: {user.email}</p>
              <p className="text-sm">ID: {user.id}</p>
            </div>
          )}
          
          {/* File Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Selecione um arquivo</label>
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getFileIcon(selectedFile.type)}
                <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>
          
          {/* Post Content */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Conteúdo do Post</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>
          
          {/* Test Button */}
          <Button 
            onClick={() => selectedFile && testUpload(selectedFile)} 
            disabled={loading || !selectedFile}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Testar Upload
              </>
            )}
          </Button>
          
          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Resultados do Teste</h3>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.success
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20"
                      : "bg-red-50 border-red-200 dark:bg-red-900/20"
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">{result.details}</p>
                      {result.error && (
                        <p className="text-sm text-red-600 mt-1">
                          Erro: {result.error}
                        </p>
                      )}
                      {result.response_code && (
                        <p className="text-sm text-gray-500 mt-1">
                          HTTP Status: {result.response_code}
                        </p>
                      )}
                      {result.media_urls && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">URLs de Mídia:</p>
                          {result.media_urls.map((url: string, i: number) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline block"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Business Rules */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Regras de Negócio</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• <strong>FREE</strong>: Não pode fazer upload de mídia</li>
              <li>• <strong>FREE Verificado</strong>: Pode fazer upload (limite 3/mês)</li>
              <li>• <strong>GOLD</strong>: Até 5 imagens por post, sem vídeo</li>
              <li>• <strong>DIAMOND/COUPLE</strong>: Upload ilimitado, incluindo vídeo</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}